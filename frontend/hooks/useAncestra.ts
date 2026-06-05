"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain, usePublicClient } from "wagmi";
import { formatUnits, parseUnits, decodeEventLog, parseAbiItem, Address } from "viem";
import { ritualChain } from "@/lib/config";
import { PAIR_ABI, ROUTER_ABI, ERC20_ABI } from "@/lib/abi";
import {
  POOLS, CONTRACTS, TOKENS, TOKEN_PAIR, WRITUAL_IS_TOKEN0,
  AMINA_TOKENS, NEFERTITI_TOKENS, YAA_TOKENS,
  RITUAL_CHAIN_ID, ModeId, Token, deadlineMs,
} from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "success" | "error";

const SWAP_EVENT_ABI = parseAbiItem(
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)"
);

const RITUAL_TOKEN = TOKENS.find(t => t.isNative)!;

// Returns the selectable token list for a given mode (null = no selector)
export function getModeTokens(mode: ModeId): Token[] | null {
  if (mode === "amina")     return AMINA_TOKENS;
  if (mode === "nefertiti") return NEFERTITI_TOKENS;
  if (mode === "yaa")       return YAA_TOKENS;
  return null;
}

export function useAncestra(mode: ModeId, onSwapSuccess?: () => void) {
  const { address, chainId } = useAccount();
  const { switchChainAsync }  = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: ritualChain.id });

  const pool         = POOLS[mode];
  const modeTokens   = getModeTokens(mode);

  const defaultToken = modeTokens ? modeTokens[0] : pool.token1;
  const [selectedToken, setSelectedToken] = useState<Token>(defaultToken);
  const [isFlipped,     setIsFlipped]     = useState(false);
  const [amountIn,      setAmountIn]      = useState("");
  const [txState,       setTxState]       = useState<TxState>("idle");
  const [txHash,        setTxHash]        = useState<Address | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [actualOut,     setActualOut]     = useState<string | null>(null);

  // Resolve pair address for the selected token
  const pairAddress: Address =
    modeTokens
      ? (TOKEN_PAIR[selectedToken.address] ?? pool.pairAddress)
      : pool.pairAddress;

  const writualIsT0 = WRITUAL_IS_TOKEN0[pairAddress] ?? true;

  const { data: reserves } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddress, refetchInterval: 30_000 },
  });

  const res = reserves as [bigint, bigint, number] | undefined;

  // rIn = WRITUAL-side reserve, rOut = selected-token-side reserve
  const { rIn, rOut } = (() => {
    if (!res) return { rIn: undefined, rOut: undefined };
    return {
      rIn:  writualIsT0 ? res[0] : res[1],
      rOut: writualIsT0 ? res[1] : res[0],
    };
  })();

  const reserve0     = res?.[0];
  const reserve1     = res?.[1];
  const hasLiquidity = !!(rIn && rOut && rIn > 0n && rOut > 0n);

  // Logical token in/out from user's perspective
  const tokenIn  = isFlipped ? selectedToken : RITUAL_TOKEN;
  const tokenOut = isFlipped ? RITUAL_TOKEN  : selectedToken;

  // AMM constant-product estimate
  const estimatedOut = useCallback(() => {
    if (!amountIn || !rIn || !rOut) return "0";
    try {
      const parsed     = parseUnits(amountIn, tokenIn.decimals);
      if (parsed === 0n) return "0";
      const reserveIn  = isFlipped ? rOut : rIn;
      const reserveOut = isFlipped ? rIn  : rOut;
      const amtInFee   = parsed * 997n;
      const numerator  = amtInFee * reserveOut;
      const denominator = reserveIn * 1000n + amtInFee;
      return formatUnits(numerator / denominator, tokenOut.decimals);
    } catch { return "0"; }
  }, [amountIn, rIn, rOut, isFlipped, tokenIn.decimals, tokenOut.decimals]);

  const fee = (() => {
    if (!amountIn) return "0";
    return (parseFloat(amountIn) * 0.003).toFixed(6);
  })();

  const priceImpact = useCallback(() => {
    if (!amountIn || !rIn || !rOut) return "—";
    try {
      const reserveIn = isFlipped ? rOut : rIn;
      const inAmt = parseFloat(amountIn);
      const rInF  = parseFloat(formatUnits(reserveIn, tokenIn.decimals));
      const pct   = (inAmt / (rInF + inAmt)) * 100;
      return pct < 0.01 ? "<0.01%" : `${pct.toFixed(2)}%`;
    } catch { return "—"; }
  }, [amountIn, rIn, rOut, isFlipped, tokenIn.decimals]);

  const flip = useCallback(() => {
    setIsFlipped(f => !f);
    setAmountIn("");
  }, []);

  const changeToken = useCallback((token: Token) => {
    setSelectedToken(token);
    setAmountIn("");
    setIsFlipped(false);
  }, []);

  const swap = useCallback(async () => {
    if (!address || !amountIn) return;
    try {
      setError(null);
      setTxHash(null);

      if (!hasLiquidity) {
        setError("This pool has no liquidity yet. Add liquidity first.");
        setTxState("error");
        return;
      }

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedIn = parseUnits(amountIn, tokenIn.decimals);
      if (parsedIn === 0n) {
        setError("Enter an amount to swap");
        setTxState("error");
        return;
      }

      const reserveIn  = isFlipped ? rOut! : rIn!;
      const reserveOut = isFlipped ? rIn!  : rOut!;
      const amtInFee   = parsedIn * 997n;
      const expectedOut = (amtInFee * reserveOut) / (reserveIn * 1000n + amtInFee);
      const minOut      = expectedOut * 9970n / 10000n;
      const deadline    = deadlineMs();

      // Fetch gas price from our own RPC so MetaMask desktop doesn't need to
      // estimate fees itself (eth_gasPrice is universally supported)
      let gasPrice: bigint;
      try {
        gasPrice = await publicClient!.getGasPrice();
      } catch {
        gasPrice = 10_000_000_000n; // 10 gwei fallback
      }

      // Capture direction/pair context for receipt parsing (closures may drift)
      const snapPairAddress   = pairAddress;
      const snapWritualIsT0   = writualIsT0;
      const snapIsFlipped     = isFlipped;
      const snapOutDecimals   = tokenOut.decimals;

      let swapHash: Address;

      if (!isFlipped) {
        // RITUAL (native) → token: payable swapExactRITUALForTokens
        setTxState("swapping");
        swapHash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactRITUALForTokens",
          args: [minOut, [CONTRACTS.WRITUAL, selectedToken.address], address, deadline],
          value: parsedIn,
          gas: 300000n,
          gasPrice,
        });
      } else {
        // token → RITUAL: approve + swapExactTokensForRITUAL
        setTxState("approving");
        await writeContractAsync({
          address: selectedToken.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, parsedIn],
          gas: 100000n,
          gasPrice,
        });

        setTxState("swapping");
        swapHash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForRITUAL",
          args: [parsedIn, minOut, [selectedToken.address, CONTRACTS.WRITUAL], address, deadline],
          gas: 300000n,
          gasPrice,
        });
      }

      setTxHash(swapHash);
      setActualOut(null);
      setTxState("success");
      setAmountIn("");
      onSwapSuccess?.();

      // Parse actual received amount from receipt in background
      publicClient!.waitForTransactionReceipt({ hash: swapHash }).then(receipt => {
        try {
          const swapLog = receipt.logs.find(
            l => l.address.toLowerCase() === snapPairAddress.toLowerCase()
          );
          if (!swapLog) return;
          const { args } = decodeEventLog({
            abi: [SWAP_EVENT_ABI],
            data: swapLog.data,
            topics: swapLog.topics as any,
          });
          const { amount0Out, amount1Out } = args as { amount0Out: bigint; amount1Out: bigint };
          // Which output side depends on which token is WRITUAL and swap direction
          const received = snapWritualIsT0
            ? (snapIsFlipped ? amount0Out : amount1Out)
            : (snapIsFlipped ? amount1Out : amount0Out);
          setActualOut(formatUnits(received, snapOutDecimals));
        } catch { /* fall back to estimate */ }
      }).catch(() => { /* no-op */ });
    } catch (err: any) {
      console.error("Swap failed:", err);
      const msg = err?.shortMessage || err?.message || "";
      const isCircuitBreaker =
        msg.includes("too many errors") ||
        msg.includes("resource not available") ||
        msg.includes("Requested resource not available");
      setError(
        isCircuitBreaker
          ? "MetaMask is temporarily unavailable — wait ~30 seconds and try again, or reconnect via WalletConnect."
          : msg || "Transaction failed"
      );
      setTxState("error");
    }
  }, [address, amountIn, chainId, selectedToken, isFlipped, rIn, rOut, hasLiquidity, switchChainAsync, writeContractAsync, onSwapSuccess, tokenIn.decimals]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
    setActualOut(null);
  }, []);

  return {
    amountIn, setAmountIn,
    isFlipped, flip,
    tokenIn, tokenOut,
    selectedToken, changeToken,
    modeTokens,
    estimatedOut, priceImpact, fee,
    txState, txHash, error, actualOut,
    swap, reset,
    reserve0, reserve1,
    rIn, rOut,
    hasLiquidity,
  };
}

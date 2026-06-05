"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits, Address } from "viem";
import { PAIR_ABI, ROUTER_ABI, ERC20_ABI } from "@/lib/abi";
import { POOLS, CONTRACTS, TOKENS, RITUAL_CHAIN_ID, ModeId, Token, deadlineMs } from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "success" | "error";

const RITUAL_TOKEN = TOKENS.find(t => t.isNative)!;

// Stables selectable on Amina mode
export const AMINA_STABLES: Token[] = [
  TOKENS.find(t => t.symbol === "USDC")!,
  TOKENS.find(t => t.symbol === "DAI")!,
];

// Stable address → its WRITUAL pair address
const STABLE_PAIR: Partial<Record<Address, Address>> = {
  [CONTRACTS.USDC]: CONTRACTS.PAIR_WRITUAL_USDC,
  [CONTRACTS.DAI]:  CONTRACTS.PAIR_WRITUAL_DAI,
  [CONTRACTS.WETH]: CONTRACTS.PAIR_WRITUAL_WETH,
};

// Is WRITUAL token0 in a given pair?
const WRITUAL_IS_T0: Partial<Record<Address, boolean>> = {
  [CONTRACTS.PAIR_WRITUAL_USDC]: true,
  [CONTRACTS.PAIR_WRITUAL_WETH]: true,
  [CONTRACTS.PAIR_WRITUAL_DAI]:  false, // DAI is token0
};

export function useAncestra(mode: ModeId, onSwapSuccess?: () => void) {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const pool = POOLS[mode];

  const [selectedStable, setSelectedStable] = useState<Token>(pool.token1);
  const [isFlipped, setIsFlipped]           = useState(false);
  const [amountIn,  setAmountIn]            = useState("");
  const [txState,   setTxState]             = useState<TxState>("idle");
  const [txHash,    setTxHash]              = useState<Address | null>(null);
  const [error,     setError]               = useState<string | null>(null);

  // Pair address tracks selected stable (for amina multi-stable)
  const pairAddress: Address =
    mode === "amina"
      ? (STABLE_PAIR[selectedStable.address] ?? pool.pairAddress)
      : pool.pairAddress;

  const writualIsT0 = WRITUAL_IS_T0[pairAddress] ?? true;

  const { data: reserves } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddress, refetchInterval: 8000 },
  });

  const res = reserves as [bigint, bigint, number] | undefined;

  // rIn = WRITUAL-side reserve, rOut = stable-side reserve
  const { rIn, rOut } = (() => {
    if (!res) return { rIn: undefined, rOut: undefined };
    return {
      rIn:  writualIsT0 ? res[0] : res[1],
      rOut: writualIsT0 ? res[1] : res[0],
    };
  })();

  const reserve0   = res?.[0];
  const reserve1   = res?.[1];
  const hasLiquidity = !!(rIn && rOut && rIn > 0n && rOut > 0n);

  // Logical token in/out from user's perspective
  const tokenIn  = isFlipped ? selectedStable : RITUAL_TOKEN;
  const tokenOut = isFlipped ? RITUAL_TOKEN   : selectedStable;

  // AMM constant-product estimate
  const estimatedOut = useCallback(() => {
    if (!amountIn || !rIn || !rOut) return "0";
    try {
      const parsed = parseUnits(amountIn, tokenIn.decimals);
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

  const changeStable = useCallback((token: Token) => {
    setSelectedStable(token);
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

      if (!isFlipped) {
        // RITUAL → stable
        setTxState("swapping");
        const hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactRITUALForTokens",
          args: [minOut, [CONTRACTS.WRITUAL, selectedStable.address], address, deadline],
          value: parsedIn,
          gas: 300000n,
        });
        setTxHash(hash);
      } else {
        // stable → RITUAL: approve then swap
        setTxState("approving");
        await writeContractAsync({
          address: selectedStable.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, parsedIn],
          gas: 100000n,
        });

        setTxState("swapping");
        const hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForRITUAL",
          args: [parsedIn, minOut, [selectedStable.address, CONTRACTS.WRITUAL], address, deadline],
          gas: 300000n,
        });
        setTxHash(hash);
      }

      setTxState("success");
      setAmountIn("");
      onSwapSuccess?.();
    } catch (err: any) {
      console.error("Swap failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
      setTxState("error");
    }
  }, [address, amountIn, chainId, selectedStable, isFlipped, rIn, rOut, hasLiquidity, switchChainAsync, writeContractAsync, onSwapSuccess, tokenIn.decimals]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return {
    amountIn, setAmountIn,
    isFlipped, flip,
    tokenIn, tokenOut,
    selectedStable, changeStable,
    aminaStables: mode === "amina" ? AMINA_STABLES : null,
    estimatedOut, priceImpact, fee,
    txState, txHash, error,
    swap, reset,
    reserve0, reserve1,
    rIn, rOut,
    hasLiquidity,
  };
}

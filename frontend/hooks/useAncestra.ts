"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits, Address, maxUint256 } from "viem";
import { PAIR_ABI, ERC20_ABI, ROUTER_ABI } from "@/lib/abi";
import { POOLS, CONTRACTS, RITUAL_CHAIN_ID, ModeId, deadlineMs } from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "success" | "error";

// ── Pair token ordering (from on-chain token0/token1 query) ─────────────────
// WRITUAL/USDC: token0=WRITUAL, token1=USDC   → reserves[0]=WRITUAL, reserves[1]=USDC
// WRITUAL/WETH: token0=WRITUAL, token1=WETH   → reserves[0]=WRITUAL, reserves[1]=WETH
// WRITUAL/DAI:  token0=DAI,     token1=WRITUAL → reserves[0]=DAI,    reserves[1]=WRITUAL
const WRITUAL_IS_TOKEN0: Record<ModeId, boolean> = {
  amina:    true,   // WRITUAL is token0 in WRITUAL/USDC pair
  nefertiti: true,  // WRITUAL is token0 in WRITUAL/WETH pair
  yaa:      false,  // DAI is token0; WRITUAL is token1 in DAI/WRITUAL pair
};

export function useAncestra(mode: ModeId, onSwapSuccess?: () => void) {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const pool = POOLS[mode];
  const [amountIn, setAmountIn] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read pair reserves
  const { data: reserves } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pool.pairAddress, refetchInterval: 8000 },
  });

  const res = reserves as [bigint, bigint, number] | undefined;

  // Normalise reserves so rIn = WRITUAL side, rOut = token1 side
  const { rIn, rOut } = (() => {
    if (!res) return { rIn: undefined, rOut: undefined };
    const writualIsToken0 = WRITUAL_IS_TOKEN0[mode];
    return {
      rIn:  writualIsToken0 ? res[0] : res[1],
      rOut: writualIsToken0 ? res[1] : res[0],
    };
  })();

  // Expose raw reserves so the UI can show them
  const reserve0 = res?.[0];
  const reserve1 = res?.[1];

  // Has liquidity?
  const hasLiquidity = !!(rIn && rOut && rIn > 0n && rOut > 0n);

  // AMM constant-product output estimate (0.3% fee)
  const estimatedOut = useCallback(() => {
    if (!amountIn || !rIn || !rOut) return "0";
    try {
      const parsed = parseUnits(amountIn, 18);
      if (parsed === 0n) return "0";
      const amtInFee  = parsed * 997n;
      const numerator  = amtInFee * rOut;
      const denominator = rIn * 1000n + amtInFee;
      const out = numerator / denominator;
      return formatUnits(out, pool.token1.decimals);
    } catch { return "0"; }
  }, [amountIn, rIn, rOut, pool.token1.decimals]);

  const fee = (() => {
    if (!amountIn) return "0";
    return (parseFloat(amountIn) * 0.003).toFixed(6);
  })();

  // Price impact estimate
  const priceImpact = useCallback(() => {
    if (!amountIn || !rIn) return "—";
    try {
      const inAmt = parseFloat(amountIn);
      const rInF  = parseFloat(formatUnits(rIn, 18));
      const impact = (inAmt / (rInF + inAmt)) * 100;
      return impact < 0.01 ? "<0.01%" : `${impact.toFixed(2)}%`;
    } catch { return "—"; }
  }, [amountIn, rIn]);

  const swap = useCallback(async () => {
    if (!address || !amountIn || !pool.pairAddress) return;

    try {
      setError(null);
      setTxHash(null);

      // No liquidity guard — before chain switch so user sees it fast
      if (!hasLiquidity) {
        setError("This pool has no liquidity yet. Add liquidity first.");
        setTxState("error");
        return;
      }

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedIn = parseUnits(amountIn, 18);
      if (parsedIn === 0n) {
        setError("Enter an amount to swap");
        setTxState("error");
        return;
      }

      // Min out with 0.3% slippage
      const amtInFee   = parsedIn * 997n;
      const numerator  = amtInFee * rOut!;
      const denominator = rIn! * 1000n + amtInFee;
      const expectedOut = numerator / denominator;
      const minOut      = expectedOut * 9970n / 10000n;

      // Step 1: Wrap native RITUAL → WRITUAL
      setTxState("approving");
      const wrapHash = await writeContractAsync({
        address: CONTRACTS.WRITUAL,
        abi: [{ type: "function", name: "deposit", inputs: [], outputs: [], stateMutability: "payable" }],
        functionName: "deposit",
        value: parsedIn,
        gas: 60000n,
      });
      // Wait for wrap receipt
      await waitForReceipt(wrapHash);

      // Step 2: Approve WRITUAL for router (infinite, skip if already approved)
      const existingAllowance = await readAllowance(CONTRACTS.WRITUAL, address, CONTRACTS.ROUTER);
      if (existingAllowance < parsedIn) {
        const approveHash = await writeContractAsync({
          address: CONTRACTS.WRITUAL,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, maxUint256],
          gas: 60000n,
        });
        await waitForReceipt(approveHash);
      }

      // Step 3: Swap WRITUAL → token1
      setTxState("swapping");
      const path: Address[] = [CONTRACTS.WRITUAL, pool.token1.address];
      const deadline = deadlineMs();

      const hash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [parsedIn, minOut, path, address, deadline],
        gas: 300000n,
      });

      setTxHash(hash);
      setTxState("success");
      setAmountIn("");
      onSwapSuccess?.();
    } catch (err: any) {
      console.error("Swap failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
      setTxState("error");
    }
  }, [address, amountIn, chainId, pool, rIn, rOut, hasLiquidity, switchChainAsync, writeContractAsync, onSwapSuccess]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return {
    amountIn, setAmountIn,
    estimatedOut, priceImpact, fee,
    txState, txHash, error,
    swap, reset,
    reserve0, reserve1,
    rIn, rOut,
    hasLiquidity,
  };
}

// ── Helpers (browser-safe, use wagmi public client via fetch) ────────────────

async function readAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  // Use wagmi's window.ethereum if available; fallback to 0 so we always approve
  try {
    const sel = "0xdd62ed3e";
    const data = sel + owner.slice(2).padStart(64, "0") + spender.slice(2).padStart(64, "0");
    // wagmi provider is set up in the app; we read via the configured transport
    const res = await (window as any).ethereum?.request({
      method: "eth_call",
      params: [{ to: token, data }, "latest"],
    });
    if (res) return BigInt(res);
  } catch {}
  return 0n;
}

async function waitForReceipt(hash: `0x${string}`, maxRetries = 24): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    await delay(2500);
    try {
      const receipt = await (window as any).ethereum?.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      });
      if (receipt?.status === "0x1") return;
      if (receipt?.status === "0x0") throw new Error("Transaction reverted");
    } catch (e: any) {
      if (e?.message?.includes("reverted")) throw e;
    }
  }
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

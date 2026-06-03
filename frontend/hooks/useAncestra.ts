"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits, Address } from "viem";
import { ANCESTRA_POOL_ABI } from "@/lib/abi";
import { POOLS, RITUAL_CHAIN_ID, ModeId } from "@/lib/constants";

export type TxState =
  | "idle"
  | "approving"
  | "swapping"
  | "success"
  | "error";

export function useAncestra(mode: ModeId) {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const pool = POOLS[mode];
  const [amountIn, setAmountIn] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read pool reserves
  const { data: reserve0 } = useReadContract({
    address: pool.poolAddress,
    abi: ANCESTRA_POOL_ABI,
    functionName: "reserve0",
    query: { enabled: !!pool.poolAddress },
  });

  const { data: reserve1 } = useReadContract({
    address: pool.poolAddress,
    abi: ANCESTRA_POOL_ABI,
    functionName: "reserve1",
    query: { enabled: !!pool.poolAddress },
  });

  // Calculate estimated output
  const estimatedOut = useCallback(() => {
    if (!amountIn || !reserve0 || !reserve1) return "0";
    const parsed = parseUnits(amountIn, 18);
    if (parsed === 0n) return "0";
    const amountInAfterFee = (parsed * 9970n) / 10000n;
    const numerator = amountInAfterFee * reserve1;
    const denominator = (reserve0 * 10000n) + amountInAfterFee;
    const out = numerator / denominator;
    return formatUnits(out, mode === "amina" ? 6 : 18);
  }, [amountIn, reserve0, reserve1, mode]);

  const fee = (() => {
    if (!amountIn) return "0";
    const parsed = parseFloat(amountIn);
    return (parsed * 0.003).toFixed(6);
  })();

  const swap = useCallback(async () => {
    if (!address || !amountIn || !pool.poolAddress) return;

    try {
      setTxState("idle");
      setError(null);
      setTxHash(null);

      // Ensure we're on Ritual Chain
      if (chainId && chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedIn = parseUnits(amountIn, 18);
      if (parsedIn === 0n) {
        setError("Enter an amount to swap");
        setTxState("error");
        return;
      }

      // Calculate expected output
      if (!reserve0 || !reserve1) {
        setError("Pool reserves not available");
        setTxState("error");
        return;
      }
      const amountInAfterFee = (parsedIn * 9970n) / 10000n;
      const numerator = amountInAfterFee * reserve1;
      const denominator = (reserve0 * 10000n) + amountInAfterFee;
      const expectedOut = numerator / denominator;

      setTxState("swapping");
      const hash = await writeContractAsync({
        address: pool.poolAddress,
        abi: ANCESTRA_POOL_ABI,
        functionName: "swapRitualForToken",
        args: [expectedOut, parsedIn],
      });

      setTxHash(hash);
      setTxState("success");
      setAmountIn("");
    } catch (err: any) {
      console.error("Swap failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
      setTxState("error");
    }
  }, [address, amountIn, chainId, pool.poolAddress, reserve0, reserve1, switchChainAsync, writeContractAsync]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return {
    amountIn,
    setAmountIn,
    estimatedOut,
    fee,
    txState,
    txHash,
    error,
    swap,
    reset,
    reserve0,
    reserve1,
  };
}

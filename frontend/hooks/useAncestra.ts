"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits, Address, maxUint256 } from "viem";
import { PAIR_ABI, ERC20_ABI, ROUTER_ABI } from "@/lib/abi";
import { POOLS, CONTRACTS, RITUAL_CHAIN_ID, ModeId, deadlineMs } from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "success" | "error";

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
    query: { enabled: !!pool.pairAddress },
  });

  const res = reserves as [bigint, bigint, number] | undefined;
  const reserve0 = res?.[0];
  const reserve1 = res?.[1];

  // Calculate estimated output (WRITUAL → token1)
  const estimatedOut = useCallback(() => {
    if (!amountIn || !reserve0 || !reserve1) return "0";
    try {
      const parsed = parseUnits(amountIn, 18);
      if (parsed === 0n) return "0";
      // Pair always stores in sorted order; WRITUAL address vs token1
      const writualAddr = CONTRACTS.WRITUAL.toLowerCase();
      const token0Addr = pool.token0.address.toLowerCase();
      // Determine which reserve is WRITUAL
      const [rIn, rOut] = writualAddr === token0Addr
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      const amtInFee = parsed * 997n;
      const numerator = amtInFee * rOut;
      const denominator = rIn * 1000n + amtInFee;
      const out = numerator / denominator;
      return formatUnits(out, pool.token1.decimals);
    } catch { return "0"; }
  }, [amountIn, reserve0, reserve1, pool]);

  const fee = (() => {
    if (!amountIn) return "0";
    return (parseFloat(amountIn) * 0.003).toFixed(6);
  })();

  const swap = useCallback(async () => {
    if (!address || !amountIn || !pool.pairAddress) return;

    try {
      setTxState("idle");
      setError(null);
      setTxHash(null);

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedIn = parseUnits(amountIn, 18);
      if (parsedIn === 0n) {
        setError("Enter an amount to swap");
        setTxState("error");
        return;
      }

      if (!reserve0 || !reserve1) {
        setError("Pool reserves not available");
        setTxState("error");
        return;
      }

      // Approve WRITUAL for router
      setTxState("approving");
      const allowance = await checkAllowance(CONTRACTS.WRITUAL, address, CONTRACTS.ROUTER);
      if (allowance < parsedIn) {
        await writeContractAsync({
          address: CONTRACTS.WRITUAL,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, maxUint256],
          gas: 100000n,
        });
      }

      // Compute min out (0.3% slippage)
      const writualAddr = CONTRACTS.WRITUAL.toLowerCase();
      const token0Addr = pool.token0.address.toLowerCase();
      const [rIn, rOut] = writualAddr === token0Addr
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      const amtInFee = parsedIn * 997n;
      const expectedOut = (amtInFee * rOut) / (rIn * 1000n + amtInFee);
      const minOut = expectedOut * 9970n / 10000n;

      const path = [CONTRACTS.WRITUAL, pool.token1.address] as Address[];
      const deadline = deadlineMs();

      setTxState("swapping");
      const hash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [parsedIn, minOut, path, address, deadline],
        gas: 400000n,
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
  }, [address, amountIn, chainId, pool, reserve0, reserve1, switchChainAsync, writeContractAsync, onSwapSuccess]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { amountIn, setAmountIn, estimatedOut, fee, txState, txHash, error, swap, reset, reserve0, reserve1 };
}

async function checkAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  try {
    const res = await fetch("https://rpc.ritualfoundation.org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "eth_call",
        params: [{ to: token, data: "0xdd62ed3e" + owner.slice(2).padStart(64, "0") + spender.slice(2).padStart(64, "0") }, "latest"],
      }),
    });
    const data = await res.json();
    return data.result ? BigInt(data.result) : 0n;
  } catch { return 0n; }
}

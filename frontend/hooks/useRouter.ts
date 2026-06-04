"use client";

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import { parseUnits, Address, maxUint256 } from "viem";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abi";
import { CONTRACTS, RITUAL_CHAIN_ID, Token, deadlineMs } from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "adding" | "removing" | "success" | "error";

// ── Swap hook ────────────────────────────────────────────────────────────────
export function useSwap() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const swap = useCallback(async (
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    slippageBps: number = 30,
  ) => {
    if (!address) return;

    try {
      setTxState("idle");
      setError(null);
      setTxHash(null);

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedIn = parseUnits(amountIn, tokenIn.decimals);
      if (parsedIn === 0n) return;

      const inAddr  = tokenIn.isNative  ? CONTRACTS.WRITUAL : tokenIn.address;
      const outAddr = tokenOut.isNative ? CONTRACTS.WRITUAL : tokenOut.address;
      const path: Address[] = [inAddr, outAddr];
      const deadline = deadlineMs();

      // Get expected output from on-chain router
      const amountsOut = await getAmountsOut(parsedIn, path);
      const expectedOut = amountsOut.length > 1 ? amountsOut[amountsOut.length - 1] : 0n;
      const minOut = expectedOut * BigInt(10000 - slippageBps) / 10000n;

      if (tokenIn.isNative) {
        // Native RITUAL → token: use swapExactRITUALForTokens (payable, handles wrap internally)
        setTxState("swapping");
        const hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactRITUALForTokens",
          args: [minOut, path, address, deadline],
          value: parsedIn,
          gas: 300000n,
        });
        setTxHash(hash);
      } else {
        // ERC20 → token: approve then swap
        setTxState("approving");
        const allowance = await checkAllowance(tokenIn.address, address, CONTRACTS.ROUTER);
        if (allowance < parsedIn) {
          const approveHash = await writeContractAsync({
            address: tokenIn.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, maxUint256],
            gas: 100000n,
          });
          await waitForTx(approveHash); // wait for approval before swap
        }

        setTxState("swapping");
        const hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [parsedIn, minOut, path, address, deadline],
          gas: 400000n,
        });
        setTxHash(hash);
      }

      setTxState("success");
    } catch (err: any) {
      console.error("Swap failed:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
      setTxState("error");
    }
  }, [address, chainId, switchChainAsync, writeContractAsync]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { txState, txHash, error, swap, reset };
}

// ── Add Liquidity hook ───────────────────────────────────────────────────────
export function useAddLiquidity() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLiquidity = useCallback(async (
    tokenA: Token,
    tokenB: Token,
    amountA: string,
    amountB: string,
    slippageBps = 50,
  ) => {
    if (!address) return;
    try {
      setTxState("idle");
      setError(null);
      setTxHash(null);

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const parsedA = parseUnits(amountA, tokenA.decimals);
      const parsedB = parseUnits(amountB, tokenB.decimals);
      const minA = parsedA * BigInt(10000 - slippageBps) / 10000n;
      const minB = parsedB * BigInt(10000 - slippageBps) / 10000n;
      const deadline = deadlineMs();

      // Approve each non-native token and WAIT for each approval to be mined
      setTxState("approving");
      for (const [tok, amt] of [[tokenA, parsedA], [tokenB, parsedB]] as [Token, bigint][]) {
        if (tok.isNative) continue;
        const allow = await checkAllowance(tok.address, address, CONTRACTS.ROUTER);
        if (allow < amt) {
          const approveHash = await writeContractAsync({
            address: tok.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, maxUint256],
            gas: 100000n,
          });
          await waitForTx(approveHash); // wait before next step
        }
      }

      setTxState("adding");

      const nativeToken = tokenA.isNative ? tokenA : tokenB.isNative ? tokenB : null;
      const erc20Token  = tokenA.isNative ? tokenB  : tokenB.isNative ? tokenA  : null;
      const nativeAmt   = tokenA.isNative ? parsedA : parsedB;
      const erc20Amt    = tokenA.isNative ? parsedB : parsedA;
      const erc20Min    = tokenA.isNative ? minB    : minA;
      const nativeMin   = tokenA.isNative ? minA    : minB;

      let hash: `0x${string}`;
      if (nativeToken && erc20Token) {
        // One side is native RITUAL → addLiquidityRITUAL (payable)
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "addLiquidityRITUAL",
          args: [erc20Token.address, erc20Amt, erc20Min, nativeMin, address, deadline],
          value: nativeAmt,
          gas: 500000n,
        });
      } else {
        // Both ERC20 → addLiquidity
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "addLiquidity",
          args: [tokenA.address, tokenB.address, parsedA, parsedB, minA, minB, address, deadline],
          gas: 500000n,
        });
      }

      setTxHash(hash);
      setTxState("success");
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Failed");
      setTxState("error");
    }
  }, [address, chainId, switchChainAsync, writeContractAsync]);

  const reset = useCallback(() => {
    setTxState("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { txState, txHash, error, addLiquidity, reset };
}

// ── Remove Liquidity hook ────────────────────────────────────────────────────
export function useRemoveLiquidity() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const removeLiquidity = useCallback(async (
    pairAddress: Address,
    tokenA: Token,
    tokenB: Token,
    lpAmount: string,
  ) => {
    if (!address) return;
    try {
      setTxState("idle");
      setError(null);
      setTxHash(null);

      if (chainId !== RITUAL_CHAIN_ID) {
        await switchChainAsync({ chainId: RITUAL_CHAIN_ID });
      }

      const lpParsed = parseUnits(lpAmount, 18);
      const deadline = deadlineMs();

      // Approve LP token for router and WAIT for approval to be mined
      setTxState("approving");
      const allow = await checkAllowance(pairAddress, address, CONTRACTS.ROUTER);
      if (allow < lpParsed) {
        const approveHash = await writeContractAsync({
          address: pairAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, maxUint256],
          gas: 100000n,
        });
        await waitForTx(approveHash); // wait before removeLiquidity
      }

      setTxState("removing");
      // Use WRITUAL address instead of native pseudo-address
      const addrA = tokenA.isNative ? CONTRACTS.WRITUAL : tokenA.address;
      const addrB = tokenB.isNative ? CONTRACTS.WRITUAL : tokenB.address;

      const hash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "removeLiquidity",
        args: [addrA, addrB, lpParsed, 0n, 0n, address, deadline],
        gas: 400000n,
      });

      setTxHash(hash);
      setTxState("success");
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Failed");
      setTxState("error");
    }
  }, [address, chainId, switchChainAsync, writeContractAsync]);

  const reset = useCallback(() => { setTxState("idle"); setTxHash(null); setError(null); }, []);
  return { txState, txHash, error, removeLiquidity, reset };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ethCall(params: object): Promise<string> {
  // Use window.ethereum to avoid server-side 403 from Ritual RPC
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const res = await (window as any).ethereum.request({ method: "eth_call", params: [params, "latest"] });
    return res || "0x";
  }
  return "0x";
}

async function getAmountsOut(amountIn: bigint, path: Address[]): Promise<bigint[]> {
  try {
    // selector: getAmountsOut(uint256,address[])
    const sel = "0xd06ca61f";
    const amtHex = amountIn.toString(16).padStart(64, "0");
    const offsetHex = "0000000000000000000000000000000000000000000000000000000000000040";
    const lenHex = path.length.toString(16).padStart(64, "0");
    const addrsHex = path.map(a => a.slice(2).toLowerCase().padStart(64, "0")).join("");
    const data = sel + amtHex + offsetHex + lenHex + addrsHex;
    const hex = await ethCall({ to: CONTRACTS.ROUTER, data });
    if (!hex || hex === "0x") return [amountIn, 0n];
    const raw = hex.slice(2);
    const offset = parseInt(raw.slice(0, 64), 16) * 2;
    const count  = parseInt(raw.slice(offset, offset + 64), 16);
    const amounts: bigint[] = [];
    for (let i = 0; i < count; i++) {
      amounts.push(BigInt("0x" + raw.slice(offset + 64 + i * 64, offset + 128 + i * 64)));
    }
    return amounts;
  } catch {
    return [amountIn, 0n];
  }
}

async function checkAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  try {
    const data = "0xdd62ed3e" + owner.slice(2).padStart(64, "0") + spender.slice(2).padStart(64, "0");
    const res = await ethCall({ to: token, data });
    if (res && res !== "0x") return BigInt(res);
  } catch {}
  return 0n;
}

async function waitForTx(hash: `0x${string}`, maxRetries = 40): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) continue;
      const receipt = await (window as any).ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      });
      if (receipt?.status === "0x1") return;
      if (receipt?.status === "0x0") throw new Error("Transaction reverted on-chain");
    } catch (e: any) {
      if (e?.message?.includes("reverted")) throw e;
    }
  }
  throw new Error("Transaction not mined after timeout");
}

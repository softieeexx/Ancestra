"use client";

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, useReadContract, useSwitchChain, usePublicClient } from "wagmi";
import { parseUnits, formatUnits, Address, maxUint256 } from "viem";
import { ROUTER_ABI, ERC20_ABI, PAIR_ABI } from "@/lib/abi";
import { CONTRACTS, RITUAL_CHAIN_ID, TOKENS, Token, deadlineMs } from "@/lib/constants";

export type TxState = "idle" | "approving" | "swapping" | "adding" | "removing" | "success" | "error";

export function useTokenApproval(token: Token | null, spender: Address, amount: bigint) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token?.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && token ? [address, spender] : undefined,
    query: { enabled: !!address && !!token && !token.isNative },
  });

  const needsApproval = !!(token && !token.isNative && allowance !== undefined && allowance < amount);

  const approve = useCallback(async () => {
    if (!token || token.isNative) return;
    await writeContractAsync({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, maxUint256],
      gas: 100000n,
    });
    await refetchAllowance();
  }, [token, spender, writeContractAsync, refetchAllowance]);

  return { needsApproval, approve };
}

export function useSwap() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amountsOut, setAmountsOut] = useState<bigint[]>([]);

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

      const path = buildPath(tokenIn, tokenOut);
      const deadline = deadlineMs();

      // Get expected output
      const routerAmountsOut = await getAmountsOut(parsedIn, path);
      const expectedOut = routerAmountsOut[routerAmountsOut.length - 1];
      const minOut = expectedOut * BigInt(10000 - slippageBps) / 10000n;
      setAmountsOut(routerAmountsOut);

      // Approve if needed (for non-native tokens)
      if (!tokenIn.isNative) {
        const allowance = await checkAllowance(tokenIn.address, address, CONTRACTS.ROUTER);
        if (allowance < parsedIn) {
          setTxState("approving");
          await writeContractAsync({
            address: tokenIn.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, maxUint256],
            gas: 100000n,
          });
        }
      }

      setTxState("swapping");
      let hash: `0x${string}`;

      if (tokenIn.isNative) {
        // Native RITUAL → Token (wrap + swap)
        // First wrap to WRITUAL
        const wrapHash = await writeContractAsync({
          address: CONTRACTS.WRITUAL,
          abi: [{ type: "function", name: "deposit", inputs: [], outputs: [], stateMutability: "payable" }],
          functionName: "deposit",
          value: parsedIn,
          gas: 100000n,
        });
        // Wait for wrap
        await waitForTx(wrapHash);
        // Approve WRITUAL for router
        const wApproveHash = await writeContractAsync({
          address: CONTRACTS.WRITUAL,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, maxUint256],
          gas: 100000n,
        });
        await waitForTx(wApproveHash);
        // Swap WRITUAL → tokenOut
        const writualPath = [CONTRACTS.WRITUAL, ...path.slice(1)];
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [parsedIn, minOut, writualPath, address, deadline],
          gas: 400000n,
        });
      } else if (tokenOut.isNative) {
        // Token → Native RITUAL (swap to WRITUAL, then unwrap)
        const writualPath = [...path.slice(0, -1), CONTRACTS.WRITUAL];
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [parsedIn, minOut, writualPath, address, deadline],
          gas: 400000n,
        });
        // Unwrap WRITUAL after swap
        await waitForTx(hash);
        const writualBal = await checkBalance(CONTRACTS.WRITUAL, address);
        if (writualBal > 0n) {
          await writeContractAsync({
            address: CONTRACTS.WRITUAL,
            abi: [{ type: "function", name: "withdraw", inputs: [{ name: "wad", type: "uint256" }], outputs: [], stateMutability: "nonpayable" }],
            functionName: "withdraw",
            args: [writualBal],
            gas: 100000n,
          });
        }
      } else {
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [parsedIn, minOut, path, address, deadline],
          gas: 400000n,
        });
      }

      setTxHash(hash!);
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
    setAmountsOut([]);
  }, []);

  return { txState, txHash, error, amountsOut, swap, reset };
}

// ── Liquidity hook ───────────────────────────────────────────────────────────
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

      // Approve both tokens
      setTxState("approving");
      for (const [tok, amt] of [[tokenA, parsedA], [tokenB, parsedB]] as [Token, bigint][]) {
        if (tok.isNative) continue;
        const allow = await checkAllowance(tok.address, address, CONTRACTS.ROUTER);
        if (allow < amt) {
          await writeContractAsync({
            address: tok.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, maxUint256],
            gas: 100000n,
          });
        }
      }

      setTxState("adding");
      const nativeToken = tokenA.isNative ? tokenA : tokenB.isNative ? tokenB : null;
      const erc20Token  = tokenA.isNative ? tokenB : tokenB.isNative ? tokenA : null;
      const nativeAmt   = tokenA.isNative ? parsedA : parsedB;
      const erc20Amt    = tokenA.isNative ? parsedB : parsedA;
      const erc20Min    = tokenA.isNative ? minB : minA;
      const nativeMin   = tokenA.isNative ? minA : minB;

      let hash: `0x${string}`;
      if (nativeToken && erc20Token) {
        // One side is native RITUAL → use addLiquidityRITUAL (payable)
        hash = await writeContractAsync({
          address: CONTRACTS.ROUTER,
          abi: ROUTER_ABI,
          functionName: "addLiquidityRITUAL",
          args: [erc20Token.address, erc20Amt, erc20Min, nativeMin, address, deadline],
          value: nativeAmt,
          gas: 500000n,
        });
      } else {
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

      const lpParsed = parseUnits(lpAmount, 18);
      const deadline = deadlineMs();

      // Approve LP token for router
      setTxState("approving");
      const allow = await checkAllowance(pairAddress, address, CONTRACTS.ROUTER);
      if (allow < lpParsed) {
        await writeContractAsync({
          address: pairAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACTS.ROUTER, maxUint256],
          gas: 100000n,
        });
      }

      setTxState("removing");
      const hash = await writeContractAsync({
        address: CONTRACTS.ROUTER,
        abi: ROUTER_ABI,
        functionName: "removeLiquidity",
        args: [tokenA.address, tokenB.address, lpParsed, 0n, 0n, address, deadline],
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

function buildPath(tokenIn: Token, tokenOut: Token): Address[] {
  const inAddr  = tokenIn.isNative  ? CONTRACTS.WRITUAL : tokenIn.address;
  const outAddr = tokenOut.isNative ? CONTRACTS.WRITUAL : tokenOut.address;
  // Direct path (no multi-hop in V1)
  return [inAddr, outAddr];
}

async function ethCall(params: object): Promise<string> {
  // Use window.ethereum in browser to avoid server-side 403 from Ritual RPC
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const res = await (window as any).ethereum.request({ method: "eth_call", params: [params, "latest"] });
    return res || "0x";
  }
  return "0x";
}

async function getAmountsOut(amountIn: bigint, path: Address[]): Promise<bigint[]> {
  try {
    const data = await ethCall({ to: CONTRACTS.ROUTER, data: encodeGetAmountsOut(amountIn, path) });
    const decoded = decodeAmountsOut(data);
    if (decoded.length > 0) return decoded;
  } catch {}
  return [amountIn, 0n];
}

async function checkAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  try {
    const data = await ethCall({ to: token, data: encodeAllowance(owner, spender) });
    if (data && data !== "0x") return BigInt(data);
  } catch {}
  return 0n;
}

async function checkBalance(token: Address, owner: Address): Promise<bigint> {
  try {
    const data = await ethCall({ to: token, data: encodeBalanceOf(owner) });
    if (data && data !== "0x") return BigInt(data);
  } catch {}
  return 0n;
}

async function waitForTx(hash: `0x${string}`, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const receipt = typeof window !== "undefined" && (window as any).ethereum
        ? await (window as any).ethereum.request({ method: "eth_getTransactionReceipt", params: [hash] })
        : null;
      if (receipt?.status === "0x1") return;
      if (receipt?.status === "0x0") throw new Error("Transaction reverted");
    } catch (e: any) {
      if (e?.message?.includes("reverted")) throw e;
    }
  }
}

// Minimal ABI encoding helpers (avoid viem dependency in pure utils)
function encodeGetAmountsOut(amountIn: bigint, path: Address[]): string {
  // selector: getAmountsOut(uint256,address[])
  const sel = "0xd06ca61f";
  const amtHex = amountIn.toString(16).padStart(64, "0");
  const offsetHex = "0000000000000000000000000000000000000000000000000000000000000040";
  const lenHex = path.length.toString(16).padStart(64, "0");
  const addrsHex = path.map(a => a.slice(2).toLowerCase().padStart(64, "0")).join("");
  return sel + amtHex + offsetHex + lenHex + addrsHex;
}

function decodeAmountsOut(hex: string): bigint[] {
  try {
    if (!hex || hex === "0x") return [];
    const data = hex.slice(2);
    const offset = parseInt(data.slice(0, 64), 16) * 2;
    const count = parseInt(data.slice(offset, offset + 64), 16);
    const amounts: bigint[] = [];
    for (let i = 0; i < count; i++) {
      amounts.push(BigInt("0x" + data.slice(offset + 64 + i * 64, offset + 128 + i * 64)));
    }
    return amounts;
  } catch { return []; }
}

function encodeAllowance(owner: Address, spender: Address): string {
  return "0xdd62ed3e" +
    owner.slice(2).padStart(64, "0") +
    spender.slice(2).padStart(64, "0");
}

function encodeBalanceOf(owner: Address): string {
  return "0x70a08231" + owner.slice(2).padStart(64, "0");
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Address, parseAbiItem } from "viem";
import { CONTRACTS } from "@/lib/constants";
import { ritualChain } from "@/lib/config";

const ALL_PAIR_ADDRESSES: Address[] = [
  CONTRACTS.PAIR_WRITUAL_USDC,
  CONTRACTS.PAIR_WRITUAL_USDT,
  CONTRACTS.PAIR_WRITUAL_DAI,
  CONTRACTS.PAIR_WRITUAL_WETH,
  CONTRACTS.PAIR_WRITUAL_MON,
  CONTRACTS.PAIR_WRITUAL_SOL,
  CONTRACTS.PAIR_WRITUAL_BTC,
  CONTRACTS.PAIR_WRITUAL_PEPE,
  CONTRACTS.PAIR_WRITUAL_SHIB,
  CONTRACTS.PAIR_WRITUAL_DOGE,
];

const SWAP_EVENT = parseAbiItem(
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)"
);

// RPC caps queries at 99,999 blocks. We scan backwards in this chunk size.
const CHUNK_SIZE = 99_999n;
// How many chunks to scan back from latest (5 × 100k = 500k blocks ≈ full testnet history)
const MAX_CHUNKS = 5;

const STORAGE_KEY_PREFIX = "ancestra_swaps_";

export interface SwapRecord {
  txHash: string;
  pairAddress: string;
  blockNumber: number;
}

function storageKey(address: Address) {
  return STORAGE_KEY_PREFIX + address.toLowerCase();
}

function loadCached(address: Address): SwapRecord[] {
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(address: Address, records: SwapRecord[]) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(records));
  } catch {}
}

export function useSwapCount() {
  const { address } = useAccount();
  const client = usePublicClient({ chainId: ritualChain.id });
  const [swapCount, setSwapCount]   = useState(0);
  const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchSwaps = useCallback(async () => {
    if (!address || !client) return;

    setLoading(true);
    setError(null);

    const cached   = loadCached(address);
    const seenHashes = new Set(cached.map((r) => r.txHash));
    const fresh: SwapRecord[] = [];

    try {
      // Get current block number
      const latestBlock = await client.getBlockNumber();

      // Scan backwards in 99,999-block chunks
      for (let chunk = 0; chunk < MAX_CHUNKS; chunk++) {
        const toBlock   = latestBlock - BigInt(chunk) * CHUNK_SIZE;
        const fromBlock = toBlock >= CHUNK_SIZE ? toBlock - CHUNK_SIZE + 1n : 0n;

        if (toBlock < 0n) break;

        // Query all pairs in parallel for this block range
        const chunkResults = await Promise.allSettled(
          ALL_PAIR_ADDRESSES.map((pairAddr) =>
            client.getLogs({
              address: pairAddr,
              event: SWAP_EVENT,
              args: { to: address },
              fromBlock,
              toBlock,
            }).then((logs) => logs.map((log) => ({ log, pairAddr })))
          )
        );

        for (const result of chunkResults) {
          if (result.status !== "fulfilled") continue;
          for (const { log, pairAddr } of result.value) {
            const hash = log.transactionHash ?? "";
            if (hash && !seenHashes.has(hash)) {
              seenHashes.add(hash);
              fresh.push({
                txHash: hash,
                pairAddress: pairAddr,
                blockNumber: Number(log.blockNumber ?? 0n),
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error("useSwapCount fetch failed:", err);
      setError(err?.message ?? "Failed to fetch swap history");
    }

    const all = [...cached, ...fresh].sort((a, b) => a.blockNumber - b.blockNumber);
    // Deduplicate by txHash (in case cache and fresh overlap)
    const deduped = Array.from(new Map(all.map((r) => [r.txHash, r])).values());

    if (fresh.length > 0) {
      saveCache(address, deduped);
    }

    setSwapRecords(deduped);
    setSwapCount(deduped.length);
    setLoading(false);
  }, [address, client]);

  useEffect(() => {
    if (address) {
      // Show cached count immediately while fetching fresh
      const cached = loadCached(address);
      setSwapRecords(cached);
      setSwapCount(cached.length);
      fetchSwaps();
    } else {
      setSwapCount(0);
      setSwapRecords([]);
    }
  }, [address, fetchSwaps]);

  return { swapCount, swapRecords, loading, error, refresh: fetchSwaps };
}

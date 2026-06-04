"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Address, parseAbiItem } from "viem";
import { POOLS } from "@/lib/constants";
import { ritualChain } from "@/lib/config";

const SWAP_EVENT = parseAbiItem(
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)"
);

const STORAGE_KEY_PREFIX = "ancestra_swaps_";

export interface SwapRecord {
  txHash: string;
  poolId: string;
  timestamp: number;
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
  const [swapCount, setSwapCount] = useState(0);
  const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSwaps = useCallback(async () => {
    if (!address || !client) return;

    setLoading(true);
    const cached = loadCached(address);
    const seenHashes = new Set(cached.map((r) => r.txHash));
    const fresh: SwapRecord[] = [];

    const poolAddresses = Object.entries(POOLS)
      .map(([id, pool]) => ({ id, address: pool.pairAddress as Address }))
      .filter((p) => !!p.address);

    try {
      for (const pool of poolAddresses) {
        const logs = await client.getLogs({
          address: pool.address,
          event: SWAP_EVENT,
          args: { to: address },
          fromBlock: 0n,
        });

        for (const log of logs) {
          const hash = log.transactionHash ?? "";
          if (!seenHashes.has(hash)) {
            seenHashes.add(hash);
            fresh.push({
              txHash: hash,
              poolId: pool.id,
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch swap logs:", err);
    }

    const all = [...cached, ...fresh];
    if (fresh.length > 0) {
      saveCache(address, all);
    }

    setSwapRecords(all);
    setSwapCount(all.length);
    setLoading(false);
  }, [address, client]);

  // Fetch on mount and when address changes
  useEffect(() => {
    if (address) {
      // Load cached count immediately for instant render
      const cached = loadCached(address);
      setSwapRecords(cached);
      setSwapCount(cached.length);
      fetchSwaps();
    } else {
      setSwapCount(0);
      setSwapRecords([]);
    }
  }, [address, fetchSwaps]);

  return { swapCount, swapRecords, loading, refresh: fetchSwaps };
}

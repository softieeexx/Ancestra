"use client";

import { useCallback, useState } from "react";
import { Address } from "viem";

export interface Achievement {
  id: string;
  tier: number;
  name: string;
  culture: string;
  requiredSwaps: number;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "omume-ala",
    tier: 1,
    name: "Omume Ala",
    culture: "Igbo",
    requiredSwaps: 3,
    description: "Tradition of the Land — First steps on the ancestral path",
  },
  {
    id: "ebo",
    tier: 2,
    name: "Ẹbọ",
    culture: "Yoruba",
    requiredSwaps: 5,
    description: "Sacred Offering — The ritual deepens, the path widens",
  },
  {
    id: "alada",
    tier: 3,
    name: "Al'ada",
    culture: "Hausa",
    requiredSwaps: 7,
    description: "Living Tradition — Mastery woven into the fabric of time",
  },
];

const CLAIMED_KEY_PREFIX = "ancestra_claimed_";

function claimedKey(address: Address) {
  return CLAIMED_KEY_PREFIX + address.toLowerCase();
}

function loadClaimed(address: Address): Set<string> {
  try {
    const raw = localStorage.getItem(claimedKey(address));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveClaimed(address: Address, claimed: Set<string>) {
  try {
    localStorage.setItem(claimedKey(address), JSON.stringify([...claimed]));
  } catch {}
}

export function useAchievements(swapCount: number, address: Address | undefined) {
  const getClaimed = useCallback((): Set<string> => {
    if (!address) return new Set();
    return loadClaimed(address);
  }, [address]);

  const markClaimed = useCallback(
    (achievementId: string) => {
      if (!address) return;
      const claimed = loadClaimed(address);
      claimed.add(achievementId);
      saveClaimed(address, claimed);
    },
    [address]
  );

  const isClaimed = useCallback(
    (achievementId: string) => getClaimed().has(achievementId),
    [getClaimed]
  );

  const isUnlocked = useCallback(
    (achievement: Achievement) => swapCount >= achievement.requiredSwaps,
    [swapCount]
  );

  // Achievements that are newly unlocked but not yet claimed
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (a) => isUnlocked(a) && !isClaimed(a.id)
  );

  return {
    achievements: ACHIEVEMENTS,
    isUnlocked,
    isClaimed,
    markClaimed,
    newlyUnlocked,
  };
}

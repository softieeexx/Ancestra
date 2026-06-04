"use client";

import { useState, useCallback } from "react";
import { useAccount, useEnsName } from "wagmi";
import { Address } from "viem";
import { useSwapCount } from "@/hooks/useSwapCount";
import { useAchievements, Achievement, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { generateAchievementCard, downloadCard } from "@/lib/generateAchievementCard";

function formatDate(ts?: number): string {
  const d = ts ? new Date(ts * 1000) : new Date();
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface AchievementCardRowProps {
  achievement: Achievement;
  unlocked: boolean;
  claimed: boolean;
  swapCount: number;
  walletDisplay: string;
  onDownload: (a: Achievement) => void;
  downloading: boolean;
}

function AchievementCardRow({
  achievement,
  unlocked,
  claimed,
  swapCount,
  walletDisplay,
  onDownload,
  downloading,
}: AchievementCardRowProps) {
  const cultureColors: Record<string, { accent: string; border: string }> = {
    Igbo: { accent: "#E07020", border: "rgba(224,112,32,0.3)" },
    Yoruba: { accent: "#4060C0", border: "rgba(64,96,192,0.3)" },
    Hausa: { accent: "#20A060", border: "rgba(32,160,96,0.3)" },
  };
  const colors = cultureColors[achievement.culture] ?? { accent: "#D4A853", border: "rgba(212,168,83,0.3)" };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all"
      style={{
        borderColor: unlocked ? colors.border : "rgba(255,255,255,0.05)",
        background: unlocked
          ? `linear-gradient(135deg, ${colors.accent}08, transparent)`
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Badge glyph */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border"
        style={{
          borderColor: unlocked ? colors.accent : "rgba(255,255,255,0.1)",
          color: unlocked ? colors.accent : "rgba(255,255,255,0.2)",
          background: unlocked ? `${colors.accent}12` : "transparent",
        }}
      >
        {unlocked ? "◈" : "◇"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="font-display font-bold text-base"
            style={{ color: unlocked ? "#EEEEEF" : "rgba(255,255,255,0.3)" }}
          >
            {achievement.name}
          </span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{
              background: unlocked ? `${colors.accent}20` : "rgba(255,255,255,0.05)",
              color: unlocked ? colors.accent : "rgba(255,255,255,0.2)",
            }}
          >
            {achievement.culture}
          </span>
        </div>
        <p className="text-xs text-earth-100/40 truncate">{achievement.description}</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
          {unlocked
            ? `✓ ${achievement.requiredSwaps} swaps completed`
            : `${swapCount}/${achievement.requiredSwaps} swaps`}
        </p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {unlocked ? (
          <button
            onClick={() => onDownload(achievement)}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: downloading ? "rgba(255,255,255,0.05)" : `${colors.accent}22`,
              border: `1px solid ${colors.border}`,
              color: downloading ? "rgba(255,255,255,0.3)" : colors.accent,
            }}
          >
            {downloading ? (
              <span>Generating…</span>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {claimed ? "Re-download" : "Download Card"}
              </>
            )}
          </button>
        ) : (
          <div className="text-xs text-earth-100/20 font-mono px-3 py-2">
            Locked
          </div>
        )}
      </div>
    </div>
  );
}

interface AchievementPanelProps {
  /** If true, shows as a compact strip (for swap page sidebar). Default: full panel. */
  compact?: boolean;
}

export default function AchievementPanel({ compact = false }: AchievementPanelProps) {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { swapCount, loading, refresh } = useSwapCount();
  const { isUnlocked, isClaimed, markClaimed, newlyUnlocked } =
    useAchievements(swapCount, address as Address | undefined);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const walletDisplay = ensName ?? (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "");

  const handleDownload = useCallback(
    async (achievement: Achievement) => {
      if (!address) return;
      setDownloadingId(achievement.id);
      try {
        const blob = await generateAchievementCard({
          achievement,
          walletDisplay: ensName ?? address,
          swapCount,
          dateEarned: formatDate(),
        });
        downloadCard(blob, `ancestra-${achievement.id}-${address.slice(2, 8)}.png`);
        markClaimed(achievement.id);
      } catch (err) {
        console.error("Card generation failed:", err);
      } finally {
        setDownloadingId(null);
      }
    },
    [address, ensName, swapCount, markClaimed]
  );

  if (!address) return null;

  if (compact) {
    // Compact strip — used inside swap page
    const nextUnlocked = ACHIEVEMENTS.find((a) => isUnlocked(a));
    const nextTarget = ACHIEVEMENTS.find((a) => !isUnlocked(a));
    return (
      <div className="rounded-xl border border-ritual/10 bg-earth-700/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono text-earth-100/40 tracking-widest uppercase">Achievements</p>
          <span className="text-xs text-ritual font-semibold">{swapCount} swaps</span>
        </div>
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = isUnlocked(a);
            return (
              <div key={a.id} className="flex items-center gap-2">
                <span className={`text-sm ${unlocked ? "text-ritual" : "text-earth-100/20"}`}>
                  {unlocked ? "◈" : "◇"}
                </span>
                <span className={`text-xs flex-1 ${unlocked ? "text-earth-100/70" : "text-earth-100/20"}`}>
                  {a.name} <span className="text-earth-100/30">({a.requiredSwaps})</span>
                </span>
                {unlocked && (
                  <button
                    onClick={() => handleDownload(a)}
                    disabled={downloadingId === a.id}
                    className="text-xs text-ritual/70 hover:text-ritual transition-colors disabled:opacity-40"
                  >
                    {downloadingId === a.id ? "…" : "↓"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {nextTarget && (
          <p className="text-xs text-earth-100/30 mt-3">
            {nextTarget.requiredSwaps - swapCount} more swap{nextTarget.requiredSwaps - swapCount !== 1 ? "s" : ""} to unlock{" "}
            <span className="text-earth-100/50">{nextTarget.name}</span>
          </p>
        )}
      </div>
    );
  }

  // Full panel
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-display font-bold text-white">Achievements</h3>
          <p className="text-xs text-earth-100/40">
            {loading ? "Loading…" : `${swapCount} swap${swapCount !== 1 ? "s" : ""} on Ritual testnet`}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-ritual/60 hover:text-ritual transition-colors disabled:opacity-30 font-mono"
        >
          {loading ? "…" : "↻ Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        {ACHIEVEMENTS.map((a) => (
          <AchievementCardRow
            key={a.id}
            achievement={a}
            unlocked={isUnlocked(a)}
            claimed={isClaimed(a.id)}
            swapCount={swapCount}
            walletDisplay={walletDisplay}
            onDownload={handleDownload}
            downloading={downloadingId === a.id}
          />
        ))}
      </div>

      {newlyUnlocked.length > 0 && (
        <div className="mt-4 p-3 rounded-xl border border-ritual/20 bg-ritual/5 text-center">
          <p className="text-xs text-ritual font-semibold">
            🎉 New achievement{newlyUnlocked.length > 1 ? "s" : ""} unlocked
          </p>
          <p className="text-xs text-earth-100/50 mt-1">
            {newlyUnlocked.map((a) => a.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

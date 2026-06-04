"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { POOLS, ModeId } from "@/lib/constants";
import { useAccount } from "wagmi";
import SwapInterface from "@/components/SwapInterface";
import AppNav from "@/components/AppNav";

export default function ModePage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const mode = params.mode as ModeId;
  const pool = POOLS[mode];

  useEffect(() => { if (!pool) router.replace("/"); }, [pool, router]);
  useEffect(() => { if (!isConnected) router.replace("/"); }, [isConnected, router]);

  if (!pool || !isConnected) return null;

  const accent = pool.color;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "#0a0803" }}>
      {/* Mode ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accent}0a 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      {/* ── Shared nav ──────────────────────────────────── */}
      <div className="relative z-10">
        <AppNav />
      </div>

      {/* ── Mode badge ──────────────────────────────────── */}
      <div className="relative z-10 flex justify-center pt-6 pb-2">
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 5px ${accent}` }} />
          <span className="font-cinzel font-semibold text-white" style={{ fontSize: "0.8rem" }}>
            {pool.name}
          </span>
          <span className="font-rajdhani text-xs tracking-wider" style={{ color: accent, fontSize: "0.62rem", letterSpacing: "0.14em" }}>
            {pool.subtitle.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Swap widget ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6">
        <SwapInterface mode={mode} />
      </main>

      <footer
        className="relative z-10 text-center pb-6"
        style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.65rem", letterSpacing: "0.2em", fontFamily: "Rajdhani, sans-serif" }}
      >
        RITUAL TESTNET · ANCESTRA DEX
      </footer>
    </div>
  );
}

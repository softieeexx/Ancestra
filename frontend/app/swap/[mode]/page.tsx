"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { POOLS, ModeId } from "@/lib/constants";

const QUEEN_TITLES: Record<ModeId, { title: string; font: string; color: string }> = {
  amina:     { title: "Queen of Zaria",        font: "Cinzel",   color: "#4ADE80" },
  nefertiti: { title: "Queen of Egypt",         font: "Cinzel",   color: "#FBBF24" },
  yaa:       { title: "Queen Mother of Ejisu",  font: "Rajdhani", color: "#F87171" },
};
import { useAccount } from "wagmi";
import SwapInterface from "@/components/SwapInterface";
import AppNav from "@/components/AppNav";
import DappFrame from "@/components/DappFrame";

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
  const queenTitle = QUEEN_TITLES[mode];

  return (
    <DappFrame>
      {/* Mode ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
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
      <div className="relative z-10 flex justify-center pt-4 sm:pt-6 pb-2">
        <div
          className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full"
          style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}
        >
          {/* Tiny legend portrait */}
          <div
            className="w-7 h-7 rounded-full overflow-hidden relative flex-shrink-0"
            style={{ border: `1.5px solid ${accent}60`, boxShadow: `0 0 8px ${accent}40` }}
          >
            <Image
              src={`/legends/${mode}.jpeg`}
              alt={pool.name}
              fill
              className="object-cover object-top"
              sizes="28px"
            />
          </div>
          <span className="font-cinzel font-semibold text-white" style={{ fontSize: "0.8rem" }}>
            {pool.name}
          </span>
          <span className="font-rajdhani tracking-wider" style={{ color: accent, fontSize: "0.62rem", letterSpacing: "0.14em" }}>
            {pool.subtitle.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Queen title ──────────────────────────────────── */}
      <div className="relative z-10 flex justify-center pb-1">
        <p
          style={{
            fontFamily: queenTitle.font === "Rajdhani" ? "Rajdhani, sans-serif" : "Cinzel, serif",
            color: queenTitle.color,
            fontSize: queenTitle.font === "Rajdhani" ? "0.78rem" : "0.7rem",
            letterSpacing: queenTitle.font === "Rajdhani" ? "0.18em" : "0.12em",
            opacity: 0.7,
            fontStyle: queenTitle.font === "Cinzel" ? "italic" : "normal",
            fontWeight: queenTitle.font === "Rajdhani" ? 600 : 400,
          }}
        >
          {queenTitle.title}
        </p>
      </div>

      {/* ── Swap widget ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6">
        <SwapInterface mode={mode} />
      </main>

      <footer
        className="relative z-10 text-center pb-4 sm:pb-6"
        style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.65rem", letterSpacing: "0.2em", fontFamily: "Rajdhani, sans-serif" }}
      >
        RITUAL TESTNET · ANCESTRA DEX
      </footer>
    </DappFrame>
  );
}

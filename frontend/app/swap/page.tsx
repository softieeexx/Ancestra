"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import AppNav from "@/components/AppNav";
import DappFrame from "@/components/DappFrame";
import LegendCard from "@/components/LegendCard";
import { ModeId } from "@/lib/constants";

const MODES: ModeId[] = ["amina", "nefertiti", "yaa"];

export default function SwapSelectPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) router.replace("/");
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <DappFrame>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.06) 0%, transparent 65%)", zIndex: 0 }}
      />

      <div className="relative z-10">
        <AppNav />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 md:py-14">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="font-rajdhani font-semibold tracking-[0.4em] uppercase mb-3" style={{ color: "#c9a84c", fontSize: "0.65rem" }}>
            Choose Your Legend
          </p>
          <h1 className="font-cinzel font-black text-white leading-tight" style={{ fontSize: "clamp(1.6rem, 5vw, 3rem)" }}>
            Select a Swap Mode
          </h1>
          <p className="mt-3 mx-auto" style={{ color: "rgba(245,230,200,0.45)", fontSize: "0.9rem", fontFamily: "Inter, sans-serif", fontWeight: 300, maxWidth: "360px" }}>
            Each legend opens a RITUAL-centric swap pool rooted in ancestral identity.
          </p>
        </div>

        {/* 3 cards */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {MODES.map((mode, i) => (
            <LegendCard key={mode} mode={mode} index={i} />
          ))}
        </div>

        <p className="mt-8 md:mt-10 font-rajdhani text-center tracking-wider" style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>
          RITUAL TESTNET · ALL SWAPS ON-CHAIN
        </p>
      </main>
    </DappFrame>
  );
}

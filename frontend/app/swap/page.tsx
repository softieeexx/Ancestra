"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import LegendCard from "@/components/LegendCard";
import { ModeId } from "@/lib/constants";

const MODES: ModeId[] = ["amina", "nefertiti", "yaa"];

function LogoIcon() {
  return (
    <div
      className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 relative"
      style={{ background: "#1a6b3a" }}
    >
      <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" priority />
    </div>
  );
}

export default function SwapSelectPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  // Guard: not connected → back to landing
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "#0a0803" }}
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.06) 0%, transparent 65%)",
          zIndex: 0,
        }}
      />

      {/* ── Nav bar ─────────────────────────────────────── */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.10)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <LogoIcon />
          <span
            className="font-cinzel font-semibold text-white tracking-[0.2em]"
            style={{ fontSize: "0.85rem" }}
          >
            ANCESTRA
          </span>
        </button>

        {/* Wallet pill */}
        <ConnectKitButton.Custom>
          {({ address }) => (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs"
              style={{
                background: "rgba(212,168,83,0.08)",
                border: "1px solid rgba(212,168,83,0.2)",
                color: "#D4A853",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#3ddc84", boxShadow: "0 0 5px #3ddc84" }}
              />
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connected"}
            </div>
          )}
        </ConnectKitButton.Custom>
      </nav>

      {/* ── Main content ────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-10 md:py-14">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <p
            className="font-rajdhani font-semibold tracking-[0.4em] uppercase mb-3"
            style={{ color: "#c9a84c", fontSize: "0.65rem" }}
          >
            Choose Your Legend
          </p>
          <h1
            className="font-cinzel font-black text-white leading-tight"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            Select a Swap Mode
          </h1>
          <p
            className="mt-3 mx-auto"
            style={{
              color: "rgba(245,230,200,0.45)",
              fontSize: "0.9rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 300,
              maxWidth: "360px",
            }}
          >
            Each legend opens a RITUAL-centric swap pool rooted in ancestral identity.
          </p>
        </div>

        {/* ── 3 Legend cards ────────────────────────────── */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {MODES.map((mode, i) => (
            <LegendCard key={mode} mode={mode} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p
          className="mt-10 font-rajdhani text-center tracking-wider"
          style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
        >
          RITUAL TESTNET · ALL SWAPS ON-CHAIN
        </p>
      </main>
    </div>
  );
}

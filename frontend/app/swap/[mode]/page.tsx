"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import { POOLS, ModeId } from "@/lib/constants";
import { useAccount } from "wagmi";
import SwapInterface from "@/components/SwapInterface";
import WalletConnect from "@/components/WalletConnect";

function LogoIcon() {
  return (
    <div
      className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 relative"
      style={{ background: "#1a6b3a" }}
    >
      <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" />
    </div>
  );
}

export default function ModePage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const mode = params.mode as ModeId;
  const pool = POOLS[mode];

  // Invalid mode → back to landing
  useEffect(() => {
    if (!pool) router.replace("/");
  }, [pool, router]);

  // Not connected → back to landing
  useEffect(() => {
    if (!isConnected) router.replace("/");
  }, [isConnected, router]);

  if (!pool || !isConnected) return null;

  const accent = pool.color;

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: "#0a0803" }}
    >
      {/* Mode ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accent}0a 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Back → legend picker */}
        <button
          onClick={() => router.push("/swap")}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem" }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9.5 11.5L5.5 7.5L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rajdhani font-medium tracking-wider" style={{ letterSpacing: "0.12em" }}>
            LEGENDS
          </span>
        </button>

        {/* Mode pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: `${accent}12`,
            border: `1px solid ${accent}30`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 5px ${accent}` }}
          />
          <span
            className="font-cinzel font-semibold text-white"
            style={{ fontSize: "0.78rem" }}
          >
            {pool.name}
          </span>
          <span
            className="font-rajdhani text-xs tracking-wider"
            style={{ color: accent, fontSize: "0.62rem", letterSpacing: "0.14em" }}
          >
            {pool.subtitle.toUpperCase()}
          </span>
        </div>

        {/* Wallet address pill */}
        <ConnectKitButton.Custom>
          {({ address }) => (
            <div
              className="font-mono text-xs px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1.5"
              style={{
                background: "rgba(212,168,83,0.06)",
                border: "1px solid rgba(212,168,83,0.15)",
                color: "rgba(212,168,83,0.7)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#3ddc84", boxShadow: "0 0 5px #3ddc84" }}
              />
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
            </div>
          )}
        </ConnectKitButton.Custom>
      </nav>

      {/* ── Swap widget ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <SwapInterface mode={mode} />
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 text-center pb-6"
        style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.65rem", letterSpacing: "0.2em", fontFamily: "Rajdhani, sans-serif" }}
      >
        RITUAL TESTNET · ANCESTRA DEX
      </footer>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { POOLS, ModeId } from "@/lib/constants";
import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import SwapInterface from "@/components/SwapInterface";
import { useEffect } from "react";

export default function SwapPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useAccount();
  const mode = params.mode as ModeId;

  const pool = POOLS[mode];

  // Redirect to home if invalid mode
  useEffect(() => {
    if (!pool) router.push("/");
  }, [pool, router]);

  if (!pool) return null;

  const color = pool.color;

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-earth-100/50 hover:text-ritual transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-display text-white">{pool.name}</span>
        </div>

        <WalletConnect />
      </div>

      {/* Mode banner */}
      <div
        className="text-center mb-8 py-6 rounded-2xl animate-fade-in"
        style={{
          background: `linear-gradient(135deg, ${color}08, transparent, ${color}05)`,
          border: `1px solid ${color}20`,
        }}
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          {pool.name}
        </h1>
        <p className="text-sm" style={{ color: color }}>
          {pool.subtitle} — {pool.description}
        </p>
      </div>

      {/* Swap interface */}
      {isConnected ? (
        <SwapInterface mode={mode} />
      ) : (
        <div className="flex flex-col items-center gap-4 mt-12">
          <p className="text-earth-100/50 text-sm">Connect your wallet to swap</p>
          <WalletConnect />
        </div>
      )}
    </div>
  );
}

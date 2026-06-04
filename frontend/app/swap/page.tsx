"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import SwapWidget from "@/components/dex/SwapWidget";

export default function SwapPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-earth-100/50 hover:text-ritual transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </button>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/swap" className="text-ritual font-semibold">Swap</a>
          <a href="/liquidity" className="text-earth-100/50 hover:text-white transition-colors">Liquidity</a>
          <a href="/pools" className="text-earth-100/50 hover:text-white transition-colors">Pools</a>
          <a href="/portfolio" className="text-earth-100/50 hover:text-white transition-colors">Portfolio</a>
        </nav>
        <WalletConnect />
      </div>

      {isConnected ? (
        <div className="flex justify-center">
          <SwapWidget />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-16">
          <p className="text-earth-100/50 text-sm">Connect your wallet to swap</p>
          <WalletConnect />
        </div>
      )}
    </div>
  );
}

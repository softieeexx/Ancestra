"use client";

import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import LegendCard from "@/components/LegendCard";
import { ModeId } from "@/lib/constants";

const modes: ModeId[] = ["amina", "nefertiti", "yaa"];

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Landing section (when not connected) */}
      {!isConnected && (
        <div className="flex flex-col items-center text-center max-w-lg animate-fade-in">
          {/* Decorative symbol */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 rounded-full border-2 border-ritual/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-ritual/20 flex items-center justify-center">
                <span className="text-3xl text-ritual/60 font-display">◈</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-3 tracking-wide">
            Ancestra
          </h1>
          <p className="text-ritual/70 text-sm font-display italic mb-2">
            ancient identity meets modern liquidity
          </p>
          <p className="text-earth-100/40 text-sm mb-10 max-w-xs">
            A RITUAL-centric AMM on Ritual Chain
          </p>

          {/* Connect button */}
          <WalletConnect />
        </div>
      )}

      {/* Legend selection (when connected) */}
      {isConnected && (
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              Ancestra
            </h1>
            <p className="text-ritual/60 text-sm font-display italic">
              choose your legend
            </p>
            <div className="mt-4">
              <WalletConnect />
            </div>
          </div>

          {/* Legend cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map((mode, i) => (
              <LegendCard key={mode} mode={mode} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

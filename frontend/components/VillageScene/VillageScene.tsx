"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ModeId } from "@/lib/constants";
import VillageCanvas from "./VillageCanvas";
import WalletConnect from "@/components/WalletConnect";
import LegendCard from "@/components/LegendCard";
import AchievementPanel from "@/components/AchievementPanel";

const modes: ModeId[] = ["amina", "nefertiti", "yaa"];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function VillageScene() {
  const { isConnected } = useAccount();
  const [showConnected, setShowConnected] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => setShowConnected(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowConnected(false);
    }
  }, [isConnected]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0D0A03]">
      {/* Canvas — always active */}
      <div className="absolute inset-0">
        <VillageCanvas dimmed={showConnected} isMobile={isMobile} />
      </div>

      {/* Disconnected UI overlay */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center
          transition-all duration-700 ease-out px-4
          ${
            showConnected
              ? "opacity-0 pointer-events-none translate-y-[-20px]"
              : "opacity-100"
          }
        `}
      >
        {/* Logo placeholder (replace with <Image> when logo is provided) */}
        <h1
          className="text-5xl md:text-7xl font-display font-bold text-white mb-3 tracking-wide"
          style={{ textShadow: "0 2px 20px rgba(212,168,83,0.3)" }}
        >
          ANCESTRA
        </h1>
        <p className="text-ritual/70 text-sm md:text-base font-display italic mb-2">
          ancient identity meets modern liquidity
        </p>
        <p className="text-earth-100/40 text-xs md:text-sm mb-10">
          A RITUAL-centric AMM on Ritual Chain
        </p>
        <div className="animate-pulse-glow">
          <WalletConnect />
        </div>
      </div>

      {/* Connected UI overlay */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center
          transition-all duration-700 ease-out px-4
          ${
            showConnected
              ? "opacity-100 translate-y-0"
              : "opacity-0 pointer-events-none translate-y-[30px]"
          }
        `}
      >
        {/* Wallet badge top-right */}
        <div className="absolute top-6 right-6">
          <WalletConnect />
        </div>

        {/* Logo in connected state */}
        <div className="absolute top-6 left-6">
          <span className="text-ritual font-display font-bold text-lg tracking-wide">
            ANCESTRA
          </span>
        </div>

        {/* Legend cards */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              choose your legend
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map((mode, i) => (
              <LegendCard key={mode} mode={mode} index={i} />
            ))}
          </div>
          {/* Achievement strip */}
          <div className="mt-6">
            <AchievementPanel compact />
          </div>
        </div>
      </div>
    </div>
  );
}

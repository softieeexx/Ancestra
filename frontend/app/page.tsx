"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import VillageCanvas from "@/components/VillageScene/VillageCanvas";

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

function DiamondIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="10" y="1.5" width="12" height="12" rx="1" transform="rotate(45 10 1.5)" stroke="#D4A853" strokeWidth="1.2" />
      <rect x="10" y="5"   width="6"  height="6"  rx="0.5" transform="rotate(45 10 5)"   stroke="#D4A853" strokeWidth="0.8" />
    </svg>
  );
}

function ConnectButton() {
  const router = useRouter();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address }) => (
        <button
          onClick={() => { isConnected ? router.push("/swap") : show?.(); }}
          className="px-14 py-4 text-sm font-cinzel uppercase transition-all duration-200 hover:bg-ritual/10 active:scale-[0.98]"
          style={{
            border: "1px solid #D4A853",
            color: "#D4A853",
            background: "rgba(0,0,0,0.25)",
            letterSpacing: "0.3em",
          }}
        >
          {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

const FEATURES = [
  { title: "RITUAL-CENTRIC",   desc: "All pools are RITUAL pairs" },
  { title: "ANCESTRAL DESIGN", desc: "Rooted in culture, built for the future" },
  { title: "COMMUNITY DRIVEN", desc: "By the people, for the people" },
];

export default function HomePage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "#070508" }}>

      {/* ── Layer 1: Cinematic CSS background matching 2.jpeg ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 45% 55% at 82% 42%, rgba(18, 72, 110, 0.32) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 68% 30%, rgba(140, 72, 18, 0.48) 0%, transparent 65%),
            radial-gradient(ellipse 35% 30% at 78% 20%, rgba(170, 88, 20, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse 70% 35% at 55% 60%, rgba(90, 45, 10, 0.55) 0%, transparent 65%),
            radial-gradient(ellipse 90% 25% at 50% 98%, rgba(20, 10, 3, 0.9)   0%, transparent 80%),
            linear-gradient(155deg, #04020A 0%, #08050A 20%, #0C0806 45%, #090604 70%, #060402 100%)
          `,
        }}
      />

      {/* ── Layer 2: Animated village canvas at very low opacity ── */}
      <div className="absolute inset-0" style={{ opacity: 0.11, mixBlendMode: "screen" }}>
        <VillageCanvas dimmed={false} isMobile={isMobile} />
      </div>

      {/* ── Layer 3: Left-side readability gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(4,2,8,0.88) 0%, rgba(4,2,8,0.80) 28%, rgba(4,2,8,0.50) 48%, rgba(4,2,8,0.12) 68%, transparent 85%)",
        }}
      />

      {/* ── Layer 4: Top vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(4,2,8,0.6) 0%, transparent 22%)" }}
      />

      {/* ── Layer 5: UI ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
              <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" priority />
            </div>
            <span
              className="font-cinzel text-white font-semibold"
              style={{ fontSize: "1rem", letterSpacing: "0.25em" }}
            >
              ANCESTRA
            </span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2 rounded-full font-cinzel text-xs tracking-widest transition-colors hover:bg-ritual/10"
            style={{ border: "1px solid rgba(212,168,83,0.5)", color: "#D4A853" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7"   y="0.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="0.5" y="7"   width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7"   y="7"   width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
            </svg>
            DOCS
          </Link>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex items-center px-8 md:px-14 lg:px-20 pb-8">
          <div style={{ maxWidth: "520px" }}>
            <h1
              className="font-cinzel font-black text-white leading-[0.88] mb-7 select-none"
              style={{
                fontSize: "clamp(4.5rem, 12vw, 9.5rem)",
                textShadow: "0 0 80px rgba(212,168,83,0.12), 0 2px 60px rgba(0,0,0,0.9)",
                letterSpacing: "-0.01em",
              }}
            >
              ANCESTRA
            </h1>

            <p
              className="font-cinzel text-xs mb-5"
              style={{ color: "#C4953E", letterSpacing: "0.42em" }}
            >
              ANCESTRAL.&nbsp;&nbsp;RITUAL-CENTRIC.
            </p>

            <p
              className="text-base leading-relaxed mb-9"
              style={{ color: "rgba(245,230,200,0.6)", maxWidth: "360px" }}
            >
              Trade RITUAL against the world through ancestral liquidity.
            </p>

            <ConnectButton />

            <div className="flex items-center gap-2.5 mt-6">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#4ADE80", boxShadow: "0 0 8px #4ADE80" }}
              />
              <span
                className="font-cinzel text-xs"
                style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.3em" }}
              >
                BUILT ON RITUAL TESTNET
              </span>
            </div>
          </div>
        </main>

        {/* Bottom feature bar */}
        <div className="flex-shrink-0">
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(212,168,83,0.55) 0%, rgba(212,168,83,0.35) 55%, transparent 100%)",
            }}
          />
          <div
            className="grid grid-cols-3"
            style={{ background: "rgba(4,2,8,0.90)", backdropFilter: "blur(16px)" }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-4 px-7 py-6"
                style={{ borderRight: i < 2 ? "1px solid rgba(212,168,83,0.1)" : "none" }}
              >
                <div className="flex-shrink-0 mt-0.5"><DiamondIcon /></div>
                <div>
                  <p
                    className="font-cinzel text-xs font-semibold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.18em" }}
                  >
                    {f.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,230,200,0.38)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

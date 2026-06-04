"use client";

import Image from "next/image";

import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";

/* ── Small reusable pieces ──────────────────────────────── */

function LogoIcon() {
  return (
    <div
      className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 relative"
      style={{ background: "#1a6b3a" }}
    >
      <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" priority />
    </div>
  );
}

function DiamondIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="10" y="1.5" width="12" height="12" rx="0.8" transform="rotate(45 10 1.5)" stroke="#c9a84c" strokeWidth="1.3" />
      <rect x="10" y="5.2" width="5.6" height="5.6" rx="0.4" transform="rotate(45 10 5.2)" stroke="#c9a84c" strokeWidth="0.85" />
    </svg>
  );
}


function ConnectWalletButton() {
  const router = useRouter();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address }) => (
        <button
          onClick={() => { isConnected ? router.push("/swap") : show?.(); }}
          className="connect-btn font-rajdhani font-semibold uppercase"
          style={{
            border: "1px solid rgba(201,168,76,0.7)",
            color: "#c9a84c",
            background: "rgba(0,0,0,0.22)",
            padding: "14px 52px",
            fontSize: "0.8rem",
            letterSpacing: "0.28em",
            cursor: "pointer",
            minWidth: "220px",
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

/* ── Page ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="hero-grain relative w-full h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>

      {/* 0 ─ Background image */}
      <Image
        src="/landing-bg.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* 1 ─ Teal crystal-tower glow (center-right) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 42% 62% at 64% 44%, rgba(0,210,190,0.13) 0%, rgba(0,180,160,0.06) 40%, transparent 72%)",
        }}
      />

      {/* 3 ─ Left-half readability dark fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(105deg, rgba(10,8,14,0.96) 0%, rgba(10,8,14,0.90) 25%, rgba(10,8,14,0.65) 45%, rgba(10,8,14,0.20) 65%, transparent 82%)",
        }}
      />

      {/* 4 ─ Top vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(180deg, rgba(10,8,14,0.6) 0%, transparent 18%)",
        }}
      />

      {/* 5 ─ Bottom vignette (ties into feature bar) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(0deg, rgba(10,8,14,0.9) 0%, transparent 30%)",
        }}
      />

      {/* 6 ─ UI */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 4 }}>

        {/* ── Navbar ────────────────────────────────── */}
        <nav className="flex items-center justify-between px-8 md:px-12 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span
              className="font-cinzel text-white font-semibold tracking-[0.22em]"
              style={{ fontSize: "0.95rem" }}
            >
              ANCESTRA
            </span>
          </div>

        </nav>

        {/* ── Hero content ──────────────────────────── */}
        <main className="flex-1 flex items-center px-8 md:px-12 lg:px-20 pb-4">
          <div style={{ maxWidth: "540px" }}>

            {/* Headline */}
            <h1
              className="font-cinzel font-black text-white select-none"
              style={{
                fontSize: "clamp(4.2rem, 11.5vw, 10rem)",
                lineHeight: 0.88,
                letterSpacing: "0.01em",
                marginBottom: "1.6rem",
                textShadow: "0 2px 80px rgba(0,0,0,0.95)",
              }}
            >
              ANCESTRA
            </h1>

            {/* Gold subtitle */}
            <p
              className="font-rajdhani font-semibold mb-5"
              style={{
                color: "#c9a84c",
                fontSize: "0.72rem",
                letterSpacing: "0.44em",
              }}
            >
              ANCESTRAL.&nbsp;&nbsp;RITUAL-CENTRIC.
            </p>

            {/* Body copy */}
            <p
              className="mb-9 leading-relaxed"
              style={{
                color: "#cccccc",
                fontSize: "1.05rem",
                maxWidth: "370px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
              }}
            >
              Trade RITUAL against the world through ancestral liquidity.
            </p>

            {/* CTA */}
            <ConnectWalletButton />

            {/* Status badge */}
            <div className="flex items-center gap-3 mt-6">
              <span
                className="dot-pulse w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#3ddc84" }}
              />
              <span
                className="font-rajdhani font-medium"
                style={{
                  color: "rgba(255,255,255,0.38)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.3em",
                }}
              >
                BUILT ON RITUAL TESTNET
              </span>
            </div>

          </div>
        </main>

        {/* ── Bottom feature bar ────────────────────── */}
        <div className="flex-shrink-0">
          {/* Gold top border */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(201,168,76,0.65) 0%, rgba(201,168,76,0.4) 50%, rgba(201,168,76,0.1) 100%)",
            }}
          />
          <div
            className="grid grid-cols-3"
            style={{ background: "rgba(10,8,14,0.92)", backdropFilter: "blur(18px)" }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-3.5 px-8 py-6"
                style={{
                  borderRight: i < 2 ? "1px solid rgba(201,168,76,0.15)" : "none",
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <DiamondIcon />
                </div>
                <div>
                  <p
                    className="font-rajdhani font-bold mb-1"
                    style={{
                      color: "rgba(255,255,255,0.88)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.2em",
                    }}
                  >
                    {f.title}
                  </p>
                  <p
                    style={{
                      color: "rgba(204,204,204,0.45)",
                      fontSize: "0.72rem",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 300,
                      lineHeight: 1.5,
                    }}
                  >
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

function DiamondIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="10" y="1.5" width="12" height="12" rx="1" transform="rotate(45 10 1.5)" stroke="#D4A853" strokeWidth="1.2" />
      <rect x="10" y="5" width="6" height="6" rx="0.5" transform="rotate(45 10 5)" stroke="#D4A853" strokeWidth="0.8" />
    </svg>
  );
}

function ConnectButton() {
  const router = useRouter();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address }) => (
        <button
          onClick={() => {
            if (isConnected) {
              router.push("/swap");
            } else {
              show?.();
            }
          }}
          className="group relative px-16 py-4 text-sm font-cinzel tracking-[0.3em] uppercase transition-all duration-300 hover:bg-ritual/10"
          style={{
            border: "1px solid #D4A853",
            color: "#D4A853",
            background: "rgba(0,0,0,0.3)",
            letterSpacing: "0.3em",
          }}
        >
          {isConnected
            ? `${address?.slice(0, 6)}…${address?.slice(-4)}`
            : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

const FEATURES = [
  {
    title: "RITUAL-CENTRIC",
    desc: "All pools are RITUAL pairs",
  },
  {
    title: "ANCESTRAL DESIGN",
    desc: "Rooted in culture, built for the future",
  },
  {
    title: "COMMUNITY DRIVEN",
    desc: "By the people, for the people",
  },
];

export default function HomePage() {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#07060A" }}
    >
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 70% 40%, rgba(120, 80, 30, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 85% 55%, rgba(30, 80, 100, 0.25) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(40, 28, 8, 0.8) 0%, transparent 70%),
            linear-gradient(180deg, #040306 0%, #0a0804 40%, #0d0a05 70%, #060503 100%)
          `,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Ancestra"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span
            className="font-cinzel text-white text-base tracking-[0.25em] font-semibold"
            style={{ letterSpacing: "0.25em" }}
          >
            ANCESTRA
          </span>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-cinzel tracking-widest transition-colors hover:bg-ritual/10"
          style={{
            border: "1px solid rgba(212,168,83,0.5)",
            color: "#D4A853",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
            <rect x="7" y="0.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
            <rect x="0.5" y="7" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
            <rect x="7" y="7" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
          </svg>
          DOCS
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center px-8 md:px-16 lg:px-24 pb-32 pt-8">
        <div className="max-w-2xl">
          {/* Giant title */}
          <h1
            className="font-cinzel font-black text-white leading-[0.9] mb-8 select-none"
            style={{
              fontSize: "clamp(5rem, 14vw, 11rem)",
              textShadow: "0 0 80px rgba(212,168,83,0.12), 0 2px 40px rgba(0,0,0,0.8)",
              letterSpacing: "-0.01em",
            }}
          >
            ANCESTRA
          </h1>

          {/* Subtitle */}
          <p
            className="font-cinzel text-sm mb-6 tracking-[0.4em]"
            style={{ color: "#C4953E" }}
          >
            ANCESTRAL.&nbsp; RITUAL-CENTRIC.
          </p>

          {/* Body */}
          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: "rgba(245,230,200,0.65)", maxWidth: "380px" }}
          >
            Trade RITUAL against the world
            <br />
            through ancestral liquidity.
          </p>

          {/* CTA */}
          <ConnectButton />

          {/* Status badge */}
          <div className="flex items-center gap-2.5 mt-7">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#4ADE80",
                boxShadow: "0 0 8px #4ADE80",
              }}
            />
            <span
              className="font-cinzel text-xs tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              BUILT ON RITUAL TESTNET
            </span>
          </div>
        </div>
      </main>

      {/* Bottom feature bar */}
      <div className="relative z-20">
        {/* Gold separator line */}
        <div
          className="w-full h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.4) 20%, rgba(212,168,83,0.4) 80%, transparent 100%)" }}
        />

        <div
          className="grid grid-cols-3"
          style={{ background: "rgba(4,3,2,0.85)", backdropFilter: "blur(12px)" }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-4 px-8 py-7"
              style={{
                borderRight: i < 2 ? "1px solid rgba(212,168,83,0.12)" : "none",
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <DiamondIcon />
              </div>
              <div>
                <p
                  className="font-cinzel text-xs font-semibold tracking-[0.2em] mb-1.5"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {f.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(245,230,200,0.4)" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useAccount, useSwitchChain } from "wagmi";
import { RITUAL_CHAIN_ID } from "@/lib/constants";

const TABS = [
  { label: "Swap",      short: "SWAP", href: "/swap" },
  { label: "Liquidity", short: "LIQ",  href: "/liquidity" },
  { label: "Pools",     short: "POOL", href: "/pools" },
  { label: "Portfolio", short: "PORT", href: "/portfolio" },
] as const;

export default function AppNav() {
  const pathname = usePathname();
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== RITUAL_CHAIN_ID;

  // Mark "Swap" as active for any /swap/* route
  const isActive = (href: string) =>
    href === "/swap"
      ? pathname.startsWith("/swap")
      : pathname === href;

  return (
    <>
    {wrongNetwork && (
      <div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-xs font-semibold font-rajdhani tracking-wider"
        style={{ background: "rgba(248,113,113,0.12)", borderBottom: "1px solid rgba(248,113,113,0.25)", color: "#F87171" }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <path d="M8 2L14 13H2L8 2Z" stroke="#F87171" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 6v3M8 11v0.5" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:inline">WRONG NETWORK — YOU&apos;RE NOT ON RITUAL TESTNET</span>
          <span className="sm:hidden">WRONG NETWORK</span>
        </div>
        <button
          onClick={() => switchChainAsync({ chainId: RITUAL_CHAIN_ID })}
          className="px-3 py-1 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
          style={{ background: "rgba(248,113,113,0.2)", border: "1px solid rgba(248,113,113,0.4)", color: "#F87171", letterSpacing: "0.1em" }}
        >
          SWITCH TO RITUAL
        </button>
      </div>
    )}
    <nav
      className="flex items-center justify-between px-3 sm:px-5 md:px-8 py-3 sm:py-4 flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(201,168,76,0.10)" }}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden relative flex-shrink-0"
          style={{ background: "#1a6b3a" }}
        >
          <Image src="/logo.jpeg" alt="Ancestra" fill className="object-cover" />
        </div>
        <span
          className="font-cinzel font-semibold text-white hidden sm:inline"
          style={{ fontSize: "0.82rem", letterSpacing: "0.2em" }}
        >
          ANCESTRA
        </span>
      </Link>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {TABS.map(({ label, short, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-rajdhani font-semibold transition-all"
              style={{
                fontSize: "clamp(0.6rem, 2vw, 0.75rem)",
                letterSpacing: "0.10em",
                color: active ? "#D4A853" : "rgba(255,255,255,0.38)",
                background: active ? "rgba(212,168,83,0.10)" : "transparent",
                border: active ? "1px solid rgba(212,168,83,0.22)" : "1px solid transparent",
              }}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label.toUpperCase()}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Wallet pill ───────────────────────────────── */}
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => (
          <button
            onClick={show}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-mono transition-all hover:opacity-80 flex-shrink-0"
            style={{
              fontSize: "clamp(0.6rem, 2vw, 0.75rem)",
              background: isConnected ? "rgba(212,168,83,0.07)" : "rgba(212,168,83,0.14)",
              border: "1px solid rgba(212,168,83,0.22)",
              color: isConnected ? "rgba(212,168,83,0.85)" : "#D4A853",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isConnected ? "#3ddc84" : "rgba(212,168,83,0.4)",
                boxShadow: isConnected ? "0 0 5px #3ddc84" : "none",
              }}
            />
            <span className="hidden sm:inline">
              {isConnected && address
                ? `${address.slice(0, 6)}…${address.slice(-4)}`
                : "Connect"}
            </span>
            <span className="sm:hidden">
              {isConnected && address ? `${address.slice(0, 4)}…` : "Wallet"}
            </span>
          </button>
        )}
      </ConnectKitButton.Custom>
    </nav>
    </>
  );
}

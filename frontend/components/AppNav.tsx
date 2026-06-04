"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";

const TABS = [
  { label: "Swap",      href: "/swap" },
  { label: "Liquidity", href: "/liquidity" },
  { label: "Pools",     href: "/pools" },
  { label: "Portfolio", href: "/portfolio" },
] as const;

export default function AppNav() {
  const pathname = usePathname();

  // Mark "Swap" as active for any /swap/* route
  const isActive = (href: string) =>
    href === "/swap"
      ? pathname.startsWith("/swap")
      : pathname === href;

  return (
    <nav
      className="flex items-center justify-between px-5 md:px-8 py-4 flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(201,168,76,0.10)" }}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
        <div
          className="w-7 h-7 rounded-md overflow-hidden relative flex-shrink-0"
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
      <div className="flex items-center gap-1">
        {TABS.map(({ label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold transition-all"
              style={{
                letterSpacing: "0.12em",
                color: active ? "#D4A853" : "rgba(255,255,255,0.38)",
                background: active ? "rgba(212,168,83,0.10)" : "transparent",
                border: active ? "1px solid rgba(212,168,83,0.22)" : "1px solid transparent",
              }}
            >
              {label.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* ── Wallet pill ───────────────────────────────── */}
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => (
          <button
            onClick={show}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
            style={{
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
            {isConnected && address
              ? `${address.slice(0, 6)}…${address.slice(-4)}`
              : "Connect"}
          </button>
        )}
      </ConnectKitButton.Custom>
    </nav>
  );
}

"use client";

import Image from "next/image";
import { ReactNode } from "react";

// ── Fixed viewport frame bars ───────────────────────────────────────────────
const BAR = "rgba(175,138,48,0.62)";
const barH: React.CSSProperties = { position: "fixed", left: 0, right: 0, height: "2px", background: BAR, zIndex: 9999, pointerEvents: "none" };
const barV: React.CSSProperties = { position: "fixed", top: 0, bottom: 0, width: "2px", background: BAR, zIndex: 9999, pointerEvents: "none" };

// ── Corner ornaments (diamond shape at each viewport corner) ────────────────
function Corner({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ position: "fixed", zIndex: 10000, pointerEvents: "none", ...style }}>
      {/* outer square */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="7" y="0.8" width="8.8" height="8.8" rx="0.4" transform="rotate(45 7 7)" fill="none" stroke="rgba(190,150,55,0.85)" strokeWidth="1.2" />
        <rect x="7" y="3.2" width="4.0" height="4.0" rx="0.2" transform="rotate(45 7 7)" fill="rgba(190,150,55,0.60)" />
      </svg>
    </div>
  );
}

export default function DappFrame({ children }: { children: ReactNode }) {
  return (
    <>
      {/* ── Viewport-edge bars ── */}
      <div style={{ ...barH, top: 0 }} />
      <div style={{ ...barH, bottom: 0 }} />
      <div style={{ ...barV, left: 0 }} />
      <div style={{ ...barV, right: 0 }} />

      {/* ── Corner ornaments ── */}
      <Corner style={{ top: "-1px", left: "-1px" }} />
      <Corner style={{ top: "-1px", right: "-1px", transform: "scaleX(-1)" }} />
      <Corner style={{ bottom: "-1px", left: "-1px", transform: "scaleY(-1)" }} />
      <Corner style={{ bottom: "-1px", right: "-1px", transform: "scale(-1)" }} />

      {/* ── Outer matte ── */}
      <div style={{ position: "relative", minHeight: "100vh", padding: "clamp(5px, 2vw, 14px)", background: "#070503", overflow: "hidden" }}>
        {/* Ankara pattern bleeds through the matte */}
        <Image
          src="/ankara.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{ zIndex: 0, opacity: 0.55 }}
        />

        {/* ── Inner canvas ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - clamp(10px, 4vw, 28px))",
            background: "rgba(14,11,7,0.93)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            border: "1.5px solid rgba(178,140,50,0.26)",
            borderRadius: "2px",
            boxShadow:
              /* inward soft glow on border */ "inset 0 0 0 1px rgba(178,140,50,0.04), " +
              /* outward amber lift */         "0 0 40px rgba(155,118,30,0.14), " +
              /* depth shadow */               "0 20px 80px rgba(0,0,0,0.85)",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

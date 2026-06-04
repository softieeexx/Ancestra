"use client";

import { ReactNode } from "react";

const GOLD = "rgba(175,138,48,0.58)";
const CORNER = "rgba(190,150,55,0.90)";

const barBase: React.CSSProperties = {
  position: "fixed", background: GOLD, zIndex: 9999, pointerEvents: "none",
};
const cornerBase: React.CSSProperties = {
  position: "fixed", width: "7px", height: "7px",
  background: CORNER, transform: "rotate(45deg)", zIndex: 10000, pointerEvents: "none",
};

export default function DappFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "#060507", minHeight: "100vh", padding: "6px" }}>
      {/* ── Viewport-edge frame bars ── */}
      <div style={{ ...barBase, top: 0,    left: 0, right:  0, height: "2px" }} />
      <div style={{ ...barBase, bottom: 0, left: 0, right:  0, height: "2px" }} />
      <div style={{ ...barBase, top: 0, bottom: 0,  left:   0, width:  "2px" }} />
      <div style={{ ...barBase, top: 0, bottom: 0,  right:  0, width:  "2px" }} />

      {/* ── Corner diamond ornaments ── */}
      <div style={{ ...cornerBase, top: "-2px",    left:  "-2px"  }} />
      <div style={{ ...cornerBase, top: "-2px",    right: "-2px"  }} />
      <div style={{ ...cornerBase, bottom: "-2px", left:  "-2px"  }} />
      <div style={{ ...cornerBase, bottom: "-2px", right: "-2px"  }} />

      {/* ── Inner canvas ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 12px)",
          background: "#0e0c09",
          border: "1px solid rgba(178,140,50,0.20)",
          boxShadow:
            "0 0 0 1px rgba(178,140,50,0.04), " +
            "0 12px 80px rgba(0,0,0,0.9), " +
            "0 0 60px rgba(178,140,50,0.06)",
          borderRadius: "2px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

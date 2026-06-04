"use client";

import { useState } from "react";
import { Address } from "viem";
import { TOKENS, Token } from "@/lib/constants";

interface Props {
  selected: Token;
  exclude?: Address;
  onSelect: (t: Token) => void;
}

export default function TokenSelector({ selected, exclude, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const available = TOKENS.filter(t => t.address !== exclude);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
        style={{ background: `${selected.logoColor}14`, border: `1px solid ${selected.logoColor}30` }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
          style={{ background: selected.logoColor }}
        >
          {selected.symbol.slice(0, 2)}
        </div>
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: selected.logoColor }}>
          {selected.symbol}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-20"
            style={{ background: "rgba(13,10,3,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
          >
            {available.map(t => (
              <button
                key={t.address}
                onClick={() => { onSelect(t); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ background: t.logoColor }}
                >
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.symbol}</div>
                  <div className="text-xs text-earth-100/40">{t.name}</div>
                </div>
                {t.address === selected.address && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.logoColor }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

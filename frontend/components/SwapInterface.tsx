"use client";

import { useState, useCallback } from "react";
import { useAncestra } from "@/hooks/useAncestra";
import { POOLS, ModeId } from "@/lib/constants";
import { useAccount, useBalance } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { ritualChain } from "@/lib/config";

interface SwapInterfaceProps {
  mode: ModeId;
  onSwapSuccess?: () => void;
}

// Token logo placeholder — letter avatar with pool accent
function TokenLogo({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-earth-800 flex-shrink-0"
      style={{ background: color }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

// Animated swap direction button
function SwapArrow({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={spinning}
      className="group relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        background: "rgba(212, 168, 83, 0.1)",
        border: "1px solid rgba(212, 168, 83, 0.2)",
        boxShadow: "0 0 12px rgba(212, 168, 83, 0.08)",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`transition-transform duration-300 ${spinning ? "rotate-180" : ""} group-hover:rotate-180`}
      >
        <path d="M8 2v12M4 10l4 4 4-4" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// Info row used in the details panel
function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-earth-100/40">{label}</span>
      <span
        className={`text-xs font-medium ${highlight ? "text-ritual" : "text-earth-100/70"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SwapInterface({ mode, onSwapSuccess }: SwapInterfaceProps) {
  const { isConnected, address } = useAccount();
  const pool = POOLS[mode];
  const {
    amountIn,
    setAmountIn,
    estimatedOut,
    fee,
    txState,
    txHash,
    error,
    swap,
    reset,
    reserve0,
    reserve1,
  } = useAncestra(mode, onSwapSuccess);

  const [arrowSpin, setArrowSpin] = useState(false);

  // Native RITUAL balance
  const { data: ritualBalance } = useBalance({
    address,
    chainId: ritualChain.id,
  });

  if (!isConnected) return null;

  const ritualBalanceDisplay = ritualBalance
    ? parseFloat(formatEther(ritualBalance.value)).toFixed(4)
    : "—";

  const outDisplay = estimatedOut();
  const hasAmount = !!amountIn && amountIn !== "0";

  // Price impact — naive estimate from reserve ratio shift
  const priceImpact = (() => {
    if (!hasAmount || !reserve0 || !reserve1) return "—";
    try {
      const inAmt = parseFloat(amountIn);
      const r0 = parseFloat(formatEther(reserve0));
      const impact = (inAmt / (r0 + inAmt)) * 100;
      return impact < 0.01 ? "<0.01%" : `${impact.toFixed(2)}%`;
    } catch {
      return "—";
    }
  })();

  const handleArrow = useCallback(() => {
    setArrowSpin(true);
    setTimeout(() => setArrowSpin(false), 350);
  }, []);

  const handleMax = useCallback(() => {
    if (ritualBalance) {
      // leave small buffer for gas
      const max = parseFloat(formatEther(ritualBalance.value)) - 0.01;
      if (max > 0) setAmountIn(max.toFixed(6));
    }
  }, [ritualBalance, setAmountIn]);

  const isBusy = txState === "swapping";
  const accent = pool.color;

  return (
    <div className="w-full max-w-[420px] mx-auto">

      {/* ── Main swap card ─────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(13, 10, 3, 0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(212, 168, 83, 0.12)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(212,168,83,0.06) inset",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            />
            <span className="text-sm font-display font-semibold text-white">
              {pool.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{
                background: `${accent}14`,
                color: accent,
                border: `1px solid ${accent}30`,
              }}
            >
              {pool.subtitle}
            </span>
          </div>
          <span className="text-xs text-earth-100/30 font-mono">Ritual Chain</span>
        </div>

        <div className="p-4 space-y-1.5">

          {/* ── Token In ─────────────────────────────────── */}
          <div
            className="rounded-xl p-4 transition-all duration-200 focus-within:ring-1"
            style={{
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35 tracking-wide">You Pay</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-earth-100/30">
                  Balance: <span className="text-earth-100/50">{ritualBalanceDisplay}</span>
                </span>
                <button
                  onClick={handleMax}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md transition-colors hover:opacity-80"
                  style={{
                    background: "rgba(212, 168, 83, 0.12)",
                    color: "#D4A853",
                    border: "1px solid rgba(212,168,83,0.2)",
                  }}
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) setAmountIn(val);
                }}
                disabled={isBusy}
                className="flex-1 bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-white/15 min-w-0"
              />
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: "rgba(212, 168, 83, 0.08)",
                  border: "1px solid rgba(212,168,83,0.15)",
                }}
              >
                <TokenLogo symbol="RI" color="#D4A853" />
                <span className="text-sm font-semibold text-ritual whitespace-nowrap">RITUAL</span>
              </div>
            </div>
          </div>

          {/* ── Swap direction ─────────────────────────── */}
          <div className="flex items-center justify-center -my-0.5 relative z-10">
            <SwapArrow onClick={handleArrow} spinning={arrowSpin} />
          </div>

          {/* ── Token Out ────────────────────────────────── */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35 tracking-wide">You Receive</span>
              <span className="text-xs text-earth-100/25">Estimated</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span
                  className={`text-3xl font-semibold ${hasAmount && outDisplay !== "0" ? "text-white" : "text-white/20"}`}
                >
                  {hasAmount && outDisplay !== "0" ? outDisplay : "0.00"}
                </span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: `${accent}10`,
                  border: `1px solid ${accent}25`,
                }}
              >
                <TokenLogo symbol={pool.token1.symbol.slice(0, 2)} color={accent} />
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: accent }}>
                  {pool.token1.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Info panel ──────────────────────────────── */}
        <div
          className="mx-4 mb-4 rounded-xl p-4 space-y-2.5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <InfoRow label="Price Impact" value={priceImpact} />
          <InfoRow label="Slippage Tolerance" value="0.30%" />
          <InfoRow label="Network Fee" value={`${fee} RITUAL`} />
          <InfoRow label="Route" value={`RITUAL → ${pool.token1.symbol}`} />
          <div
            className="pt-2 mt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <InfoRow
              label="Minimum Received"
              value={hasAmount && outDisplay !== "0" ? `${outDisplay} ${pool.token1.symbol}` : "—"}
              highlight
            />
          </div>
        </div>

        {/* ── Swap button ─────────────────────────────── */}
        <div className="px-4 pb-4">
          <button
            onClick={swap}
            disabled={!hasAmount || isBusy}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed relative overflow-hidden"
            style={
              !hasAmount || isBusy
                ? {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
                : {
                    background: "linear-gradient(135deg, #D4A853 0%, #F0C060 50%, #C8902A 100%)",
                    color: "#0D0A03",
                    boxShadow: "0 4px 20px rgba(212,168,83,0.3), 0 0 0 0.5px rgba(212,168,83,0.4) inset",
                  }
            }
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Confirming in wallet…
              </span>
            ) : !hasAmount ? (
              "Enter an amount"
            ) : (
              `Swap RITUAL → ${pool.token1.symbol}`
            )}
          </button>
        </div>
      </div>

      {/* ── Transaction status ─────────────────────── */}
      {txState !== "idle" && (
        <div className="mt-3">
          <TxStatusCard
            txState={txState}
            txHash={txHash}
            error={error}
            onReset={reset}
            accent={accent}
            tokenOut={pool.token1.symbol}
            outAmount={outDisplay}
          />
        </div>
      )}
    </div>
  );
}

// ── Inline transaction status card ─────────────────────────────────
interface TxStatusCardProps {
  txState: string;
  txHash: `0x${string}` | null;
  error: string | null;
  onReset: () => void;
  accent: string;
  tokenOut: string;
  outAmount: string;
}

function TxStatusCard({ txState, txHash, error, onReset, accent, tokenOut, outAmount }: TxStatusCardProps) {
  if (txState === "idle") return null;

  const isSuccess = txState === "success";
  const isError = txState === "error";
  const isPending = txState === "swapping";

  return (
    <div
      className="rounded-2xl p-4 animate-fade-in"
      style={{
        background: isSuccess
          ? "rgba(74, 222, 128, 0.05)"
          : isError
          ? "rgba(248, 113, 113, 0.05)"
          : "rgba(212, 168, 83, 0.05)",
        border: `1px solid ${
          isSuccess
            ? "rgba(74, 222, 128, 0.15)"
            : isError
            ? "rgba(248, 113, 113, 0.15)"
            : "rgba(212, 168, 83, 0.15)"
        }`,
        backdropFilter: "blur(12px)",
      }}
    >
      {isPending && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ritual/30 border-t-ritual animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Waiting for confirmation</p>
            <p className="text-xs text-earth-100/40 mt-0.5">Confirm this transaction in your wallet</p>
          </div>
        </div>
      )}

      {isSuccess && txHash && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Swap Complete</p>
              <p className="text-xs text-earth-100/50 mt-0.5">
                You received <span className="text-white font-medium">{outAmount} {tokenOut}</span>
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs text-earth-100/30 mb-1">Transaction Hash</p>
            <a
              href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ritual/70 hover:text-ritual transition-colors font-mono break-all"
            >
              {txHash.slice(0, 18)}…{txHash.slice(-12)}
            </a>
          </div>

          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "rgba(212,168,83,0.1)",
              border: "1px solid rgba(212,168,83,0.2)",
              color: "#D4A853",
            }}
          >
            New Swap
          </button>
        </div>
      )}

      {isError && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 4l6 6M10 4l-6 6" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transaction Failed</p>
              <p className="text-xs text-red-300/60 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#F87171",
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

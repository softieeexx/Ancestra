"use client";

import { useState, useCallback, useEffect } from "react";
import { useAncestra } from "@/hooks/useAncestra";
import { POOLS, ModeId } from "@/lib/constants";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { ritualChain } from "@/lib/config";
import { ERC20_ABI } from "@/lib/abi";

interface SwapInterfaceProps {
  mode: ModeId;
  onSwapSuccess?: () => void;
}

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
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        className={`transition-transform duration-300 ${spinning ? "rotate-180" : ""} group-hover:rotate-180`}
      >
        <path d="M8 2v12M4 10l4 4 4-4" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-earth-100/40">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-ritual" : "text-earth-100/70"}`}>{value}</span>
    </div>
  );
}

export default function SwapInterface({ mode, onSwapSuccess }: SwapInterfaceProps) {
  const { isConnected, address } = useAccount();
  const pool = POOLS[mode];
  const {
    amountIn, setAmountIn,
    isFlipped, flip,
    tokenIn, tokenOut,
    selectedToken, changeToken,
    modeTokens,
    estimatedOut, fee,
    txState, txHash, error, actualOut,
    swap, reset,
    hasLiquidity,
  } = useAncestra(mode, onSwapSuccess);

  const [arrowSpin, setArrowSpin] = useState(false);
  const [toastState, setToastState] = useState<"hidden" | "visible" | "dismissing">("hidden");

  const { data: ritualBalance } = useBalance({ address, chainId: ritualChain.id });

  const { data: tokenBal } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !selectedToken.isNative },
  });

  if (!isConnected) return null;

  const balanceDisplay = tokenIn.isNative
    ? (ritualBalance ? parseFloat(formatEther(ritualBalance.value)).toFixed(4) : "—")
    : (tokenBal ? parseFloat(formatUnits(tokenBal as bigint, tokenIn.decimals)).toFixed(4) : "—");

  const outDisplay = estimatedOut();
  const hasAmount  = !!amountIn && amountIn !== "0";
  const isBusy     = txState === "swapping" || txState === "approving";
  const accent     = pool.color;

  // Precision for output display
  const outPrecision = tokenOut.decimals <= 6 ? 4 : tokenOut.decimals === 9 ? 6 : 6;

  // Floating success toast: auto-dismiss after 5 s
  useEffect(() => {
    if (txState === "success" && txHash) {
      setToastState("visible");
      const timer = setTimeout(() => {
        setToastState("dismissing");
        setTimeout(() => {
          reset();
          setToastState("hidden");
        }, 600);
      }, 5000);
      return () => { clearTimeout(timer); };
    }
  }, [txState, txHash, reset]);

  const handleArrow = useCallback(() => {
    setArrowSpin(true);
    setTimeout(() => setArrowSpin(false), 350);
    flip();
  }, [flip]);

  const handleMax = useCallback(() => {
    if (tokenIn.isNative && ritualBalance) {
      const max = parseFloat(formatEther(ritualBalance.value)) - 0.01;
      if (max > 0) setAmountIn(max.toFixed(6));
    } else if (tokenBal) {
      setAmountIn(formatUnits(tokenBal as bigint, tokenIn.decimals));
    }
  }, [tokenIn, ritualBalance, tokenBal, setAmountIn]);

  // Token chip shown in "You Receive" when direction is RITUAL → token
  const TokenOutChip = () => {
    if (modeTokens && !isFlipped) {
      return (
        <div className="relative flex-shrink-0">
          <select
            value={selectedToken.address}
            onChange={e => {
              const t = modeTokens.find(s => s.address === e.target.value);
              if (t) changeToken(t);
            }}
            disabled={isBusy}
            className="appearance-none pr-7 pl-3 py-2 rounded-xl text-sm font-semibold cursor-pointer outline-none"
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              color: accent,
              minWidth: "88px",
            }}
          >
            {modeTokens.map(t => (
              <option key={t.address} value={t.address} style={{ background: "#0D0A03", color: "#fff" }}>
                {t.symbol}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
        style={{
          background: tokenOut.isNative ? "rgba(212,168,83,0.08)" : `${accent}10`,
          border: `1px solid ${tokenOut.isNative ? "rgba(212,168,83,0.18)" : `${accent}28`}`,
        }}
      >
        <TokenLogo symbol={tokenOut.symbol.slice(0, 2)} color={tokenOut.isNative ? "#D4A853" : accent} />
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: tokenOut.isNative ? "#D4A853" : accent }}>
          {tokenOut.symbol}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
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
          className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
            <span className="text-sm font-display font-semibold text-white truncate">{pool.name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono flex-shrink-0"
              style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}30` }}
            >
              {pool.subtitle.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-earth-100/30 font-mono flex-shrink-0 hidden sm:inline">Ritual Chain</span>
        </div>

        <div className="p-4 space-y-1.5">

          {/* ── Token In ───────────────────────────────── */}
          <div
            className="rounded-xl p-4 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35 tracking-wide">You Pay</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-earth-100/30">
                  Balance: <span className="text-earth-100/50">{balanceDisplay}</span>
                </span>
                <button
                  onClick={handleMax}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md transition-colors hover:opacity-80"
                  style={{ background: "rgba(212,168,83,0.12)", color: "#D4A853", border: "1px solid rgba(212,168,83,0.2)" }}
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
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmountIn(e.target.value); }}
                disabled={isBusy}
                className="flex-1 bg-transparent text-2xl sm:text-3xl font-semibold text-white outline-none placeholder:text-white/15 min-w-0"
              />
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: tokenIn.isNative ? "rgba(212,168,83,0.08)" : `${accent}10`,
                  border: `1px solid ${tokenIn.isNative ? "rgba(212,168,83,0.18)" : `${accent}28`}`,
                }}
              >
                <TokenLogo symbol={tokenIn.symbol.slice(0, 2)} color={tokenIn.isNative ? "#D4A853" : accent} />
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: tokenIn.isNative ? "#D4A853" : accent }}>
                  {tokenIn.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* ── Flip arrow ──────────────────────────── */}
          <div className="flex items-center justify-center -my-0.5 relative z-10">
            <SwapArrow onClick={handleArrow} spinning={arrowSpin} />
          </div>

          {/* ── Token Out ──────────────────────────────── */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35 tracking-wide">You Receive</span>
              <span className="text-xs text-earth-100/25">Estimated</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className={`text-2xl sm:text-3xl font-semibold ${hasAmount && outDisplay !== "0" ? "text-white" : "text-white/20"}`}>
                  {hasAmount && outDisplay !== "0" ? parseFloat(outDisplay).toFixed(outPrecision) : "0.00"}
                </span>
              </div>
              <TokenOutChip />
            </div>
          </div>
        </div>

        {/* ── Info panel ─────────────────────────────── */}
        <div
          className="mx-4 mb-4 rounded-xl p-4 space-y-2.5"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <InfoRow label="Slippage Tolerance" value="0.30%" />
          <InfoRow label="Network Fee" value={`${fee} ${tokenIn.symbol}`} />
          <InfoRow label="Route" value={`${tokenIn.symbol} → ${tokenOut.symbol}`} />
          <div className="pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <InfoRow
              label="Minimum Received"
              value={hasAmount && outDisplay !== "0" ? `${parseFloat(outDisplay).toFixed(outPrecision)} ${tokenOut.symbol}` : "—"}
              highlight
            />
          </div>
        </div>

        {/* ── No-liquidity warning ───────────────────── */}
        {!hasLiquidity && (
          <div
            className="mx-4 mb-2 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M8 2L14 13H2L8 2Z" stroke="#F87171" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6v3M8 11v0.5" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#F87171" }}>No liquidity in this pool</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(248,113,113,0.6)" }}>
                Add liquidity first on the{" "}
                <a href="/liquidity" className="underline hover:opacity-80 transition-opacity">Liquidity page</a>.
              </p>
            </div>
          </div>
        )}

        {/* ── Swap button ────────────────────────────── */}
        <div className="px-4 pb-4">
          <button
            onClick={swap}
            disabled={!hasAmount || isBusy || !hasLiquidity}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
            style={
              !hasAmount || isBusy || !hasLiquidity
                ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }
                : { background: "linear-gradient(135deg, #D4A853 0%, #F0C060 50%, #C8902A 100%)", color: "#0D0A03", boxShadow: "0 4px 20px rgba(212,168,83,0.3)" }
            }
          >
            {txState === "approving" ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Approving {tokenIn.symbol}…
              </span>
            ) : isBusy ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Confirming in wallet…
              </span>
            ) : !hasLiquidity ? "Pool has no liquidity"
              : !hasAmount ? "Enter an amount"
              : `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`
            }
          </button>
        </div>
      </div>

      {/* ── Transaction status (pending/error inline) ── */}
      {(txState !== "idle" && txState !== "success") && (
        <div className="mt-3">
          <TxStatusCard
            txState={txState}
            txHash={txHash}
            error={error}
            onReset={reset}
            accent={accent}
            tokenOut={tokenOut.symbol}
            outAmount={actualOut ?? outDisplay}
            outPrecision={outPrecision}
            isActual={!!actualOut}
          />
        </div>
      )}

      {/* ── Floating success toast ──────────────────── */}
      {toastState !== "hidden" && (
        <SwapSuccessToast
          txHash={txHash}
          tokenOut={tokenOut.symbol}
          outAmount={actualOut ?? outDisplay}
          outPrecision={outPrecision}
          isActual={!!actualOut}
          dismissing={toastState === "dismissing"}
        />
      )}
    </div>
  );
}

interface SwapSuccessToastProps {
  txHash: `0x${string}` | null;
  tokenOut: string;
  outAmount: string;
  outPrecision: number;
  isActual: boolean;
  dismissing: boolean;
}

function SwapSuccessToast({ txHash, tokenOut, outAmount, outPrecision, isActual, dismissing }: SwapSuccessToastProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: dismissing ? "translateY(-30px) scale(0.95)" : "translateY(0) scale(1)",
        opacity: dismissing ? 0 : 1,
        pointerEvents: dismissing ? "none" : "auto",
        background: "rgba(13, 10, 3, 0.92)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(74,222,128,0.25)",
        borderRadius: "16px",
        padding: "16px 20px",
        minWidth: "300px",
        maxWidth: "380px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(74,222,128,0.1) inset",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-white">Swap Complete</p>
      </div>
      <p className="text-xs text-earth-100/50 mb-2">
        Received{" "}
        <span className="text-white font-medium">
          {isActual ? "" : "~"}{parseFloat(outAmount).toFixed(outPrecision)} {tokenOut}
        </span>
      </p>
      {txHash && (
        <a
          href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ritual/70 hover:text-ritual transition-colors font-mono inline-flex items-center gap-1"
        >
          View on Explorer ↗
        </a>
      )}
    </div>
  );
}

interface TxStatusCardProps {
  txState: string;
  txHash: `0x${string}` | null;
  error: string | null;
  onReset: () => void;
  accent: string;
  tokenOut: string;
  outAmount: string;
  outPrecision: number;
  isActual?: boolean;
}

function TxStatusCard({ txState, txHash, error, onReset, accent, tokenOut, outAmount, outPrecision, isActual }: TxStatusCardProps) {
  if (txState === "idle") return null;
  const isSuccess = txState === "success";
  const isError   = txState === "error";
  const isPending = txState === "swapping" || txState === "approving";

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: isSuccess ? "rgba(74,222,128,0.05)" : isError ? "rgba(248,113,113,0.05)" : "rgba(212,168,83,0.05)",
        border: `1px solid ${isSuccess ? "rgba(74,222,128,0.15)" : isError ? "rgba(248,113,113,0.15)" : "rgba(212,168,83,0.15)"}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {isPending && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ritual/30 border-t-ritual animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">
              {txState === "approving" ? "Approving token spend…" : "Waiting for confirmation"}
            </p>
            <p className="text-xs text-earth-100/40 mt-0.5">Confirm this transaction in your wallet</p>
          </div>
        </div>
      )}
      {isSuccess && txHash && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Swap Complete</p>
              <p className="text-xs text-earth-100/50 mt-0.5">
                You received{" "}
                <span className="text-white font-medium">
                  {isActual ? "" : "~"}{parseFloat(outAmount).toFixed(outPrecision)} {tokenOut}
                </span>
                {!isActual && <span className="text-earth-100/30 text-xs"> (confirming…)</span>}
              </p>
            </div>
          </div>
          <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-earth-100/30 mb-1">Transaction Hash</p>
            <a href={`https://explorer.ritualfoundation.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-ritual/70 hover:text-ritual transition-colors font-mono break-all">
              {txHash.slice(0, 18)}…{txHash.slice(-12)}
            </a>
          </div>
          <button onClick={onReset} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)", color: "#D4A853" }}>
            New Swap
          </button>
        </div>
      )}
      {isError && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 4l6 6M10 4l-6 6" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transaction Failed</p>
              <p className="text-xs text-red-300/60 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          <button onClick={onReset} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

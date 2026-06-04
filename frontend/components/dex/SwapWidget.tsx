"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits, parseUnits, Address } from "viem";
import { TOKENS, Token, CONTRACTS, RITUAL_CHAIN_ID } from "@/lib/constants";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abi";
import { useSwap } from "@/hooks/useRouter";
import { ritualChain } from "@/lib/config";
import TokenSelector from "./TokenSelector";
import TxStatus from "./TxStatus";

const DEFAULT_IN  = TOKENS[0]; // RITUAL (native)
const DEFAULT_OUT = TOKENS[2]; // USDC

export default function SwapWidget() {
  const { address } = useAccount();
  const [tokenIn,  setTokenIn]  = useState<Token>(DEFAULT_IN);
  const [tokenOut, setTokenOut] = useState<Token>(DEFAULT_OUT);
  const [amountIn,  setAmountIn]  = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage,  setSlippage]  = useState(0.3);
  const [arrowSpin, setArrowSpin] = useState(false);
  const [estimating, setEstimating] = useState(false);

  const { txState, txHash, error, amountsOut, swap, reset } = useSwap();

  // Native RITUAL balance
  const { data: nativeBalance } = useBalance({ address, chainId: ritualChain.id });

  // ERC20 token balances
  const { data: balIn } = useReadContract({
    address: tokenIn.isNative ? undefined : tokenIn.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !tokenIn.isNative },
  });

  const { data: balOut } = useReadContract({
    address: tokenOut.isNative ? undefined : tokenOut.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !tokenOut.isNative },
  });

  // Estimate output via Router.getAmountsOut
  const inAddress  = tokenIn.isNative  ? CONTRACTS.WRITUAL : tokenIn.address;
  const outAddress = tokenOut.isNative ? CONTRACTS.WRITUAL : tokenOut.address;

  const { data: routerAmounts, isLoading: routerLoading } = useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: amountIn && parseFloat(amountIn) > 0
      ? [parseUnits(amountIn, tokenIn.decimals), [inAddress, outAddress]]
      : undefined,
    query: {
      enabled: !!amountIn && parseFloat(amountIn) > 0 && inAddress !== outAddress,
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (routerAmounts && routerAmounts.length > 1) {
      setAmountOut(formatUnits(routerAmounts[routerAmounts.length - 1], tokenOut.decimals));
    } else {
      setAmountOut("");
    }
  }, [routerAmounts, tokenOut.decimals]);

  const handleFlip = useCallback(() => {
    setArrowSpin(true);
    setTimeout(() => setArrowSpin(false), 350);
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  }, [tokenIn, tokenOut, amountIn, amountOut]);

  const handleMax = useCallback(() => {
    if (tokenIn.isNative && nativeBalance) {
      const max = Math.max(0, parseFloat(formatUnits(nativeBalance.value, 18)) - 0.01);
      setAmountIn(max.toFixed(6));
    } else if (balIn) {
      setAmountIn(formatUnits(balIn as bigint, tokenIn.decimals));
    }
  }, [tokenIn, nativeBalance, balIn]);

  const handleSwap = useCallback(async () => {
    if (!amountIn) return;
    await swap(tokenIn, tokenOut, amountIn, slippage * 100);
  }, [tokenIn, tokenOut, amountIn, slippage, swap]);

  const displayBalIn = tokenIn.isNative
    ? nativeBalance ? parseFloat(formatUnits(nativeBalance.value, 18)).toFixed(4) : "—"
    : balIn ? parseFloat(formatUnits(balIn as bigint, tokenIn.decimals)).toFixed(4) : "—";

  const displayBalOut = tokenOut.isNative
    ? nativeBalance ? parseFloat(formatUnits(nativeBalance.value, 18)).toFixed(4) : "—"
    : balOut ? parseFloat(formatUnits(balOut as bigint, tokenOut.decimals)).toFixed(4) : "—";

  const hasAmount = !!amountIn && parseFloat(amountIn) > 0;
  const isBusy = txState === "swapping" || txState === "approving";
  const priceImpact = (() => {
    if (!routerAmounts || !hasAmount) return null;
    // rough estimate — for production use exact reserves
    return null;
  })();

  return (
    <div className="w-full max-w-[420px]">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(13,10,3,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(212,168,83,0.12)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-sm font-semibold text-white">Swap</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-earth-100/40">
              <span>Slippage:</span>
              {[0.1, 0.3, 0.5, 1].map(s => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className="px-1.5 py-0.5 rounded text-xs transition-colors"
                  style={{
                    background: slippage === s ? "rgba(212,168,83,0.2)" : "transparent",
                    color: slippage === s ? "#D4A853" : "rgba(255,255,255,0.3)",
                    border: slippage === s ? "1px solid rgba(212,168,83,0.3)" : "1px solid transparent",
                  }}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1.5">
          {/* Token In */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35">You Pay</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-earth-100/30">
                  Balance: <span className="text-earth-100/50">{displayBalIn}</span>
                </span>
                <button
                  onClick={handleMax}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
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
                onChange={e => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) setAmountIn(e.target.value);
                }}
                disabled={isBusy}
                className="flex-1 bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-white/15 min-w-0"
              />
              <TokenSelector
                selected={tokenIn}
                exclude={tokenOut.address}
                onSelect={t => { setTokenIn(t); setAmountOut(""); }}
              />
            </div>
          </div>

          {/* Flip */}
          <div className="flex items-center justify-center -my-0.5 relative z-10">
            <button
              onClick={handleFlip}
              disabled={isBusy}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)" }}
            >
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className={`transition-transform duration-300 ${arrowSpin ? "rotate-180" : ""}`}
              >
                <path d="M8 2v12M4 10l4 4 4-4" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Token Out */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-earth-100/35">You Receive</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-earth-100/30">
                  Balance: <span className="text-earth-100/50">{displayBalOut}</span>
                </span>
                {routerLoading && (
                  <span className="w-3 h-3 border border-ritual/40 border-t-ritual rounded-full animate-spin" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex-1 text-3xl font-semibold ${hasAmount && amountOut ? "text-white" : "text-white/20"}`}>
                {hasAmount && amountOut ? parseFloat(amountOut).toFixed(tokenOut.decimals > 10 ? 6 : 4) : "0.00"}
              </span>
              <TokenSelector
                selected={tokenOut}
                exclude={tokenIn.address}
                onSelect={t => { setTokenOut(t); setAmountOut(""); }}
              />
            </div>
          </div>
        </div>

        {/* Info panel */}
        {hasAmount && amountOut && (
          <div
            className="mx-4 mb-4 rounded-xl p-3 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <InfoRow label="Slippage Tolerance" value={`${slippage}%`} />
            <InfoRow label="Route" value={`${tokenIn.symbol} → ${tokenOut.symbol}`} />
            <InfoRow
              label="Min Received"
              value={`${(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(tokenOut.decimals > 10 ? 6 : 4)} ${tokenOut.symbol}`}
              highlight
            />
          </div>
        )}

        {/* Swap button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSwap}
            disabled={!hasAmount || isBusy}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
            style={
              !hasAmount || isBusy
                ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }
                : { background: "linear-gradient(135deg, #D4A853 0%, #F0C060 50%, #C8902A 100%)", color: "#0D0A03", boxShadow: "0 4px 20px rgba(212,168,83,0.3)" }
            }
          >
            {txState === "approving" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Approving…
              </span>
            ) : isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Swapping…
              </span>
            ) : !hasAmount ? "Enter an amount" : (
              `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`
            )}
          </button>
        </div>
      </div>

      {txState !== "idle" && (
        <div className="mt-3">
          <TxStatus txState={txState} txHash={txHash} error={error} onReset={reset} />
        </div>
      )}
    </div>
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

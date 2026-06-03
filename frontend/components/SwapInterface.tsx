"use client";

import { useAncestra } from "@/hooks/useAncestra";
import { POOLS, ModeId } from "@/lib/constants";
import TransactionStatus from "./TransactionStatus";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

interface SwapInterfaceProps {
  mode: ModeId;
}

export default function SwapInterface({ mode }: SwapInterfaceProps) {
  const { isConnected } = useAccount();
  const pool = POOLS[mode];
  const {
    amountIn, setAmountIn,
    estimatedOut, fee,
    txState, txHash, error,
    swap, reset,
    reserve0,
  } = useAncestra(mode);

  if (!isConnected) return null;

  const ritualReserveDisplay = reserve0 ? formatEther(reserve0).slice(0, 6) : "...";

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Mode header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-display font-bold text-white">{pool.name}</h2>
        <p className="text-sm text-earth-100/60">{pool.subtitle}</p>
      </div>

      {/* Swap card */}
      <div className="bg-earth-700/30 backdrop-blur-sm rounded-2xl p-5 border border-ritual/10">
        {/* From: RITUAL */}
        <div className="mb-2">
          <label className="text-xs text-earth-100/50 mb-2 block">You Pay</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setAmountIn(val);
              }}
              className="swap-input pr-20"
              disabled={txState === "swapping"}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-ritual font-semibold text-sm">RITUAL</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-3">
          <div className="w-10 h-10 rounded-full bg-earth-600/50 border border-ritual/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4L10 16M10 16L6 12M10 16L14 12" stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* To: paired token */}
        <div className="mb-6">
          <label className="text-xs text-earth-100/50 mb-2 block">You Receive</label>
          <div className="swap-input cursor-default flex items-center justify-between">
            <span className="text-2xl font-medium text-white">
              {estimatedOut}
            </span>
            <span className="text-earth-100/80 font-semibold text-sm">
              {pool.tokenOut.symbol}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-5 text-xs text-earth-100/50">
          <div className="flex justify-between">
            <span>Estimated Output</span>
            <span className="text-earth-100/70">
              {estimatedOut} {pool.tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Slippage</span>
            <span className="text-earth-100/70">0.3%</span>
          </div>
          <div className="flex justify-between">
            <span>Fee (0.3%)</span>
            <span className="text-earth-100/70">{fee} RITUAL</span>
          </div>
          <div className="flex justify-between">
            <span>Pool RITUAL</span>
            <span className="text-earth-100/70">{ritualReserveDisplay}</span>
          </div>
        </div>

        {/* Swap button */}
        <button
          onClick={swap}
          disabled={!amountIn || txState === "swapping"}
          className={`
            w-full py-4 rounded-xl font-semibold text-base
            transition-all duration-300
            ${!amountIn || txState === "swapping"
              ? "bg-earth-500/30 text-earth-100/30 cursor-not-allowed"
              : "bg-ritual text-earth-800 hover:bg-ritual-light active:scale-[0.98]"
            }
          `}
        >
          {txState === "swapping" ? "Swapping..." : `Swap RITUAL → ${pool.tokenOut.symbol}`}
        </button>

        {/* Transaction status */}
        <TransactionStatus txState={txState} txHash={txHash} error={error} onReset={reset} />
      </div>
    </div>
  );
}

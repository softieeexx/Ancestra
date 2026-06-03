"use client";

import { TxState } from "@/hooks/useAncestra";
import { Address } from "viem";

interface TransactionStatusProps {
  txState: TxState;
  txHash: Address | null;
  error: string | null;
  onReset: () => void;
}

export default function TransactionStatus({
  txState,
  txHash,
  error,
  onReset,
}: TransactionStatusProps) {
  if (txState === "idle") return null;

  return (
    <div className="mt-4 p-4 rounded-xl border animate-fade-in"
      style={{
        backgroundColor: txState === "error" ? "rgba(248, 113, 113, 0.08)" : "rgba(74, 222, 128, 0.08)",
        borderColor: txState === "error" ? "rgba(248, 113, 113, 0.2)" : "rgba(74, 222, 128, 0.2)",
      }}
    >
      {txState === "swapping" && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-ritual border-t-transparent rounded-full animate-spin" />
          <span className="text-ritual">Swapping...</span>
        </div>
      )}

      {txState === "success" && txHash && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold">Swap Complete</span>
          </div>
          <a
            href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-ritual/70 hover:text-ritual truncate underline underline-offset-2"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
          <button
            onClick={onReset}
            className="text-xs text-earth-100/50 hover:text-earth-100 transition-colors"
          >
            New Swap
          </button>
        </div>
      )}

      {txState === "error" && error && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold">Swap Failed</span>
          </div>
          <p className="text-xs text-red-300/70">{error}</p>
          <button
            onClick={onReset}
            className="text-xs text-earth-100/50 hover:text-earth-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

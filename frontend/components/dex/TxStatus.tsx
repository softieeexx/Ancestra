"use client";

interface Props {
  txState: string;
  txHash: `0x${string}` | null;
  error: string | null;
  onReset: () => void;
}

const EXPLORER = "https://explorer.ritualfoundation.org";

export default function TxStatus({ txState, txHash, error, onReset }: Props) {
  if (txState === "idle") return null;

  const isSuccess = txState === "success";
  const isError   = txState === "error";
  const isPending = !isSuccess && !isError;

  const borderColor = isSuccess
    ? "rgba(74,222,128,0.2)"
    : isError
    ? "rgba(248,113,113,0.2)"
    : "rgba(212,168,83,0.2)";

  const bg = isSuccess
    ? "rgba(74,222,128,0.05)"
    : isError
    ? "rgba(248,113,113,0.05)"
    : "rgba(212,168,83,0.05)";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: bg, border: `1px solid ${borderColor}`, backdropFilter: "blur(12px)" }}
    >
      {isPending && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ritual/30 border-t-ritual animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">
              {txState === "approving" ? "Approving token…" : "Confirming transaction…"}
            </p>
            <p className="text-xs text-earth-100/40 mt-0.5">Check your wallet</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Transaction Complete</p>
              {txHash && (
                <a
                  href={`${EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ritual/70 hover:text-ritual transition-colors font-mono"
                >
                  {txHash.slice(0, 18)}…{txHash.slice(-8)}
                </a>
              )}
            </div>
          </div>
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)", color: "#D4A853" }}
          >
            New Transaction
          </button>
        </div>
      )}

      {isError && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
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
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

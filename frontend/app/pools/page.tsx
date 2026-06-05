"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import AppNav from "@/components/AppNav";
import DappFrame from "@/components/DappFrame";
import { CONTRACTS, POOLS } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI } from "@/lib/abi";

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-2.5 sm:p-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="text-[10px] sm:text-xs text-earth-100/40 mb-1 truncate">{label}</div>
      <div className="text-xs sm:text-sm font-medium text-white truncate">{value}</div>
    </div>
  );
}

function PoolCard({ poolKey }: { poolKey: keyof typeof POOLS }) {
  const pool = POOLS[poolKey];

  const { data: reserves } = useReadContract({ address: pool.pairAddress, abi: PAIR_ABI, functionName: "getReserves" });
  const { data: totalSupply } = useReadContract({ address: pool.pairAddress, abi: PAIR_ABI, functionName: "totalSupply" });

  const res = reserves as [bigint, bigint, number] | undefined;
  const lp  = totalSupply as bigint | undefined;

  const r0    = res ? parseFloat(formatUnits(res[0], pool.token0.decimals)) : 0;
  const r1    = res ? parseFloat(formatUnits(res[1], pool.token1.decimals)) : 0;
  const price = r0 > 0 && r1 > 0 ? r1 / r0 : 0;

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
      style={{ background: "rgba(13,10,3,0.6)", backdropFilter: "blur(16px)", border: `1px solid ${pool.color}20` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {[pool.token0, pool.token1].map((t, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-earth-900" style={{ background: t.logoColor, zIndex: i }}>
                {t.symbol.slice(0, 2)}
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{pool.token0.symbol}/{pool.token1.symbol}</div>
            <div className="text-xs" style={{ color: pool.color }}>{pool.subtitle}</div>
          </div>
        </div>
        <a
          href={`https://explorer.ritualfoundation.org/address/${pool.pairAddress}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-mono text-earth-100/30 hover:text-earth-100/60 transition-colors flex-shrink-0"
        >
          {pool.pairAddress.slice(0, 6)}…{pool.pairAddress.slice(-4)}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox label={`${pool.token0.symbol} Rsrv`} value={r0.toFixed(pool.token0.decimals > 10 ? 6 : 2)} />
        <StatBox label={`${pool.token1.symbol} Rsrv`} value={r1.toFixed(pool.token1.decimals > 6 ? 6 : 4)} />
        <StatBox label="Price" value={`${price.toFixed(4)} ${pool.token1.symbol}`} />
        <StatBox label="LP Supply" value={lp ? parseFloat(formatUnits(lp, 18)).toFixed(4) : "—"} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a href={`/swap/${pool.id}`}
          className="flex-1 py-2 text-center rounded-xl text-xs font-semibold transition-all"
          style={{ background: `${pool.color}12`, color: pool.color, border: `1px solid ${pool.color}25` }}
        >
          Swap
        </a>
        <a href="/liquidity"
          className="flex-1 py-2 text-center rounded-xl text-xs font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Add Liquidity
        </a>
      </div>
    </div>
  );
}

export default function PoolsPage() {
  const { data: pairsCount } = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: "allPairsLength",
  });

  return (
    <DappFrame>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.05) 0%, transparent 65%)", zIndex: 0 }} />

      <div className="relative z-10">
        <AppNav />
      </div>

      <div className="relative z-10 flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-cinzel font-bold text-white" style={{ fontSize: "1.5rem" }}>Pools</h1>
              <p className="text-sm text-earth-100/40 mt-1">
                {pairsCount !== undefined ? `${Number(pairsCount)} pool${Number(pairsCount) !== 1 ? "s" : ""}` : "Loading…"} on Ritual Chain
              </p>
            </div>
            <div className="text-xs font-mono text-earth-100/30 hidden sm:block">
              Factory: {CONTRACTS.FACTORY.slice(0, 10)}…
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(POOLS) as Array<keyof typeof POOLS>).map(k => (
              <PoolCard key={k} poolKey={k} />
            ))}
          </div>

          {/* Contract addresses */}
          <div className="mt-6 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs font-mono text-earth-100/30 mb-3">Deployed Contracts</p>
            <div className="grid gap-2 text-xs font-mono">
              {([
                ["Factory", CONTRACTS.FACTORY],
                ["Router",  CONTRACTS.ROUTER],
                ["WRITUAL", CONTRACTS.WRITUAL],
              ] as [string, string][]).map(([label, addr]) => (
                <div key={addr} className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-earth-100/40 flex-shrink-0 w-16">{label}</span>
                  <a
                    href={`https://explorer.ritualfoundation.org/address/${addr}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-ritual/60 hover:text-ritual transition-colors min-w-0 truncate"
                  >
                    <span className="hidden sm:inline">{addr}</span>
                    <span className="sm:hidden">{addr.slice(0, 10)}…{addr.slice(-6)}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DappFrame>
  );
}

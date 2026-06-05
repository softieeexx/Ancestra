"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import AppNav from "@/components/AppNav";
import DappFrame from "@/components/DappFrame";
import { CONTRACTS, TOKEN_PAIR, TOKENS, WRITUAL_IS_TOKEN0 } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI } from "@/lib/abi";

// All pools to display: [label, pairAddress, token0sym, token1sym, t0dec, t1dec, color]
const ALL_POOLS = [
  // Amina — stables
  { label: "RITUAL / USDC", pair: CONTRACTS.PAIR_WRITUAL_USDC, t0: "RITUAL", t1: "USDC", d0: 18, d1: 6,  color: "#4ADE80", mode: "amina"     },
  { label: "RITUAL / USDT", pair: CONTRACTS.PAIR_WRITUAL_USDT, t0: "RITUAL", t1: "USDT", d0: 18, d1: 6,  color: "#26A17B", mode: "amina"     },
  { label: "RITUAL / DAI",  pair: CONTRACTS.PAIR_WRITUAL_DAI,  t0: "RITUAL", t1: "DAI",  d0: 18, d1: 18, color: "#F472B6", mode: "yaa"       },
  // Nefertiti — crypto
  { label: "RITUAL / ETH",  pair: CONTRACTS.PAIR_WRITUAL_WETH, t0: "RITUAL", t1: "ETH",  d0: 18, d1: 18, color: "#627EEA", mode: "nefertiti" },
  { label: "RITUAL / MON",  pair: CONTRACTS.PAIR_WRITUAL_MON,  t0: "RITUAL", t1: "MON",  d0: 18, d1: 18, color: "#836EF9", mode: "nefertiti" },
  { label: "RITUAL / SOL",  pair: CONTRACTS.PAIR_WRITUAL_SOL,  t0: "RITUAL", t1: "SOL",  d0: 18, d1: 9,  color: "#9945FF", mode: "nefertiti" },
  { label: "RITUAL / BTC",  pair: CONTRACTS.PAIR_WRITUAL_BTC,  t0: "RITUAL", t1: "BTC",  d0: 18, d1: 8,  color: "#F7931A", mode: "nefertiti" },
] as const;

function PoolRow({ pool }: { pool: typeof ALL_POOLS[number] }) {
  const { data: reserves    } = useReadContract({ address: pool.pair, abi: PAIR_ABI, functionName: "getReserves" });
  const { data: totalSupply } = useReadContract({ address: pool.pair, abi: PAIR_ABI, functionName: "totalSupply" });

  const res = reserves as [bigint, bigint, number] | undefined;
  const lp  = totalSupply as bigint | undefined;

  // WRITUAL is NOT token0 in USDT, DAI, MON, SOL, BTC pairs — those tokens are token0
  const writualIsT0 = WRITUAL_IS_TOKEN0[pool.pair] ?? true;
  const rRitual = res ? (writualIsT0 ? res[0] : res[1]) : undefined;
  const rOther  = res ? (writualIsT0 ? res[1] : res[0]) : undefined;

  const ritualAmt = rRitual ? parseFloat(formatUnits(rRitual, 18)) : 0;
  const otherAmt  = rOther  ? parseFloat(formatUnits(rOther,  pool.d1)) : 0;
  const price     = ritualAmt > 0 && otherAmt > 0 ? otherAmt / ritualAmt : 0;
  const lpAmt     = lp ? parseFloat(formatUnits(lp, 18)) : 0;
  const hasLiq    = ritualAmt > 0 && otherAmt > 0;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 px-4 py-3.5 rounded-xl transition-all hover:bg-white/[0.02]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Pool name */}
      <div className="flex items-center gap-3 sm:w-[180px] flex-shrink-0">
        <div className="flex -space-x-1.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-black/40"
            style={{ background: "#D4A853", zIndex: 1 }}>RI</div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-black/40"
            style={{ background: pool.color }}>
            {pool.t1.slice(0, 2)}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{pool.label}</div>
          {!hasLiq && <div className="text-[10px] text-red-400/60 mt-0.5">No liquidity</div>}
        </div>
      </div>

      {/* Stats — horizontal scroll-safe on mobile */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 overflow-x-auto pb-0.5 sm:pb-0 text-xs font-mono">
        <div className="flex-shrink-0">
          <div className="text-earth-100/35 mb-0.5">RITUAL Rsrv</div>
          <div className="text-white/70">{hasLiq ? ritualAmt.toFixed(4) : "—"}</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-earth-100/35 mb-0.5">{pool.t1} Rsrv</div>
          <div className="text-white/70">{hasLiq ? otherAmt.toFixed(pool.d1 <= 9 ? 6 : 4) : "—"}</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-earth-100/35 mb-0.5">Price</div>
          <div className="text-white/70">{hasLiq ? `${price.toFixed(pool.d1 <= 9 ? 6 : 4)} ${pool.t1}` : "—"}</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-earth-100/35 mb-0.5">LP Supply</div>
          <div className="text-white/70">{lpAmt > 0 ? lpAmt.toFixed(4) : "—"}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 sm:ml-4">
        <a
          href={`/swap/${pool.mode}`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: `${pool.color}15`, color: pool.color, border: `1px solid ${pool.color}30` }}
        >
          Swap
        </a>
        <a
          href="/liquidity"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          + Liq
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

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-cinzel font-bold text-white" style={{ fontSize: "1.5rem" }}>Pools</h1>
              <p className="text-sm text-earth-100/40 mt-1">
                {pairsCount !== undefined ? `${Number(pairsCount)} pool${Number(pairsCount) !== 1 ? "s" : ""}` : "Loading…"} on Ritual Chain
              </p>
            </div>
            <div className="text-xs font-mono text-earth-100/25 hidden sm:block truncate ml-4">
              Factory: {CONTRACTS.FACTORY.slice(0, 10)}…
            </div>
          </div>

          {/* Pool list */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(13,10,3,0.65)", backdropFilter: "blur(16px)", border: "1px solid rgba(212,168,83,0.10)" }}
          >
            {/* Table header — desktop only */}
            <div
              className="hidden sm:flex items-center gap-0 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.22)" }}
            >
              <div className="w-[180px] flex-shrink-0">Pool</div>
              <div className="flex-1 flex gap-6">
                <span className="w-24">RITUAL Rsrv</span>
                <span className="w-24">Token Rsrv</span>
                <span className="w-28">Price</span>
                <span className="w-20">LP Supply</span>
              </div>
              <div className="w-[88px] flex-shrink-0">Actions</div>
            </div>

            {/* Section: Amina — Stables */}
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4ADE8060" }}>
                Amina · Stables
              </span>
            </div>
            {ALL_POOLS.filter(p => p.mode === "amina" || p.t1 === "DAI").map(p => (
              <PoolRow key={p.pair} pool={p} />
            ))}

            {/* Section: Nefertiti — Crypto */}
            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#FBBF2460" }}>
                Nefertiti · Crypto
              </span>
            </div>
            {ALL_POOLS.filter(p => p.mode === "nefertiti").map(p => (
              <PoolRow key={p.pair} pool={p} />
            ))}

            {/* Last row: no bottom border */}
            <div className="h-2" />
          </div>

          {/* Contract addresses */}
          <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] font-mono text-earth-100/25 mb-3 uppercase tracking-widest">Deployed Contracts</p>
            <div className="grid gap-1.5 text-xs font-mono">
              {([
                ["Factory", CONTRACTS.FACTORY],
                ["Router",  CONTRACTS.ROUTER],
                ["WRITUAL", CONTRACTS.WRITUAL],
              ] as [string, string][]).map(([label, addr]) => (
                <div key={addr} className="flex items-center gap-3 min-w-0">
                  <span className="text-earth-100/35 flex-shrink-0 w-16">{label}</span>
                  <a href={`https://explorer.ritualfoundation.org/address/${addr}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-ritual/50 hover:text-ritual transition-colors min-w-0 truncate">
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

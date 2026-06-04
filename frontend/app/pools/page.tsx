"use client";

import { useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits, Address } from "viem";
import WalletConnect from "@/components/WalletConnect";
import { CONTRACTS, POOLS, TOKENS } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI } from "@/lib/abi";

function NavBar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-6">
      <button onClick={() => router.push("/")} className="flex items-center gap-2 text-earth-100/50 hover:text-ritual transition-colors text-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Home
      </button>
      <nav className="flex items-center gap-4 text-sm">
        <a href="/swap" className="text-earth-100/50 hover:text-white transition-colors">Swap</a>
        <a href="/liquidity" className="text-earth-100/50 hover:text-white transition-colors">Liquidity</a>
        <a href="/pools" className="text-ritual font-semibold">Pools</a>
        <a href="/portfolio" className="text-earth-100/50 hover:text-white transition-colors">Portfolio</a>
      </nav>
      <WalletConnect />
    </div>
  );
}

function PoolCard({ poolKey }: { poolKey: keyof typeof POOLS }) {
  const pool = POOLS[poolKey];

  const { data: reserves } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
  });

  const { data: totalSupply } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "totalSupply",
  });

  const res = reserves as [bigint, bigint, number] | undefined;
  const lp  = totalSupply as bigint | undefined;

  const r0 = res ? parseFloat(formatUnits(res[0], pool.token0.decimals)) : 0;
  const r1 = res ? parseFloat(formatUnits(res[1], pool.token1.decimals)) : 0;
  const price = r0 > 0 && r1 > 0 ? (r1 / r0) : 0;

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
      style={{
        background: "rgba(13,10,3,0.6)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${pool.color}20`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {[pool.token0, pool.token1].map((t, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-earth-900"
                style={{ background: t.logoColor, zIndex: i }}
              >
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
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-earth-100/30 hover:text-earth-100/60 transition-colors"
        >
          {pool.pairAddress.slice(0, 8)}…{pool.pairAddress.slice(-4)}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox label={`${pool.token0.symbol} Reserve`} value={r0.toFixed(pool.token0.decimals > 10 ? 6 : 2)} />
        <StatBox label={`${pool.token1.symbol} Reserve`} value={r1.toFixed(pool.token1.decimals > 6 ? 6 : 4)} />
        <StatBox label="Price" value={`${price.toFixed(4)} ${pool.token1.symbol}/${pool.token0.symbol}`} />
        <StatBox label="LP Supply" value={lp ? parseFloat(formatUnits(lp, 18)).toFixed(4) : "—"} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href="/swap"
          className="flex-1 py-2 text-center rounded-xl text-xs font-semibold transition-all"
          style={{ background: `${pool.color}12`, color: pool.color, border: `1px solid ${pool.color}25` }}
        >
          Swap
        </a>
        <a
          href="/liquidity"
          className="flex-1 py-2 text-center rounded-xl text-xs font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Add Liquidity
        </a>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="text-xs text-earth-100/40 mb-1">{label}</div>
      <div className="text-sm font-medium text-white truncate">{value}</div>
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
    <div className="flex-1 flex flex-col px-4 py-6">
      <NavBar />

      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Pool Explorer</h1>
            <p className="text-sm text-earth-100/40 mt-1">
              {pairsCount !== undefined ? `${Number(pairsCount)} pool${Number(pairsCount) !== 1 ? "s" : ""}` : "Loading…"} on Ritual Chain
            </p>
          </div>
          <div className="text-xs font-mono text-earth-100/30">
            Factory: {CONTRACTS.FACTORY.slice(0, 10)}…
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(POOLS) as Array<keyof typeof POOLS>).map(k => (
            <PoolCard key={k} poolKey={k} />
          ))}
        </div>

        {/* Contract addresses */}
        <div
          className="mt-6 rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs font-mono text-earth-100/30 mb-3">Deployed Contracts</p>
          <div className="grid gap-2 text-xs font-mono">
            {[
              ["Factory", CONTRACTS.FACTORY],
              ["Router", CONTRACTS.ROUTER],
              ["WRITUAL", CONTRACTS.WRITUAL],
            ].map(([label, addr]) => (
              <div key={addr} className="flex items-center justify-between">
                <span className="text-earth-100/40">{label}</span>
                <a
                  href={`https://explorer.ritualfoundation.org/address/${addr}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-ritual/60 hover:text-ritual transition-colors"
                >
                  {addr}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

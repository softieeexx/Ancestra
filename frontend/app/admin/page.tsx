"use client";

import { useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits, Address } from "viem";
import WalletConnect from "@/components/WalletConnect";
import { CONTRACTS, POOLS } from "@/lib/constants";
import { FACTORY_ABI, ROUTER_ABI, PAIR_ABI, ERC20_ABI } from "@/lib/abi";

const EXPLORER = "https://explorer.ritualfoundation.org";

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
        <a href="/pools" className="text-earth-100/50 hover:text-white transition-colors">Pools</a>
        <a href="/portfolio" className="text-earth-100/50 hover:text-white transition-colors">Portfolio</a>
      </nav>
      <WalletConnect />
    </div>
  );
}

function ContractStatus({ label, address, check }: {
  label: string;
  address: Address;
  check?: { abi: any; fn: string; label: string };
}) {
  const { data, isError } = useReadContract(
    check
      ? { address, abi: check.abi, functionName: check.fn }
      : { enabled: false } as any
  );

  const isLive = !isError && (check ? data !== undefined : true);

  return (
    <div
      className="p-4 rounded-xl flex items-center justify-between gap-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: isLive ? "#4ADE80" : "#F87171", boxShadow: `0 0 6px ${isLive ? "#4ADE80" : "#F87171"}` }}
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-white">{label}</div>
          <a
            href={`${EXPLORER}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-earth-100/40 hover:text-ritual transition-colors truncate block"
          >
            {address}
          </a>
        </div>
      </div>
      {check && data !== undefined && (
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-earth-100/40">{check.label}</div>
          <div className="text-xs font-mono text-white/60 max-w-[120px] truncate">
            {typeof data === "bigint" ? data.toString() : String(data).slice(0, 20)}
          </div>
        </div>
      )}
    </div>
  );
}

function PoolStatus({ poolKey }: { poolKey: keyof typeof POOLS }) {
  const pool = POOLS[poolKey];

  const { data: reserves, isError } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
  });

  const { data: lpSupply } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "totalSupply",
  });

  const res = reserves as [bigint, bigint, number] | undefined;
  const lp  = lpSupply as bigint | undefined;

  const hasLiquidity = res && res[0] > 0n && res[1] > 0n;

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: hasLiquidity ? `${pool.color}06` : "rgba(248,113,113,0.05)",
        border: `1px solid ${hasLiquidity ? pool.color + "20" : "rgba(248,113,113,0.2)"}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: hasLiquidity ? "#4ADE80" : "#F87171" }}
          />
          <span className="text-sm font-semibold text-white">
            {pool.token0.symbol}/{pool.token1.symbol}
          </span>
          <span className="text-xs" style={{ color: pool.color }}>{pool.subtitle}</span>
        </div>
        <a
          href={`${EXPLORER}/address/${pool.pairAddress}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-mono text-earth-100/30 hover:text-earth-100/60"
        >
          {pool.pairAddress.slice(0, 10)}…
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-earth-100/40">{pool.token0.symbol}</div>
          <div className="text-white/70">
            {res ? parseFloat(formatUnits(res[0], pool.token0.decimals)).toFixed(6) : "—"}
          </div>
        </div>
        <div>
          <div className="text-earth-100/40">{pool.token1.symbol}</div>
          <div className="text-white/70">
            {res ? parseFloat(formatUnits(res[1], pool.token1.decimals)).toFixed(6) : "—"}
          </div>
        </div>
        <div>
          <div className="text-earth-100/40">LP Supply</div>
          <div className="text-white/70">
            {lp ? parseFloat(formatUnits(lp, 18)).toFixed(4) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: pairsCount } = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: "allPairsLength",
  });

  const { data: routerFactory } = useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: "factory",
  });

  const routerOk = routerFactory?.toString().toLowerCase() === CONTRACTS.FACTORY.toLowerCase();

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      <NavBar />

      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-earth-100/40 mt-1">Deployment status · Ritual Chain (ID: 1979)</p>
          </div>
        </div>

        {/* Core contracts */}
        <section className="mb-6">
          <h2 className="text-xs font-mono text-earth-100/40 mb-3 uppercase tracking-widest">Core Contracts</h2>
          <div className="space-y-2">
            <ContractStatus
              label="AncestraFactory"
              address={CONTRACTS.FACTORY}
              check={{ abi: FACTORY_ABI, fn: "allPairsLength", label: "Pairs created" }}
            />
            <ContractStatus
              label="AncestraRouter"
              address={CONTRACTS.ROUTER}
              check={{ abi: ROUTER_ABI, fn: "factory", label: "Factory ref" }}
            />
            <ContractStatus
              label="WRITUAL"
              address={CONTRACTS.WRITUAL}
              check={{ abi: [{ type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" }], fn: "totalSupply", label: "Total supply" }}
            />
          </div>
        </section>

        {/* Router integrity */}
        <div
          className="mb-6 p-4 rounded-xl"
          style={{
            background: routerOk ? "rgba(74,222,128,0.05)" : "rgba(248,113,113,0.05)",
            border: `1px solid ${routerOk ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: routerOk ? "#4ADE80" : "#F87171" }} />
            <span className="text-sm font-semibold text-white">Router ↔ Factory Link</span>
          </div>
          <p className="text-xs text-earth-100/40">
            {routerOk
              ? "Router factory address matches deployed factory — routing is operational"
              : "Router factory mismatch — check deployment"}
          </p>
        </div>

        {/* Token contracts */}
        <section className="mb-6">
          <h2 className="text-xs font-mono text-earth-100/40 mb-3 uppercase tracking-widest">Token Contracts</h2>
          <div className="space-y-2">
            {[
              { label: "USDC (Mock)", address: CONTRACTS.USDC },
              { label: "WETH (Mock)", address: CONTRACTS.WETH },
              { label: "DAI (Mock)", address: CONTRACTS.DAI },
            ].map(c => (
              <ContractStatus key={c.address} label={c.label} address={c.address as Address} />
            ))}
          </div>
        </section>

        {/* Pool health */}
        <section className="mb-6">
          <h2 className="text-xs font-mono text-earth-100/40 mb-3 uppercase tracking-widest">Pool Status</h2>
          <div className="space-y-3">
            {(Object.keys(POOLS) as Array<keyof typeof POOLS>).map(k => (
              <PoolStatus key={k} poolKey={k} />
            ))}
          </div>
        </section>

        {/* Verification hashes */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <h2 className="text-xs font-mono text-earth-100/40 mb-3 uppercase tracking-widest">Verification</h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex gap-2">
              <span className="text-earth-100/40 w-32 flex-shrink-0">Test Swap 1</span>
              <a href={`${EXPLORER}/tx/0xb70f4b03c34eb9e1f0070c46d9570d309f0d9035c329334499ea2c4057d88e5a`} target="_blank" rel="noopener noreferrer" className="text-ritual/60 hover:text-ritual transition-colors truncate">
                0xb70f4b…d88e5a (WRITUAL→USDC)
              </a>
            </div>
            <div className="flex gap-2">
              <span className="text-earth-100/40 w-32 flex-shrink-0">Test Swap 2</span>
              <a href={`${EXPLORER}/tx/0xa0756c236bc371e375fbb09ba2c4f24d15b8bf3374d6eff960b6ed2b766bd44e`} target="_blank" rel="noopener noreferrer" className="text-ritual/60 hover:text-ritual transition-colors truncate">
                0xa0756c…6bd44e (WRITUAL→WETH)
              </a>
            </div>
            <div className="flex gap-2">
              <span className="text-earth-100/40 w-32 flex-shrink-0">Test Swap 3</span>
              <a href={`${EXPLORER}/tx/0x5c7ec787626f237413e608013159bafe72cb372f50ab04ce457b5300d436844a`} target="_blank" rel="noopener noreferrer" className="text-ritual/60 hover:text-ritual transition-colors truncate">
                0x5c7ec7…36844a (WRITUAL→DAI)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

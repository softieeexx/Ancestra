"use client";

import { useRouter } from "next/navigation";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits, Address } from "viem";
import WalletConnect from "@/components/WalletConnect";
import { CONTRACTS, POOLS, TOKENS } from "@/lib/constants";
import { PAIR_ABI, ERC20_ABI } from "@/lib/abi";
import { ritualChain } from "@/lib/config";

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
        <a href="/portfolio" className="text-ritual font-semibold">Portfolio</a>
      </nav>
      <WalletConnect />
    </div>
  );
}

function TokenBalanceRow({ token, address }: { token: typeof TOKENS[number]; address: Address }) {
  const { data: nativeBal } = useBalance({ address, chainId: ritualChain.id });
  const { data: erc20Bal } = useReadContract({
    address: token.isNative ? undefined : token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !token.isNative },
  });

  const bal = token.isNative
    ? nativeBal ? formatUnits(nativeBal.value, 18) : "0"
    : erc20Bal ? formatUnits(erc20Bal as bigint, token.decimals) : "0";

  const display = parseFloat(bal).toFixed(token.decimals > 10 ? 6 : 4);
  const hasBalance = parseFloat(bal) > 0;

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl transition-all"
      style={{
        background: hasBalance ? `${token.logoColor}08` : "rgba(255,255,255,0.02)",
        border: `1px solid ${hasBalance ? token.logoColor + "20" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ background: token.logoColor, opacity: hasBalance ? 1 : 0.4 }}
      >
        {token.symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{token.symbol}</div>
        <div className="text-xs text-earth-100/40 truncate">{token.name}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${hasBalance ? "text-white" : "text-earth-100/30"}`}>
          {display}
        </div>
      </div>
    </div>
  );
}

function LpPositionRow({ poolKey, address }: { poolKey: keyof typeof POOLS; address: Address }) {
  const pool = POOLS[poolKey];

  const { data: lpBal } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: totalSupply } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "totalSupply",
  });

  const { data: reserves } = useReadContract({
    address: pool.pairAddress,
    abi: PAIR_ABI,
    functionName: "getReserves",
  });

  const lp  = lpBal as bigint | undefined;
  const ts  = totalSupply as bigint | undefined;
  const res = reserves as [bigint, bigint, number] | undefined;

  if (!lp || lp === 0n) return null;

  const share = ts && ts > 0n ? Number((lp * 10000n) / ts) / 100 : 0;
  const myR0  = res && ts && ts > 0n ? (lp * res[0]) / ts : 0n;
  const myR1  = res && ts && ts > 0n ? (lp * res[1]) / ts : 0n;

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: `${pool.color}08`, border: `1px solid ${pool.color}20` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {[pool.token0, pool.token1].map((t, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black border border-earth-900"
                style={{ background: t.logoColor }}
              >
                {t.symbol.slice(0, 2)}
              </div>
            ))}
          </div>
          <span className="text-sm font-semibold text-white">{pool.token0.symbol}/{pool.token1.symbol}</span>
        </div>
        <span className="text-xs font-mono" style={{ color: pool.color }}>{share.toFixed(4)}% share</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-earth-100/40">{pool.token0.symbol}: </span>
          <span className="text-white/70">{parseFloat(formatUnits(myR0, pool.token0.decimals)).toFixed(6)}</span>
        </div>
        <div>
          <span className="text-earth-100/40">{pool.token1.symbol}: </span>
          <span className="text-white/70">{parseFloat(formatUnits(myR1, pool.token1.decimals)).toFixed(6)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-earth-100/40">LP: </span>
          <span className="text-white/70">{parseFloat(formatUnits(lp, 18)).toFixed(6)} AMLP</span>
        </div>
      </div>
      <div className="mt-3">
        <a
          href="/liquidity"
          className="text-xs transition-colors"
          style={{ color: pool.color }}
        >
          Manage position →
        </a>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { isConnected, address } = useAccount();

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      <NavBar />

      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-display font-bold text-white mb-6">Portfolio</h1>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 mt-12">
            <p className="text-earth-100/50 text-sm">Connect your wallet to view your portfolio</p>
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Token balances */}
            <section>
              <h2 className="text-sm font-semibold text-earth-100/50 mb-3 uppercase tracking-widest">Token Balances</h2>
              <div className="space-y-2">
                {TOKENS.map(t => (
                  <TokenBalanceRow key={t.address} token={t} address={address!} />
                ))}
              </div>
            </section>

            {/* LP positions */}
            <section>
              <h2 className="text-sm font-semibold text-earth-100/50 mb-3 uppercase tracking-widest">Liquidity Positions</h2>
              <div className="space-y-3">
                {(Object.keys(POOLS) as Array<keyof typeof POOLS>).map(k => (
                  <LpPositionRow key={k} poolKey={k} address={address!} />
                ))}
              </div>
              <p className="text-xs text-earth-100/30 mt-3 text-center">
                Only pools with non-zero LP balance are shown
              </p>
            </section>

            {/* Faucet hint */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.1)" }}
            >
              <p className="text-xs text-ritual/70 font-semibold mb-1">Need testnet tokens?</p>
              <p className="text-xs text-earth-100/40">
                USDC, WETH and DAI are mock tokens — call <code className="text-ritual/60">faucet(address)</code> on
                their contracts to receive test amounts. Contract addresses are on the{" "}
                <a href="/pools" className="text-ritual/70 hover:text-ritual transition-colors">Pools page</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits, Address } from "viem";
import AppNav from "@/components/AppNav";
import WalletConnect from "@/components/WalletConnect";
import TokenSelector from "@/components/dex/TokenSelector";
import TxStatus from "@/components/dex/TxStatus";
import { TOKENS, Token, CONTRACTS, POOLS } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI, ROUTER_ABI, MOCK_ERC20_ABI } from "@/lib/abi";
import { useAddLiquidity, useRemoveLiquidity } from "@/hooks/useRouter";

type Tab = "add" | "remove" | "faucet";

export default function LiquidityPage() {
  const { isConnected, address } = useAccount();
  const [tab, setTab] = useState<Tab>("add");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0803" }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.05) 0%, transparent 65%)", zIndex: 0 }} />

      <div className="relative z-10">
        <AppNav />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-4 py-8">
        <div className="max-w-[500px] mx-auto w-full">
          <h1 className="font-cinzel font-bold text-white mb-6" style={{ fontSize: "1.5rem" }}>Liquidity</h1>

          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["add", "remove", "faucet"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-3 text-sm font-semibold transition-all"
                style={
                  tab === t
                    ? { background: "rgba(212,168,83,0.15)", color: "#D4A853" }
                    : { background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)" }
                }
              >
                {t === "add" ? "Add Liquidity" : t === "remove" ? "Remove Liquidity" : "Faucet"}
              </button>
            ))}
          </div>

          {!isConnected ? (
            <div className="flex flex-col items-center gap-4 mt-16">
              <p className="text-earth-100/50 text-sm">Connect your wallet to manage liquidity</p>
              <WalletConnect />
            </div>
          ) : tab === "add" ? (
            <AddLiquidity address={address!} />
          ) : tab === "remove" ? (
            <RemoveLiquidity address={address!} />
          ) : (
            <FaucetPanel address={address!} />
          )}
        </div>
      </div>
    </div>
  );
}

function AddLiquidity({ address }: { address: Address }) {
  const [tokenA, setTokenA] = useState<Token>(TOKENS[1]); // WRITUAL
  const [tokenB, setTokenB] = useState<Token>(TOKENS[2]); // USDC
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const { txState, txHash, error, addLiquidity, reset } = useAddLiquidity();

  const addrA = tokenA.isNative ? CONTRACTS.WRITUAL : tokenA.address;
  const addrB = tokenB.isNative ? CONTRACTS.WRITUAL : tokenB.address;

  const { data: pairAddr } = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [addrA, addrB],
  });

  const { data: reserves } = useReadContract({
    address: pairAddr as Address | undefined,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddr && pairAddr !== "0x0000000000000000000000000000000000000000" },
  });

  const handleAmountAChange = useCallback((val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    setAmountA(val);
    if (reserves && val && parseFloat(val) > 0) {
      const [r0, r1] = reserves as [bigint, bigint, number];
      const inAmt = parseUnits(val, tokenA.decimals);
      if (r0 > 0n && r1 > 0n) {
        const quoted = (inAmt * r1) / r0;
        setAmountB(parseFloat(formatUnits(quoted, tokenB.decimals)).toFixed(6));
      }
    }
  }, [reserves, tokenA.decimals, tokenB.decimals]);

  const isBusy = txState === "approving" || txState === "adding";
  const hasAmounts = !!amountA && !!amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,10,3,0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(212,168,83,0.12)" }}>
      <div className="p-5">
        <div className="space-y-3">
          {/* Token A */}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs text-earth-100/35 block mb-2">Token A</span>
            <div className="flex items-center gap-3">
              <input
                type="text" inputMode="decimal" placeholder="0.00" value={amountA}
                onChange={e => handleAmountAChange(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/15"
              />
              <TokenSelector selected={tokenA} exclude={tokenB.address} onSelect={t => { setTokenA(t); setAmountA(""); setAmountB(""); }} />
            </div>
          </div>

          <div className="flex justify-center text-earth-100/30 text-sm">+</div>

          {/* Token B */}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs text-earth-100/35 block mb-2">Token B</span>
            <div className="flex items-center gap-3">
              <input
                type="text" inputMode="decimal" placeholder="0.00" value={amountB}
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmountB(e.target.value); }}
                className="flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/15"
              />
              <TokenSelector selected={tokenB} exclude={tokenA.address} onSelect={t => { setTokenB(t); setAmountA(""); setAmountB(""); }} />
            </div>
          </div>

          {pairAddr && pairAddr !== "0x0000000000000000000000000000000000000000" ? (
            <div className="text-xs text-earth-100/40 text-center">Pool exists · {(pairAddr as string).slice(0, 10)}…{(pairAddr as string).slice(-6)}</div>
          ) : (
            <div className="text-xs text-ritual/60 text-center">New pool will be created</div>
          )}

          <button
            onClick={() => addLiquidity(tokenA, tokenB, amountA, amountB)}
            disabled={!hasAmounts || isBusy}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all"
            style={
              !hasAmounts || isBusy
                ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }
                : { background: "linear-gradient(135deg, #D4A853 0%, #F0C060 50%, #C8902A 100%)", color: "#0D0A03" }
            }
          >
            {txState === "approving" ? "Approving…" : isBusy ? "Adding liquidity…" : "Add Liquidity"}
          </button>
        </div>
      </div>
      {txState !== "idle" && <div className="px-5 pb-5"><TxStatus txState={txState} txHash={txHash} error={error} onReset={reset} /></div>}
    </div>
  );
}

function RemoveLiquidity({ address }: { address: Address }) {
  const { txState, txHash, error, removeLiquidity, reset } = useRemoveLiquidity();
  const [selectedPool, setSelectedPool] = useState<keyof typeof POOLS>("amina");
  const [lpAmount, setLpAmount] = useState("");

  const pool = POOLS[selectedPool];

  const { data: lpBalance } = useReadContract({ address: pool.pairAddress, abi: PAIR_ABI, functionName: "balanceOf", args: [address] });
  const { data: totalSupply } = useReadContract({ address: pool.pairAddress, abi: PAIR_ABI, functionName: "totalSupply" });
  const { data: reserves } = useReadContract({ address: pool.pairAddress, abi: PAIR_ABI, functionName: "getReserves" });

  const lpBal    = lpBalance as bigint | undefined;
  const lpSupply = totalSupply as bigint | undefined;
  const res      = reserves as [bigint, bigint, number] | undefined;

  const lpShare = lpBal && lpSupply && lpSupply > 0n ? Number((lpBal * 10000n) / lpSupply) / 100 : 0;
  const lpAmtBig = lpAmount ? (() => { try { return parseUnits(lpAmount, 18); } catch { return 0n; } })() : 0n;
  const expectedA = res && lpSupply && lpSupply > 0n && lpAmtBig > 0n ? (lpAmtBig * res[0]) / lpSupply : 0n;
  const expectedB = res && lpSupply && lpSupply > 0n && lpAmtBig > 0n ? (lpAmtBig * res[1]) / lpSupply : 0n;

  const isBusy = txState === "approving" || txState === "removing";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,10,3,0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(212,168,83,0.12)" }}>
      <div className="p-5">
        {/* Pool selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(Object.keys(POOLS) as Array<keyof typeof POOLS>).map(k => {
            const p = POOLS[k];
            return (
              <button key={k} onClick={() => { setSelectedPool(k); setLpAmount(""); }}
                className="py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                style={selectedPool === k
                  ? { background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }
                  : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {p.token0.symbol}/{p.token1.symbol}
              </button>
            );
          })}
        </div>

        {/* LP info */}
        <div className="rounded-xl p-3 mb-4 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex justify-between text-xs">
            <span className="text-earth-100/40">Your LP Balance</span>
            <span className="text-white/70">{lpBal ? parseFloat(formatUnits(lpBal, 18)).toFixed(6) : "0"} AMLP</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-earth-100/40">Pool Share</span>
            <span className="text-ritual">{lpShare.toFixed(4)}%</span>
          </div>
        </div>

        {/* LP input */}
        <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-earth-100/35">LP Amount to Remove</span>
            <button onClick={() => lpBal && setLpAmount(formatUnits(lpBal, 18))} className="text-xs" style={{ color: "#D4A853" }}>MAX</button>
          </div>
          <input
            type="text" inputMode="decimal" placeholder="0.00" value={lpAmount}
            onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setLpAmount(e.target.value); }}
            className="w-full bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/15"
          />
        </div>

        {lpAmtBig > 0n && (
          <div className="rounded-xl p-3 mb-4 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex justify-between text-xs">
              <span className="text-earth-100/40">You receive {pool.token0.symbol}</span>
              <span className="text-white/70">{parseFloat(formatUnits(expectedA, pool.token0.decimals)).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-earth-100/40">You receive {pool.token1.symbol}</span>
              <span className="text-white/70">{parseFloat(formatUnits(expectedB, pool.token1.decimals)).toFixed(6)}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => removeLiquidity(pool.pairAddress, pool.token0, pool.token1, lpAmount)}
          disabled={!lpAmount || parseFloat(lpAmount) <= 0 || isBusy}
          className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all"
          style={!lpAmount || isBusy
            ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }
            : { background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }
          }
        >
          {isBusy ? "Removing…" : "Remove Liquidity"}
        </button>
      </div>
      {txState !== "idle" && <div className="px-5 pb-5"><TxStatus txState={txState} txHash={txHash} error={error} onReset={reset} /></div>}
    </div>
  );
}

// ── Faucet Panel ─────────────────────────────────────────────────────────────

const FAUCET_TOKENS = [
  { address: CONTRACTS.USDC, symbol: "USDC", color: "#4ADE80", name: "USD Coin" },
  { address: CONTRACTS.WETH, symbol: "WETH", color: "#FBBF24", name: "Wrapped Ether" },
  { address: CONTRACTS.DAI,  symbol: "DAI",  color: "#F87171", name: "Dai Stablecoin" },
] as const;

function FaucetPanel({ address }: { address: Address }) {
  const { writeContractAsync } = useWriteContract();
  const [minting, setMinting] = useState<string | null>(null);
  const [minted, setMinted]   = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  const mint = useCallback(async (token: typeof FAUCET_TOKENS[number]) => {
    setMinting(token.symbol);
    setMinted(null);
    setMintError(null);
    try {
      await writeContractAsync({
        address: token.address,
        abi: MOCK_ERC20_ABI,
        functionName: "faucet",
        args: [address],
        gas: 100000n,
      });
      setMinted(token.symbol);
    } catch (err: any) {
      setMintError(err?.shortMessage || err?.message || "Mint failed");
    } finally {
      setMinting(null);
    }
  }, [address, writeContractAsync]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(13,10,3,0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(212,168,83,0.12)" }}
    >
      <div className="p-5">
        <p className="text-xs text-earth-100/40 mb-1">Testnet Faucet</p>
        <p className="text-sm text-white/60 mb-5">
          Mint 1,000 test tokens to your wallet. No limit — use as needed for testing.
        </p>

        <div className="space-y-3">
          {FAUCET_TOKENS.map(token => (
            <div
              key={token.symbol}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: `${token.color}08`, border: `1px solid ${token.color}18` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ background: token.color }}
                >
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{token.symbol}</div>
                  <div className="text-xs text-earth-100/40">{token.name}</div>
                </div>
              </div>

              <button
                onClick={() => mint(token)}
                disabled={minting === token.symbol}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
                style={{ background: `${token.color}18`, color: token.color, border: `1px solid ${token.color}30` }}
              >
                {minting === token.symbol ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    Minting…
                  </span>
                ) : "Mint 1,000"}
              </button>
            </div>
          ))}
        </div>

        {minted && (
          <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: "#4ADE80" }}>
              1,000 {minted} minted to your wallet
            </p>
          </div>
        )}

        {mintError && (
          <div className="mt-4 rounded-xl px-4 py-3" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <p className="text-xs font-semibold" style={{ color: "#F87171" }}>{mintError}</p>
          </div>
        )}

        <p className="text-xs text-earth-100/25 mt-5 text-center">
          Mock tokens only — no real value · Ritual Testnet
        </p>
      </div>
    </div>
  );
}

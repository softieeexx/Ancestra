import { Address } from "viem";

export const RITUAL_CHAIN_ID = 1979;

// ── Deployed contract addresses (Ritual Chain testnet) ───────────────────────
export const CONTRACTS = {
  WRITUAL:   "0x97bA2808dEe4B117145dEC51985ca2C70810E3bA" as Address,
  FACTORY:   "0xB7a842c56Fc6797B6b1BBd50A0f03357bf9A1fB9" as Address,
  ROUTER:    "0xe38fdE07E91cEBccF22BBB719dDdB434238DF721" as Address,
  // Stablecoins
  USDC:      "0x9Fa1dacB93cBC442DBD2B61450EfF6923Dd0A411" as Address,
  USDT:      "0x0e477d65a7AEf13830091f4D9B5906E4b5469db6" as Address,
  DAI:       "0x0309FdE8308fEd7E15b0A37d2818a47e7a6a0206" as Address,
  // Crypto tokens
  WETH:      "0xAc037b017f9392D5C19E35A45985798F8aAb004c" as Address,
  MON:       "0x3Fa6711b444E1235cd4503655f3F0E7c75089D5E" as Address,
  SOL:       "0x17f8dAC69dc27C6ec37D47baaFf7E55d3a8327a0" as Address,
  BTC:       "0x2Ae6c1e1e62c0bC6F7a05b48D7582d837D59f188" as Address,
  // Degen tokens
  PEPE:      "0xbaEADBaFFA5415628B9b5e5Ca26c244Ec4457050" as Address,
  SHIB:      "0x398F639320addBAB62424013f814605139dDb475" as Address,
  DOGE:      "0xD5279549141C15C09e65d9A5A1cc571Be10770c1" as Address,
  // Stable pairs
  PAIR_WRITUAL_USDC: "0x9d90d5789495874eb29B2Ea368ed6a027Aedd14d" as Address,
  PAIR_WRITUAL_USDT: "0xF31bBAc073da1D401E3d0A014803CF71723031c5" as Address,
  PAIR_WRITUAL_DAI:  "0xde994445B3feF6Ed06c8fb673c723c8F7732E356" as Address,
  // Crypto pairs
  PAIR_WRITUAL_WETH: "0x925047592D27E417490279F40Dd7EcFE0B3F6cB6" as Address,
  PAIR_WRITUAL_MON:  "0x43F29692ba8F6C320576E2c2ea9fDEE0a67A3561" as Address,
  PAIR_WRITUAL_SOL:  "0x4f25057ebA6cF68C1200f24bf285A324efD82f1E" as Address,
  PAIR_WRITUAL_BTC:  "0x132BD619721dd5E49806FF8aFeC683591b9e1c1a" as Address,
  // Degen pairs
  PAIR_WRITUAL_PEPE: "0xF89BbCC50A117DC11975A10c5E6B478c3e1bFe3b" as Address,
  PAIR_WRITUAL_SHIB: "0xb4051c1d208192fc788EB37d9bF407016694e637" as Address,
  PAIR_WRITUAL_DOGE: "0x67801420564322f68699cf42674EaBFe1dAE5Aa6" as Address,
} as const;

// ── Native RITUAL token (pseudo-address for native) ──────────────────────────
export const RITUAL_NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

// ── Token list ───────────────────────────────────────────────────────────────
export type Token = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoColor: string;
  isNative?: boolean;
};

export const TOKENS: Token[] = [
  { address: RITUAL_NATIVE,  symbol: "RITUAL",  name: "Ritual",          decimals: 18, logoColor: "#D4A853", isNative: true },
  { address: CONTRACTS.WRITUAL, symbol: "WRITUAL", name: "Wrapped RITUAL", decimals: 18, logoColor: "#C8902A" },
  { address: CONTRACTS.USDC, symbol: "USDC",    name: "USD Coin",         decimals: 6,  logoColor: "#4ADE80" },
  { address: CONTRACTS.USDT, symbol: "USDT",    name: "Tether USD",       decimals: 6,  logoColor: "#26A17B" },
  { address: CONTRACTS.DAI,  symbol: "DAI",     name: "Dai Stablecoin",   decimals: 18, logoColor: "#F472B6" },
  { address: CONTRACTS.WETH, symbol: "ETH",     name: "Ethereum",         decimals: 18, logoColor: "#627EEA" },
  { address: CONTRACTS.MON,  symbol: "MON",     name: "Monad",            decimals: 18, logoColor: "#836EF9" },
  { address: CONTRACTS.SOL,  symbol: "SOL",     name: "Solana",           decimals: 9,  logoColor: "#9945FF" },
  { address: CONTRACTS.BTC,  symbol: "BTC",     name: "Bitcoin",          decimals: 8,  logoColor: "#F7931A" },
  { address: CONTRACTS.PEPE, symbol: "PEPE",    name: "Pepe",             decimals: 18, logoColor: "#4FB846" },
  { address: CONTRACTS.SHIB, symbol: "SHIB",    name: "Shiba Inu",        decimals: 18, logoColor: "#FF6B00" },
  { address: CONTRACTS.DOGE, symbol: "DOGE",    name: "Dogecoin",         decimals: 8,  logoColor: "#C2A633" },
];

// ── Pool/pair list ───────────────────────────────────────────────────────────
export type PoolInfo = {
  id: ModeId;
  pairAddress: Address;
  token0: Token;
  token1: Token;
  name: string;
  subtitle: string;
  description: string;
  color: string;
};

const WRITUAL_TOKEN = TOKENS[1];
const USDC_TOKEN    = TOKENS[2];
const WETH_TOKEN    = TOKENS[5];
const DAI_TOKEN     = TOKENS[4];

export const POOLS: Record<ModeId, PoolInfo> = {
  amina: {
    id: "amina",
    pairAddress: CONTRACTS.PAIR_WRITUAL_USDC,
    token0: WRITUAL_TOKEN,
    token1: USDC_TOKEN,
    name: "Amina",
    subtitle: "Stable Mode",
    description: "WRITUAL / stablecoins",
    color: "#4ADE80",
  },
  nefertiti: {
    id: "nefertiti",
    pairAddress: CONTRACTS.PAIR_WRITUAL_WETH,
    token0: WRITUAL_TOKEN,
    token1: WETH_TOKEN,
    name: "Nefertiti",
    subtitle: "Crypto Mode",
    description: "WRITUAL / crypto",
    color: "#FBBF24",
  },
  yaa: {
    id: "yaa",
    pairAddress: CONTRACTS.PAIR_WRITUAL_PEPE,
    token0: WRITUAL_TOKEN,
    token1: TOKENS[9], // PEPE placeholder — overridden by selectedToken in hook
    name: "Yaa Asantewa",
    subtitle: "Degen Mode",
    description: "WRITUAL / degen",
    color: "#F87171",
  },
};

export type ModeId = "amina" | "nefertiti" | "yaa";

// ── Per-mode selectable tokens ───────────────────────────────────────────────
// Amina: stablecoins
export const AMINA_TOKENS: Token[] = [
  TOKENS.find(t => t.symbol === "USDC")!,
  TOKENS.find(t => t.symbol === "USDT")!,
  TOKENS.find(t => t.symbol === "DAI")!,
];

// Nefertiti: crypto tokens
export const NEFERTITI_TOKENS: Token[] = [
  TOKENS.find(t => t.symbol === "ETH")!,
  TOKENS.find(t => t.symbol === "MON")!,
  TOKENS.find(t => t.symbol === "SOL")!,
  TOKENS.find(t => t.symbol === "BTC")!,
];

// Yaa Asantewa: degen tokens
export const YAA_TOKENS: Token[] = [
  TOKENS.find(t => t.symbol === "PEPE")!,
  TOKENS.find(t => t.symbol === "SHIB")!,
  TOKENS.find(t => t.symbol === "DOGE")!,
];

// ── Pair address lookup by token address ─────────────────────────────────────
export const TOKEN_PAIR: Partial<Record<Address, Address>> = {
  [CONTRACTS.USDC]: CONTRACTS.PAIR_WRITUAL_USDC,
  [CONTRACTS.USDT]: CONTRACTS.PAIR_WRITUAL_USDT,
  [CONTRACTS.DAI]:  CONTRACTS.PAIR_WRITUAL_DAI,
  [CONTRACTS.WETH]: CONTRACTS.PAIR_WRITUAL_WETH,
  [CONTRACTS.MON]:  CONTRACTS.PAIR_WRITUAL_MON,
  [CONTRACTS.SOL]:  CONTRACTS.PAIR_WRITUAL_SOL,
  [CONTRACTS.BTC]:  CONTRACTS.PAIR_WRITUAL_BTC,
  [CONTRACTS.PEPE]: CONTRACTS.PAIR_WRITUAL_PEPE,
  [CONTRACTS.SHIB]: CONTRACTS.PAIR_WRITUAL_SHIB,
  [CONTRACTS.DOGE]: CONTRACTS.PAIR_WRITUAL_DOGE,
};

// ── Is WRITUAL token0 in each pair? (from on-chain token0() call) ─────────────
// false = the other token is token0 (WRITUAL is token1)
export const WRITUAL_IS_TOKEN0: Partial<Record<Address, boolean>> = {
  [CONTRACTS.PAIR_WRITUAL_USDC]: true,   // WRITUAL < USDC by address sort
  [CONTRACTS.PAIR_WRITUAL_USDT]: false,  // USDT is token0
  [CONTRACTS.PAIR_WRITUAL_DAI]:  false,  // DAI is token0
  [CONTRACTS.PAIR_WRITUAL_WETH]: true,   // WRITUAL is token0
  [CONTRACTS.PAIR_WRITUAL_MON]:  false,  // MON is token0
  [CONTRACTS.PAIR_WRITUAL_SOL]:  false,  // SOL is token0
  [CONTRACTS.PAIR_WRITUAL_BTC]:  false,  // BTC is token0
  [CONTRACTS.PAIR_WRITUAL_PEPE]: true,   // WRITUAL is token0
  [CONTRACTS.PAIR_WRITUAL_SHIB]: false,  // SHIB is token0
  [CONTRACTS.PAIR_WRITUAL_DOGE]: true,   // WRITUAL is token0
};

// Ritual Chain block timestamp is in milliseconds
export function deadlineMs(secondsFromNow = 3600): bigint {
  return BigInt(Date.now() + secondsFromNow * 1000);
}

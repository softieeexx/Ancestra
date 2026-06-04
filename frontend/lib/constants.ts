import { Address } from "viem";

export const RITUAL_CHAIN_ID = 1979;

// ── Deployed contract addresses (Ritual Chain testnet) ───────────────────────
export const CONTRACTS = {
  WRITUAL:   "0x97bA2808dEe4B117145dEC51985ca2C70810E3bA" as Address,
  FACTORY:   "0xB7a842c56Fc6797B6b1BBd50A0f03357bf9A1fB9" as Address,
  ROUTER:    "0xe38fdE07E91cEBccF22BBB719dDdB434238DF721" as Address,
  // Tokens
  USDC:      "0x9Fa1dacB93cBC442DBD2B61450EfF6923Dd0A411" as Address,
  WETH:      "0xAc037b017f9392D5C19E35A45985798F8aAb004c" as Address,
  DAI:       "0x0309FdE8308fEd7E15b0A37d2818a47e7a6a0206" as Address,
  // Pairs
  PAIR_WRITUAL_USDC: "0x9d90d5789495874eb29B2Ea368ed6a027Aedd14d" as Address,
  PAIR_WRITUAL_WETH: "0x925047592D27E417490279F40Dd7EcFE0B3F6cB6" as Address,
  PAIR_WRITUAL_DAI:  "0xde994445B3feF6Ed06c8fb673c723c8F7732E356" as Address,
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
  {
    address: RITUAL_NATIVE,
    symbol: "RITUAL",
    name: "Ritual",
    decimals: 18,
    logoColor: "#D4A853",
    isNative: true,
  },
  {
    address: CONTRACTS.WRITUAL,
    symbol: "WRITUAL",
    name: "Wrapped RITUAL",
    decimals: 18,
    logoColor: "#C8902A",
  },
  {
    address: CONTRACTS.USDC,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoColor: "#4ADE80",
  },
  {
    address: CONTRACTS.WETH,
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoColor: "#FBBF24",
  },
  {
    address: CONTRACTS.DAI,
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logoColor: "#F87171",
  },
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
const WETH_TOKEN    = TOKENS[3];
const DAI_TOKEN     = TOKENS[4];

export const POOLS: Record<ModeId, PoolInfo> = {
  amina: {
    id: "amina",
    pairAddress: CONTRACTS.PAIR_WRITUAL_USDC,
    token0: WRITUAL_TOKEN,
    token1: USDC_TOKEN,
    name: "Amina",
    subtitle: "Stable Mode",
    description: "WRITUAL / USDC",
    color: "#4ADE80",
  },
  nefertiti: {
    id: "nefertiti",
    pairAddress: CONTRACTS.PAIR_WRITUAL_WETH,
    token0: WRITUAL_TOKEN,
    token1: WETH_TOKEN,
    name: "Nefertiti",
    subtitle: "Crypto Mode",
    description: "WRITUAL / WETH",
    color: "#FBBF24",
  },
  yaa: {
    id: "yaa",
    pairAddress: CONTRACTS.PAIR_WRITUAL_DAI,
    token0: WRITUAL_TOKEN,
    token1: DAI_TOKEN,
    name: "Yaa Asantewa",
    subtitle: "Alt Mode",
    description: "WRITUAL / DAI",
    color: "#F87171",
  },
};

export type ModeId = "amina" | "nefertiti" | "yaa";

// Ritual Chain block timestamp is in milliseconds
export function deadlineMs(secondsFromNow = 3600): bigint {
  return BigInt(Date.now() + secondsFromNow * 1000);
}

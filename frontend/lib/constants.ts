import { Address } from "viem";

export const RITUAL_CHAIN_ID = 1979;

export const RITUAL_TOKEN = {
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address, // native
  symbol: "RITUAL",
  decimals: 18,
  name: "Ritual Testnet",
};

export const POOLS = {
  amina: {
    id: "amina",
    name: "Amina",
    subtitle: "Stable Mode",
    description: "RITUAL / USDC",
    poolAddress: process.env.NEXT_PUBLIC_POOL_STABLE as Address,
    tokenOut: {
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin",
    },
    color: "#4ADE80",
    gradient: "from-emerald-500/20 to-emerald-900/20",
  },
  nefertiti: {
    id: "nefertiti",
    name: "Nefertiti",
    subtitle: "Crypto Mode",
    description: "RITUAL / WETH",
    poolAddress: process.env.NEXT_PUBLIC_POOL_CRYPTO as Address,
    tokenOut: {
      symbol: "WETH",
      decimals: 18,
      name: "Wrapped Ether",
    },
    color: "#FBBF24",
    gradient: "from-amber-500/20 to-amber-900/20",
  },
  yaa: {
    id: "yaa",
    name: "Yaa Asantewa",
    subtitle: "Alt Mode",
    description: "RITUAL / ALT",
    poolAddress: process.env.NEXT_PUBLIC_POOL_ALT as Address,
    tokenOut: {
      symbol: "ALT",
      decimals: 18,
      name: "Alt Token",
    },
    color: "#F87171",
    gradient: "from-red-500/20 to-red-900/20",
  },
} as const;

export type ModeId = keyof typeof POOLS;

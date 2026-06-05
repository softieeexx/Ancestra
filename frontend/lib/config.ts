import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Chain",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.ritualfoundation.org"] },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: "https://explorer.ritualfoundation.org",
    },
  },
});

// In production we proxy RPC through our own API route so MetaMask's
// circuit-breaker doesn't get triggered by shared RPC load.
const RITUAL_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://rpc.ritualfoundation.org";

export { RITUAL_RPC_URL };

export const config = createConfig(
  getDefaultConfig({
    chains: [ritualChain],
    transports: {
      [ritualChain.id]: http(RITUAL_RPC_URL),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "",
    appName: "Ancestra",
    appDescription: "RITUAL-centric ancestral AMM DEX",
    appUrl: "https://ancestra.ritual",
    appIcon: "/favicon.ico",
  })
);

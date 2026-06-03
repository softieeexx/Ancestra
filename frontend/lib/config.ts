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

export const config = createConfig(
  getDefaultConfig({
    chains: [ritualChain],
    transports: {
      [ritualChain.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "",
    appName: "Ancestra",
    appDescription: "RITUAL-centric ancestral AMM DEX",
    appUrl: "https://ancestra.ritual",
    appIcon: "/favicon.ico",
  })
);

"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount, useSwitchChain } from "wagmi";
import { RITUAL_CHAIN_ID } from "@/lib/constants";
import { useEffect } from "react";

export default function WalletConnect() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  // Auto-switch to Ritual Chain on connect
  useEffect(() => {
    if (isConnected && chainId && chainId !== RITUAL_CHAIN_ID) {
      switchChainAsync({ chainId: RITUAL_CHAIN_ID }).catch(() => {});
    }
  }, [isConnected, chainId, switchChainAsync]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, address, ensName }) => (
        <button
          onClick={show}
          className={`
            px-8 py-4 rounded-xl font-semibold text-lg
            transition-all duration-300
            ${isConnected
              ? "bg-earth-600/50 border border-ritual/30 text-ritual hover:bg-earth-500/50"
              : "bg-ritual text-earth-800 hover:bg-ritual-light animate-pulse-glow"
            }
          `}
        >
          {isConnected
            ? ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`
            : "Connect Wallet"
          }
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

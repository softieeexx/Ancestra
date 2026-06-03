"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { config } from "@/lib/config";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="dark"
          customTheme={{
            "--ck-font-family": '"Inter", system-ui, sans-serif',
            "--ck-border-radius": "12px",
            "--ck-overlay-backdrop-filter": "blur(4px)",
            "--ck-primary-color": "#D4A853",
            "--ck-primary-button-background": "#D4A853",
            "--ck-primary-button-text-color": "#0D0A03",
            "--ck-secondary-button-background": "#1A1507",
            "--ck-secondary-button-text-color": "#F5E6C8",
            "--ck-secondary-button-hover-background": "#3A2B0A",
            "--ck-tertiary-button-background": "#1A1507",
            "--ck-tertiary-button-text-color": "#F5E6C8",
            "--ck-body-background": "#0D0A03",
            "--ck-body-color": "#F5E6C8",
            "--ck-body-color-muted": "#A67C2E",
            "--ck-accent-color": "#D4A853",
            "--ck-accent-text-color": "#0D0A03",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

# ANCESTRA

**Ancient identity meets modern liquidity.**

A RITUAL-centric AMM DEX on Ritual Chain (testnet). Swap RITUAL for stablecoins, major crypto, and alt tokens through three legend-themed modes.

## Quick Start

### Prerequisites

- Node.js 18+
- Foundry (for contract deployment)
- Ritual testnet RITUAL tokens (get from [faucet](https://faucet.ritualfoundation.org))

### Contracts

```bash
cd contracts

# Install dependencies
forge install

# Compile
forge build

# Test
forge test

# Deploy to Ritual testnet
forge script script/Deploy.s.sol:DeployAncestra \
  --rpc-url ritual \
  --broadcast
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and fill in env vars
cp ../.env.example .env.local

# Start dev server
npm run dev
```

### Environment Variables

Copy `.env.example` to `frontend/.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_ID` | WalletConnect Project ID ([get one](https://cloud.walletconnect.com)) |
| `NEXT_PUBLIC_POOL_STABLE` | Deployed Amina (RITUAL/USDC) pool address |
| `NEXT_PUBLIC_POOL_CRYPTO` | Deployed Nefertiti (RITUAL/WETH) pool address |
| `NEXT_PUBLIC_POOL_ALT` | Deployed Yaa Asantewa (RITUAL/ALT) pool address |

## Architecture

### Three Swap Modes

| Mode | Legend | Pair | Type |
|------|--------|------|------|
| Amina | Amina | RITUAL / USDC | Stable |
| Nefertiti | Nefertiti | RITUAL / WETH | Crypto |
| Yaa Asantewa | Yaa Asantewa | RITUAL / ALT | Alt |

### Smart Contracts

- `AncestraPool.sol` — Constant product AMM (x * y = k), 0.3% fee
- `MockERC20.sol` — Testnet mock tokens

### Stack

- **Contracts:** Solidity + Foundry
- **Frontend:** Next.js 14 + wagmi v2 + ConnectKit
- **Chain:** Ritual Chain (Chain ID 1979)

## Design

African ancestral aesthetic with:
- Earth-toned dark theme
- Geometric patterns (diamonds, chevrons, triangles)
- Gold accent (RITUAL brand)
- Three legendary figures as mode selectors
- Smooth transitions and subtle animations

## Network

| Property | Value |
|----------|-------|
| Chain ID | 1979 |
| RPC | https://rpc.ritualfoundation.org |
| Explorer | https://explorer.ritualfoundation.org |
| Faucet | https://faucet.ritualfoundation.org |
| Currency | RITUAL (18 decimals) |

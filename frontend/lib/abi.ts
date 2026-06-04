// ── ERC20 ────────────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  { type: "function", name: "name", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ name: "", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "transfer", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "transferFrom", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
  { type: "event", name: "Transfer", inputs: [{ name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
  { type: "event", name: "Approval", inputs: [{ name: "owner", type: "address", indexed: true }, { name: "spender", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
] as const;

// ── WRITUAL ───────────────────────────────────────────────────────────────────
export const WRITUAL_ABI = [
  ...ERC20_ABI,
  { type: "function", name: "deposit", inputs: [], outputs: [], stateMutability: "payable" },
  { type: "function", name: "withdraw", inputs: [{ name: "wad", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "Deposit", inputs: [{ name: "dst", type: "address", indexed: true }, { name: "wad", type: "uint256", indexed: false }] },
  { type: "event", name: "Withdrawal", inputs: [{ name: "src", type: "address", indexed: true }, { name: "wad", type: "uint256", indexed: false }] },
] as const;

// ── Ancestra Factory ─────────────────────────────────────────────────────────
export const FACTORY_ABI = [
  { type: "function", name: "feeTo", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "feeToSetter", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "getPair", inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }], outputs: [{ name: "pair", type: "address" }], stateMutability: "view" },
  { type: "function", name: "allPairs", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "pair", type: "address" }], stateMutability: "view" },
  { type: "function", name: "allPairsLength", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "createPair", inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }], outputs: [{ name: "pair", type: "address" }], stateMutability: "nonpayable" },
  { type: "function", name: "setFeeTo", inputs: [{ name: "_feeTo", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setFeeToSetter", inputs: [{ name: "_feeToSetter", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "PairCreated", inputs: [{ name: "token0", type: "address", indexed: true }, { name: "token1", type: "address", indexed: true }, { name: "pair", type: "address", indexed: false }, { name: "totalPairs", type: "uint256", indexed: false }] },
] as const;

// ── Ancestra Pair (LP token + AMM) ────────────────────────────────────────────
export const PAIR_ABI = [
  ...ERC20_ABI,
  { type: "function", name: "MINIMUM_LIQUIDITY", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "pure" },
  { type: "function", name: "factory", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "token0", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "token1", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "getReserves", inputs: [], outputs: [{ name: "reserve0", type: "uint112" }, { name: "reserve1", type: "uint112" }, { name: "blockTimestampLast", type: "uint32" }], stateMutability: "view" },
  { type: "function", name: "price0CumulativeLast", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "price1CumulativeLast", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "kLast", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "mint", inputs: [{ name: "to", type: "address" }], outputs: [{ name: "liquidity", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "burn", inputs: [{ name: "to", type: "address" }], outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "swap", inputs: [{ name: "amount0Out", type: "uint256" }, { name: "amount1Out", type: "uint256" }, { name: "to", type: "address" }, { name: "data", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "sync", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "Mint", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "amount0", type: "uint256", indexed: false }, { name: "amount1", type: "uint256", indexed: false }] },
  { type: "event", name: "Burn", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "amount0", type: "uint256", indexed: false }, { name: "amount1", type: "uint256", indexed: false }, { name: "to", type: "address", indexed: true }] },
  { type: "event", name: "Swap", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "amount0In", type: "uint256", indexed: false }, { name: "amount1In", type: "uint256", indexed: false }, { name: "amount0Out", type: "uint256", indexed: false }, { name: "amount1Out", type: "uint256", indexed: false }, { name: "to", type: "address", indexed: true }] },
  { type: "event", name: "Sync", inputs: [{ name: "reserve0", type: "uint112", indexed: false }, { name: "reserve1", type: "uint112", indexed: false }] },
] as const;

// ── Ancestra Router ───────────────────────────────────────────────────────────
export const ROUTER_ABI = [
  { type: "function", name: "factory", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "WRITUAL", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },

  // Add liquidity
  { type: "function", name: "addLiquidity", inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "amountADesired", type: "uint256" }, { name: "amountBDesired", type: "uint256" }, { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }, { name: "liquidity", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "addLiquidityRITUAL", inputs: [{ name: "token", type: "address" }, { name: "amountTokenDesired", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountRITUALMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountRITUAL", type: "uint256" }, { name: "liquidity", type: "uint256" }], stateMutability: "payable" },

  // Remove liquidity
  { type: "function", name: "removeLiquidity", inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountAMin", type: "uint256" }, { name: "amountBMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "removeLiquidityRITUAL", inputs: [{ name: "token", type: "address" }, { name: "liquidity", type: "uint256" }, { name: "amountTokenMin", type: "uint256" }, { name: "amountRITUALMin", type: "uint256" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountRITUAL", type: "uint256" }], stateMutability: "nonpayable" },

  // Swaps: Token→Token
  { type: "function", name: "swapExactTokensForTokens", inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },
  { type: "function", name: "swapTokensForExactTokens", inputs: [{ name: "amountOut", type: "uint256" }, { name: "amountInMax", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },

  // Swaps: Native RITUAL→Token
  { type: "function", name: "swapExactRITUALForTokens", inputs: [{ name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "payable" },
  { type: "function", name: "swapRITUALForExactTokens", inputs: [{ name: "amountOut", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "payable" },

  // Swaps: Token→Native RITUAL
  { type: "function", name: "swapExactTokensForRITUAL", inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },
  { type: "function", name: "swapTokensForExactRITUAL", inputs: [{ name: "amountOut", type: "uint256" }, { name: "amountInMax", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },

  // View helpers
  { type: "function", name: "quote", inputs: [{ name: "amountA", type: "uint256" }, { name: "reserveA", type: "uint256" }, { name: "reserveB", type: "uint256" }], outputs: [{ name: "amountB", type: "uint256" }], stateMutability: "pure" },
  { type: "function", name: "getAmountOut", inputs: [{ name: "amountIn", type: "uint256" }, { name: "reserveIn", type: "uint256" }, { name: "reserveOut", type: "uint256" }], outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "pure" },
  { type: "function", name: "getAmountIn", inputs: [{ name: "amountOut", type: "uint256" }, { name: "reserveIn", type: "uint256" }, { name: "reserveOut", type: "uint256" }], outputs: [{ name: "amountIn", type: "uint256" }], stateMutability: "pure" },
  { type: "function", name: "getAmountsOut", inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "getAmountsIn", inputs: [{ name: "amountOut", type: "uint256" }, { name: "path", type: "address[]" }], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "view" },
] as const;

// ── Mock ERC20 (testnet only) — has open faucet ──────────────────────────────
export const MOCK_ERC20_ABI = [
  ...ERC20_ABI,
  { type: "function", name: "faucet", inputs: [{ name: "to", type: "address" }], outputs: [], stateMutability: "nonpayable" },
] as const;

// Legacy pool ABI kept for swap count event queries
export const ANCESTRA_POOL_ABI = [
  { type: "event", name: "Swapped", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "tokenIn", type: "address", indexed: true }, { name: "tokenOut", type: "address", indexed: true }, { name: "amountIn", type: "uint256", indexed: false }, { name: "amountOut", type: "uint256", indexed: false }, { name: "fee", type: "uint256", indexed: false }, { name: "timestamp", type: "uint256", indexed: false }], anonymous: false },
  { type: "event", name: "Swap", inputs: [{ name: "sender", type: "address", indexed: true }, { name: "amount0In", type: "uint256", indexed: false }, { name: "amount1In", type: "uint256", indexed: false }, { name: "amount0Out", type: "uint256", indexed: false }, { name: "amount1Out", type: "uint256", indexed: false }, { name: "to", type: "address", indexed: true }], anonymous: false },
] as const;

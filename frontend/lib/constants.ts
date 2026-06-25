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
  // Ritual system contracts and precompiles
  RITUAL_WALLET: "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as Address,
  ASYNC_DELIVERY: "0x5A16214fF555848411544b005f7Ac063742f39F6" as Address,
  TEE_SERVICE_REGISTRY: "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as Address,
  ASYNC_JOB_TRACKER: "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5" as Address,
  SOVEREIGN_AGENT: "0x000000000000000000000000000000000000080c" as Address,
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

// ── AncestraAgent Contract ABI & Bytecode ───────────────────────────────────
export const ANCESTRA_AGENT_BYTECODE = "0x608060405234801561000f575f80fd5b505f80546001600160a01b031916331790556109548061002e5f395ff3fe608060405234801561000f575f80fd5b5060043610610090575f3560e01c80638da5cb5b116100635780638da5cb5b146100eb57806397f7726114610115578063abcc11d81461011e578063f7a9c84914610133578063fe0217f61461013b575f80fd5b806313af40351461009457806351cc784f146100a95780638af14768146100c55780638ca12055146100d8575b5f80fd5b6100a76100a23660046105a1565b610156565b005b6100b260015481565b6040519081526020015b60405180910390f35b6100b26100d3366004610613565b610272565b6100a76100e6366004610652565b6103e2565b5f546100fd906001600160a01b031681565b6040516001600160a01b0390911681526020016100bc565b6100fd61080c81565b610126610508565b6040516100bc91906106dd565b610126610594565b6100fd735a16214ff555848411544b005f7ac063742f39f681565b5f546001600160a01b031633146101c35760405162461bcd60e51b815260206004820152602660248201527f416e6365737472614167656e743a2063616c6c6572206973206e6f74207468656044820152651037bbb732b960d11b60648201526084015b60405180910390fd5b6001600160a01b0381166102195760405162461bcd60e51b815260206004820152601b60248201527f416e6365737472614167656e743a207a65726f2061646472657373000000000060448201526064016101ba565b5f80546040516001600160a01b03808516939216917f8292fce18fa69edf4db7b94ea2e58241df0ae57f97e0a6c9b29067028bf92d7691a35f80546001600160a01b0319166001600160a01b0392909216919091179055565b5f805f61080c6001600160a01b031685856040516102919291906106ef565b5f604051808303815f865af19150503d805f81146102ca576040519150601f19603f3d011682016040523d82523d5f602084013e6102cf565b606091505b50915091508161032f5760405162461bcd60e51b815260206004820152602560248201527f416e6365737472614167656e743a20707265636f6d70696c652063616c6c652066604482015264185a5b195960da1b60648201526084016101ba565b6020815110156103925760405162461bcd60e51b815260206004820152602860248201527f416e6365737472614167656e743a20696e76616c696420707265636f6d70696c60448201526719481bdd5d1c1d5d60c21b60648201526084016101ba565b808060200190518101906103a691906106fe565b6001819055604051909350339084907f942ef7a985c840a3d7401c72196421b86d6ceaa0bd0a70d1200aab935f969df4905f90a3505092915050565b33735a16214ff555848411544b005f7ac063742f39f6146104595760405162461bcd60e51b815260206004820152602b60248201527f416e6365737472614167656e743a20756e617574686f72697a65642063616c6c60448201526a3130b1b59039b2b73232b960a91b60648201526084016101ba565b60015483146104aa5760405162461bcd60e51b815260206004820152601e60248201527f416e6365737472614167656e743a206a6f62204944206d69736d61746368000060448201526064016101ba565b60026104b78284836107af565b5060036104c58284836107af565b50827f08ef17b7305f0fe5cca95b1e868f8d3f1686ce2a4705191c7b177bd55dd679c0838360036040516104fb9392919061086b565b60405180910390a2505050565b6002805461051590610729565b80601f016020809104026020016040519081016040528092919081815260200182805461054190610729565b801561058c5780601f106105635761010080835404028352916020019161058c565b820191905f5260205f20905b81548152906001019060200180831161056f57829003601f168201915b505050505081565b6003805461051590610729565b5f602082840312156105b1575f80fd5b81356001600160a01b03811681146105c7575f80fd5b9392505050565b5f8083601f8401126105de575f80fd5b50813567ffffffffffffffff8111156105f5575f80fd5b60208301915083602082850101111561060c575f80fd5b9250929050565b5f808360208285031215610624575f80fd5b823567ffffffffffffffff81111561063a575f80fd5b610646858286016105ce565b90969095509350505050565b5f805f60408486031215610664575f80fd5b83359250602084013567ffffffffffffffff811115610681575f80fd5b61068d868287016105ce565b9497909650939450505050565b5f81518084525f5b818110156106be576020818501810151868301820152016106a2565b505f602082860101526020601f19601f83011685010191505092915050565b602081525f6105c7602083018461069a565b818382375f9101908152919050565b5f6020828403121561070e575f80fd5b5051919050565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061073d57607f821691505b60208210810361075b57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156107aa575f81815260208120601f850160051c810160208610156107875750805b601f850160051c820191505b818110156107a657828155600101610793565b5050505b505050565b67ffffffffffffffff8311156107c7576107c7610715565b6107db836107d58354610729565b83610761565b5f601f84116001811461080c575f85156107f55750838201355b5f19600387901b1c1916600186901b178355610864565b5f83815260209020601f19861690835b8281101561083c578685013582556020948501946001909201910161081c565b5086821015610858575f1960f88860031b161c19848701351681555b5060018560011b0183555b5050505050565b60408152826040820152828460608301375f606084830101525f601f19601f85011682016020606084830301818501525f85546108a781610729565b806060860152608060018084165f81146108c857600181146108e25761090d565b60ff1985168884015283151560051b88018301955061090d565b8a5f52865f205f5b858110156109055781548a82018601529083019088016108ea565b890184019650505b50939b9a505050505050505050505056fea26469706673582212209c9a07cf4f7e5ef6da150678f0e87ac32031a8c8c6b6117a12ac3c0cfa05886464736f6c63430008140033";

export const ANCESTRA_AGENT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "AgentCallInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnerUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "result",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "resultText",
        "type": "string"
      }
    ],
    "name": "SovereignAgentResultDelivered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "input",
        "type": "bytes"
      }
    ],
    "name": "callSovereignAgent",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastJobId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastResult",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastResultText",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "result",
        "type": "bytes"
      }
    ],
    "name": "onSovereignAgentResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "setOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

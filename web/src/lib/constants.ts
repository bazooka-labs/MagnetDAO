export const ALGOD_URLS = {
  testnet: "https://testnet-api.algonode.cloud",
  mainnet: "https://mainnet-api.algonode.cloud",
} as const;

export const INDEXER_URLS = {
  testnet: "https://testnet-idx.algonode.cloud",
  mainnet: "https://mainnet-idx.algonode.cloud",
} as const;

export const MAGNET_TOKEN = {
  name: "Magnet",
  ticker: "$U",
  asaId: 3081853135,
  totalSupply: 750_000,
  decimals: 0,
} as const;

export const QUARTER_SECONDS = 7_776_000; // 90 days

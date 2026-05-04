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

// Founder/treasury wallet — used for founder-only UI gating and application fee destination.
export const FOUNDER_ADDRESS = "VM2JLZMKFLE635FXX54MU4TY6JUDIMLNRXOQDZUX3FKUFLS2BPEO2VL7QM";

// Destination for liquidity application fee transactions.
export const APPLICATION_ADDRESS = FOUNDER_ADDRESS;

// Submission fee in microALGO (0 = applicant pays only the 0.001 ALGO network fee).
// Raise this constant if spam becomes an issue — no contract change required.
export const APPLICATION_FEE = 0;

export const APPLICATION_NOTE_PREFIX = "magnet-apply:v1:";

// Application cards are visible for this many months after submission.
export const APPLICATION_WINDOW_MONTHS = 6;

// Deployed voting.py app ID — set after testnet/mainnet deployment.
export const VOTING_APP_ID = 0;

// Vote window duration matching the voting.py contract constant.
export const VOTE_DURATION_SECONDS = 604_800; // 7 days

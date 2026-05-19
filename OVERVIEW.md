# MagnetDAO Overview

## What is MagnetDAO?

MagnetDAO is a founder-guided Algorand liquidity DAO built around a single core token, Magnet ($U). Magnet powers governance, liquidity growth, and fee generation — the same token used for DAO voting also serves as the base asset in all liquidity pools. The mission is to solve low liquidity on Algorand by deploying treasury capital and community participation to build deeper, more useful markets around Magnet and selected ecosystem projects.

---

## The Magnet Token

| Field | Value |
|---|---|
| Name | Magnet |
| Ticker | $U |
| ASA ID (mainnet) | 3081853135 |
| ASA ID (testnet) | 761651596 |
| Total Supply | 750,000 $U |
| Decimals | 5 (1 $U = 100,000 base units) |
| Network | Algorand |

Magnet serves as both the governance token and the liquidity anchor for the DAO. Holding Magnet gives members voting rights and direct exposure to fee-generating activity across all Magnet liquidity pools.

---

## Treasury

The treasury is funded by revenue from Bazooka Labs' applications, allocated quarterly. Treasury is held in USDC at the founder wallet and deployed into Algorand DEX liquidity pools on proposal approval.

**Founder/Treasury Wallet:** `VM2JLZMKFLE635FXX54MU4TY6JUDIMLNRXOQDZUX3FKUFLS2BPEO2VL7QM`

Treasury capital is deployed by acquiring the winning project's token and pairing it with Magnet in a DEX liquidity pool. DEX selection is flexible per deployment (TinyMan, etc.).

---

## On-Chain Systems

### 1. Liquidity Application Portal

Projects apply for treasury liquidity by submitting a signed Algorand payment transaction to the founder wallet. The application payload is JSON-encoded in the transaction note field with a known prefix.

- **Note prefix:** `magnet-apply:v1:`
- **Payload fields:** `name`, `asaTitle`, `asaId`, `description`, `contact`
- **Submission fee:** 0 microALGO above the standard network fee (adjustable)
- **Visibility window:** 6 months from submission date
- **Read method:** Algorand Indexer note-prefix query on the founder wallet's transaction history

Applications are wallet-signed, permanently on-chain, and cost only the ~0.001 ALGO network fee. This acts as a lightweight spam barrier requiring a real Algorand wallet.

### 2. Governance Voting Contract

Token-locking on-chain voting for governance decisions. The Founder creates ballot proposals; Magnet holders vote by locking tokens in an atomic transaction group.

**Deployed contract (mainnet, live as of 2026-05-15):**
- **App ID:** 3554779766
- **Contract address:** `OKJJKZER5Z2DQY4655PST3WHFQRB6UQARP4QGXBAYQFJJCZLY27KMR5YAM`
- **Founder:** `VM2JLZMKFLE635FXX54MU4TY6JUDIMLNRXOQDZUX3FKUFLS2BPEO2VL7QM` (accepted on-chain 2026-05-15)
- **Source:** `contracts/voting/voting.py`
- **Deploy script:** `contracts/deploy_voting.py` (requires `FUNDER_MNEMONIC` env var)

**Mechanics:**
- Founder calls `create_proposal` with question + 2–4 choices (project names as choice labels)
- Vote window: 7 days from creation
- Voters cast by sending an atomic group: AppCall (`cast_vote`) + AssetTransfer (whole $U tokens locked in contract)
- Only whole $U tokens accepted — fractional dust stays in voter's wallet
- One vote per wallet per proposal, enforced by BoxCreate existence check
- After the window closes, voters call `claim_tokens` to retrieve their locked $U
- Proposal boxes remain on-chain permanently as governance history

**Box layout:**
- Proposal box: `prop_{uint64_id}` — 304 bytes (start_time, end_time, 4 vote tallies, question, 4 choices)
- Vote box: `vote_{proposal_id}{voter_pubkey}` — 16 bytes (choice index, locked amount)

**Key constants:**
- Vote duration: 604,800 seconds (7 days)
- Decimal factor: 100,000 (1 display $U = 100,000 base units)

---

## Governance Cycle

1. **Application** — External projects submit on-chain applications via the Proposals page
2. **Discussion** — Community discusses in MagnetDAO Discord
3. **Vote** — Founder creates a governance ballot; Magnet holders vote by locking tokens
4. **Deployment** — Treasury deploys liquidity to the winning project's DEX pair

Voting weight: **1 $U = 1 vote**. Tokens are locked for the duration of the active vote window, returned in full after it closes.

The Founder retains final approval authority over all liquidity decisions. As the DAO matures, founder involvement in day-to-day decisions is expected to decrease.

---

## Web Application

**Live URL:** https://magnetdao.vercel.app  
**Stack:** Next.js 14.2.35 · TypeScript · Tailwind CSS · algosdk v3 · @txnlab/use-wallet-react v4.6.0

### Pages

| Route | Description |
|---|---|
| `/` | Hero with animated Magnet logo, live stats (TVL, holders, treasury USDC), CTA buttons |
| `/proposals` | Liquidity application submissions + active/past governance votes |
| `/treasury` | Live USDC stats, daily balance chart, governance vote history |
| `/governance` | Token info, supply/holders, price/swap link, quarterly cycle explainer, voting rules |

### Key Components

| File | Purpose |
|---|---|
| `LiveStats.tsx` | Server component — TVL (Vestige), holders (Indexer), treasury USDC (algod). Cached 1h. |
| `ApplyModal.tsx` | Wallet-signed payment tx with note-field JSON payload |
| `ApplicationCard.tsx` | Collapsible card for each liquidity application |
| `CreateProposalModal.tsx` | Founder-only — sends `create_proposal` AppCall; fetches `proposal_count` first to build correct `prop_` box name |
| `VotingProposalCard.tsx` | Per-proposal vote display, claim button post-expiry; `claim_tokens` uses flat fee 2000 (inner ASA transfer fee pooling) |
| `VoteModal.tsx` | Atomic group: cast_vote AppCall + whole-token AssetTransfer; declares both `prop_` and `vote_` boxes |
| `ClaimFounderButton.tsx` | Governance page — visible only to pending founder; calls `accept_founder` on-chain |
| `TreasuryChart.tsx` | SVG line chart — daily USDC balance history, no dependencies |

### Data Sources

| Data | Source | Cache |
|---|---|---|
| Magnet TVL | Vestige API (`api.vestigelabs.org`) | 1h |
| Holder count | Algorand Indexer (paginated balances) | 1h |
| Treasury USDC | Algorand algod (`mainnet-api.algonode.cloud`) | 1h |
| Liquidity applications | Indexer note-prefix query on founder wallet | live (client fetch) |
| Voting proposals | Indexer box reads on voting contract | live (client fetch) |
| Total USDC inflows | Indexer — sum all USDC receiver txns on founder wallet | 24h |
| Daily USDC history | Indexer — replay all USDC txns, bucket by day | 24h |
| $U price in USDC | Vestige × CoinGecko ALGO/USD | 5min |
| Proposal count | algod global state on voting contract | 1h |

### Constants (`web/src/lib/constants.ts`)

```ts
VOTING_APP_ID = 3554779766         // mainnet voting contract
VOTING_NETWORK = "mainnet"
MAGNET_TOKEN.asaId = 3081853135    // mainnet ASA
FOUNDER_ADDRESS = "VM2J..."        // treasury + admin gating
APPLICATION_NOTE_PREFIX = "magnet-apply:v1:"
APPLICATION_FEE = 0                // raise if spam becomes an issue
VOTE_DURATION_SECONDS = 604800     // must match voting.py VOTE_DURATION
```

### Wallet Network Config (`web/src/hooks/useWallet.tsx`)

Wallet provider is pinned to mainnet. Key config:
- `defaultNetwork: NetworkId.MAINNET`
- `options: { resetNetwork: true }` — ignores any cached testnet session in localStorage
- Both MAINNET and TESTNET algod entries kept in `networks` to prevent session-resume crashes

---

## Design

**Theme:** Electric purple neon glow (`#a855f7`) on near-black background (`#08000f`) with radial purple vignette. White as primary contrast element. Inspired by the Magnet token logo.

**Brand asset:** `web/public/magnet-logo.png` — white magnet silhouette on transparent background. CSS `drop-shadow` applies the neon purple glow effect.

---

## Repository Structure

```
MagnetDAO/
├── OVERVIEW.md             # This file
├── GOVERNANCE.md           # Governance rules and quarterly cycle detail
├── PROPOSAL.md             # Proposals page design spec
├── TOKENOMICS.md           # Token dual role, distribution, fee model
├── TREASURY.md             # Treasury funding and deployment mechanics
├── TODO.md                 # Pending work
├── README.md               # Quick-start and links
├── contracts/
│   ├── requirements.txt    # pyteal==0.27.0, py-algorand-sdk
│   ├── deploy.py           # Legacy deploy script (governance + treasury contracts only)
│   ├── deploy_voting.py    # Active deploy script for voting.py (requires FUNDER_MNEMONIC)
│   ├── build/              # Compiled TEAL (voting_approval.teal, voting_clear.teal)
│   ├── governance/
│   │   └── governance.py   # Legacy governance contract (not in active use)
│   ├── treasury/
│   │   └── treasury.py     # Legacy treasury contract (not in active use)
│   └── voting/
│       └── voting.py       # Active — deployed to mainnet App ID 3554779766
└── web/
    ├── public/
    │   └── magnet-logo.png
    ├── src/
    │   ├── app/
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── proposals/page.tsx
    │   │   ├── treasury/page.tsx
    │   │   └── governance/page.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── HeroCTA.tsx
    │   │   ├── LiveStats.tsx
    │   │   ├── TreasuryChart.tsx
    │   │   ├── ApplyModal.tsx
    │   │   ├── ApplicationCard.tsx
    │   │   ├── CreateProposalModal.tsx
    │   │   ├── VotingProposalCard.tsx
    │   │   ├── VoteModal.tsx
    │   │   └── ui.tsx
    │   │   ├── ClaimFounderButton.tsx
    │   ├── hooks/
    │   │   └── useWallet.tsx
    │   ├── lib/
    │   │   └── constants.ts
    │   └── types/
    │       └── dao.ts
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.js
```

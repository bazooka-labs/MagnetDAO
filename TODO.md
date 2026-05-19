# MagnetDAO — TODO

---

## Mainnet Launch

- [x] Deploy `voting.py` to mainnet, get production App ID (3554779766)
- [x] Update `VOTING_APP_ID` in `constants.ts` to mainnet App ID
- [x] Flip `VOTING_NETWORK` from `"testnet"` to `"mainnet"` in `constants.ts`
- [x] Call `optin_asa` on the mainnet voting contract (contract must hold mainnet Magnet ASA 3081853135)
- [ ] Verify end-to-end voting flow on mainnet with a real $U balance before announcing
  - [x] Proposal created (founder wallet, 2026-05-15)
  - [x] Vote cast (second wallet, 2026-05-15)
  - [ ] claim_tokens — window opens ~2026-05-22 (7-day lock)

---

## Proposals Page

- [ ] Test full liquidity application flow: submit → appears in card list → visible for 6 months
- [ ] Test full voting flow: create proposal → vote → wait expiry → claim tokens
  - [x] Box key encoding confirmed correct: `vote_` + proposal_id (8 bytes) + voter pubkey (32 bytes)
  - [x] Fee pooling confirmed: claim_tokens uses flat_fee=true, fee=2000 (covers inner ASA transfer)
- [ ] Add a "no wallet" state message on the vote modal (currently only checked inline)
- [ ] Consider adding a "Copy ASA ID" button on ApplicationCards for reviewer convenience

---

## Treasury Page

- [ ] Verify USDC inflow total once real treasury deposits begin
- [ ] Confirm daily chart renders correctly once USDC transaction history exists (currently shows placeholder)
- [ ] Add a "last updated" timestamp below the chart so viewers know when data refreshed
- [ ] Consider adding ALGO balance alongside USDC once treasury starts holding ALGO

---

## Governance Page

- [ ] Verify live $U price once Magnet has meaningful USDC pool liquidity on TinyMan
- [ ] Confirm holder count is accurate (Indexer pagination runs to completion)

---

## Smart Contracts

- [ ] Decide fate of legacy `governance.py` and `treasury.py` — archive or delete if voting.py fully replaces the voting mechanism
- [ ] Consider migrating `voting.py` from PyTeal 0.27 to PuyaPy (Algorand Python) for long-term maintainability
- [ ] Add a `cancel_proposal` function (founder-only, for emergency removal of a live proposal)
- [ ] Evaluate whether `create_proposal` should accept a future `start_time` rather than always starting immediately

---

## UI / UX

- [ ] Add toast notifications for transaction success and failure (currently errors show inline only)
- [ ] Mobile responsive audit — test all pages on small screens
- [ ] Add AlgoExplorer / Lora links for: voting contract, each governance vote result, liquidity application transactions
- [ ] Footer: wire up real Discord and GitHub links
- [ ] SEO: add per-page `<title>` and Open Graph metadata (`og:image`, `og:description`)
- [ ] Favicon: use the magnet logo PNG as favicon/apple-touch-icon
- [ ] Consider a "Share result" link on completed vote epoch cards on the treasury page

---

## Infrastructure

- [ ] Set up GitHub repo and push codebase (currently only deployed via Vercel CLI)
- [ ] Enable Vercel GitHub integration so `git push main` auto-deploys
- [ ] Add environment variable support for sensitive constants (e.g. future API keys)
- [ ] Review Vercel project `rootDirectory` setting — currently deploys from `/Users/kc/MagnetDAO` root; confirm `web/` subdirectory is correctly resolved

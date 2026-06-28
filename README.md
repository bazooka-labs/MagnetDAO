# Magnet Strategies

Magnet Strategies is an Algorand-native DeFi organization founded in June 2025 with a single long-term objective: to grow the value of the Magnet token ($U) at a rate that consistently outpaces ALGO. The organization pursues yield across multiple Algorand DeFi strategies — strategic liquidity pools, liquid staking, node participation rewards, and stablecoin lending — and reinvests returns into the token's underlying value.

**A Bazooka Labs Product.**

## Live

- **Landing page:** https://magnetstrategies.io
- **DAO app:** https://magnetstrategies.io/dao
- **MagnetFi app:** https://magnetstrategies.io/magnetfi

## Products

### MagnetDAO
Liquidity governance arm of Magnet Strategies. $U holders vote quarterly on which Algorand projects receive treasury-backed liquidity support. LP fees flow back to the treasury and compound into future cycles.

→ [`magnetdao/`](./magnetdao/OVERVIEW.md)

### MagnetFi
Lending and borrowing arm of Magnet Strategies. Single-token lending/borrowing via **CompX** markets is live; the **LP-collateral vault + mUSD stablecoin** protocol (v2) is built, internally audited (24 review passes + executable integration/adversarial tests), and **testnet-deployed** — mainnet launch incoming. The **mUSD** ASA is live on mainnet (`3615600399`). (v1 standard overcollateralized lending is code-complete and superseded by v2.)

→ [`magnetfi/`](./magnetfi/OVERVIEW.md)

## Token

| Field        | Value                         |
|--------------|-------------------------------|
| Name         | Magnet                        |
| Ticker       | $U                            |
| ASA ID       | 3081853135                    |
| Total Supply | 750,000 $U                    |
| Decimals     | 5 (1 $U = 100,000 base units) |
| Network      | Algorand mainnet              |
| Founded      | June 2025                     |

## Repository Structure

```
MagnetStrategies/
├── README.md
├── magnetdao/          ← MagnetDAO governance docs
├── magnetfi/           ← MagnetFi lending protocol
│   ├── v1/             ← Standard lending (code complete, superseded by v2)
│   └── v2/             ← LP vault + mUSD — docs, contracts, oracle bot, tests
│                          (built, audited, testnet-deployed)
├── contracts/
│   └── magnetdao/      ← Voting contract (live on mainnet)
└── web/                ← Next.js frontend (magnetstrategies.io)
```

## Built by Bazooka Labs

Magnet Strategies is developed and maintained by Bazooka Labs.  
Follow: [X / Twitter](https://x.com/Bazooka_Labs) · [Discord](https://discord.gg/naqFXmfM)

# Solana Meme Agent — Telegram Bot

A deliberately simple Telegram interface for the $15 Solana experiment.

## Philosophy

The bot should feel like a normal chat, not a trading terminal. Most actions use inline buttons and short messages.

### Core flow

`/start` → Scan / Portfolio / Help

`Scan` → 5 candidates → `Analyze` → `Buy $1` / `Buy $3` / `Skip`

Any buy action produces a transaction proposal. **The bot must never receive or store a seed phrase/private key.** Real signing is intentionally disabled until the wallet approval flow is implemented and tested.

## Commands

- `/start` — main menu
- `/scan` — scan for candidates
- `/portfolio` — show balance and positions
- `/help` — explain the bot

## Design rules

- Keep messages short.
- Prefer buttons over commands.
- Never expose raw transaction construction to the user.
- Always show token, amount, estimated price impact/slippage and destination before approval.
- No automatic trades.
- No arbitrary wallet transfers.
- All trade proposals expire after a short period.

## Planned implementation

1. Telegram webhook/polling adapter.
2. Reuse the existing market scanner and scoring engine.
3. Add persistent watchlist/portfolio state.
4. Add Jupiter quote generation and simulation.
5. Add wallet-based user approval/signing.
6. Add optional alerts.

Environment variables should contain only bot configuration and public RPC settings. Private keys/seed phrases are prohibited.

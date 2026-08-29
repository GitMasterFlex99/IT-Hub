# Solana Meme Agent — Telegram Bot

A deliberately simple Telegram interface for the $15 Solana experiment.

## What works

- `/start`, `/scan`, `/portfolio`, `/help`
- Inline buttons for the main actions
- `/scan` fetches public Solana pair data from DexScreener
- Basic liquidity filtering and a simple research score
- Market links for manual inspection
- Optional Telegram chat-ID allowlist

## Run locally

```bash
npm install
cp .env.example .env
# add TELEGRAM_BOT_TOKEN
npm run dev
```

Create the bot token with Telegram's BotFather. Never commit `.env` or a bot token.

## Security boundary

This bot has no wallet private key, seed phrase, or transaction signing capability. Trading is disabled. A future trade flow must prepare, simulate and present a transaction for explicit wallet approval; the bot must never take custody of funds.

## Design philosophy

The bot should feel like a normal chat, not a trading terminal. Keep messages short, prefer buttons, and avoid unnecessary commands. The intended flow is `/start` → Scan → candidates → Analyze → Buy $1 / Buy $3 / Skip.

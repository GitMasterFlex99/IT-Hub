# Solana Meme Agent

A deliberately small, safety-first Solana research dashboard for a $15 experiment.

## Current scope

- Connects to an injected Phantom wallet without requesting a seed phrase.
- Reads the wallet's SOL balance through Solana RPC.
- Searches Solana pairs through DexScreener's public API.
- Scores candidates using liquidity, 24h volume, buy/sell activity, pair age and FDV/liquidity.
- Opens the market page for manual inspection.

## Safety boundary

**Trading is disabled in this MVP.** The app cannot sign or broadcast a transaction. The wallet is used only to identify the public address and read its SOL balance.

The score is a research heuristic, not financial advice and not a prediction of future returns. Meme coins can lose most or all of their value quickly.

## Run locally

```bash
cd solana-agent
npm install
npm run dev
```

Build with `npm run build`.

## Next planned stage

1. Add token safety checks and stronger market-data validation.
2. Add Jupiter quote generation without broadcasting.
3. Add transaction simulation and a clear human-approval screen.
4. Only after those are tested, add optional wallet signing through the user's wallet.

Never put a seed phrase or private key in source code, `.env` files, browser storage, or chat.

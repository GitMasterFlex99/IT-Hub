# Telegram Interface

Telegram is the intended simple control surface for the Solana Meme Agent.

## Design goals

- Keep the interface to a handful of commands and buttons.
- No seed phrase or private key is ever entered into Telegram.
- Read-only market research works before trading is enabled.
- Real trades must use an external wallet signing flow and explicit confirmation.

## Proposed commands

- `/start` — show the four main actions
- `/scan` — show the best current candidates
- `/analyze` — inspect a token
- `/portfolio` — show wallet/position state
- `/help` — show available actions

The bot should prefer inline buttons over command-heavy workflows.

## Planned trade flow

1. User selects a candidate.
2. Bot shows a short risk summary and proposed position size.
3. User presses Buy.
4. Bot prepares a swap transaction but does not sign it.
5. A wallet approval flow presents the exact transaction to the user.
6. Only an explicit approval can broadcast the transaction.

Never implement a Telegram command that accepts a private key or seed phrase.

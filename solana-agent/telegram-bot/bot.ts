import type { InlineKeyboardButton } from "./types";

export const commands = {
  start: "Open the simple main menu",
  scan: "Find the strongest current candidates",
  portfolio: "Show balance and tracked positions",
  help: "Show a short explanation",
};

export const mainMenu: InlineKeyboardButton[][] = [
  [{ text: "🔎 Scan", callback_data: "scan" }],
  [{ text: "💰 Portfolio", callback_data: "portfolio" }],
  [{ text: "❓ Help", callback_data: "help" }],
];

export function analysisKeyboard(mint: string): InlineKeyboardButton[][] {
  return [
    [
      { text: "Analyze", callback_data: `analyze:${mint}` },
      { text: "Skip", callback_data: `skip:${mint}` },
    ],
    [
      { text: "Buy $1", callback_data: `buy:${mint}:1` },
      { text: "Buy $3", callback_data: `buy:${mint}:3` },
    ],
  ];
}

export function confirmationKeyboard(id: string): InlineKeyboardButton[][] {
  return [[
    { text: "✅ Approve", callback_data: `approve:${id}` },
    { text: "❌ Cancel", callback_data: `cancel:${id}` },
  ]];
}

import { Bot, InlineKeyboard } from "grammy";

type Pair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  baseToken?: { symbol?: string; name?: string; address?: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  priceChange?: { h1?: number; h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  pairCreatedAt?: number;
  txns?: { h24?: { buys?: number; sells?: number } };
};

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID;

if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const bot = new Bot(token);

function money(n?: number) {
  if (!Number.isFinite(n)) return "—";
  if (n! >= 1_000_000) return `$${(n! / 1_000_000).toFixed(1)}M`;
  if (n! >= 1_000) return `$${(n! / 1_000).toFixed(1)}K`;
  return `$${n!.toFixed(0)}`;
}

function age(pairCreatedAt?: number) {
  if (!pairCreatedAt) return "unknown";
  const hours = Math.max(0, (Date.now() - pairCreatedAt) / 3_600_000);
  if (hours < 24) return `${hours.toFixed(0)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function score(p: Pair) {
  const liq = p.liquidity?.usd ?? 0;
  const vol = p.volume?.h24 ?? 0;
  const buys = p.txns?.h24?.buys ?? 0;
  const sells = p.txns?.h24?.sells ?? 0;
  const change = p.priceChange?.h24 ?? 0;
  let s = 0;
  if (liq >= 100_000) s += 30; else if (liq >= 25_000) s += 22; else if (liq >= 10_000) s += 12;
  if (vol >= 500_000) s += 25; else if (vol >= 100_000) s += 18; else if (vol >= 25_000) s += 10;
  if (buys + sells > 0 && buys > sells) s += Math.min(20, Math.round((buys / (buys + sells)) * 20));
  if (change > 0 && change < 100) s += 10; else if (change >= 100) s += 4;
  if (liq > 0 && (p.fdv ?? 0) / liq < 100) s += 10;
  if (age(p.pairCreatedAt).endsWith("h") && Number.parseFloat(age(p.pairCreatedAt)) < 2) s -= 15;
  return Math.max(0, Math.min(100, s));
}

async function scan(): Promise<Pair[]> {
  const res = await fetch("https://api.dexscreener.com/latest/dex/search?q=SOL");
  if (!res.ok) throw new Error(`DexScreener HTTP ${res.status}`);
  const data = (await res.json()) as { pairs?: Pair[] };
  return (data.pairs ?? [])
    .filter(p => p.chainId === "solana" && (p.liquidity?.usd ?? 0) >= 10_000)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 5);
}

function guard(ctx: { chat?: { id: number } }) {
  return !allowedChatId || String(ctx.chat?.id) === allowedChatId;
}

const mainKeyboard = () => new InlineKeyboard()
  .text("🔎 Scan", "scan").text("💼 Portfolio", "portfolio").row()
  .text("ℹ️ How it works", "how");

bot.command("start", async ctx => {
  if (!guard(ctx)) return;
  await ctx.reply(
    "Solana Meme Agent\n\nSimple by design. I scan first; you stay in control.\n\nTrading is disabled for now.",
    { reply_markup: mainKeyboard() }
  );
});

bot.command("scan", async ctx => {
  if (!guard(ctx)) return;
  await sendScan(ctx);
});

bot.command("portfolio", async ctx => {
  if (!guard(ctx)) return;
  await ctx.reply("💼 Portfolio\n\nWallet trading is not connected yet. No funds are stored by this bot.", { reply_markup: mainKeyboard() });
});

bot.command("help", async ctx => {
  if (!guard(ctx)) return;
  await ctx.reply("Use the buttons or /scan.\n\nThe bot never asks for a seed phrase or private key. Real trades will require an explicit wallet approval.", { reply_markup: mainKeyboard() });
});

async function sendScan(ctx: any) {
  await ctx.reply("🔎 Scanning Solana markets...");
  try {
    const pairs = await scan();
    if (!pairs.length) return ctx.reply("No candidates passed the basic liquidity filter.");
    for (const [i, p] of pairs.entries()) {
      const symbol = p.baseToken?.symbol ?? "Unknown";
      const s = score(p);
      const buys = p.txns?.h24?.buys ?? 0;
      const sells = p.txns?.h24?.sells ?? 0;
      const text = [
        `${i + 1}. ${symbol} — ${s}/100`,
        `Liquidity: ${money(p.liquidity?.usd)}   Volume: ${money(p.volume?.h24)}`,
        `24h: ${p.priceChange?.h24?.toFixed(1) ?? "—"}%   Buys/Sells: ${buys}/${sells}`,
        `Age: ${age(p.pairCreatedAt)}   FDV: ${money(p.fdv)}`,
        p.url ? `Market: ${p.url}` : "",
        "⚠️ Research score only — not a buy signal."
      ].filter(Boolean).join("\n");
      await ctx.reply(text, { reply_markup: new InlineKeyboard().text("Analyze", `analyze:${p.baseToken?.address ?? ""}`) });
    }
  } catch (e) {
    console.error(e);
    await ctx.reply("Couldn't fetch market data right now. Try again in a moment.");
  }
}

bot.callbackQuery("scan", async ctx => { await ctx.answerCallbackQuery(); if (guard(ctx)) await sendScan(ctx); });
bot.callbackQuery("portfolio", async ctx => { await ctx.answerCallbackQuery(); if (guard(ctx)) await ctx.reply("💼 No wallet is connected yet. Trading is disabled.", { reply_markup: mainKeyboard() }); });
bot.callbackQuery("how", async ctx => { await ctx.answerCallbackQuery(); if (guard(ctx)) await ctx.reply("I scan public Solana market data and rank candidates using simple liquidity, volume, activity, age and valuation checks.\n\nNothing is bought automatically. When trading is added, every transaction will require explicit wallet approval.", { reply_markup: mainKeyboard() }); });
bot.callbackQuery(/^analyze:(.+)$/, async ctx => { await ctx.answerCallbackQuery(); if (guard(ctx)) await ctx.reply("Detailed token analysis is the next module. For now, use the market link in the scan result to inspect the pair.", { reply_markup: mainKeyboard() }); });

bot.catch(err => console.error("Telegram bot error", err));

await bot.api.setMyCommands([
  { command: "start", description: "Open the main menu" },
  { command: "scan", description: "Find Solana candidates" },
  { command: "portfolio", description: "View portfolio" },
  { command: "help", description: "Show help" }
]);

console.log("Solana Meme Agent Telegram bot running");
await bot.start();

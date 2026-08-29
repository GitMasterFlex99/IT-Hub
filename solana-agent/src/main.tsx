import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import './styles.css';

type Pair = { chainId:string; dexId:string; url?:string; pairAddress:string; baseToken:{address:string;name:string;symbol:string}; quoteToken:{address:string;symbol:string}; priceUsd?:string; fdv?:number; liquidity?:{usd?:number}; volume?:{h24?:number}; txns?:{h24?:{buys:number;sells:number}}; pairCreatedAt?:number };
type Score = Pair & { score:number; reasons:string[]; risk:string };

declare global { interface Window { solana?: { isPhantom?:boolean; connect:()=>Promise<{publicKey:PublicKey}>; disconnect?:()=>Promise<void>; signTransaction?:(tx:unknown)=>Promise<unknown> } } }

const RPC = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC, 'confirmed');
const searchTerms = ['bonk','dog','cat','pepe','meme','pump'];

function scorePair(p: Pair): Score {
  const liq = p.liquidity?.usd ?? 0; const vol = p.volume?.h24 ?? 0; const tx = p.txns?.h24;
  const ageHours = p.pairCreatedAt ? (Date.now()-p.pairCreatedAt)/3600000 : 9999;
  let score=0; const reasons:string[]=[];
  if(liq>=100000){score+=25;reasons.push('strong liquidity')} else if(liq>=25000){score+=18;reasons.push('usable liquidity')} else if(liq>=10000){score+=10;reasons.push('thin liquidity')}
  if(vol>=500000){score+=20;reasons.push('high 24h volume')} else if(vol>=100000){score+=14;reasons.push('healthy 24h volume')} else if(vol>=25000){score+=7;reasons.push('some trading activity')}
  if(tx){const total=tx.buys+tx.sells; if(total>=1000) score+=15; else if(total>=250) score+=10; if(tx.buys>tx.sells*1.2){score+=10;reasons.push('buy-side momentum')} else if(tx.sells>tx.buys*1.5){score-=8;reasons.push('heavy sell pressure')}}
  if(ageHours>=24 && ageHours<168){score+=15;reasons.push('has some trading history')} else if(ageHours>=1){score+=8;reasons.push('not brand new')}
  if((p.fdv??0)>0 && liq>0 && (p.fdv??0)/liq<30){score+=10;reasons.push('reasonable FDV/liquidity ratio')} else if((p.fdv??0)/Math.max(liq,1)>100){score-=12;reasons.push('high FDV relative to liquidity')}
  const risk = liq<10000?'HIGH':score<45?'HIGH':score<65?'MEDIUM':'LOWER';
  return {...p,score:Math.max(0,Math.min(100,Math.round(score))),reasons,risk};
}

async function fetchCandidates():Promise<Score[]> {
  const results = await Promise.all(searchTerms.map(t=>fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(t)}`).then(r=>r.ok?r.json():{pairs:[]}).catch(()=>({pairs:[]}))));
  const all = results.flatMap((x:any)=>x.pairs??[]).filter((p:Pair)=>p.chainId==='solana' && p.baseToken?.address);
  const seen=new Set<string>();
  return all.filter((p:Pair)=>{if(seen.has(p.baseToken.address))return false;seen.add(p.baseToken.address);return true;}).map(scorePair).sort((a,b)=>b.score-a.score).slice(0,20);
}

function App(){
  const [wallet,setWallet]=useState<string>(''); const [balance,setBalance]=useState<number|null>(null); const [candidates,setCandidates]=useState<Score[]>([]); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [lastScan,setLastScan]=useState<Date|null>(null);
  const connected = Boolean(wallet);
  async function connect(){setError(''); if(!window.solana?.isPhantom){setError('Phantom wallet was not detected. Install Phantom or use a Solana-compatible injected wallet.');return;} try{const r=await window.solana.connect(); const pk=r.publicKey.toBase58(); setWallet(pk); setBalance(await connection.getBalance(r.publicKey)/LAMPORTS_PER_SOL);}catch(e){setError(e instanceof Error?e.message:'Wallet connection failed.');}}
  async function refreshBalance(){if(!wallet)return;try{setBalance(await connection.getBalance(new PublicKey(wallet))/LAMPORTS_PER_SOL)}catch(e){setError(e instanceof Error?e.message:'Could not read wallet balance.')}}
  async function scan(){setLoading(true);setError('');try{setCandidates(await fetchCandidates());setLastScan(new Date())}catch(e){setError(e instanceof Error?e.message:'Scan failed.')}finally{setLoading(false)}}
  useEffect(()=>{scan()},[]);
  const top=useMemo(()=>candidates.filter(x=>x.risk!=='HIGH').slice(0,5),[candidates]);
  return <div className="shell">
    <header><div><span className="eyebrow">$15 EXPERIMENT</span><h1>Solana Meme Agent</h1><p>Research first. Human signs every trade.</p></div><div className="walletBox">{connected?<><span>{wallet.slice(0,4)}…{wallet.slice(-4)}</span><strong>{balance===null?'—':`${balance.toFixed(4)} SOL`}</strong><button onClick={refreshBalance}>Refresh</button></>:<button className="primary" onClick={connect}>Connect Phantom</button>}</div></header>
    <section className="notice"><strong>Trading is disabled.</strong> This build only reads public market data and your wallet balance. No seed phrase or private key is requested, and no transaction can be signed by the app.</section>
    <main>
      <div className="toolbar"><div><h2>Candidate scan</h2><span className="muted">{lastScan?`Last scan ${lastScan.toLocaleTimeString()}`:'Scanning…'}</span></div><button onClick={scan} disabled={loading}>{loading?'Scanning…':'Scan Solana'}</button></div>
      {error&&<div className="error">{error}</div>}
      <div className="grid">{top.map(p=><article className="card" key={p.baseToken.address}><div className="row"><div><h3>{p.baseToken.symbol}</h3><span>{p.baseToken.name}</span></div><div className={`risk ${p.risk.toLowerCase()}`}>{p.risk}</div></div><div className="score"><b>{p.score}</b><span>/100 research score</span></div><dl><div><dt>Liquidity</dt><dd>${(p.liquidity?.usd??0).toLocaleString(undefined,{maximumFractionDigits:0})}</dd></div><div><dt>24h volume</dt><dd>${(p.volume?.h24??0).toLocaleString(undefined,{maximumFractionDigits:0})}</dd></div><div><dt>FDV</dt><dd>${(p.fdv??0).toLocaleString(undefined,{maximumFractionDigits:0})}</dd></div></dl><ul>{p.reasons.slice(0,3).map(r=><li key={r}>{r}</li>)}</ul><a href={p.url} target="_blank" rel="noreferrer">View market ↗</a></article>)}</div>
      <section className="method"><h2>How the score works</h2><p>Liquidity, 24h volume, buy/sell activity, pair age and FDV-to-liquidity are scored. This is a research heuristic, not a prediction of price or safety.</p><div className="chips"><span>Liquidity 25%</span><span>Volume 20%</span><span>Flow 25%</span><span>History 15%</span><span>Valuation 10%</span></div></section>
    </main>
    <footer>Experimental software · Never paste a seed phrase into this app.</footer>
  </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

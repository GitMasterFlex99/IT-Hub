const state = { tickets: [], assets: [], query: '', priority: '' };
const $ = (s) => document.querySelector(s);

async function load() {
  const data = await fetch('/api/dashboard').then(r => r.json());
  state.tickets = data.tickets; state.assets = data.assets;
  renderMetrics(data.metrics); renderTickets(); renderAssets();
}

function renderMetrics(m) {
  $('#metrics').innerHTML = [
    ['Open tickets', m.open, 'Needs attention'],
    ['High priority', m.highPriority, 'Priority queue'],
    ['Resolved', m.resolvedToday, 'Recent completions'],
    ['Tracked assets', m.assets, 'Devices & equipment']
  ].map(([label, value, hint]) => `<article class="metric"><span>${label}</span><strong>${value}</strong><small>${hint}</small></article>`).join('');
}

function renderTickets() {
  const q = state.query.toLowerCase();
  const rows = state.tickets.filter(t => (!q || `${t.id} ${t.title} ${t.category} ${t.assignee}`.toLowerCase().includes(q)) && (!state.priority || t.priority === state.priority));
  $('#ticketRows').innerHTML = rows.map(t => `<tr><td><strong>${t.id}</strong><small>${t.category}</small></td><td>${t.title}</td><td><span class="priority ${t.priority.toLowerCase()}">${t.priority}</span></td><td><span class="status">${t.status}</span></td><td>${t.assignee}</td></tr>`).join('');
}

function renderAssets() {
  $('#assetList').innerHTML = state.assets.map(a => `<div class="asset"><div class="asset-icon">${a.type.slice(0,2).toUpperCase()}</div><div class="asset-info"><strong>${a.asset} · ${a.model}</strong><small>${a.user} · ${a.status}</small></div><span class="health ${a.health.toLowerCase()}">${a.health}</span></div>`).join('');
}

$('#search').addEventListener('input', e => { state.query = e.target.value; renderTickets(); });
$('#priority').addEventListener('change', e => { state.priority = e.target.value; renderTickets(); });
document.querySelectorAll('[data-scroll]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.scroll).scrollIntoView({ behavior: 'smooth' })));
load().catch(() => { $('#metrics').innerHTML = '<article class="metric"><span>Connection</span><strong>Offline</strong><small>Start the server to reconnect</small></article>'; });

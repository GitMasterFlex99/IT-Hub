const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

const tickets = [
  { id: 'INC-1042', title: 'VPN connection fails after password reset', priority: 'High', status: 'In Progress', assignee: 'Mika', category: 'Network', created: '2026-08-27T08:12:00Z', slaHours: 4 },
  { id: 'INC-1041', title: 'Laptop camera not detected in Teams', priority: 'Medium', status: 'New', assignee: 'Unassigned', category: 'Hardware', created: '2026-08-27T09:30:00Z', slaHours: 8 },
  { id: 'INC-1040', title: 'Request access to finance shared drive', priority: 'Low', status: 'Waiting', assignee: 'Alex', category: 'Access', created: '2026-08-26T13:05:00Z', slaHours: 24 },
  { id: 'INC-1039', title: 'Printer queue stuck on floor 2', priority: 'Medium', status: 'Resolved', assignee: 'Mika', category: 'Hardware', created: '2026-08-26T07:44:00Z', slaHours: 8 },
  { id: 'INC-1038', title: 'New starter account provisioning', priority: 'High', status: 'Resolved', assignee: 'Alex', category: 'Access', created: '2026-08-25T10:20:00Z', slaHours: 4 }
];

const assets = [
  { asset: 'LT-204', type: 'Laptop', model: 'Dell Latitude 5440', user: 'Sofia K.', status: 'Assigned', health: 'Healthy' },
  { asset: 'LT-205', type: 'Laptop', model: 'Lenovo ThinkPad T14', user: 'Joonas P.', status: 'Assigned', health: 'Healthy' },
  { asset: 'MN-118', type: 'Monitor', model: 'Dell P2422H', user: 'Unassigned', status: 'In Stock', health: 'Healthy' },
  { asset: 'PH-042', type: 'Phone', model: 'iPhone 15', user: 'Mika R.', status: 'Assigned', health: 'Healthy' },
  { asset: 'LT-199', type: 'Laptop', model: 'HP EliteBook 840', user: 'Unassigned', status: 'Repair', health: 'Attention' }
];

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const requested = new URL(req.url, `http://${req.headers.host}`).pathname;
  const safe = requested === '/' ? '/index.html' : requested;
  const file = path.normalize(path.join(publicDir, safe));
  if (!file.startsWith(publicDir)) return json(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (err, data) => {
    if (err) return json(res, 404, { error: 'Not found' });
    const ext = path.extname(file);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': `${types[ext] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    const open = tickets.filter(t => t.status !== 'Resolved');
    return json(res, 200, {
      metrics: { open: open.length, highPriority: open.filter(t => t.priority === 'High').length, resolvedToday: tickets.filter(t => t.status === 'Resolved').length, assets: assets.length },
      tickets,
      assets
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/tickets') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const filtered = tickets.filter(t => (!q || `${t.id} ${t.title} ${t.category} ${t.assignee}`.toLowerCase().includes(q)) && (!status || t.status === status) && (!priority || t.priority === priority));
    return json(res, 200, filtered);
  }
  if (req.method === 'GET' && url.pathname === '/api/assets') return json(res, 200, assets);
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`IT-Hub running on http://localhost:${PORT}`));

module.exports = { server, tickets, assets };

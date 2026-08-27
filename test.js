const test = require('node:test');
const assert = require('node:assert/strict');
const { tickets, assets } = require('./server');

test('seed data contains realistic ticket priorities', () => {
  assert.ok(tickets.length >= 5);
  assert.ok(tickets.some(t => t.priority === 'High'));
  assert.ok(tickets.every(t => ['New','In Progress','Waiting','Resolved'].includes(t.status)));
});

test('asset inventory contains tracked equipment', () => {
  assert.ok(assets.length >= 5);
  assert.ok(assets.every(a => a.asset && a.type && a.status));
});

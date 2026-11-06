// Run with: node workers/inbox/test.mjs
import assert from 'node:assert/strict';
import worker from './src/index.js';

const kv = () => { const m = new Map(); const meta = new Map(); return { m, put: async (k, v, o) => { m.set(k, v); meta.set(k, o?.metadata); }, get: async (k) => m.get(k)?.buffer, delete: async (k) => m.delete(k), list: async () => ({ keys: [...m.keys()].map((name) => ({ name, metadata: meta.get(name) })) }) }; };
const run = async (fn) => { const w = []; await fn({ waitUntil: (p) => w.push(p) }); await Promise.all(w); };
const message = (log, fail, to = 'Contact@bloxio.tech') => ({ to, raw: new Blob(['From: a@b.c\r\n\r\nhi']).stream(), forward: async (to) => { log.push(`forward:${to}`); if (fail) throw new Error('no'); } });
const env = (PENDING) => ({ API_URL: 'https://api.test/', ROUTES: JSON.stringify({ 'contact@bloxio.tech': 'me@gmail.test' }), INBOUND_SECRET: 's', PENDING });

// portal up: forwarded first, then copied with the secret
let log = []; let store = kv();
globalThis.fetch = async (url, o) => { log.push(`post:${url}:${o.headers['x-inbound-secret']}:${o.headers['x-mailbox']}`); return { ok: true, status: 204 }; };
await run((ctx) => worker.email(message(log), env(store), ctx));
assert.deepEqual(log, ['forward:me@gmail.test', 'post:https://api.test/public/inbound:s:contact@bloxio.tech']);
assert.equal(store.m.size, 0);

// portal down: still forwarded, copy waits, the scheduled run delivers it
log = [];
globalThis.fetch = async () => ({ ok: false, status: 503 });
await run((ctx) => worker.email(message(log), env(store), ctx));
assert.equal(log[0], 'forward:me@gmail.test');
assert.equal(store.m.size, 1);
await run((ctx) => worker.scheduled({}, env(store), ctx));
assert.equal(store.m.size, 1, 'kept while the portal is down');
globalThis.fetch = async () => ({ ok: true, status: 204 });
await run((ctx) => worker.scheduled({}, env(store), ctx));
assert.equal(store.m.size, 0);

// forwarding failure is not hidden, so the sender gets a bounce instead of silence
await assert.rejects(worker.email(message([], true), env(store), { waitUntil() {} }));

// an address with no route is refused, not sent to someone else
await assert.rejects(worker.email(message([], false, 'other@bloxio.tech'), env(store), { waitUntil() {} }));
console.log('worker tests passed');

/* Cloudflare Email Worker for the bloxio.tech mailboxes. Mail is forwarded to its
   Gmail inbox (ROUTES, a secret: {"mailbox": "gmail address"}) first, so it arrives whatever happens to the portal. A copy then goes to the
   portal's inbox; if the portal can't take it, the copy waits in KV and the
   scheduled run tries again. */
const MAX_COPY = 25_000_000; // Email Routing's own limit, so attachments come too
const KEEP_FOR = 7 * 24 * 60 * 60; // seconds

async function post(body, mailbox, env) {
  const res = await fetch(`${env.API_URL.replace(/\/$/, '')}/public/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'message/rfc822', 'x-inbound-secret': env.INBOUND_SECRET, 'x-mailbox': mailbox },
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`portal answered ${res.status}`);
}

async function copy(message, env) {
  const mailbox = message.to.toLowerCase();
  const raw = new Uint8Array(await new Response(message.raw).arrayBuffer()).slice(0, MAX_COPY);
  try {
    await post(raw, mailbox, env);
  } catch (e) {
    console.error('copy to portal failed, keeping for retry:', e.message);
    await env.PENDING.put(`mail:${Date.now()}:${crypto.randomUUID()}`, raw, { expirationTtl: KEEP_FOR, metadata: { mailbox } });
  }
}

async function retry(env) {
  const { keys } = await env.PENDING.list({ prefix: 'mail:', limit: 50 });
  for (const { name, metadata } of keys) {
    const raw = await env.PENDING.get(name, 'arrayBuffer');
    try {
      if (raw) await post(raw, metadata?.mailbox || '', env);
      await env.PENDING.delete(name);
    } catch (e) {
      console.error('retry failed, keeping for the next run:', e.message); // one large email mustn't hold up the rest
    }
  }
}

export default {
  async email(message, env, ctx) {
    const to = JSON.parse(env.ROUTES)[message.to.toLowerCase()];
    if (!to) throw new Error(`no route for ${message.to}`); // never guess where someone's mail should go
    await message.forward(to);
    ctx.waitUntil(copy(message, env).catch((e) => console.error('copy lost:', e.message)));
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(retry(env).catch((e) => console.error('retry stopped:', e.message)));
  },
};

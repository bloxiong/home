/* Cloudflare Email Worker for contact@bloxio.tech. Mail is forwarded to Gmail
   first, so it arrives whatever happens to the portal. A copy then goes to the
   portal's inbox; if the portal can't take it, the copy waits in KV and the
   scheduled run tries again. */
const MAX_COPY = 2_000_000; // enough for the text; attachments stay in Gmail
const KEEP_FOR = 7 * 24 * 60 * 60; // seconds

async function post(body, env) {
  const res = await fetch(`${env.API_URL.replace(/\/$/, '')}/public/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'message/rfc822', 'x-inbound-secret': env.INBOUND_SECRET },
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`portal answered ${res.status}`);
}

async function copy(message, env) {
  const raw = new Uint8Array(await new Response(message.raw).arrayBuffer()).slice(0, MAX_COPY);
  try {
    await post(raw, env);
  } catch (e) {
    console.error('copy to portal failed, keeping for retry:', e.message);
    await env.PENDING.put(`mail:${Date.now()}:${crypto.randomUUID()}`, raw, { expirationTtl: KEEP_FOR });
  }
}

async function retry(env) {
  const { keys } = await env.PENDING.list({ prefix: 'mail:', limit: 50 });
  for (const { name } of keys) {
    const raw = await env.PENDING.get(name, 'arrayBuffer');
    if (raw) await post(raw, env);
    await env.PENDING.delete(name);
  }
}

export default {
  async email(message, env, ctx) {
    await message.forward(env.FORWARD_TO);
    ctx.waitUntil(copy(message, env).catch((e) => console.error('copy lost:', e.message)));
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(retry(env).catch((e) => console.error('retry stopped:', e.message)));
  },
};

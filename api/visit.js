/* Vercel function: the site pings /api/visit on each page view. Vercel's edge
   knows the visitor's approximate location, so this adds it and forwards the
   view to the BLOXio API. Nothing is stored here, and the API keeps no IPs. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const api = process.env.CONTENT_API_URL;
  const secret = process.env.VISIT_SECRET;
  if (!api || !secret) return res.status(204).end();

  let body = {};
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch { /* ignore */ }
  const h = req.headers;
  const dec = (v) => { try { return decodeURIComponent(v || ''); } catch { return v || ''; } };

  try {
    await fetch(`${api.replace(/\/$/, '')}/public/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-visit-secret': secret },
      body: JSON.stringify({
        host: (h['x-forwarded-host'] || h.host || '').split(':')[0],
        path: String(body.path || '/').slice(0, 300),
        ref: String(body.ref || '').slice(0, 500),
        country: h['x-vercel-ip-country'] || '',
        region: dec(h['x-vercel-ip-country-region']),
        city: dec(h['x-vercel-ip-city']),
        ua: h['user-agent'] || '',
        ip: (h['x-forwarded-for'] || '').split(',')[0].trim(),
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch { /* analytics must never break the site */ }
  res.status(204).end();
}

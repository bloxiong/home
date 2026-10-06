/* Runs before every build. Pulls the published content from the API and
   saves it as src/content/overrides.json, which site.js applies on top of
   its built-in defaults. If CONTENT_API_URL isn't set or the API can't be
   reached, the last saved overrides are kept, so a build never breaks. */
import { writeFileSync } from 'node:fs';

const api = process.env.CONTENT_API_URL;
if (!api) { console.log('fetch-content: CONTENT_API_URL not set, using saved content'); process.exit(0); }
try {
  const r = await fetch(`${api.replace(/\/$/, '')}/public/content`, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  delete data._IMAGES;
  writeFileSync(new URL('../src/content/overrides.json', import.meta.url), JSON.stringify(data, null, 2) + '\n');
  console.log('fetch-content: applied', Object.keys(data).length, 'sections from', api);
} catch (e) {
  console.warn('fetch-content: could not reach the API, using saved content:', e.message);
}

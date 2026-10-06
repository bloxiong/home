/* The BLOXio API (server/, on Render). Local development talks to a local
   API; set VITE_API_URL to override. */
const local = typeof window !== 'undefined' && /(^|\.)localhost$/.test(window.location.hostname);
export const API_URL = import.meta.env.VITE_API_URL || (local ? 'http://localhost:8000' : 'https://api.bloxio.tech');

export async function postJSON(path, body, { timeout = 20000 } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).detail || msg; } catch { /* not JSON */ }
    throw new Error(typeof msg === 'string' ? msg : 'Please check the form and try again.');
  }
  return res.json();
}

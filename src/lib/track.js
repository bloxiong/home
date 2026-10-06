/* Counts a page view: no cookies, no personal data. Runs only on the live
   sites; the location is added server-side by /api/visit. */
const LIVE = /(^|\.)bloxio\.tech$/;

export function trackView(path) {
  if (typeof window === 'undefined' || !LIVE.test(window.location.hostname)) return;
  const body = JSON.stringify({ path, ref: document.referrer || '' });
  try {
    if (!navigator.sendBeacon?.('/api/visit', body)) {
      fetch('/api/visit', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch { /* never let analytics break a page */ }
}

/* Which site is this? The same build serves bloxio.tech and
   agrosense360.bloxio.tech; the host decides the routes. In development,
   open http://agrosense360.localhost:5173 to see the AgroSense360 site. */
export const MAIN_URL = 'https://bloxio.tech';
export const AGRO_URL = 'https://agrosense360.bloxio.tech';

const host = typeof window !== 'undefined' ? window.location.hostname : '';
export const isAgroHost = host.startsWith('agrosense360.');
/* only the live main site sends AgroSense360 visitors to the subdomain;
   localhost keeps the page in place so it can be worked on */
export const isMainLiveHost = host === 'bloxio.tech' || host === 'www.bloxio.tech';

/* Public URL of a path, wherever it now lives (used for canonical tags) */
export function publicUrl(path) {
  if (path === '/products/agrosense360') return `${AGRO_URL}/`;
  if (path === '/products/agrosense360/survey') return `${AGRO_URL}/survey`;
  return `${MAIN_URL}${path}`;
}

/* On bloxio.tech, start fetching the AgroSense360 page the moment a link to
   it is pointed at or touched, so the hop to the subdomain is near instant. */
if (isMainLiveHost && typeof document !== 'undefined') {
  let done = false;
  const warm = (e) => {
    if (done) return;
    const a = e.target.closest?.('a[href*="agrosense360"]');
    if (!a) return;
    done = true;
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = `${AGRO_URL}/`;
    document.head.appendChild(l);
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
}

/* ── moving between bloxio.tech and agrosense360.bloxio.tech ──────────
   A link to a page on the other site goes straight to its real address
   (never via a stale /products/agrosense360 page). The loading curtain
   drops over the current page first, then the browser leaves; the new
   page keeps the curtain up until it has fully loaded, then opens. */

/* Where a path lives: an absolute URL if it belongs to the other site, else null. */
export function otherSiteUrl(pathname, search = '', hash = '') {
  const tail = `${search}${hash}`;
  if (isAgroHost) {
    if (pathname === '/' || pathname === '/survey') return null;
    if (pathname === '/products/agrosense360') return null; // redirected to / in-app
    if (pathname === '/products/agrosense360/survey') return null;
    if (pathname === '/__home') return `${MAIN_URL}/`;
    return `${MAIN_URL}${pathname}${tail}`;
  }
  if (!isMainLiveHost) return null; // local development keeps everything in one app
  if (pathname === '/products/agrosense360') return `${AGRO_URL}/${tail}`;
  if (pathname === '/products/agrosense360/survey') return `${AGRO_URL}/survey${tail}`;
  return null;
}

let leaving = false;
export function leaveTo(url) {
  if (leaving) return;
  leaving = true;
  const old = document.getElementById('boot');
  if (old) old.remove();
  const boot = document.createElement('div');
  boot.id = 'boot';
  boot.className = 'boot-closing';
  boot.setAttribute('aria-hidden', 'true');
  boot.innerHTML = '<div class="boot-mark"><img class="boot-word" src="/bloxio-logo.png" alt="" width="400" height="75" />'
    + '<img class="boot-tag" src="/brand/tagline.png" alt="" width="785" height="70" /></div>';
  document.body.appendChild(boot);
  void boot.offsetHeight; // start from above the screen
  boot.classList.add('boot-closed');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => window.location.assign(url), reduce ? 250 : 620);
}

if (typeof document !== 'undefined' && (isAgroHost || isMainLiveHost)) {
  // links: catch them before the router does
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    let url;
    try { url = new URL(a.href, window.location.href); } catch { return; }
    let dest = null;
    if (url.origin === window.location.origin) dest = otherSiteUrl(url.pathname, url.search, url.hash);
    else if (/(^|\.)bloxio\.tech$/.test(url.hostname) && !/^(admin|api)\./.test(url.hostname)) dest = url.href;
    if (!dest) return;
    e.preventDefault();
    e.stopPropagation();
    leaveTo(dest);
  }, true);
  // coming back with the browser's Back button: drop a leftover curtain
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    const b = document.getElementById('boot');
    if (b && b.classList.contains('boot-closing')) b.remove();
  });
}

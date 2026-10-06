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

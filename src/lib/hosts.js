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

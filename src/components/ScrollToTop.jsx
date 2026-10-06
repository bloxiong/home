import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* New page → start at the top instantly (a smooth scroll here used to
   crawl back through the whole cinematic home page). A #hash lands on
   its section once it exists: pages are lazy-loaded, so keep looking
   for a few seconds while the chunk downloads. */
const HASH_TIMEOUT_MS = 4000;

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const id = hash ? decodeURIComponent(hash.slice(1)) : '';
    const target = id && document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      return;
    }
    // Never leave the visitor at the previous page's scroll position.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!id) return;

    const deadline = performance.now() + HASH_TIMEOUT_MS;
    let raf = 0;
    const find = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'start' });
      else if (performance.now() < deadline) raf = requestAnimationFrame(find);
    };
    raf = requestAnimationFrame(find);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

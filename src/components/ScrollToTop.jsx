import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* New page → start at the top instantly (a smooth scroll here used to
   crawl back through the whole cinematic home page). A #hash lands on
   its section once the page has rendered. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: 'start' });
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

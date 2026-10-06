import { IMG_FILE, LQIP } from '../content/photos';
import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Adds `is-in` to the element once it scrolls into view. */
export function useInView({ rootMargin = '0px 0px -8% 0px', once = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);
  return [ref, inView];
}

/* Card surface. `interactive` adds the hover lift for linked cards. */
export const card = (interactive = false) =>
  `rounded-2xl border border-line bg-surface ${
    interactive
      ? 'transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_24px_50px_-28px_color-mix(in_oklab,var(--bx-accent)_70%,transparent)]'
      : ''
  }`;

export const fmtDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* Site photos are self-hosted in public/img as <stem>-<width>.webp
   (640, 1024, 1600). Unknown ids fall back to Unsplash. */
const WIDTHS = [640, 1024, 1600];
export const photo = (id, w = 1600) => {
  const stem = IMG_FILE[id];
  if (!stem) return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
  const best = WIDTHS.find((x) => x >= w) ?? WIDTHS[WIDTHS.length - 1];
  return `/img/${stem}-${best}.webp`;
};
export const photoSrcSet = (id) =>
  IMG_FILE[id] ? WIDTHS.map((w) => `/img/${IMG_FILE[id]}-${w}.webp ${w}w`).join(', ') : undefined;
export const photoPreview = (id) => LQIP[id];

/* Form field style shared by the contact form and the survey */
export const inputCls = (err) =>
  `w-full rounded-[10px] border bg-canvas px-4 py-3 text-ink placeholder:text-muted/70 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${
    err ? 'border-red-500/70' : 'border-line'
  }`;

/* Writes scroll progress through an element into CSS variables, without
   re-rendering: --p goes 0 → 1 as the element travels from the bottom of
   the viewport to the top; --e goes 0 → 1 as its top edge travels from the
   bottom of the viewport to the middle (an "entry" progress). */
export function useScrollVars() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
      const e = Math.min(Math.max((vh - r.top) / (vh * 0.5), 0), 1);
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--e', e.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return ref;
}

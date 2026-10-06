import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { BrandText } from './ui';

/* Scroll-driven track: a green line fills down the rail as the list passes a
   reading line ~60% down the screen, and each step lights up when the line
   reaches its marker. Classes and a CSS variable are set directly on the DOM
   so scrolling never re-renders React. */
function useScrollTrack(ref) {
  useEffect(() => {
    const ol = ref.current;
    if (!ol) return undefined;
    const items = [...ol.querySelectorAll(':scope > li')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ol.style.setProperty('--fill', '1');
      items.forEach((li) => li.classList.add('is-on'));
      return undefined;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = ol.getBoundingClientRect();
      const line = window.innerHeight * 0.6;
      const first = items[0].getBoundingClientRect().top + 20;
      const last = items[items.length - 1].getBoundingClientRect().top + 20;
      const fill = Math.min(1, Math.max(0, (line - first) / Math.max(1, last - first)));
      ol.style.setProperty('--fill', fill.toFixed(4));
      ol.style.setProperty('--rail', `${Math.max(0, last - r.top - 20)}px`);
      items.forEach((li) => li.classList.toggle('is-on', li.getBoundingClientRect().top + 20 <= line));
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
  }, [ref]);
}

/* Honest progress track. Steps are `done`, `now` (in progress) or upcoming. */
export default function Timeline({ steps }) {
  const ref = useRef(null);
  useScrollTrack(ref);
  return (
    <ol ref={ref} className="track relative">
      {steps.map((s, i) => {
        const state = s.done ? 'done' : s.now ? 'now' : 'next';
        return (
          <li key={s.title} className="track-step relative grid grid-cols-[2.5rem_1fr] gap-5 pb-10 last:pb-0">
            <span
              className={`track-dot relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                state === 'done'
                  ? 'border-accent bg-accent text-on-accent'
                  : state === 'now'
                    ? 'border-accent bg-canvas text-accent'
                    : 'border-line bg-canvas text-muted'
              }`}
            >
              {state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}
              {state === 'now' && (
                <span className="absolute inset-0 rounded-full border border-accent motion-safe:animate-ping opacity-40" />
              )}
            </span>
            <div className="track-body pt-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={`text-lg font-bold tracking-tight ${state === 'next' ? 'text-muted' : 'text-ink'}`}>{s.title}</h3>
                {state === 'now' && (
                  <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">In progress</span>
                )}
                {state === 'next' && (
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">Next</span>
                )}
              </div>
              <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted md:text-base"><BrandText>{s.body}</BrandText></p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

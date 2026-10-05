import React from 'react';
import { Check } from 'lucide-react';

/* Honest progress track. Steps are `done`, `now` (in progress) or upcoming. */
export default function Timeline({ steps }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const state = s.done ? 'done' : s.now ? 'now' : 'next';
        const last = i === steps.length - 1;
        return (
          <li key={s.title} className="relative grid grid-cols-[2.5rem_1fr] gap-5 pb-10 last:pb-0">
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-[1.25rem] top-10 bottom-0 w-px -translate-x-1/2 ${
                  state === 'next' ? 'border-l border-dashed border-line' : 'bg-accent/50'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                state === 'done'
                  ? 'border-accent bg-accent text-canvas'
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
            <div className="pt-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={`text-lg font-bold tracking-tight ${state === 'next' ? 'text-muted' : 'text-ink'}`}>{s.title}</h3>
                {state === 'now' && (
                  <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">In progress</span>
                )}
                {state === 'next' && (
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">Next</span>
                )}
              </div>
              <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted md:text-base">{s.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

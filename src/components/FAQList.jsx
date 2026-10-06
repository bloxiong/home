import React from 'react';
import { Plus } from 'lucide-react';
import { BrandText, StarBullet } from './ui';

/* Native <details> so it works with keyboard, find-in-page and no JS.
   Each question is a card: a gold star that glints when open, the answer
   sliding open underneath (smoothly where the browser supports it). */
export default function FAQList({ items }) {
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <details key={item.q} className="faq-item group rounded-2xl border border-line bg-surface">
          <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-left md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
            <StarBullet i={i} className="faq-star h-4 w-4" />
            <span className="flex-1 font-semibold text-ink transition-colors group-hover:text-accent md:text-lg">
              <BrandText plain>{item.q}</BrandText>
            </span>
            <span className="faq-toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-accent transition-[rotate,background-color,border-color] duration-300 group-open:rotate-45">
              <Plus size={16} />
            </span>
          </summary>
          <p className="max-w-[68ch] px-5 pb-5 pl-[3.25rem] leading-relaxed text-muted md:px-6 md:pb-6 md:pl-[3.5rem]">
            <BrandText plain>{item.a}</BrandText>
          </p>
        </details>
      ))}
    </div>
  );
}

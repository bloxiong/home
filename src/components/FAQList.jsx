import React from 'react';
import { Plus } from 'lucide-react';
import { BrandText } from './ui';

/* Native <details> so it works with keyboard, find-in-page and no JS. */
export default function FAQList({ items }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-semibold text-ink transition-colors group-hover:text-accent md:text-lg"><BrandText>{item.q}</BrandText></span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-accent transition-transform duration-300 group-open:rotate-45">
              <Plus size={16} />
            </span>
          </summary>
          <p className="max-w-[68ch] pb-6 pr-12 leading-relaxed text-muted"><BrandText>{item.a}</BrandText></p>
        </details>
      ))}
    </div>
  );
}

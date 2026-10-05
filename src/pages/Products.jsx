import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta, PageHeader, Button, StatusBadge, RevealImage, Section, SectionHeading, CTABand } from '../components/ui';
import { PRODUCTS, AGROSENSE } from '../content/site';

export default function Products() {
  const [flagship, ...pipeline] = PRODUCTS;

  return (
    <>
      <PageMeta
        title="Products"
        description="AgroSense360 is in active development. Bloxio is also exploring smart electronics, agricultural drones, smart lighting, security and energy products."
      />

      <PageHeader
        title="What we are building"
        lead="One product in active development, and five product lines we are researching next. Every status on this page is where things really stand today."
      />

      {/* Flagship */}
      <Section>
        <Link to="/products/agrosense360" className="group grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14 items-center">
          <RevealImage src={flagship.img} className="aspect-[16/10]" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
          <div>
            <StatusBadge status={flagship.status} live />
            <h2
              className="mt-5 font-display font-black text-ink leading-[1.04] tracking-tight transition-colors group-hover:text-accent"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              {flagship.name}
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted">{flagship.category}</p>
            <p className="mt-5 text-lg leading-relaxed text-muted">{AGROSENSE.summary}</p>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-accent">
              How AgroSense360 works
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </Section>

      {/* Pipeline */}
      <Section tone="sunken">
        <SectionHeading
          title="In the pipeline"
          lead="Product lines we are researching. None of these are for sale yet. Our farmer survey asks which of them people want most, and the answers help decide what we build next."
        />
        <ul className="border-t border-line">
          {pipeline.map((p) => (
            <li
              key={p.slug}
              id={p.slug}
              className="scroll-mt-28 grid gap-6 border-b border-line py-8 sm:grid-cols-[12rem_1fr] md:grid-cols-[16rem_1fr_auto] md:items-center md:gap-10"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
                <img src={p.img.replace('w=1600', 'w=640')} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-ink md:text-2xl">{p.name}</h3>
                <p className="mt-1 text-sm text-muted">{p.category}</p>
                <p className="mt-3 max-w-[56ch] leading-relaxed text-muted">{p.blurb}</p>
              </div>
              <div className="md:justify-self-end">
                <StatusBadge status={p.status} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">Photos are illustrative.</p>
      </Section>

      <CTABand
        title="Want one of these to exist?"
        body="Tell us what you would use it for. Real demand from farmers and businesses helps us choose which product line to build next."
      >
        <Button to="/survey" arrow>Take the survey</Button>
        <Button to="/contact?topic=other" variant="ghost">Tell us your use case</Button>
      </CTABand>
    </>
  );
}

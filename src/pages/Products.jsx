import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageMeta, PageHeader, Button, StatusBadge, Section, SectionHeading, CTABand, Reveal, CountUp, TechLabel, Photo, BrandText,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import { PRODUCTS, AGROSENSE, IMG } from '../content/site';

export default function Products() {
  const [flagship, ...pipeline] = PRODUCTS;
  const headline = AGROSENSE.proof.slice(0, 3);

  return (
    <>
      <PageMeta
        title="Products"
        path="/products"
        description="AgroSense360 is a working prototype. BLOXio is also researching BLOXio Smart Systems, agricultural drones, security and energy products. Every status is labelled honestly."
      />

      <PageHeader
        image={IMG.pcb}
        label="Products"
        title="What we are building"
        lead="AgroSense360 is a working prototype. Four more product lines are concepts in research. None are for sale yet."
      />

      {/* Flagship */}
      <Section>
        <Reveal>
          <Link to={flagship.href} className={`${card(true)} group grid overflow-hidden lg:grid-cols-[1.1fr_1fr]`}>
            <Photo id={flagship.img} zoom fill className="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[320px]" sizes="(min-width: 1024px) 55vw, 100vw" caption="Illustrative photo" />
            <div className="flex flex-col p-7 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <TechLabel>Flagship · 01</TechLabel>
                <StatusBadge status={flagship.status} />
              </div>
              <h2 className="font-display mt-4 uppercase leading-none text-ink transition-colors group-hover:text-accent" style={{ fontSize: 'clamp(1.05rem, max(4vw, min(8.5vw, 2rem)), 3.2rem)' }}>
                {flagship.name}
              </h2>
              <p className="mt-2 text-label text-muted">{flagship.category}</p>
              <p className="mt-4 text-lg leading-relaxed text-muted">{flagship.blurb}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
                {headline.map((p) => (
                  <div key={p.label}>
                    <dt className="sr-only">{p.label}</dt>
                    <dd>
                      <CountUp value={p.value} decimals={p.decimals} suffix={p.suffix} className="font-display block text-2xl text-accent md:text-3xl" />
                      <span className="mt-1 block text-xs leading-snug text-muted">{p.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto pt-8">
                <span className="link-line">How AgroSense360 works</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </Section>

      {/* Pipeline */}
      <Section tone="sunken">
        <SectionHeading
          label="In research"
          title="The product line"
          lead="Concepts in research. Demand decides what we build next."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pipeline.map((p, i) => (
            <Reveal as="li" key={p.slug} i={i % 3} id={p.slug} className="scroll-mt-28">
              <Link to="/contact?topic=other" aria-label={`${p.name}: tell us your use case`} className={`${card(true)} group flex h-full flex-col overflow-hidden`}>
              <Photo id={p.img} zoom className="aspect-[16/10]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="text-label text-muted">{String(i + 2).padStart(2, '0')}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-ink"><BrandText>{p.name}</BrandText></h3>
              <p className="mt-1 text-label text-muted">{p.category}</p>
              <p className="mt-4 leading-relaxed text-muted">{p.blurb}</p>
              </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      <CTABand
        label="Tell us what to build"
        title="Want one of these to exist?"
        body="Tell us what you would use it for. Real demand decides what we build next."
      >
        <Button to="/products/agrosense360/survey" variant="text">Take the survey</Button>
        <Button to="/contact?topic=other" variant="text">Tell us your use case</Button>
      </CTABand>
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal, StatusBadge, Photo,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import { RESEARCH, IMG } from '../content/site';

const LEGEND = ['prototype', 'development', 'rnd', 'concept'];

export default function Research() {
  return (
    <>
      <PageMeta
        title="Research"
        path="/research"
        description="BLOXio's research areas: autonomous field robotics, crop-disease vision for local crops, soil sensing, low-power sensor networks and edge intelligence. Research, not products for sale."
      />

      <PageHeader
        image={IMG.network}
        label="Research & development"
        title="What we are exploring"
        lead="Where the next products come from. None are for sale; each shows its real stage."
      />

      <Section>
        <Reveal className="mb-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-6">
          <span className="text-label text-muted">Stages</span>
          {LEGEND.map((k) => <StatusBadge key={k} status={k} />)}
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {RESEARCH.map((r, i) => (
            <Reveal key={r.id} i={i % 2}>
              <article id={r.id} className={`${card(true)} group flex h-full scroll-mt-28 flex-col overflow-hidden`}>
                <Photo id={r.img} zoom className="aspect-[16/9]" sizes="(min-width: 768px) 50vw, 100vw" />
                <div className="flex flex-1 flex-col p-7 md:p-9">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-label text-muted">R-{String(i + 1).padStart(2, '0')}</span>
                  <StatusBadge status={r.status} />
                </div>
                <h2 className="mt-8 text-2xl font-bold tracking-tight text-ink">{r.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{r.body}</p>
                {r.links && (
                  <div className="mt-auto pt-6">
                    {r.links.map((l) => (
                      <Link key={l.to} to={l.to} className="group inline-flex items-center gap-2 text-sm font-semibold text-accent">
                        {l.label}
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHeading
          label="What the labels mean"
          title="Honest stages"
        />
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['prototype', 'A working version exists and has been tested outside a lab bench.'],
            ['development', 'Actively being built toward something deployable.'],
            ['rnd', 'Being investigated. Results may change the direction.'],
            ['concept', 'An idea we think is worth testing. Nothing built yet.'],
          ].map(([k, text], i) => (
            <Reveal key={k} i={i} className={`${card()} p-6`}>
              <dt><StatusBadge status={k} /></dt>
              <dd className="mt-4 text-sm leading-relaxed text-muted">{text}</dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      <CTABand
        label="Collaborate"
        title="Research with us."
        body="Universities, farms and companies on the same problems: let’s compare notes."
      >
        <Button to="/contact?topic=invest" variant="light" arrow>Propose a collaboration</Button>
      </CTABand>
    </>
  );
}

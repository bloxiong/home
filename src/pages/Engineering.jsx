import React from 'react';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal, Photo,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import { CAPABILITIES, DISCIPLINES, ENGAGEMENTS, PROCESS, IMG } from '../content/site';

export default function Engineering() {
  return (
    <>
      <PageMeta
        title="Engineering"
        path="/engineering"
        description="Embedded systems, software and cloud, AI and edge computing, and product engineering. How BLOXio engineers hardware and software as one system, and how to work with us."
      />

      <PageHeader
        image={IMG.soldering}
        label="Engineering"
        title="From the circuit board to the screen"
        lead="One team for electronics, firmware, cloud and models, engineered as one system."
      >
        <Button to="/contact?topic=project" variant="light" arrow>Start a project</Button>
        <Button href="#how-we-work" variant="ghost">How we work</Button>
      </PageHeader>



      {/* Capabilities */}
      <Section tone="sunken" id="capabilities">
        <SectionHeading label="Capabilities" title="What we work in" />
        <div className="grid gap-4">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.id} i={i % 2}>
              <article id={c.id} className={`${card()} scroll-mt-28 grid gap-8 overflow-hidden md:grid-cols-[0.9fr_1.4fr] md:gap-0`}>
                <div className="relative min-h-[180px]">
                  <Photo id={c.img} parallax className="absolute inset-0" imgClassName="brightness-[0.55]" sizes="(min-width: 768px) 40vw, 100vw" />
                  <div className="relative flex h-full flex-col justify-end p-7 text-white md:p-10">
                  <span className="text-label text-signal">{c.n}</span>
                  <h3 className="font-display mt-4 text-2xl uppercase leading-tight md:text-3xl">{c.title}</h3>
                  </div>
                </div>
                <div className="px-7 pb-7 md:p-10">
                  <p className="text-lg leading-relaxed text-muted">{c.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {c.stack.map((s) => (
                      <li key={s} className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-xs text-ink">{s}</li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                    <span className="text-label mr-2 text-accent">In practice</span>
                    {c.proof}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Disciplines anchors from the home page */}
      <Section>
        <SectionHeading
          label="Disciplines"
          title="How the work is organised"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.id} i={i}>
              <div id={d.id} className={`${card()} scroll-mt-28 h-full p-7`}>
                <span className="text-label text-accent">{d.n}</span>
                <h3 className="mt-4 text-xl font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-muted">{d.lead}</p>
                <ul className="mt-6 space-y-2 border-t border-line pt-5">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-center gap-3 text-sm text-ink">
                      <span className="h-1 w-1 bg-accent" aria-hidden="true" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Process */}
      <section id="how-we-work" className="on-forest relative scroll-mt-16 overflow-hidden bg-forest text-on-forest">
        <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
          <Reveal>
            <p className="label-rule text-label text-forest-muted">How we work</p>
            <h2 className="font-display mt-5 max-w-3xl uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)' }}>
              The riskiest part gets tested first
            </h2>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-forest-muted">
              Every project follows the same path, scaled to its size. A consulting engagement might stop after design; a
              product goes all the way.
            </p>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden border border-forest-line bg-forest-line sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((p, i) => (
              <Reveal as="li" key={p.title} i={i} className="bg-forest p-6 transition-colors duration-300 hover:bg-forest-2">
                <span className="font-display text-3xl text-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-muted">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Engagements */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <SectionHeading
              className="mb-8!"
              label="Work with us"
              title="Ways to engage"
              lead="From a feasibility study to devices running in the field."
            />
            <Button to="/contact?topic=project" arrow>Start a project</Button>
          </div>
          <ul className="border-t border-line">
            {ENGAGEMENTS.map((e, i) => (
              <Reveal as="li" key={e.id} i={i} id={e.id} className="scroll-mt-28 grid gap-2 border-b border-line py-6 md:grid-cols-[14rem_1fr] md:gap-8">
                <h3 className="font-bold text-ink">{e.title}</h3>
                <p className="leading-relaxed text-muted">{e.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <CTABand
        label="Start here"
        title="Tell us what you are trying to build."
        body="A short description is enough. We reply with questions and next steps."
      >
        <Button to="/contact?topic=project" variant="light" arrow>Start a project</Button>
        <Button href="mailto:contact@bloxio.tech" variant="ghost">contact@bloxio.tech</Button>
      </CTABand>
    </>
  );
}

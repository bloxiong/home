import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal, Photo, StarBullet, StarTag,
} from '../components/ui';
import { card, useReadingLine } from '../lib/ui-utils';
import { CAPABILITIES, DISCIPLINES, ENGAGEMENTS, PROCESS, IMG } from '../content/site';

export default function Engineering() {
  const pathRef = useReadingLine();
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
        lead="Electronics, firmware, cloud and machine learning from one team, so nothing falls between vendors."
      >
        <Button to="/contact?topic=project" variant="text">Start a project</Button>
        <Button href="#how-we-work" variant="text">How we work</Button>
      </PageHeader>



      {/* Capabilities */}
      <Section tone="sunken" id="capabilities">
        <SectionHeading label="Capabilities" title="What we work in" lead="Four capability areas, each proven on a system we built ourselves." />
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
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {c.stack.map((s, i) => (
                      <StarTag key={s} i={i} className="bg-canvas font-mono">{s}</StarTag>
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
          lead="Product engineering, software and intelligence, and research and development."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {DISCIPLINES.map((d, i) => (
            <Reveal key={d.id} i={i}>
              <div id={d.id} className={`${card()} scroll-mt-28 h-full p-7`}>
                <span className="text-label text-accent">{d.n}</span>
                <h3 className="mt-4 text-xl font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-muted">{d.lead}</p>
                <ul className="mt-6 space-y-2 border-t border-line pt-4">
                  {d.items.map((it, k) => (
                    <li key={it} className="flex items-center gap-3 text-sm text-ink">
                      <StarBullet i={k} className="h-3 w-3" />
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
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <Reveal>
            <p className="script-label text-forest-muted">How we work</p>
            <h2 className="font-display mt-4 max-w-3xl uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.05rem, max(3.6vw, min(8.5vw, 1.75rem)), 2.9rem)' }}>
              The riskiest part gets tested first
            </h2>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-forest-muted">
              Every project follows the same path, scaled to its size. A consulting engagement might stop after design; a
              product goes all the way.
            </p>
          </Reveal>
          {/* the path: a rail of gold stars; a green line runs along it with
              scroll and each step lights up as the line reaches it */}
          <ol ref={pathRef} className="howpath relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
            {PROCESS.map((p, i) => (
              <li key={p.title} className="howpath-step relative pl-11 lg:pl-0 lg:pt-14" style={{ '--k': (i / (PROCESS.length - 1)).toFixed(3) }}>
                <span className="howpath-node" aria-hidden="true">
                  <img src="/brand/star.png" alt="" width="160" height="159" draggable="false" />
                </span>
                <h3 className="font-display text-xl uppercase leading-none tracking-wide">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Engagements: a journey from idea to field, each step a card that
          opens the contact form */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              className="mb-6!"
              label="Work with us"
              title="Ways to engage"
              lead="From a feasibility study to devices running in the field. Start at any step."
            />
            <Button to="/contact?topic=project" variant="text">Start a project</Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ENGAGEMENTS.map((e, i) => (
              <Reveal as="li" key={e.id} i={i} id={e.id} className={`scroll-mt-28 ${i === 0 ? 'sm:col-span-2' : ''}`}>
                <Link
                  to="/contact?topic=project"
                  className={`${card(true)} engage-card group relative flex h-full flex-col overflow-hidden p-6 md:p-7`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="script-label">{e.phase}</span>
                    <StarBullet i={i} className="h-4 w-4" />
                  </span>
                  <h3 className={`mt-6 font-bold tracking-tight text-ink ${i === 0 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{e.title}</h3>
                  <p className={`mt-2 leading-relaxed text-muted ${i === 0 ? 'max-w-[52ch] md:text-lg' : ''}`}>{e.body}</p>
                </Link>
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
        <Button to="/contact?topic=project" variant="text">Start a project</Button>
        <Button href="mailto:contact@bloxio.tech" variant="text">contact@bloxio.tech</Button>
      </CTABand>
    </>
  );
}

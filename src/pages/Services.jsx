import React from 'react';
import { PageMeta, PageHeader, Button, RevealImage, Section, SectionHeading, CTABand } from '../components/ui';
import { SERVICES, INDUSTRIES, PROCESS, IMG } from '../content/site';

const WHY = [
  { title: 'Engineers do the work', body: 'You talk to the people designing your circuits and writing your firmware, not to an account manager.' },
  { title: 'Hardware and software together', body: 'Electronics, firmware, apps and AI are designed as one system, so nothing falls between two vendors.' },
  { title: 'Built for local conditions', body: 'We design for heat, dust, unstable power and patchy networks from the start, not as an afterthought.' },
  { title: 'We ship our own products too', body: 'Building AgroSense360 means we go through the same path we take clients on, from prototype to field.' },
];

export default function Services() {
  return (
    <>
      <PageMeta
        title="Services"
        description="R&D, product design and manufacturing, IoT and smart device systems, technical consulting and support from Bloxio's engineers in Lagos."
      />

      <PageHeader
        title="Engineering, from first idea to working system"
        lead="We take on projects across AI, IoT and electronics: research, prototypes, connected systems and the support that keeps them running."
      >
        <Button to="/contact?topic=project" arrow>Start a project</Button>
        <Button href="#how-we-work" variant="secondary">How we work</Button>
      </PageHeader>

      <Section>
        <div className="space-y-0 border-t border-line">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="scroll-mt-28 grid gap-6 border-b border-line py-10 md:grid-cols-[1fr_1.4fr] md:gap-14 md:py-14"
            >
              <div>
                <h2 className="font-ui text-2xl font-bold tracking-tight leading-tight text-ink md:text-3xl">{s.title}</h2>
                <p className="mt-3 font-semibold text-accent">{s.short}</p>
              </div>
              <div>
                <p className="leading-relaxed text-muted md:text-lg">{s.body}</p>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Typical deliverables</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink">{d}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sunken" id="how-we-work">
        <SectionHeading
          title="How we work"
          lead="Every project follows the same path, scaled to its size. A consulting engagement might stop after design; a product goes all the way."
        />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-5">
          {PROCESS.map((p, i) => (
            <li key={p.title} className="bg-sunken p-6">
              <span className="font-display text-sm font-bold text-accent tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-start">
          <div>
            <SectionHeading className="mb-8!" title="Why work with us" />
            <div className="border-t border-line">
              {WHY.map((w) => (
                <div key={w.title} className="border-b border-line py-5">
                  <h3 className="font-semibold text-ink">{w.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <RevealImage src={IMG.soldering} className="aspect-[4/3]" />
            <h2 className="font-ui mt-12 text-xl font-bold tracking-tight text-ink">Industries we work in</h2>
            <ul className="mt-4 border-t border-line">
              {INDUSTRIES.map((ind) => (
                <li key={ind.name} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <span className="font-semibold text-ink">{ind.name}</span>
                  <span className="text-right text-sm text-muted">{ind.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CTABand
        title="Tell us what you are trying to build"
        body="A short description is enough to start. We will reply with questions, a suggested approach and next steps."
      >
        <Button to="/contact?topic=project" arrow>Start a project</Button>
        <Button href="mailto:contact@bloxio.tech" variant="ghost">contact@bloxio.tech</Button>
      </CTABand>
    </>
  );
}

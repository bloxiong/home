import React from 'react';
import { GraduationCap, BadgeCheck } from 'lucide-react';
import { PageMeta, PageHeader, Button, RevealImage, Section, SectionHeading, CTABand } from '../components/ui';
import Timeline from '../components/Timeline';
import { FOUNDERS, MILESTONES, COMPANY, IMG } from '../content/site';

const STATEMENTS = [
  {
    label: 'Our aim',
    text: 'To research, invent, develop, produce and deliver technology products and services that improve lives and solve real-world problems.',
  },
  {
    label: 'Our mission',
    text: 'To become a leading force in technology innovation, with solutions that meet today’s challenges and anticipate tomorrow’s needs, built to the highest standards of quality.',
  },
  {
    label: 'Our vision',
    text: 'To be recognised globally as a pioneering technology company that sets new standards in quality, sustainability and technological advancement.',
  },
];

const PRINCIPLES = [
  { title: 'Start from the real problem', body: 'We go to the farm, the site or the factory floor first. A product that ignores its conditions fails there.' },
  { title: 'Say exactly where things stand', body: 'Prototype means prototype. We tell customers, partners and investors the honest status, every time.' },
  { title: 'Engineer it properly', body: 'World-class standards in design, testing and documentation, whether the product is ours or a client’s.' },
  { title: 'Nigeria first, built for the world', body: 'We design for local conditions and build to standards that travel beyond borders.' },
];

export default function About() {
  return (
    <>
      <PageMeta
        title="About"
        description="Bloxio Nigeria Limited is an engineer-founded technology company in Lagos, building hardware and software products across AI, IoT and electronics."
      />

      <PageHeader
        title="An engineering company, built in Lagos"
        lead="Bloxio Nigeria Limited designs and builds hardware and software products that solve real problems, engineered in Nigeria to world-class standards."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20 items-center">
          <div className="prose-bx text-lg leading-relaxed text-muted">
            <p>
              Bloxio is a next-generation technology company founded by two electrical and electronics engineers.
              We work across the full stack of a physical product: circuits and sensors, firmware, software and the AI
              that turns data into decisions.
            </p>
            <p>
              We are building our own products, starting with <strong className="font-semibold text-ink">AgroSense360</strong>,
              a smart farming system for Nigerian farmers. Alongside it, we take on engineering work for companies that need
              devices, connected systems or technical advice.
            </p>
            <p>
              We combine deep engineering skill with the speed of a startup: we move fast, test early in real conditions, and
              ship products that hold up in them.
            </p>
          </div>
          <RevealImage src={IMG.drafting} className="aspect-[4/5]" />
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {STATEMENTS.map((s) => (
            <div key={s.label} className="bg-sunken p-8 md:p-10">
              <h2 className="font-ui text-lg font-bold tracking-tight text-accent">{s.label}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="founders">
        <SectionHeading
          title="The founders"
          lead="Bloxio is run by its co-founders, who lead engineering and the business directly."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {FOUNDERS.map((f) => (
            <article key={f.name} className="rounded-2xl border border-line bg-surface p-8 md:p-10">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark font-display text-2xl font-black text-black">
                  {f.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-ink md:text-2xl">{f.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                </div>
              </div>
              <dl className="mt-8 space-y-5 border-t border-line pt-6">
                <div className="flex gap-4">
                  <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-sm text-muted">Education</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{f.education}</dd>
                    <dd className="text-sm text-muted">{f.focus}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-sm text-muted">Professional</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{f.postnominals}</dd>
                    <dd className="text-sm text-muted">GMNSE: Graduate Member, Nigerian Society of Engineers</dd>
                  </div>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            title="Where we are"
            lead="An early-stage company, honestly described. Here is the path so far and what comes next."
          />
          <Timeline steps={MILESTONES} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading className="mb-8!" title="How we work" />
            <div className="border-t border-line">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="border-b border-line py-5">
                  <h3 className="font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading className="mb-8!" title="Company details" />
            <dl className="border-t border-line text-sm">
              {[
                ['Registered name', COMPANY.legalName],
                ['Registration', 'Corporate Affairs Commission (CAC), Nigeria'],
                ['Registered office', COMPANY.address.join(', ')],
                ['Email', COMPANY.email],
                ['Phone', COMPANY.phones.map((p) => p.display).join(' · ')],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <CTABand
        title="Invest, partner or join us"
        body="We are actively exploring partnerships and investment, and we want to hear from farms that could host a pilot, distributors, research partners and engineers who want to build here."
      >
        <Button to="/contact?topic=invest" arrow>Talk to the founders</Button>
        <Button to="/careers" variant="ghost">Careers</Button>
      </CTABand>
    </>
  );
}

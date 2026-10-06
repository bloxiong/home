import React from 'react';
import { GraduationCap, BadgeCheck, ArrowUpRight } from 'lucide-react';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal, TechLabel, Brand, BrandText, BrandLine,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import Timeline from '../components/Timeline';
import { FOUNDERS, MILESTONES, COMPANY, IMG } from '../content/site';

const STATEMENTS = [
  {
    label: 'Aim',
    text: 'To research, invent, develop, produce and deliver technology products and services that improve lives and solve real-world problems.',
  },
  {
    label: 'Mission',
    text: 'To become a leading force in technology innovation, with solutions that meet today’s challenges and anticipate tomorrow’s needs, built to the highest standards of quality.',
  },
  {
    label: 'Vision',
    text: 'To be recognised globally as a pioneering technology company that sets new standards in quality, sustainability and technological advancement.',
  },
];

const PRINCIPLES = [
  { title: 'Start from the real problem', body: 'We go to the farm, the site or the factory floor first. A product that ignores its conditions fails there.' },
  { title: 'Say exactly where things stand', body: 'Prototype means prototype. Customers, partners and investors get the honest status, every time.' },
  { title: 'Test the riskiest part first', body: 'Design, testing and documentation are done properly, whether the product is ours or a client’s.' },
  { title: 'Nigeria first, built for the world', body: 'We design for local conditions and to standards that travel beyond borders.' },
];

const TRUST = [
  ['CAC registered', 'BLOXio Nigeria Limited'],
  ['Based in', 'Festac, Lagos, Nigeria'],
  ['Works in', 'Engineering & R&D'],
  ['Founded by', 'Two electrical and electronics engineers'],
];

export default function About() {
  return (
    <>
      <PageMeta
        title="Company"
        path="/about"
        description="BLOXio Nigeria Limited is a CAC-registered engineering and technology company in Lagos developing intelligent hardware and software systems. Meet the founders."
      />

      <PageHeader
        image={IMG.drafting}
        label="Company"
        title="BLOXio Nigeria Limited"
        lead="A Nigerian engineering and technology company developing intelligent hardware and software systems."
      />

      <div className="border-b border-line bg-surface">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-6 lg:grid-cols-4">
          {TRUST.map(([k, v], i) => (
            <Reveal key={k} i={i} className="border-line py-7 pr-4 not-last:lg:border-r lg:px-6 lg:first:pl-0">
              <dt className="text-label text-muted">{k}</dt>
              <dd className="mt-2 font-semibold text-ink"><BrandText>{v}</BrandText></dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHeading
            className="mb-0!"
            label="What we do"
            title="Engineers building products, not slides"
          />
          <Reveal className="prose-bx text-lg leading-relaxed text-muted">
            <p>
              <BrandLine><Brand /> was founded by two electrical and electronics engineers.</BrandLine> We work across the whole stack of a
              physical product: circuits and sensors, firmware, cloud services, and the AI that turns data into decisions.
            </p>
            <p>
              We build our own products, starting with <strong className="font-semibold text-ink">AgroSense360</strong>,
              an autonomous field rover for crop and soil monitoring. Alongside it, we take on engineering work for
              companies that need devices, connected systems or technical advice.
            </p>
            <p>
              AgroSense360 is the first product, not the only one. BLOXio Smart Systems, drones, security and energy are
              in research, and the team is set up to take each from idea to engineered system.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Founders */}
      <Section tone="sunken" id="founders">
        <SectionHeading
          label="Founders"
          title="The people behind the systems"
          lead="Two technical founders who built the AgroSense360 core and run the company."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <Reveal as="article" key={f.name} i={i} className={`${card()} flex flex-col p-7 md:p-10`}>
              <div className="flex items-center gap-5">
                <div className="font-display flex h-20 w-20 shrink-0 items-center justify-center bg-forest text-2xl text-signal" aria-hidden="true">
                  {f.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-ink md:text-2xl">{f.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                  <p className="mt-1 text-label text-muted">{f.focus}</p>
                </div>
              </div>
              <p className="mt-7 leading-relaxed text-muted">{f.bio}</p>
              <dl className="mt-7 space-y-4 border-t border-line pt-6">
                <div className="flex gap-4">
                  <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-label text-muted">Education</dt>
                    <dd className="mt-1 font-semibold text-ink">{f.education}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-label text-muted">Professional</dt>
                    <dd className="mt-1 font-semibold text-ink">{f.postnominals}</dd>
                    <dd className="text-sm text-muted">Graduate Member, Nigerian Society of Engineers</dd>
                  </div>
                </div>
              </dl>
              {f.link && (
                <a
                  href={f.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold text-accent"
                >
                  {f.link.label}
                  <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            label="Progress"
            title="Where we are"
            lead="What is done, what is in progress, and what comes next."
          />
          <Timeline steps={MILESTONES} />
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHeading label="Principles" title="How we work" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} i={i} className={`${card()} p-6`}>
              <span className="text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-5 font-bold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {STATEMENTS.map((s, i) => (
            <Reveal key={s.label} i={i} className="bg-surface p-7">
              <TechLabel>{s.label}</TechLabel>
              <p className="mt-4 leading-relaxed text-ink">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading label="Details" title="Company details" />
          <dl className="border-t border-line text-sm">
            {[
              ['Registered name', COMPANY.legalName],
              ['Registration', 'Corporate Affairs Commission (CAC), Nigeria'],
              ['Registered office', COMPANY.address.join(', ')],
              ['Email', COMPANY.email],
              ['Phone', COMPANY.phones.map((p) => p.display).join(' · ')],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4">
                <dt className="text-label text-muted">{k}</dt>
                <dd className="font-semibold text-ink"><BrandText>{v}</BrandText></dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <CTABand
        label="Get involved"
        title="Invest, partner or join us."
        body="Investors, pilot farms, distributors, research partners and engineers."
      >
        <Button to="/contact?topic=invest" variant="light" arrow>Talk to the founders</Button>
        <Button to="/careers" variant="ghost">Careers</Button>
      </CTABand>
    </>
  );
}

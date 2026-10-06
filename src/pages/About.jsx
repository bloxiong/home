import React from 'react';
import { GraduationCap, BadgeCheck, Building2, MapPin, Mail, Phone, Clock } from 'lucide-react';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal, TechLabel, Brand, BrandText, BrandLine, StarBullet,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import Timeline from '../components/Timeline';
import { FOUNDERS, MILESTONES, COMPANY, IMG } from '../content/site';

const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address.join(', '))}`;

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
  { title: 'Test the riskiest part first', body: 'We prove the hardest assumption on a bench or test track before spending on the rest. Our products and client work get the same treatment.' },
  { title: 'Nigeria first, built for the world', body: 'We design for local conditions and to standards that travel beyond borders.' },
];

const TRUST = [
  ['CAC registered', 'BLOXio Nigeria Limited'],
  ['Based in', 'Festac, Lagos, Nigeria'],
  ['Works in', 'Electronics, embedded, cloud & AI'],
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
        cinematic
        image={IMG.drafting}
        label="Company"
        title="BLOXio Nigeria Limited"
        lead="A Nigerian engineering and technology company developing intelligent hardware and software systems."
        footer={
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TRUST.map(([k, v], i) => (
              <div key={k} className="fact-card rise-in rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md md:p-5" style={{ '--i': 3 + i * 0.6 }}>
                <dt className="flex items-center gap-2 text-label text-forest-muted">
                  <StarBullet i={i} className="h-3 w-3" />{k}
                </dt>
                <dd className="mt-2 font-semibold leading-snug text-on-forest"><BrandText>{v}</BrandText></dd>
              </div>
            ))}
          </dl>
        }
      />

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
              AgroSense360 is the first product, not the only one. BLOXio Smart Systems, agricultural drones, security and energy
              systems are concepts in research. Each moves into development only when demand is clear.
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
            <Reveal as="article" key={f.name} i={i} className={`${card()} founder-card-plain flex flex-col p-7 md:p-10`}>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="founder-mono founder-card-mono" aria-hidden="true">
                  <span className="font-display text-xl text-accent">{f.initials}</span>
                </div>
                <div>
                  <h3 className="font-display text-xl uppercase leading-tight text-ink md:text-2xl">{f.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                  <p className="mt-1 text-label text-muted">{f.focus}</p>
                </div>
              </div>
              <p className="mt-4 leading-relaxed text-muted">{f.bio}</p>
              <dl className="mt-6 space-y-4 border-t border-line pt-4">
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
                  className="link-line mt-auto self-start"
                >
                  {f.link.label}
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            className="lg:sticky lg:top-28 lg:self-start"
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
              <h3 className="mt-4 font-bold text-ink">{p.title}</h3>
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

      {/* Company details: everything needed to verify us and reach us */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              className="mb-0!"
              label="Details"
              title="Company details"
              lead="Everything you need to verify us and reach us."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Reveal className={`${card()} detail-card sm:col-span-2`}>
              <p className="detail-key"><span className="detail-icon"><Building2 size={16} /></span>Registered name</p>
              <div className="mt-3">
                <span className="font-display block text-2xl uppercase leading-tight text-ink md:text-3xl"><BrandText>{COMPANY.legalName}</BrandText></span>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <BadgeCheck size={14} /> Registered with the Corporate Affairs Commission (CAC), Nigeria
                </span>
              </div>
            </Reveal>
            <Reveal i={1} className={`${card()} detail-card sm:col-span-2`}>
              <p className="detail-key"><span className="detail-icon"><MapPin size={16} /></span>Registered office</p>
              <div className="mt-3 text-lg font-semibold leading-snug text-ink">
                {COMPANY.address[0]}<br />{COMPANY.address[1]}
              </div>
              <div className="mt-4"><a href={MAP_URL} target="_blank" rel="noreferrer" className="link-line">Open in Google Maps</a></div>
            </Reveal>
            <Reveal i={2} as="div" className="h-full">
              <a href={`mailto:${COMPANY.email}`} className={`${card(true)} detail-card block h-full`}>
                <p className="detail-key"><span className="detail-icon"><Mail size={16} /></span>Email</p>
                <div className="mt-3 break-all font-semibold text-ink">{COMPANY.email}</div>
                <div className="mt-1 text-sm text-muted">We aim to reply within 24 hours.</div>
              </a>
            </Reveal>
            <Reveal i={3} className={`${card()} detail-card`}>
              <p className="detail-key"><span className="detail-icon"><Phone size={16} /></span>Phone</p>
              {COMPANY.phones.map((ph) => (
                <div key={ph.tel} className="mt-3 mt-1 first-of-type:mt-3">
                  <a href={`tel:${ph.tel}`} className="font-semibold tabular-nums text-ink transition-colors hover:text-accent">{ph.display}</a>
                </div>
              ))}
            </Reveal>
            <Reveal i={4} className={`${card()} detail-card sm:col-span-2`}>
              <p className="detail-key"><span className="detail-icon"><Clock size={16} /></span>Office hours</p>
              <div className="mt-3 font-semibold text-ink">{COMPANY.hours}</div>
            </Reveal>
          </div>
        </div>
      </Section>

      <CTABand
        label="Get involved"
        title="Invest, partner or join us."
        body="Investors, pilot farms, distributors, research partners and engineers."
      >
        <Button to="/contact?topic=invest" variant="text">Talk to the founders</Button>
        <Button to="/careers" variant="text">Careers</Button>
      </CTABand>
    </>
  );
}

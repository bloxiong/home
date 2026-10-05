import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import CinematicHero, { INTRO_END_ID } from '../components/CinematicHero';
import { PageMeta, Button, StatusBadge, RevealImage, SectionHeading, CTABand } from '../components/ui';
import { AGROSENSE, SERVICES, FOUNDERS, IMG } from '../content/site';

const FACTS = [
  { k: 'Company',      v: 'Bloxio Nigeria Limited, CAC-registered' },
  { k: 'Based in',     v: 'Festac, Lagos' },
  { k: 'Founded by',   v: 'Two electrical and electronics engineers' },
  { k: 'Works across', v: 'AI, IoT, embedded systems and electronics' },
  { k: 'Building now', v: 'AgroSense360, a smart farming system' },
];

const PATHS = [
  {
    who: 'Farmers and agribusiness',
    body: 'Tell us how you monitor your farm today and get early access when the AgroSense360 pilot opens.',
    cta: 'Join the pilot list',
    to: '/survey',
  },
  {
    who: 'Businesses',
    body: 'Need a device, a sensor network or an engineering second opinion? Bring us the problem.',
    cta: 'Start a project',
    to: '/contact?topic=project',
  },
  {
    who: 'Investors and partners',
    body: 'Host a pilot, distribute, research with us, or back the build. Talk to the founders directly.',
    cta: 'Talk to the founders',
    to: '/contact?topic=invest',
  },
  {
    who: 'Engineers',
    body: 'Want to build hardware made in Nigeria? We want to hear from you, even before roles open.',
    cta: 'See careers',
    to: '/careers',
  },
];

export default function Home() {
  return (
    <>
      <PageMeta
        description="Bloxio Nigeria Limited is a Lagos engineering company building hardware and software products across AI, IoT and electronics, starting with AgroSense360 for smart farming."
      />
      <CinematicHero />

      {/* Overview: who we are in one screen */}
      <section id={INTRO_END_ID} className="bg-canvas scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <p
              className="font-display font-black text-ink leading-[1.12] tracking-tight text-balance"
              style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)' }}
            >
              We build our own hardware products, and the engineering behind other people’s.
            </p>
            <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-muted">
              Bloxio is an engineer-founded company in Lagos. We design electronics, firmware, software and AI
              together, so a product works as one system in the conditions it will actually face: heat, dust,
              power cuts and patchy networks. Our first product is for Nigerian farms.
            </p>
            <div className="mt-8">
              <Button to="/about" variant="text" arrow>About the company</Button>
            </div>
          </div>

          <dl className="self-end border-t border-line">
            {FACTS.map((f) => (
              <div key={f.k} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
                <dt className="text-sm text-muted">{f.k}</dt>
                <dd className="text-sm font-semibold text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Flagship product */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <RevealImage src={IMG.maize} className="aspect-[4/3] lg:aspect-[4/5]" />
          <div>
            <StatusBadge status={AGROSENSE.stage} live />
            <h2
              className="mt-6 font-display font-black text-ink leading-[1.04] tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4.2vw, 3.4rem)' }}
            >
              AgroSense360
            </h2>
            <p className="mt-3 text-xl font-semibold text-accent">{AGROSENSE.oneLiner}</p>
            <p className="mt-5 text-lg leading-relaxed text-muted">{AGROSENSE.summary}</p>

            <ul className="mt-9 grid gap-x-8 sm:grid-cols-2 border-t border-line">
              {AGROSENSE.components.map((c) => (
                <li key={c.title} className="border-b border-line py-4">
                  <p className="font-semibold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/products/agrosense360" arrow>How it works</Button>
              <Button to="/survey" variant="secondary">Join the pilot list</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services as an index, not a card grid */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <SectionHeading
            title="Engineering you can hire"
            lead="The same team building AgroSense360 takes on client work, from a first feasibility study to devices running in the field."
          />
          <ul className="border-t border-line">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/services#${s.id}`}
                  className="group grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_1.2fr_auto] md:items-center md:gap-10"
                >
                  <span className="text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-accent md:text-xl">
                    {s.title}
                  </span>
                  <span className="text-muted leading-relaxed">{s.short}</span>
                  <ArrowRight
                    size={20}
                    className="hidden text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent md:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button to="/services" variant="secondary" arrow>Services and how we work</Button>
          </div>
        </div>
      </section>

      {/* One clear next step per audience */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <SectionHeading title="Where do you fit?" />
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p) => (
              <Link
                key={p.who}
                to={p.to}
                className="group flex flex-col bg-sunken p-7 transition-colors duration-200 hover:bg-canvas"
              >
                <h3 className="text-lg font-bold tracking-tight leading-snug text-ink">{p.who}</h3>
                <p className="mt-3 mb-8 text-sm leading-relaxed text-muted">{p.body}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  {p.cta}
                  <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20 items-start">
          <div>
            <SectionHeading
              className="mb-8!"
              title="Built by engineers"
              lead="Bloxio is run by its two founders, both trained in electrical and electronics engineering, who design and build the products themselves."
            />
            <Button to="/about" variant="text" arrow>Meet the founders</Button>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {FOUNDERS.map((f) => (
              <li key={f.name} className="border-t-2 border-accent pt-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark font-display text-lg font-black text-black">
                  {f.initials}
                </div>
                <p className="mt-5 text-xl font-bold tracking-tight text-ink">{f.name}</p>
                <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {f.education}. {f.postnominals}.
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Have something to build?"
        body="A device, a sensor network, a farm that needs watching. Tell us about it and the founders will reply."
      >
        <Button to="/contact" arrow>Start a conversation</Button>
        <Button to="/products/agrosense360" variant="ghost">Explore AgroSense360</Button>
      </CTABand>
    </>
  );
}

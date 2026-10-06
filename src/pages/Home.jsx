import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Hero, { INTRO_END_ID } from '../components/Hero';
import {
  PageMeta, Button, StatusBadge, SectionHeading, CTABand, Reveal, CountUp, TechLabel, Photo, ScrollWords, Brand, BrandLine, BrandText,
} from '../components/ui';
import { card, fmtDate, useScrollVars } from '../lib/ui-utils';
import {
  DISCIPLINES, PRODUCTS, RESEARCH, FOUNDERS, NUMBERS, PROCESS, ARTICLES, CAPABILITIES, IMG,
} from '../content/site';

export default function Home() {
  const research = ['networks', 'edge', 'autonomy'].map((id) => RESEARCH.find((r) => r.id === id));
  const latest = ARTICLES[0];
  const productsRef = useScrollVars();
  const processRef = useScrollVars();

  return (
    <>
      <PageMeta path="/" />
      <Hero />

      {/* 01 Overview */}
      <section id={INTRO_END_ID} className="scroll-mt-16 bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-16 sm:px-6 md:pt-14 md:pb-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <Reveal>
            <TechLabel>Who we are</TechLabel>
            <ScrollWords
              text="We build our own products, and the engineering behind other people’s."
              className="font-display mt-6 uppercase leading-[1.04] text-ink text-balance"
              style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.6rem)' }}
            />
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted">
              Circuits, firmware, cloud and AI, designed as one system.
            </p>
            <div className="mt-8">
              <Button to="/about" variant="text" arrow>About the company</Button>
            </div>
          </Reveal>

          <dl className="grid grid-cols-2 gap-3 self-end">
            {NUMBERS.map((n, i) => (
              <Reveal key={n.label} i={i} className={`${card(true)} p-4 sm:p-5`}>
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <CountUp value={n.value} className="font-display block text-4xl text-accent md:text-5xl" />
                  <span className="mt-3 block text-sm leading-snug text-muted">{n.label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* 02 Capabilities */}
      <section className="cap-band on-forest relative overflow-hidden bg-forest text-on-forest">
        <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="label-rule text-label text-forest-muted">One step ahead of tech</p>
            <h2 className="font-display mt-5 uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)' }}>
              From the circuit board to the screen
            </h2>
          </Reveal>
          <ol className="border-t border-forest-line">
            {CAPABILITIES.map((c, i) => (
              <Reveal as="li" key={c.id} i={i}>
                <Link
                  to={`/engineering#${c.id}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-forest-line px-2 py-4 transition-colors hover:bg-forest-2"
                >
                  <span className="text-label text-signal">{c.n}</span>
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    <span className="mt-1 block font-mono text-xs text-forest-muted">{c.stack.slice(0, 4).join(' · ')}</span>
                  </span>
                  <ArrowUpRight size={18} className="text-forest-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 What we engineer: cards stack as you scroll */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <SectionHeading
            label="What we engineer"
            title="Three disciplines, one system"
            lead="Hardware, software and research, engineered as one."
          />
          <div className="grid gap-6">
            {DISCIPLINES.map((d, i) => (
              <div key={d.id} className="sticky" style={{ top: `calc(6rem + ${i * 1.25}rem)` }}>
                <Link
                  to={`/engineering#${d.id}`}
                  className={`${card(true)} group grid overflow-hidden shadow-[0_-18px_40px_-30px_rgba(16,34,26,0.5)] min-h-[520px] md:min-h-0 md:h-[440px] md:grid-cols-[1fr_1.1fr]`}
                >
                  <Photo id={d.img} zoom fill className="aspect-[16/10] md:aspect-auto md:h-full" sizes="(min-width: 768px) 45vw, 100vw" />
                  <div className="flex flex-col p-6 md:p-8">
                    <div className="flex items-start justify-between gap-6">
                      <span className="font-display text-3xl text-accent">{d.n}</span>
                      <ArrowUpRight size={22} className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-ink md:text-2xl">{d.title}</h3>
                    <p className="mt-2 text-muted">{d.lead}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-5">
                      {d.items.map((it) => (
                        <li key={it} className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink">{it}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/engineering" variant="text" arrow>How we engineer</Button>
          </div>
        </div>
      </section>

      {/* 05 Product line: photo panels */}
      <section ref={productsRef} className="on-forest bg-[#0A0C0B] text-on-forest">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-6 md:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="label-rule text-label text-forest-muted">Products</p>
              <h2 className="font-display mt-5 uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)' }}>
                What we are building
              </h2>
              <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-forest-muted">
                One working prototype. Four lines in research.
              </p>
            </Reveal>
            <Button to="/products" variant="ghost" arrow>All products</Button>
          </div>
        </div>
        <ul className="drift no-scrollbar mx-auto mt-12 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-16 sm:px-6 md:pb-24">
          {PRODUCTS.map((p, i) => (
            <Reveal as="li" key={p.slug} i={i} style={{ '--k': i }} className="w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-[23%]">
              <Link to={p.href ?? `/products#${p.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-forest-line transition-colors hover:border-signal/60">
                <Photo id={p.img} zoom className="absolute inset-0" imgClassName="brightness-[0.6]" sizes="(min-width: 1024px) 31vw, 80vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B] via-[#0A0C0B]/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <StatusBadge status={p.status} onForest />
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-white"><BrandText>{p.name}</BrandText></h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{p.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 06 Inside BLOXio */}
      <section className="on-forest relative overflow-hidden bg-forest text-on-forest">
        <Photo id={IMG.soldering} parallax className="absolute inset-0" imgClassName="opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest via-forest/80 to-forest" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <Reveal>
            <p className="label-rule text-label text-forest-muted"><BrandLine>Inside <Brand /></BrandLine></p>
            <h2 className="font-display mt-5 max-w-4xl uppercase leading-[0.95] text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
              Ideas aren’t enough. We engineer them.
            </h2>
          </Reveal>
          <div ref={processRef} className="process mt-10">
          <div className="process-line mb-6 h-px bg-forest-line" aria-hidden="true"><span /></div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((p, i) => (
              <Reveal as="li" key={p.title} i={i} style={{ '--k': i / PROCESS.length }} className="process-step rounded-2xl border border-forest-line bg-forest/70 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-signal/50">
                <span className="font-display text-3xl text-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-muted">{p.body}</p>
              </Reveal>
            ))}
          </ol>
          </div>
        </div>
      </section>

      {/* 07 Research */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading className="mb-0!" label="Research" title="What we are exploring" lead="Labelled by real stage." />
            <Button to="/research" variant="secondary" arrow>All research</Button>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {research.map((r, i) => (
              <Reveal key={r.id} i={i} className={`${card(true)} group flex flex-col overflow-hidden`}>
                <Photo id={r.img} zoom className="aspect-[16/10]" sizes="(min-width: 768px) 33vw, 100vw" />
                <div className="flex flex-1 flex-col p-5">
                  <StatusBadge status={r.status} className="self-start" />
                  <h3 className="mt-4 text-lg font-bold text-ink">{r.title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 08 Founders */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <SectionHeading
            label="The engineers"
            title="Built by the people who build it"
            lead="Two engineers who build it themselves."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} i={i} className={`${card(true)} p-6`}>
                <div className="flex items-center gap-5">
                  <div className="font-display flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest text-lg text-signal ring-4 ring-accent/10">
                    {f.initials}
                  </div>
                  <div>
                    <p className="text-xl font-bold tracking-tight text-ink">{f.name}</p>
                    <p className="mt-0.5 text-sm font-semibold text-accent">{f.role}</p>
                  </div>
                </div>
                <p className="mt-6 text-label text-muted">{f.focus}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Button to="/about#founders" variant="text" arrow>More about the founders</Button>
          </div>
        </div>
      </section>

      {/* 09 Journal */}
      {latest && (
        <section className="bg-canvas">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
            <Reveal>
              <Link to={`/journal/${latest.slug}`} className={`${card(true)} group grid overflow-hidden md:grid-cols-[1fr_1.3fr]`}>
                <Photo id={latest.img} zoom fill className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-[220px]" sizes="(min-width: 768px) 40vw, 100vw" />
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <p className="text-label text-accent">From the journal</p>
                  <p className="mt-2 text-label text-muted">{latest.category} · {fmtDate(latest.date)}</p>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink md:text-3xl">{latest.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{latest.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    Read the note <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <CTABand
        image={IMG.field}
        label="Work with us"
        title="Build the next system with us."
        body="Hardware, software and intelligence. Tell us what you want to build."
      >
        <Button to="/contact" variant="light" arrow>Start a conversation</Button>
        <Button to="/engineering" variant="ghost">How we work</Button>
      </CTABand>
    </>
  );
}

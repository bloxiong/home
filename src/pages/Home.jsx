import React from 'react';
import { Link } from 'react-router-dom';
import Hero, { INTRO_END_ID } from '../components/Hero';
import {
  PageMeta, Button, StatusBadge, SectionHeading, CTABand, Reveal, CountUp, TechLabel, Photo, ScrollWords, Brand, BrandText, StarTag, StarBullet,
} from '../components/ui';
import { card, fmtDate, useScrollVars, useReadingLine } from '../lib/ui-utils';
import {
  DISCIPLINES, PRODUCTS, RESEARCH, FOUNDERS, NUMBERS, PROCESS, ARTICLES, CAPABILITIES, IMG,
} from '../content/site';

export default function Home() {
  const research = ['networks', 'edge', 'autonomy'].map((id) => RESEARCH.find((r) => r.id === id));
  const latest = ARTICLES[0];
  const productsRef = useScrollVars();
  const processRef = useReadingLine();

  return (
    <>
      <PageMeta path="/" />
      <Hero />

      {/* 01 Overview */}
      {/* pulled up onto the planet's faded surface (no background of its own),
          so there is no empty band between the hero and this section */}
      <section id={INTRO_END_ID} className="relative z-10 -mt-24 scroll-mt-16 md:-mt-32">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-14 sm:px-6 md:pt-14 md:pb-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <Reveal>
            <TechLabel>Who we are</TechLabel>
            <ScrollWords
              text="We build our own products, and the engineering behind other people’s."
              className="font-display mt-4 uppercase leading-[1.04] text-ink text-balance"
              style={{ fontSize: 'clamp(1.05rem, max(3.2vw, min(8.5vw, 1.5rem)), 2.6rem)' }}
            />
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
              Circuits, firmware, cloud services and AI under one roof, from a CAC-registered company in Lagos.
            </p>
            <div className="mt-6">
              <Button to="/about" variant="text">About the company</Button>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 self-end">
            {NUMBERS.map((n, i) => (
              <Reveal as={Link} to={n.to} key={n.label} i={i} className={`${card(true)} block p-4 sm:p-5`}>
                <CountUp value={n.value} className="font-display block text-4xl text-accent md:text-5xl" />
                <span className="mt-3 block text-sm leading-snug text-muted">{n.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Capabilities: the tagline writes itself in, four capabilities light up */}
      <section className="cap-band on-forest relative overflow-hidden bg-forest text-on-forest">
        <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Reveal>
            <span className="bx-shine tag-write" style={{ '--mask': 'url(/brand/tagline.png)' }}>
              <img src="/brand/tagline.png" alt="One step ahead of tech" width="785" height="70" draggable="false" />
            </span>
            <h2 className="font-display mt-4 uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.05rem, max(3.6vw, min(8.5vw, 1.75rem)), 2.9rem)' }}>
              From the circuit board to the screen
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-forest-muted">
              Four capabilities under one roof, so the board, the firmware, the cloud and the model are designed together.
            </p>
            <div className="mt-8">
              <Button to="/engineering" variant="text">Explore our technology</Button>
            </div>
          </Reveal>
          <ol className="grid gap-3 sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <Reveal as="li" key={c.id} i={i}>
                <Link
                  to={`/engineering#${c.id}`}
                  className="cap-tile group relative flex h-full min-h-[11rem] flex-col overflow-hidden rounded-2xl border border-forest-line bg-forest-2/70 p-5 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-signal/60 hover:shadow-[0_24px_50px_-28px_rgba(111,211,157,0.55)] active:translate-y-0"
                >
                  <Photo
                    id={c.img}
                    fill
                    className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100"
                    imgClassName="brightness-[0.32] transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 640px) 30vw, 100vw"
                  />
                  <span className="relative flex items-center">
                    <StarBullet i={i} className="h-4 w-4" />
                  </span>
                  <span className="relative mt-auto pt-8">
                    <span className="block text-lg font-bold tracking-tight">{c.title}</span>
                    <span className="mt-1.5 block font-mono text-xs leading-relaxed text-forest-muted">{c.stack.slice(0, 4).join(' · ')}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 What we engineer: cards stack as you scroll */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <SectionHeading
            label="What we engineer"
            title="Three disciplines, one system"
            lead="Product engineering, software and intelligence, and research. Each feeds the next."
          />
          <div className="grid gap-6">
            {DISCIPLINES.map((d, i) => (
              <div key={d.id} className="sticky" style={{ top: `calc(6rem + ${i * 1.25}rem)` }}>
                <Link
                  to={`/engineering#${d.id}`}
                  className={`${card(true)} group grid overflow-hidden shadow-[0_-18px_40px_-30px_rgba(16,34,26,0.5)] md:h-[360px] md:grid-cols-[1fr_1.1fr]`}
                >
                  <Photo id={d.img} zoom fill className="aspect-[16/10] md:aspect-auto md:h-full" sizes="(min-width: 768px) 45vw, 100vw" />
                  <div className="flex flex-col p-6 md:p-8">
                    <div className="flex items-start justify-between gap-6">
                      <span className="font-display text-3xl text-accent">{d.n}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-ink md:text-2xl">{d.title}</h3>
                    <p className="mt-2 text-muted">{d.lead}</p>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-5">
                      {d.items.map((it, k) => (
                        <StarTag key={it} i={k}>{it}</StarTag>
                      ))}
                    </ul>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/engineering" variant="text">How we engineer</Button>
          </div>
        </div>
      </section>

      {/* 05 Product line: photo panels */}
      <section ref={productsRef} className="on-forest bg-[#0A0C0B] text-on-forest">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-6 md:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="script-label text-forest-muted">Products</p>
              <h2 className="font-display mt-4 uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.05rem, max(3.6vw, min(8.5vw, 1.75rem)), 2.9rem)' }}>
                What we are building
              </h2>
              <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-forest-muted">
                One working prototype. Four product concepts in research. Every status labelled.
              </p>
            </Reveal>
            <Button to="/products" variant="text">All products</Button>
          </div>
        </div>
        <ul className="drift no-scrollbar mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-16 sm:px-6 md:pb-24">
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
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <Reveal>
            <p className="script-label text-forest-muted">Inside <Brand /></p>
            <h2 className="font-display mt-4 max-w-4xl uppercase leading-[0.95] text-balance" style={{ fontSize: 'clamp(1.05rem, max(5vw, min(8.5vw, 2rem)), 3.75rem)' }}>
              Ideas aren’t enough. We engineer them.
            </h2>
          </Reveal>
          {/* the same path of stars as Engineering › How we work; it fills with scroll */}
          <Link to="/engineering#how-we-work" className="group mt-10 block" aria-label="How we work, on the Engineering page">
            <ol ref={processRef} className="howpath relative grid gap-8 lg:grid-cols-5 lg:gap-6">
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
          </Link>
        </div>
      </section>

      {/* 07 Research */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading className="mb-0!" label="Research" title="What we are exploring" lead="Low-power networks, edge intelligence and field autonomy, each labelled by its real stage." />
            <Button to="/research" variant="text">All research</Button>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {research.map((r, i) => (
              <Reveal as={Link} to={`/research#${r.id}`} key={r.id} i={i} className={`${card(true)} group flex flex-col overflow-hidden`}>
                <Photo id={r.img} zoom className="aspect-[16/10]" sizes="(min-width: 768px) 33vw, 100vw" />
                <div className="flex flex-1 flex-col p-5">
                  <StatusBadge status={r.status} className="self-start" />
                  <h3 className="mt-4 text-lg font-bold text-ink">{r.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 08 Founders */}
      <section className="bg-sunken">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <SectionHeading
            label="The engineers"
            title="Built by the people who build it"
            lead="Both B.Eng electrical and electronics engineers and graduate members of the Nigerian Society of Engineers. They write the firmware, train the models and run the company."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {FOUNDERS.map((f, i) => (
              <Reveal
                as={Link}
                to="/about#founders"
                key={f.name}
                i={i}
                className="founder-card group relative block overflow-hidden rounded-2xl border p-5 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 sm:p-6 md:p-8"
              >
                <div className="founder-glow pointer-events-none absolute inset-0" aria-hidden="true" />
                <div className="founder-head relative flex items-center gap-4 sm:gap-5">
                  <div className="founder-mono" aria-hidden="true">
                    <span className="founder-initials font-display text-lg sm:text-xl">{f.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg uppercase leading-tight sm:text-xl md:text-2xl">{f.name}</p>
                    <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                  </div>
                </div>
                <ul className="relative mt-5 flex flex-wrap gap-1.5 sm:gap-2">
                  {f.focus.split(/, | and /).map((t, k) => (
                    <li key={t} className="founder-tag inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium">
                      <StarBullet i={k} className="h-3 w-3" />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-4 text-sm leading-relaxed text-muted founder-bio">{f.bio}</p>
                <div className="founder-meta relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4">
                  <span className="text-xs leading-snug">{f.education}</span>
                  <span className="flex gap-1.5">
                    {f.postnominals.split(', ').map((c) => (
                      <span key={c} className="founder-badge rounded-md border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em]">{c}</span>
                    ))}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Button to="/about#founders" variant="text">More about the founders</Button>
          </div>
        </div>
      </section>

      {/* 09 Journal */}
      {latest && (
        <section className="bg-canvas">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
            <Reveal>
              <Link to={`/journal/${latest.slug}`} className={`${card(true)} group grid overflow-hidden md:grid-cols-[1fr_1.3fr]`}>
                <Photo id={latest.img} zoom fill className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-[220px]" sizes="(min-width: 768px) 40vw, 100vw" />
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <p className="text-label text-accent">From the journal</p>
                  <p className="mt-2 text-label text-muted">{latest.category} · {fmtDate(latest.date)}</p>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink md:text-3xl">{latest.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{latest.summary}</p>
                  <span className="link-line mt-6 self-start">
                    Read the note
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <CTABand
        image={IMG.space}
        label="Work with us"
        title="Build the next system with us."
        body="Electronics, firmware, cloud and AI, from a feasibility study to devices in the field. Tell us what you want to build."
      >
        <Button to="/contact" variant="text">Start a conversation</Button>
        <Button to="/engineering" variant="text">How we work</Button>
      </CTABand>
    </>
  );
}

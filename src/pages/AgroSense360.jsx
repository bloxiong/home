import React, { useEffect, useRef, useState } from 'react';
import {
  PageMeta, PageHeader, Button, StatusBadge, Section, SectionHeading, CTABand, Reveal, CountUp, TechLabel, StarTag,
} from '../components/ui';
import { card } from '../lib/ui-utils';
import FAQList from '../components/FAQList';
import { AGROSENSE, IMG } from '../content/site';

const PRODUCT_FAQS = [
  {
    q: 'Can I buy AgroSense360 today?',
    a: 'Not yet. The core system has worked end to end as a prototype. The next generation is being developed for real field deployment. Join the pilot list and we will contact you when field testing opens.',
  },
  {
    q: 'How much will it cost?',
    a: 'Pricing will be validated with design-partner farms before anything is sold. Our farmer survey asks how you would prefer to pay, and those answers shape the model.',
  },
  {
    q: 'Can my farm host a pilot?',
    a: 'We are looking for five design-partner farms: mid-sized commercial farms of 20 to 80 hectares growing tomato, pepper, cassava or yam, starting in Imo, Abia and Enugu. None are recruited yet. Choose “AgroSense360 pilot” on the contact page and tell us about your farm.',
  },
  {
    q: 'Which crops does it cover?',
    a: `The prototype model names 38 disease and healthy states across 9 crops. Written advice covers local crops including ${AGROSENSE.crops.slice(0, 6).join(', ')}. Retraining on Nigerian field imagery is part of field testing. Tell us what you grow in the survey; it affects which crops we test first.`,
  },
];

/* Drive / See / Sense / Say. On large screens the left panel sticks and
   follows whichever step is in the middle of the viewport. */
function LoopSection() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const step = AGROSENSE.loop[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-28 border border-line bg-surface p-10" aria-hidden="true">
          <div className="flex items-center justify-between text-label text-muted">
            <span>{String(active + 1).padStart(2, '0')} / 04</span>
            <span>{step.tag}</span>
          </div>
          <p key={step.key} className="rise-in font-display mt-16 uppercase leading-none text-accent" style={{ fontSize: 'clamp(1.05rem, max(7vw, min(8.5vw, 3.5rem)), 6.5rem)' }}>
            {step.verb}
          </p>
          <div className="mt-16 grid grid-cols-4 gap-2">
            {AGROSENSE.loop.map((s, i) => (
              <span
                key={s.key}
                className={`h-1 transition-colors duration-500 ${i <= active ? 'bg-accent' : 'bg-line'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <ol className="grid gap-4 lg:gap-[30vh] lg:py-[12vh]">
        {AGROSENSE.loop.map((s, i) => (
          <li
            key={s.key}
            ref={(el) => { refs.current[i] = el; }}
            data-index={i}
            className={`${card()} p-7 transition-[border-color,opacity] duration-500 md:p-9 ${
              i === active ? 'lg:border-accent' : 'lg:opacity-60'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-2xl uppercase text-accent">{s.verb}</span>
              <span className="text-label text-muted">{s.tag}</span>
            </div>
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-ink">{s.title}</h3>
            <p className="mt-3 text-lg leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AgroSense360() {
  return (
    <>
      <PageMeta
        title="AgroSense360"
        path="/products/agrosense360"
        description="AgroSense360 is an autonomous field rover that watches crops, reads the soil and sends farmers a diagnosis and treatment on their phones. Prototype results: 96.5% accuracy across 38 disease and healthy classes."
      />

      <PageHeader
        image={IMG.farmers}
        label="Overview"
        title="AgroSense360"
        lead={AGROSENSE.oneLiner}
        aside={
          <div className="border border-forest-line bg-forest-2 p-6">
            <StatusBadge status={AGROSENSE.status} onForest />
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-label text-forest-muted">Where it stands</dt>
                <dd className="mt-1 font-semibold">Integrated prototype, worked end to end</dd>
              </div>
              <div>
                <dt className="text-label text-forest-muted">Next step</dt>
                <dd className="mt-1 font-semibold">Field-ready units and design-partner pilots</dd>
              </div>
              <div>
                <dt className="text-label text-forest-muted">Available to buy</dt>
                <dd className="mt-1 font-semibold">Not yet</dd>
              </div>
            </dl>
          </div>
        }
      >
        <Button to="/products/agrosense360/survey" variant="text">Join the pilot list</Button>
        <Button to="/contact?topic=pilot" variant="text">Partnership enquiries</Button>
      </PageHeader>


      {/* 02 Problem */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHeading
              className="mb-8!"
              label="Problem"
              title="By the time it is visible, the crop is already being lost"
            />
            <Reveal className="border-t border-line pt-6">
              <p className="font-display text-6xl text-accent md:text-7xl">{AGROSENSE.lossStat.value}</p>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-muted">{AGROSENSE.lossStat.label}</p>
            </Reveal>
          </div>
          <div className="grid gap-4 self-end">
            {AGROSENSE.problems.map((p, i) => (
              <Reveal key={p.n} i={i} className={`${card()} grid gap-4 p-6 sm:grid-cols-[3rem_1fr]`}>
                <span className="text-label text-accent">{p.n}</span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{p.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* 03 System */}
      <Section tone="sunken">
        <SectionHeading
          label="System"
          title="One rover does the walking, looking, testing and telling"
          lead="Phone apps only see the leaf you photographed. Drones cannot touch the soil. Soil probes are blind to the crop. AgroSense360 brings crop and soil together in the row."
        />
        <LoopSection />
      </Section>

      {/* 04 Intelligence */}
      <Section>
        <SectionHeading
          label="Intelligence"
          title="An instruction, not a score"
          lead="Advice written for the crops Nigerian farmers grow, with a next step for every diagnosis."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal className={`${card()} p-7`}>
            <TechLabel>What reaches the farmer</TechLabel>
            <div className="mt-4 space-y-5">
              {AGROSENSE.farmer.map((f) => (
                <div key={f.title}>
                  <h3 className="font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal i={1} className={`${card()} p-7`}>
            <TechLabel>What the farm manager sees</TechLabel>
            <div className="mt-4 space-y-5">
              {AGROSENSE.manager.map((f) => (
                <div key={f.title}>
                  <h3 className="font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-8">
          <TechLabel>Advice written for</TechLabel>
          <ul className="mt-4 flex flex-wrap gap-2">
            {AGROSENSE.crops.map((c, i) => (
              <StarTag key={c} i={i} className="bg-surface text-sm">{c}</StarTag>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* 05 Development */}
      <section className="on-forest relative overflow-hidden bg-forest text-on-forest">
        <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
          <Reveal>
            <p className="script-label text-forest-muted">Development</p>
            <h2 className="font-display mt-4 max-w-3xl uppercase leading-[0.98]" style={{ fontSize: 'clamp(1.05rem, max(3.6vw, min(8.5vw, 1.75rem)), 2.9rem)' }}>
              The core system has already worked end to end
            </h2>
          </Reveal>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-forest-line bg-forest-line lg:grid-cols-5">
            {AGROSENSE.proof.map((p, i) => (
              /* five results: on two columns the last one spans the row, so no empty box */
              <Reveal key={p.label} i={i} className="bg-forest p-6 last:col-span-2 lg:last:col-span-1">
                <dt className="sr-only">{p.label}</dt>
                <dd>
                  <CountUp
                    value={p.value}
                    decimals={p.decimals}
                    prefix={p.prefix}
                    suffix={p.suffix}
                    className="font-display block text-3xl text-signal sm:text-4xl"
                  />
                  <span className="mt-3 block text-sm leading-snug text-forest-muted">{p.label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Reveal className="border border-forest-line p-6">
              <p className="text-label text-signal">What we have</p>
              <p className="mt-3 leading-relaxed">{AGROSENSE.have}</p>
            </Reveal>
            <Reveal i={1} className="border border-dashed border-forest-line p-6">
              <p className="script-label text-forest-muted">What we do not have yet</p>
              <p className="mt-3 leading-relaxed">{AGROSENSE.haveNot}</p>
            </Reveal>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-forest-muted">{AGROSENSE.proofNote}</p>
        </div>
      </section>

      {/* 06 What's next */}
      <Section>
        <SectionHeading
          label="What’s next"
          title="The next 18 months are about field proof"
          lead={AGROSENSE.roadmapNote}
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {AGROSENSE.roadmap.map((r, i) => (
            <Reveal as="li" key={r.when} i={i} className={`${card()} relative p-7`}>
              <p className="text-label text-accent">{r.when}</p>
              <h3 className="mt-6 text-xl font-bold text-ink">{r.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{r.body}</p>
              <p className="mt-4 text-label text-muted">Target</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading className="mb-6!" label="Questions" title="Questions about AgroSense360" lead="Availability, price, pilots and crops, answered plainly." />
            <Button to="/contact?topic=pilot" variant="text">Ask about a pilot</Button>
          </div>
          <FAQList items={PRODUCT_FAQS} />
        </div>
      </Section>

      <CTABand
        label="Pilot programme"
        title="Every farm deserves an agronomist that never sleeps."
        body="A few minutes of your time decides which problems we solve first."
      >
        <Button to="/products/agrosense360/survey" variant="text">Take the survey</Button>
        <Button to="/contact?topic=pilot" variant="text">Host a pilot</Button>
      </CTABand>
    </>
  );
}

import React from 'react';
import { Check, Radio, Camera, Cpu, Smartphone } from 'lucide-react';
import { PageMeta, PageHeader, Button, StatusBadge, RevealImage, Section, SectionHeading, CTABand } from '../components/ui';
import Timeline from '../components/Timeline';
import FAQList from '../components/FAQList';
import { AGROSENSE, MILESTONES, IMG } from '../content/site';

const FLOW_ICONS = [Radio, Camera, Cpu, Smartphone];
const FLOW_VERBS = ['Sense', 'See', 'Analyse', 'Alert'];

const PRODUCT_FAQS = [
  {
    q: 'Can I buy AgroSense360 today?',
    a: 'Not yet. AgroSense360 is a prototype that we are building and testing in-house. Join the pilot list and we will contact you when field testing opens.',
  },
  {
    q: 'How much will it cost?',
    a: 'Pricing is not set. Our farmer survey asks whether you would prefer a one-time purchase, a subscription or pay-per-use, and those answers will shape the model.',
  },
  {
    q: 'Can my farm host the pilot?',
    a: 'We would like to hear from farms and agribusinesses willing to test the system in real conditions. Choose “AgroSense360 pilot” on the contact page and tell us about your farm.',
  },
  {
    q: 'Which crops will it support?',
    a: 'We are deciding this from field research. Tell us what you grow in the survey; it directly affects which crops we test first.',
  },
];

export default function AgroSense360() {
  return (
    <>
      <PageMeta
        title="AgroSense360"
        description="AgroSense360 combines field sensors, cameras and AI to monitor crop health, soil and weather and send farmers early warnings. Prototype in progress; join the pilot list."
      />

      <PageHeader
        title="AgroSense360"
        lead={`${AGROSENSE.oneLiner} ${AGROSENSE.summary}`}
        aside={
          <div className="rounded-2xl border border-line bg-surface p-6">
            <StatusBadge status={AGROSENSE.stage} live />
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted">Where it stands</dt>
                <dd className="mt-1 font-semibold text-ink">Prototype being built and tested in-house</dd>
              </div>
              <div>
                <dt className="text-muted">Next step</dt>
                <dd className="mt-1 font-semibold text-ink">Field pilot with early-access farms</dd>
              </div>
              <div>
                <dt className="text-muted">Available to buy</dt>
                <dd className="mt-1 font-semibold text-ink">Not yet</dd>
              </div>
            </dl>
          </div>
        }
      >
        <Button to="/survey" arrow>Join the pilot list</Button>
        <Button to="/contact?topic=pilot" variant="secondary">Partner on the pilot</Button>
      </PageHeader>

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
          <RevealImage src={IMG.farmers} className="aspect-[16/10] md:aspect-[21/9]" />
          <p className="mt-3 text-xs text-muted">Illustrative photo. Not an AgroSense360 deployment.</p>
        </div>
      </div>

      <Section>
        <SectionHeading
          title="The problem on the farm"
          lead="Farm monitoring keeps running into the same four problems. AgroSense360 is designed around them."
        />
        <div className="grid gap-x-12 md:grid-cols-2">
          {AGROSENSE.problems.map((p) => (
            <div key={p.title} className="border-t border-line py-7">
              <h3 className="text-xl font-bold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sunken">
        <SectionHeading
          title="How it works"
          lead="Four parts working as one system, from the soil to the farmer’s phone."
        />
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-accent/60 via-accent/30 to-accent/60 md:block" />
          {AGROSENSE.components.map((c, i) => {
            const Icon = FLOW_ICONS[i];
            return (
              <li key={c.title} className="relative">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-sunken text-accent">
                  <Icon size={20} />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{FLOW_VERBS[i]}</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading className="mb-8!" title="What it is designed to do" />
            <ul className="space-y-4">
              {AGROSENSE.features.map((f) => (
                <li key={f} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-ink">{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Features are being built and tested in the prototype. Final capabilities will follow what the pilot shows works.
            </p>
          </div>
          <div>
            <SectionHeading className="mb-8!" title="Who it is for" />
            <ul className="border-t border-line">
              {AGROSENSE.audiences.map((a) => (
                <li key={a} className="border-b border-line py-4 font-semibold text-ink">{a}</li>
              ))}
            </ul>
            <RevealImage src={IMG.seedlings} className="mt-10 aspect-[16/10]" />
          </div>
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            title="Where it stands"
            lead="We would rather tell you exactly where we are than promise a launch date. This is the honest version."
          />
          <Timeline steps={MILESTONES.slice(1)} />
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <SectionHeading title="Questions about AgroSense360" />
          <FAQList items={PRODUCT_FAQS} />
        </div>
      </Section>

      <CTABand
        title="Help shape AgroSense360"
        body="The survey takes a few minutes. Your answers decide which problems we solve first, and you will be first in line for the pilot."
      >
        <Button to="/survey" arrow>Take the survey</Button>
        <Button to="/contact?topic=pilot" variant="ghost">Host a pilot</Button>
      </CTABand>
    </>
  );
}

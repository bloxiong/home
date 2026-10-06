import React from 'react';
import {
  PageMeta, PageHeader, Button, Section, SectionHeading, CTABand, Reveal,
} from '../components/ui';
import { COMPANY, IMG } from '../content/site';

const AREAS = [
  { title: 'Embedded systems and firmware', body: 'Microcontrollers, sensors, low-power design and the code that runs on them.' },
  { title: 'Electronics and PCB design', body: 'Schematics, layout, power supplies and getting boards from prototype to production.' },
  { title: 'Machine learning and computer vision', body: 'Models that read crop images and sensor data, and run where connectivity is poor.' },
  { title: 'Mobile and web software', body: 'Apps and dashboards that farmers and clients actually use every day.' },
  { title: 'Agronomy and field operations', body: 'People who know farms and can run pilots, train users and bring back what works.' },
  { title: 'Product and industrial design', body: 'Enclosures, usability and making hardware that survives the field.' },
];

const EXPECT = [
  { title: 'Work directly with the founders', body: 'A small team means no layers. You will design, build and decide alongside the people who started the company.' },
  { title: 'Real hardware, real conditions', body: 'Your work ends up on boards, in enclosures and on farms, not only in slides.' },
  { title: 'Broad responsibility early', body: 'At this stage everyone touches more than one part of the product. Curiosity matters as much as experience.' },
];

const mailto = `mailto:${COMPANY.email}?subject=${encodeURIComponent('Careers: introduction')}`;

export default function Careers() {
  return (
    <>
      <PageMeta
        title="Careers"
        path="/careers"
        description="Build hardware made in Nigeria. BLOXio wants to hear from engineers in embedded systems, electronics, machine learning, software and agronomy."
      />

      <PageHeader
        image={IMG.parts}
        label="Careers"
        title="Build hardware made in Nigeria"
        lead="A small, founder-led team. No open roles yet, but we always want to meet builders."
      >
        <Button href={mailto} variant="light" arrow>Introduce yourself</Button>
      </PageHeader>

      <Section>
        <SectionHeading
          title="Who we would like to hear from"
          lead="Skills we will need as AgroSense360 moves to pilot."
        />
        <div className="grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <Reveal key={a.title} className="border-t border-line py-6">
              <h3 className="text-lg font-bold tracking-tight text-ink">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{a.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="sunken">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <SectionHeading className="mb-8!" title="What to expect" />
            <div className="border-t border-line">
              {EXPECT.map((e) => (
                <div key={e.title} className="border-b border-line py-5">
                  <h3 className="font-semibold text-ink">{e.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{e.body}</p>
                </div>
              ))}
            </div>
          </div>
          <Reveal className="on-forest relative overflow-hidden bg-forest p-8 text-on-forest md:p-10">
            <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
            <p className="relative text-label text-forest-muted">What you would work on</p>
            <ul className="relative mt-6 space-y-3 text-lg">
              {['Firmware and embedded control', 'Crop-disease models', 'Backend services and dashboards', 'Field testing with real farms'].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="h-1.5 w-1.5 bg-signal" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading title="How to get in touch" />
          <ol className="space-y-6 text-lg leading-relaxed text-muted">
            <li>
              <span className="font-semibold text-ink">Email {COMPANY.email}</span> with “Careers” in the subject.
            </li>
            <li>
              <span className="font-semibold text-ink">Tell us what you have built.</span> Links to projects, code, boards or
              write-ups say more than a list of tools.
            </li>
            <li>
              <span className="font-semibold text-ink">Attach your CV</span> and tell us which area above interests you most.
            </li>
            <li>
              <span className="font-semibold text-ink">Students are welcome too.</span> Tell us what you are studying and what
              you want to learn.
            </li>
          </ol>
        </div>
      </Section>

      <CTABand title="Not an engineer, but want to help?" body="Investors, partners, farms and distributors: we would like to hear from you too.">
        <Button to="/contact?topic=invest" variant="light" arrow>Get in touch</Button>
        <Button href={mailto} variant="ghost">Careers email</Button>
      </CTABand>
    </>
  );
}

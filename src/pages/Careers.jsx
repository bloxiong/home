import React from 'react';
import { PageMeta, PageHeader, Button, RevealImage, Section, SectionHeading, CTABand } from '../components/ui';
import { IMG, COMPANY } from '../content/site';

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
        description="Build hardware made in Nigeria. Bloxio wants to hear from engineers in embedded systems, electronics, machine learning, software and agronomy."
      />

      <PageHeader
        title="Build hardware made in Nigeria"
        lead="We are a small, founder-led team. There are no open roles listed right now, but we always want to meet people who would like to build products like AgroSense360 with us."
      >
        <Button href={mailto} arrow>Introduce yourself</Button>
      </PageHeader>

      <Section>
        <SectionHeading
          title="Who we would like to hear from"
          lead="Skills we expect to need as AgroSense360 moves from prototype to pilot, and as client work grows."
        />
        <div className="grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.title} className="border-t border-line py-6">
              <h3 className="text-lg font-bold tracking-tight text-ink">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{a.body}</p>
            </div>
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
          <RevealImage src={IMG.parts} className="aspect-[4/3]" />
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
        <Button to="/contact?topic=invest" arrow>Get in touch</Button>
        <Button href={mailto} variant="ghost">Careers email</Button>
      </CTABand>
    </>
  );
}

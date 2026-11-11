import React from 'react';
import { PageMeta, PageHeader, Section, BrandText } from '../components/ui';
import { COMPANY } from '../content/site';

const UPDATED = '11 November 2026';

const SECTIONS = [
  {
    h: 'Who we are',
    p: [
      `This website is run by ${COMPANY.legalName}, ${COMPANY.address.join(', ')}. For anything about your data, email ${COMPANY.email}.`,
    ],
  },
  {
    h: 'What we collect, and why',
    list: [
      ['Contact form', 'Your name, email, phone and organisation, and your message are stored on our database so we caan reply. We send you one confirmation email, and use your details only to answer you.'],
      ['AgroSense360 survey', 'Your answers, and your email address if you give it, are stored on our server that only BLOXio can access. We use them to design AgroSense360 and, if you asked, to contact you about early access and launch updates.'],
    ],
  },
  {
    h: 'What we do not do',
    p: [
      'We do not sell your data, use advertising trackers or cookies, or build profiles of visitors. We do not share your information with anyone outside BLOXio.',
    ],
  },
  {
    h: 'How long we keep it',
    p: [
      'We keep enquiries and survey answers for as long as they help us reply to you or build.',
    ],
  },
  {
    h: 'Changes',
    p: ['If this notice changes, we will update it here and change the date above.'],
  },
];

export default function Privacy() {
  return (
    <>
      <PageMeta title="Privacy" path="/privacy" description="How BLOXio Nigeria Limited handles information from its website, contact form and survey." />
      <PageHeader label="Legal" title="Privacy notice" lead={`Plain-language summary of what this website collects and why. Last updated ${UPDATED}.`} />
      <Section>
        <div className="max-w-[68ch] space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-ui text-xl font-bold tracking-tight text-ink">{s.h}</h2>
              {s.p?.map((t) => (
                <p key={t} className="mt-4 leading-relaxed text-muted"><BrandText>{t}</BrandText></p>
              ))}
              {s.list && (
                <dl className="mt-4 space-y-4">
                  {s.list.map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-semibold text-ink">{k}</dt>
                      <dd className="mt-1 leading-relaxed text-muted"><BrandText>{v}</BrandText></dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}

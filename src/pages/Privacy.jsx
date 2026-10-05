import React from 'react';
import { PageMeta, PageHeader, Section } from '../components/ui';
import { COMPANY } from '../content/site';

const UPDATED = '5 October 2026';

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
      ['Contact form', 'The form does not send anything to our servers. It opens your own email app with your message filled in. We receive what you choose to send, and use it only to reply to you.'],
      ['AgroSense360 survey', 'Your answers, and your email address if you give it, are stored in a Google Sheet that only Bloxio can access. We use them to design AgroSense360 and, if you asked, to contact you about early access and launch updates.'],
      ['Theme preference', 'Your light or dark mode choice is saved in your own browser (local storage). It never leaves your device.'],
    ],
  },
  {
    h: 'What we do not do',
    p: [
      'We do not sell your data, use advertising trackers, or run analytics on this site. We do not share your information with anyone outside Bloxio, except the service providers below that make the site work.',
    ],
  },
  {
    h: 'Third-party services',
    p: [
      'Pages load fonts from Google Fonts and cdnfonts, and photos from Unsplash. Survey answers are stored with Google. These providers receive technical information such as your IP address when your browser contacts them, under their own privacy policies.',
    ],
  },
  {
    h: 'How long we keep it',
    p: [
      'We keep enquiries and survey answers for as long as they help us reply to you or build AgroSense360, and delete them when they no longer do, or sooner if you ask.',
    ],
  },
  {
    h: 'Your rights',
    p: [
      `Under the Nigeria Data Protection Act 2023 you can ask to see the data we hold about you, correct it, or have it deleted, and you can withdraw consent to updates at any time. Email ${COMPANY.email} and we will act on your request.`,
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
      <PageMeta title="Privacy" description="How Bloxio Nigeria Limited handles information from its website, contact form and AgroSense360 survey." />
      <PageHeader title="Privacy notice" lead={`Plain-language summary of what this website collects and why. Last updated ${UPDATED}.`} />
      <Section>
        <div className="max-w-[68ch] space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-ui text-xl font-bold tracking-tight text-ink">{s.h}</h2>
              {s.p?.map((t) => (
                <p key={t} className="mt-4 leading-relaxed text-muted">{t}</p>
              ))}
              {s.list && (
                <dl className="mt-4 space-y-4">
                  {s.list.map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-semibold text-ink">{k}</dt>
                      <dd className="mt-1 leading-relaxed text-muted">{v}</dd>
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

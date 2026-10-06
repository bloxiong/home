import React from 'react';
import { PageMeta, PageHeader, Section, BrandText } from '../components/ui';
import { COMPANY } from '../content/site';

const UPDATED = '6 October 2026';

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
      ['Contact form', 'Your name, email, optional phone and organisation, and your message are stored on our server so the founders can reply. We send you one confirmation email, and use your details only to answer you.'],
      ['AgroSense360 survey', 'Your answers, and your email address if you give it, are stored on our server and in a Google Sheet that only BLOXio can access. We use them to design AgroSense360 and, if you asked, to contact you about early access and launch updates. If you give an email, we send you one thank-you email.'],
      ['Visit counts', 'We count page views to see which pages are read and roughly where visitors are. We record the page, the site that linked you here, your device type and browser, and an approximate location (city and country, from your connection). We use no cookies and store no IP addresses; a daily anonymous code lets us count you once per day without recognising you on another day.'],
      ['Theme preference', 'Your light or dark mode choice is saved in your own browser (local storage). It never leaves your device.'],
    ],
  },
  {
    h: 'What we do not do',
    p: [
      'We do not sell your data, use advertising trackers or cookies, or build profiles of visitors. We do not share your information with anyone outside BLOXio, except the service providers below that make the site work.',
    ],
  },
  {
    h: 'Third-party services',
    p: [
      'Pages load fonts from Google Fonts and Fontshare. Photos are served from this site. The site is hosted on Vercel and our server on Render, with data in Neon (a database provider); emails are sent through Resend; survey answers are also kept in Google Sheets. These providers process data only to run these services, under their own privacy policies.',
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
      <PageMeta title="Privacy" path="/privacy" description="How BLOXio Nigeria Limited handles information from its website, contact form and AgroSense360 survey." />
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

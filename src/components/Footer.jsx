import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '../content/site';
import { isAgroHost, MAIN_URL } from '../lib/hosts';

import { BrandText } from './ui';

const COLUMNS = [
  {
    title: 'Products',
    links: [
      { label: 'AgroSense360', to: '/products/agrosense360' },
      { label: 'All products', to: '/products' },
      { label: 'Research', to: '/research' },
      { label: 'Join the pilot list', to: '/products/agrosense360/survey' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Engineering', to: '/engineering' },
      { label: 'About', to: '/about' },
      { label: 'Journal', to: '/journal' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Start a project', to: '/contact?topic=project' },
      { label: 'Investment and partnerships', to: '/contact?topic=invest' },
      { label: 'Privacy', to: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="on-forest relative overflow-hidden bg-forest text-on-forest">
      <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            {isAgroHost ? (
              <a href={MAIN_URL} aria-label="BLOXio home" className="inline-block">
              <img src="/bloxio-logo.png" alt="BLOXio" width="400" height="75" className="mb-6 h-auto w-28" />
            </a>
            ) : (
              <Link to="/" aria-label="BLOXio home" className="inline-block">
              <img src="/bloxio-logo.png" alt="BLOXio" width="400" height="75" className="mb-6 h-auto w-28" />
            </Link>
            )}
            <p className="max-w-xs text-sm leading-relaxed text-forest-muted">{COMPANY.positioning} Designed and engineered in Nigeria.</p>
            <ul className="mt-6 space-y-1.5 text-sm">
              <li><a href={`mailto:${COMPANY.email}`} className="text-on-forest transition-colors hover:text-signal">{COMPANY.email}</a></li>
              {COMPANY.phones.map((p) => (
                <li key={p.tel}><a href={`tel:${p.tel}`} className="tabular-nums text-on-forest transition-colors hover:text-signal">{p.display}</a></li>
              ))}
              <li className="pt-1.5 text-forest-muted">{COMPANY.address.join(', ')}</li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-label mb-5 text-forest-muted">{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-on-forest transition-colors hover:text-signal">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          className="font-display mt-20 select-none uppercase leading-none text-forest-line"
          style={{ fontSize: 'clamp(1.05rem, max(14vw, min(8.5vw, 3rem)), 11rem)' }}
          aria-hidden="true"
        >
          One step ahead of tech
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-forest-line pt-8 sm:flex-row sm:items-center sm:justify-between sm:pr-20">
          <p className="text-label text-forest-muted">
            © {new Date().getFullYear()} <BrandText>{COMPANY.legalName}</BrandText>
          </p>
          <Link to="/contact" className="link-line">
            Work with us
          </Link>
        </div>
      </div>
    </footer>
  );
}

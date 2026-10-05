import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { COMPANY } from '../content/site';

const COLUMNS = [
  {
    title: 'Products',
    links: [
      { label: 'AgroSense360', to: '/products/agrosense360' },
      { label: 'All products', to: '/products' },
      { label: 'Join the pilot list', to: '/survey' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_0.8fr]">
          <div>
            <Link to="/" aria-label="Bloxio home">
              <img src="/bloxio-logo.png" alt="Bloxio" width="400" height="75" className="logo-adapt w-24 h-auto mb-5" />
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs mb-6">
              A Lagos engineering company building hardware, software and AI products, from Nigeria to the world.
            </p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-accent shrink-0" />
                <a href={`mailto:${COMPANY.email}`} className="text-ink hover:text-accent transition-colors">{COMPANY.email}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-accent shrink-0 mt-1" />
                <span className="flex flex-col">
                  {COMPANY.phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`} className="text-ink hover:text-accent transition-colors tabular-nums">{p.display}</a>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-accent shrink-0 mt-1" />
                <span className="text-muted">{COMPANY.address.join(', ')}</span>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-micro font-semibold uppercase tracking-[0.14em] text-accent mb-4">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted hover:text-ink transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} {COMPANY.legalName}. CAC-registered in Nigeria.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:gap-2.5 transition-all">
            Work with us <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

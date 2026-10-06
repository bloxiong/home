import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  PageMeta, Reveal, Button,
} from '../components/ui';
import { card, fmtDate } from '../lib/ui-utils';
import { ARTICLES, COMPANY } from '../content/site';

function Block({ b }) {
  if (b.type === 'h') return <h2 className="mt-12 text-2xl font-bold tracking-tight text-ink"><BrandText>{b.text}</BrandText></h2>;
  if (b.type === 'list') {
    return (
      <ul className="mt-6 space-y-3 border-l border-line pl-6">
        {b.items.map((it) => (
          <li key={it} className="relative text-lg leading-relaxed text-ink before:absolute before:-left-[27px] before:top-3 before:h-1.5 before:w-1.5 before:bg-accent">
            <BrandText>{it}</BrandText>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-6 text-lg leading-relaxed text-muted"><BrandText>{b.text}</BrandText></p>;
}

export default function JournalArticle() {
  const { slug } = useParams();
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return <Navigate to="/" replace />;

  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 2);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    datePublished: a.date,
    author: { '@type': 'Organization', name: a.author },
    publisher: { '@type': 'Organization', name: COMPANY.legalName, url: COMPANY.url },
    description: a.summary,
  };

  return (
    <>
      <PageMeta title={a.title} description={a.summary} path={`/journal/${a.slug}`} type="article" />
      <script type="application/ld+json">{JSON.stringify(ld)}</script>

      <article className="bg-canvas">
        <header className="border-b border-line paper-grid">
          <div className="mx-auto max-w-3xl px-5 pt-32 pb-14 sm:px-6 md:pt-40">
            <Link to="/journal" className="group inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /> Journal
            </Link>
            <p className="rise-in mt-10 text-label text-muted">
              {a.category} · <time dateTime={a.date}>{fmtDate(a.date)}</time>
            </p>
            <h1 className="rise-in font-display mt-5 uppercase leading-[0.98] text-ink text-balance" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', '--i': 1 }}>
              {a.title}
            </h1>
            <p className="rise-in mt-6 text-xl leading-relaxed text-muted" style={{ '--i': 2 }}>{a.summary}</p>
            <p className="rise-in mt-8 text-label text-ink" style={{ '--i': 3 }}
              >By <BrandText>{a.author}</BrandText></p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 md:py-20">
          {a.body.map((b, i) => <Block key={i} b={b} />)}

          {(a.related?.length || others.length > 0) && (
            <aside className="mt-20 border-t border-line pt-10">
              <p className="text-label text-muted">Related</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {a.related?.map((r) => (
                  <Reveal key={r.to}>
                    <Link to={r.to} className={`${card(true)} group flex items-center justify-between p-5 font-semibold text-ink`}>
                      {r.label}
                      <ArrowRight size={18} className="text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  </Reveal>
                ))}
                {others.map((o) => (
                  <Reveal key={o.slug}>
                    <Link to={`/journal/${o.slug}`} className={`${card(true)} block p-5`}>
                      <p className="text-label text-muted">{o.category}</p>
                      <p className="mt-2 font-semibold text-ink">{o.title}</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </aside>
          )}

          <div className="mt-16">
            <Button to="/contact" arrow>Talk to the engineers</Button>
          </div>
        </div>
      </article>
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageMeta, PageHeader, Section, Reveal, BrandText,
} from '../components/ui';
import { card, fmtDate } from '../lib/ui-utils';
import { ARTICLES, IMG } from '../content/site';


export default function Journal() {
  const articles = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageMeta
        title="Journal"
        path="/journal"
        description="Engineering notes from BLOXio: how AgroSense360 and our other systems are designed, built and tested."
      />
      <PageHeader
        image={IMG.space}
        label="Journal"
        title="Engineering notes"
        lead="Notes from the bench and the test track: how we build, what we measured, and what is not proven yet."
      />
      <Section>
        <ul className="border-t border-line">
          {articles.map((a, i) => (
            <Reveal as="li" key={a.slug} i={i}>
              <Link
                to={`/journal/${a.slug}`}
                className="group grid gap-4 border-b border-line py-8 md:grid-cols-[12rem_1fr_auto] md:items-start md:gap-10"
              >
                <div className="text-label text-muted">
                  <time dateTime={a.date}>{fmtDate(a.date)}</time>
                  <p className="mt-1 text-accent">{a.category}</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent md:text-3xl">{a.title}</h2>
                  <p className="mt-3 max-w-[62ch] leading-relaxed text-muted">{a.summary}</p>
                  <p className="mt-4 text-label text-muted"><BrandText>{a.author}</BrandText></p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
        {articles.length < 3 && (
          <Reveal className={`${card()} mt-10 p-6 text-sm leading-relaxed text-muted`}>
            More notes are on the way as AgroSense360 moves toward field testing. Want one when it is published?{' '}
            <Link to="/contact?topic=other" className="link-underline font-semibold text-accent">Tell us</Link>.
          </Reveal>
        )}
      </Section>
    </>
  );
}

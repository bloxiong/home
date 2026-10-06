import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { STATUS } from '../content/site';
import { useInView, useScrollVars, prefersReducedMotion, photo, photoSrcSet, photoPreview } from '../lib/ui-utils';

const DEFAULT_DESCRIPTION =
  'BLOXio Nigeria Limited builds intelligent hardware and software for the physical world: electronics, embedded systems, cloud and AI, starting with the AgroSense360 field rover.';
const SITE = 'https://bloxio.tech';

/* Per-page <title>, description, canonical and social tags. React 19
   hoists these into <head>; index.html deliberately has no description,
   og:title or og:description, so these are the only copies. */
export function PageMeta({ title, description = DEFAULT_DESCRIPTION, path, type = 'website' }) {
  const full = title ? `${title} · BLOXio` : 'BLOXio · Engineering tomorrow';
  const url = path != null ? `${SITE}${path}` : null;
  return (
    <>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {url && <link rel="canonical" href={url} />}
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
    </>
  );
}

/* ── Motion primitives ─────────────────────────────────────────── */

/* Fades and lifts its child in on scroll. `i` staggers siblings. */
export function Reveal({ as = 'div', i = 0, className = '', style, children, ...rest }) {
  const Tag = as;
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--i': i, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Counts up to `value` when it scrolls into view. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1400, className = '' }) {
  const [ref, inView] = useInView();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  const shown = prefersReducedMotion() ? value : inView ? n : 0;
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span aria-hidden="true">{prefix}{shown.toFixed(decimals)}{suffix}</span>
      <span className="sr-only">{prefix}{value.toFixed(decimals)}{suffix}</span>
    </span>
  );
}

/* The flat BLOXio wordmark as inline text. Sized to the surrounding font
   (cap height), in brand gold by default; `gold` adds a slow shine for
   headings. Screen readers hear "BLOXio". */
export function Brand({ gold = false, className = '' }) {
  return <span role="img" aria-label="BLOXio" className={`brand ${gold ? 'brand-gold' : ''} ${className}`} />;
}

/* Renders a string with every "BLOXio" swapped for the wordmark. The
   sentence that carries the logo is set in the display face (the one
   used for "Engineering tomorrow") so the logo reads as part of it;
   the rest of the text keeps its own font. */
export function BrandText({ children, gold = false }) {
  if (typeof children !== 'string' || !children.includes('BLOXio')) return children;
  const withLogo = (text) =>
    text.split(/(BLOXio)/).map((part, i) =>
      part === 'BLOXio' ? <Brand key={i} gold={gold} /> : <React.Fragment key={i}>{part}</React.Fragment>,
    );
  return children.split(/(?<=[.!?])(\s+)/).map((chunk, i) =>
    chunk.includes('BLOXio')
      ? <span key={i} className="brand-line">{withLogo(chunk)}</span>
      : <React.Fragment key={i}>{chunk}</React.Fragment>,
  );
}

/* Wraps hand-written JSX that contains <Brand /> in the display face. */
export function BrandLine({ children }) {
  return <span className="brand-line">{children}</span>;
}

/* Splits a string into masked words that rise in one after another: on
   load inside `.split-load`, or when a parent `.reveal` gets `.is-in`. */
export function SplitWords({ text }) {
  if (typeof text !== 'string') return text;
  return text.split(' ').map((w, i) => (
    <React.Fragment key={i}>
      <span className="sw"><span className="sw-i" style={{ '--w': i }}>{w === 'BLOXio' ? <Brand gold /> : <BrandText>{w}</BrandText>}</span></span>{' '}
    </React.Fragment>
  ));
}

/* Paragraph whose words light up one by one as it scrolls into view. */
export function ScrollWords({ text, as = 'p', className = '', style }) {
  const Tag = as;
  const ref = useScrollVars();
  const words = text.split(' ');
  return (
    <Tag ref={ref} className={`scroll-words ${className}`} style={style}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span style={{ '--w': (i / words.length).toFixed(3) }}>{w}</span>{' '}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/* ── Building blocks ───────────────────────────────────────────── */

const BTN_BASE =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-200 active:translate-y-px';
const BTN = {
  primary:   `${BTN_BASE} btn-pop bg-accent text-on-accent`,
  secondary: `${BTN_BASE} border border-ink/25 text-ink hover:-translate-y-0.5 hover:border-accent hover:bg-accent/6 hover:text-accent`,
  /* for always-dark field sections */
  light:     `${BTN_BASE} btn-pop-light bg-on-forest text-forest`,
  ghost:     `${BTN_BASE} border border-forest-muted/40 text-on-forest hover:-translate-y-0.5 hover:border-signal hover:bg-signal/8 hover:text-signal`,
  text:      'group inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-200',
};

/* Internal routes use <Link>; anything with a scheme uses <a>. */
export function Button({ to, href, variant = 'primary', arrow = false, children, className = '', ...rest }) {
  const cls = `${BTN[variant]} ${className}`;
  const content = (
    <>
      <BrandText>{children}</BrandText>
      {arrow && <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button type="button" className={cls} {...rest}>{content}</button>;
}

/* Honest stage label. `status` is a STATUS key (prototype, rnd, concept…). */
export function StatusBadge({ status, onForest = false, className = '' }) {
  const s = STATUS[status] ?? { label: status, tone: 'outline' };
  const live = s.tone === 'solid';
  const dashed = s.tone === 'dashed';
  const tone = onForest
    ? live
      ? 'border-signal/50 bg-black/45 text-signal'
      : `${dashed ? 'border-dashed text-forest-muted' : 'text-on-forest'} border-white/30 bg-black/45`
    : live
      ? 'border-accent/40 bg-accent/10 text-accent'
      : `${dashed ? 'border-dashed text-muted' : 'text-ink'} border-ink/25 bg-transparent`;
  return (
    <span
      className={`badge inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] backdrop-blur-sm ${tone} ${className}`}
    >
      <span className={`relative inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${live ? 'bg-current' : 'border border-current'}`}>
        {live && <span className="badge-ping absolute inset-0 rounded-full bg-current" />}
      </span>
      {s.label}
    </span>
  );
}

/* Tiny mono metadata label, e.g. "01 / FLAGSHIP TECHNOLOGY" */
export function TechLabel({ children, className = '' }) {
  return <p className={`label-rule text-label text-muted ${className}`}>{children}</p>;
}

/* Photo with responsive sources. `fill` makes the image cover its box
   instead of setting its height (for cards beside text). `parallax` drifts
   the image against the scroll; `reveal` unrolls it when it enters; `zoom` scales on hover of a
   parent `.group`. Off when motion is reduced. */
export function Photo({ id, alt = '', className = '', imgClassName = '', parallax = false, reveal = false, zoom = false, fill = false, priority = false, sizes = '100vw', caption }) {
  const wrap = useRef(null);
  const img = useRef(null);
  const [revealRef, inView] = useInView();

  // Loaded state lives on the DOM (data-loaded), not in React state, so a
  // cached image that finished before hydration is caught without a
  // re-render: the ref callback marks it straight away.
  const markLoaded = (el) => { if (el && wrap.current) wrap.current.dataset.loaded = 'true'; };
  const imgRef = (el) => {
    img.current = el;
    if (el?.complete && el.naturalWidth) markLoaded(el);
  };

  useEffect(() => {
    if (!parallax || prefersReducedMotion()) return;
    const el = wrap.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
      if (img.current) img.current.style.transform = `translate3d(0, ${(p * 8).toFixed(2)}%, 0) scale(1.18)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [parallax]);

  const setRefs = (el) => { wrap.current = el; revealRef.current = el; };

  return (
    <figure ref={setRefs} data-loaded="false" style={photoPreview(id) ? { '--lqip': `url(${photoPreview(id)})` } : undefined} className={`photo ${className.includes('absolute') ? '' : 'relative'} overflow-hidden ${reveal ? `reveal-img ${inView ? 'is-in' : ''}` : ''} ${className}`}>
      <img
        ref={imgRef}
        src={photo(id, 1600)}
        srcSet={photoSrcSet(id)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={(e) => markLoaded(e.currentTarget)}
        className={`${fill ? 'absolute inset-0' : ''} h-full w-full object-cover ${parallax ? 'scale-[1.18] will-change-transform' : ''} ${
          zoom ? 'transition-transform duration-700 ease-out group-hover:scale-[1.06]' : ''
        } ${imgClassName}`}
      />
      {caption && <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-1 text-label text-white/80 backdrop-blur-sm">{caption}</figcaption>}
    </figure>
  );
}

/* Content-page header on a dark field with an engineering grid. */
export function PageHeader({ label, title, lead, children, aside, image }) {
  return (
    <header className="on-forest relative overflow-hidden bg-forest text-on-forest">
      {image && (
        <>
          <Photo id={image} parallax priority className="absolute inset-0" imgClassName="opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/85 to-forest/40" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-forest to-transparent" aria-hidden="true" />
        </>
      )}
      <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-12 sm:px-6 md:pt-36 md:pb-16">
        <div className={aside ? 'grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end' : ''}>
          <div>
            {label && <p className="label-rule rise-in text-label text-forest-muted">{label}</p>}
            <h1
              className="split-load font-display mt-5 uppercase leading-[0.95] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}
            >
              <SplitWords text={title} />
            </h1>
            {lead && (
              <p className="rise-in mt-6 max-w-[60ch] text-lg leading-relaxed text-forest-muted md:text-xl" style={{ '--i': 2 }}>
                <BrandText>{lead}</BrandText>
              </p>
            )}
            {children && <div className="rise-in mt-9 flex flex-wrap gap-3" style={{ '--i': 3 }}>{children}</div>}
          </div>
          {aside && <div className="rise-in" style={{ '--i': 3 }}>{aside}</div>}
        </div>
      </div>
    </header>
  );
}

export function Section({ id, children, className = '', tone = 'canvas' }) {
  const bg = tone === 'sunken' ? 'bg-sunken' : tone === 'surface' ? 'bg-surface' : 'bg-canvas';
  return (
    <section id={id} className={`${bg} scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">{children}</div>
    </section>
  );
}

/* Section heading with an optional mono index label. */
export function SectionHeading({ label, title, lead, className = '', as = 'h2' }) {
  const H = as;
  return (
    <Reveal className={`mb-8 md:mb-12 ${className}`}>
      {label && <TechLabel className="mb-4">{label}</TechLabel>}
      <H
        className="font-display uppercase leading-[0.98] text-ink text-balance"
        style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.9rem)' }}
      >
        <SplitWords text={title} />
      </H>
      {lead && <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg"><BrandText>{lead}</BrandText></p>}
    </Reveal>
  );
}

/* Closing call-to-action on a dark field. */
export function CTABand({ label, title, body, children, image }) {
  return (
    <section className="on-forest relative overflow-hidden bg-forest text-on-forest">
      {image && (
        <>
          <Photo id={image} parallax className="absolute inset-0" imgClassName="opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/30" aria-hidden="true" />
        </>
      )}
      <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
        <Reveal className="max-w-3xl">
          {label && <p className="text-label text-forest-muted">{label}</p>}
          <h2
            className="font-display mt-5 uppercase leading-[0.95] text-balance"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            <SplitWords text={title} />
          </h2>
          {body && <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-forest-muted"><BrandText>{body}</BrandText></p>}
          {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

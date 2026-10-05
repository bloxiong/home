import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* Per-page <title> and description. React 19 hoists these into <head>. */
export function PageMeta({ title, description }) {
  const full = title ? `${title} · Bloxio` : 'Bloxio · One step ahead of tech';
  return (
    <>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
    </>
  );
}

const BTN_BASE =
  'group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]';
const BTN = {
  primary: `${BTN_BASE} bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black shadow-[0_6px_20px_-8px_rgba(189,138,76,0.7)] hover:shadow-[0_10px_28px_-8px_rgba(189,138,76,0.8)] hover:-translate-y-0.5`,
  secondary: `${BTN_BASE} border border-line text-ink hover:border-accent hover:text-accent`,
  /* for always-dark surfaces such as CTABand */
  ghost: `${BTN_BASE} border border-white/25 text-white hover:border-amber-400 hover:text-amber-200`,
  text: 'group inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all duration-200',
};

/* Internal routes use <Link>; anything with a scheme uses <a>. */
export function Button({ to, href, variant = 'primary', arrow = false, children, className = '', ...rest }) {
  const cls = `${BTN[variant]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button type="button" className={cls} {...rest}>{content}</button>;
}

/* Honest stage label. `live` means actively being built. */
export function StatusBadge({ status, live = false, onDark = false }) {
  const tone = live
    ? onDark
      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
      : 'border-accent/40 bg-accent/10 text-accent'
    : onDark
      ? 'border-white/20 bg-black/30 text-white/75'
      : 'border-line text-muted';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${tone}`}>
      <span className="relative flex h-1.5 w-1.5">
        {live && <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 motion-safe:animate-ping" />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-amber-400' : onDark ? 'bg-white/50' : 'bg-muted'}`} />
      </span>
      {status}
    </span>
  );
}

/* Content-page header. The title carries the page. No eyebrow labels. */
export function PageHeader({ title, lead, children, aside }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-70"
        style={{ background: 'radial-gradient(circle, rgba(189,138,76,0.16) 0%, transparent 65%)', filter: 'blur(40px)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-16 md:pt-44 md:pb-24">
        <div className={aside ? 'grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end' : ''}>
          <div>
            <h1
              className="rise-in font-display font-black text-ink leading-[1.02] tracking-tight text-balance"
              style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}
            >
              {title}
            </h1>
            {lead && (
              <p className="rise-in mt-6 max-w-[60ch] text-lg leading-relaxed text-muted md:text-xl" style={{ '--i': 1 }}>
                {lead}
              </p>
            )}
            {children && <div className="rise-in mt-9 flex flex-wrap gap-3" style={{ '--i': 2 }}>{children}</div>}
          </div>
          {aside && <div className="rise-in" style={{ '--i': 2 }}>{aside}</div>}
        </div>
      </div>
    </header>
  );
}

export function Section({ id, children, className = '', tone = 'canvas' }) {
  const bg = tone === 'sunken' ? 'bg-sunken' : 'bg-canvas';
  return (
    <section id={id} className={`${bg} scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function SectionHeading({ title, lead, className = '' }) {
  return (
    <div className={`mb-12 md:mb-16 ${className}`}>
      <h2
        className="font-display font-black text-ink leading-[1.08] tracking-tight text-balance"
        style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
      >
        {title}
      </h2>
      {lead && <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">{lead}</p>}
    </div>
  );
}

/* Image that unrolls top-to-bottom when it scrolls into view. Visible
   immediately when reduced motion is on (the CSS only arms it otherwise). */
export function RevealImage({ src, alt = '', className = '', imgClassName = '', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('is-in'); io.disconnect(); }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal-img overflow-hidden rounded-2xl ${className}`} style={style}>
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}

/* Closing call-to-action used at the foot of content pages. */
export function CTABand({ title, body, children }) {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div data-always-dark className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-[#0e0b07] px-8 py-14 md:px-16 md:py-20">
          <img
            src="/brand/star-cluster.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-6 w-56 opacity-25 md:w-80"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 15% 100%, rgba(189,138,76,0.22) 0%, transparent 60%)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <h2
              className="font-display font-black leading-[1.08] tracking-tight text-white text-balance"
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}
            >
              {title}
            </h2>
            {body && <p className="mt-5 text-lg leading-relaxed text-white/70">{body}</p>}
            {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

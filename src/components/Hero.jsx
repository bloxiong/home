import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { StarBullet } from './ui';
import WordRotator from './WordRotator';
import BrandOrbit from './BrandOrbit';
import { HERO_WORDS } from '../content/site';

export const INTRO_END_ID = 'overview';

/* Particle network from the original hero, now in field green. Paused
   whenever the hero is off-screen; one static frame with reduced motion. */
function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, running = false, pts = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(100, Math.max(w < 768 ? 46 : 0, Math.floor((w * h) / 17000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.55 + 0.15,
      }));
    };

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const dark = true; // the hero is always night, in light mode too
      const dot = dark ? '143,211,168' : '27,122,75';
      const line = dark ? '93,187,132' : '27,122,75';
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot},${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            const d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${line},${0.12 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(draw); } };
    const stop  = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    if (reduce) draw();
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener('resize', resize);
    return () => {
      stop(); io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

/* Phones don't get the star cluster, so the four disciplines it labels on
   desktop sit under the buttons instead, each with a star that takes its
   turn to glint. */
const SIGNALS = [
  { label: 'Electronics', to: '/engineering#embedded' },
  { label: 'AI', to: '/engineering#ai' },
  { label: 'IoT', to: '/engineering#iot' },
  { label: 'Cloud', to: '/engineering#software' },
];

function SignalTiles() {
  return (
    <ul className="hero-tiles rise-in mt-10 grid w-full grid-cols-2 gap-2.5 md:hidden" style={{ '--i': 5 }} aria-label="What we work across">
      {SIGNALS.map(({ label, to }, i) => (
        <li key={label}>
          <Link to={to} className="hero-signal flex items-center gap-3 rounded-xl border border-line bg-surface/50 px-3.5 py-3 backdrop-blur-sm transition-[translate,background-color] duration-200 active:translate-y-px active:bg-accent/10" style={{ '--k': i }}>
          <StarBullet i={i} className="h-4 w-4" />
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* "ENGINEERING" resolves like a signal: each letter cycles through random
   glyphs, then locks in, left to right. The real letter always holds the
   space underneath, so nothing shifts while it decodes. */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';

function DecodeWord({ text }) {
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [shown, setShown] = useState(() => text.split('').map((c) => (reduce ? c : '')));
  useEffect(() => {
    if (reduce) return undefined;
    const start = performance.now() + 250;
    let raf = 0;
    const tick = (now) => {
      const t = now - start;
      const next = text.split('').map((c, i) => {
        const lock = 380 + i * 70;           // when this letter settles
        if (t >= lock) return c;
        if (t < i * 35) return '';           // not started yet
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setShown(next);
      if (t < 380 + text.length * 70) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduce]);

  return (
    <span className="decode" aria-label={text}>
      {text.split('').map((c, i) => (
        <span key={i} className="decode-cell" aria-hidden="true">
          <span className="invisible">{c}</span>
          <span className={`decode-glyph ${shown[i] === c ? 'is-set' : ''}`}>{shown[i]}</span>
        </span>
      ))}
    </span>
  );
}

/* As the page scrolls away the hero eases up and out (--out goes 0 to 1). */
function useScrollOut(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = el.offsetHeight || 1;
      el.style.setProperty('--out', Math.min(1, Math.max(0, window.scrollY / h)).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [ref]);
}

export default function Hero() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  useParticles(canvasRef);
  useScrollOut(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="hero relative flex flex-col overflow-hidden bg-canvas text-ink"
      aria-labelledby="hero-title"
    >
      <div
        className="hero-vignette absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 60% 50%, transparent 0%, color-mix(in oklab, var(--bx-canvas) 65%, transparent) 55%, var(--bx-canvas) 100%)' }}
        aria-hidden="true"
      />
      <div className="hero-aurora pointer-events-none absolute -inset-[25%] md:hidden" aria-hidden="true" />
      {/* A planet's edge at dawn. Its surface is the page itself: it is lit
          gold near the sun and settles into the page colour by the bottom of
          the hero, so the planet flows straight into the next section. */}
      <div className="hero-horizon pointer-events-none absolute inset-x-0 bottom-0 z-[2]" aria-hidden="true">
        <div className="hero-atmo" />
        <div className="hero-ground">
          <div className="hero-planet" />
          <div className="hero-rim" />
        </div>
      </div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true" />

      <div className="hero-out relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-2 px-5 pt-24 pb-[calc(130px+1.5rem)] sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-6 md:pt-24 md:pb-[24svh]">
        <div className="hero-orbit hidden md:order-2 md:block">
          <BrandOrbit />
        </div>
        <div className="relative z-10 flex flex-col items-start text-left md:order-1">
        <h1
          id="hero-title"
          className="hero-title rise-in font-display uppercase leading-[0.92]"
          style={{ '--i': 1 }}
        >
          <DecodeWord text="ENGINEERING" />
          <br />
          <span className="text-shimmer">tomorrow.</span>
        </h1>
        <div className="rise-in mt-6 max-w-xl" style={{ '--i': 2 }}>
          {/* one line at every width: on phones the size scales with the screen
              so "We engineer embedded electronics" (the longest) still fits */}
          <p className="hero-rotline flex flex-nowrap items-end gap-x-2 whitespace-nowrap text-[clamp(1.05rem, max(5vw, min(8.5vw, 1rem)), 1.5rem)] font-bold leading-tight tracking-tight sm:gap-x-2.5 sm:text-3xl">
            {/* same bottom room as the rotator (it keeps space for its underline), so both sit on one baseline */}
            <span className="pb-[0.18em]">We engineer</span>
            <WordRotator words={HERO_WORDS} className="text-accent" />
          </p>
          <p className="mt-2 text-lg leading-snug text-muted sm:text-xl">
            Intelligent hardware and software for the physical world.
          </p>
        </div>
        <SignalTiles />
        </div>
      </div>

    </section>
  );
}

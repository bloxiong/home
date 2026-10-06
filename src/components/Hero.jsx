import React, { useEffect, useRef } from 'react';
import { Button } from './ui';
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
      const count = Math.min(100, Math.floor((w * h) / 17000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.55 + 0.15,
      }));
    };

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const dark = document.documentElement.classList.contains('dark');
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

export default function Hero() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <section
      className="hero relative overflow-hidden bg-canvas text-ink"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 60% 50%, transparent 0%, color-mix(in oklab, var(--bx-canvas) 65%, transparent) 55%, var(--bx-canvas) 100%)' }}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-2 px-5 pt-20 pb-8 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-6 md:pt-24 md:pb-10">
        <div className="hidden md:order-2 md:block">
          <BrandOrbit />
        </div>
        <div className="relative z-10 flex flex-col items-start text-left md:order-1">
        <h1
          id="hero-title"
          className="hero-title rise-in font-display uppercase leading-[0.92]"
          style={{ '--i': 1 }}
        >
          <span className="split-chars" aria-label="Engineering">
            {'Engineering'.split('').map((c, i) => (
              <span key={i} aria-hidden="true" style={{ '--c': i }}>{c}</span>
            ))}
          </span>
          <br />
          <span className="text-shimmer">tomorrow.</span>
        </h1>
        <p className="rise-in mt-6 max-w-xl text-xl font-semibold leading-snug sm:text-2xl" style={{ '--i': 2 }}>
          We build intelligent hardware and software for the physical world.
        </p>
        <p className="rise-in mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg font-medium text-muted sm:text-xl" style={{ '--i': 2 }}>
          <span>We engineer</span>
          <WordRotator words={HERO_WORDS} className="font-semibold text-accent" />
        </p>
        <div className="rise-in mt-9 flex flex-wrap justify-start gap-3" style={{ '--i': 4 }}>
          <Button to="/engineering" arrow>Explore our technology</Button>
          <Button to="/contact?topic=invest" variant="secondary">Partner with BLOXio</Button>
        </div>
        </div>
      </div>

    </section>
  );
}

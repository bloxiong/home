import React, { useEffect, useRef } from 'react';
import { useInView } from '../lib/ui-utils';

/* Brand piece built from the BLOXio lockup taken apart. The five stars
   keep their places from the logo and come alive: the small stars float
   and twinkle, pulses of light run out from the large star and make each
   one flare in turn, and a slow glint turns behind the large star. As each star flares, its discipline
   appears beside it on a fine leader line. Scrolling feeds energy. On
   entry the small stars fly out of the large one to their places.
   Decorative only: aria-hidden. */

// One discipline per small star; it appears when that star flares.
const LABELS = ['Electronics', 'AI', 'IoT', 'Cloud'];

// Small-star positions from the lockup, relative to the large star, in
// units of the large star's width (lockup: star 280px wide, small stars
// about 205px across and 171px up/down from its centre).
const HOMES = [
  { dx: -0.73, dy: -0.61 },
  { dx: 0.73,  dy: -0.61 },
  { dx: 0.73,  dy: 0.61 },
  { dx: -0.73, dy: 0.61 },
];
const PULSE_EVERY = 1.1; // seconds between pulses (at rest)


export default function BrandOrbit({ className = '' }) {
  const [viewRef, inView] = useInView({ rootMargin: '0px 0px -15% 0px' });
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const starRefs = useRef([]);
  const labelRefs = useRef([]);
  const burst = useRef(0);

  useEffect(() => {
    if (inView) burst.current = performance.now();
  }, [inView]);

  useEffect(() => {
    const stage = stageRef.current, canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, S = 0, raf = 0, running = false, last = performance.now();
    let clock = 0, energy = 0, lastY = window.scrollY, pulseClock = 0, nextStar = 0;
    const pulses = [];          // { star, t } light running hub -> star
    const flare = [0, 0, 0, 0]; // per-star flare level 0..1
    const age = [Infinity, Infinity, Infinity, Infinity]; // seconds since each star's label appeared

    const resize = () => {
      W = stage.clientWidth; H = stage.clientHeight; S = W * 0.9375;
      stage.dataset.compact = W < 380 ? 'true' : 'false';
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const home = (i, grow) => {
      const h = HOMES[i], w = S * 0.2;
      const fx = Math.sin(clock * 0.9 + i * 1.9) * S * 0.008;
      const fy = Math.cos(clock * 0.7 + i * 1.3) * S * 0.01;
      return { x: W / 2 + (h.dx * w + fx) * grow, y: H / 2 + (h.dy * w + fy) * grow };
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      energy *= 0.94;
      const speed = 1 + energy;
      clock += dt * speed;

      const bt = Math.min((now - burst.current) / 1300, 1);
      const grow = reduce ? 1 : 1 + 2.2 * Math.pow(bt - 1, 3) + 1.2 * Math.pow(bt - 1, 2);
      const cx = W / 2, cy = H / 2;
      const G = '229,192,138'; // the hero is always night, so always bright gold

      ctx.clearRect(0, 0, W, H);

      // entry: a ring of light expands from the large star as it appears
      if (!reduce && bt < 1) {
        const k = 1 - Math.pow(1 - bt, 2);
        ctx.beginPath();
        ctx.arc(cx, cy, S * 0.08 + k * S * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${G},${(0.55 * (1 - bt)).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // rotating glint behind the large star
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(clock * 0.25);
      for (let k = 0; k < 4; k++) {
        ctx.rotate(Math.PI / 2);
        const g = ctx.createLinearGradient(0, 0, S * 0.32, 0);
        g.addColorStop(0, `rgba(${G},0.35)`);
        g.addColorStop(1, `rgba(${G},0)`);
        ctx.beginPath();
        ctx.moveTo(0, -S * 0.006);
        ctx.lineTo(S * 0.32, 0);
        ctx.lineTo(0, S * 0.006);
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.restore();
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.22);
      halo.addColorStop(0, `rgba(${G},${0.18 + 0.06 * Math.sin(clock * 1.6)})`);
      halo.addColorStop(1, `rgba(${G},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      // constellation lines from the large star to each small one
      const homes = HOMES.map((_, i) => home(i, grow));
      homes.forEach((p, i) => {
        const g = ctx.createLinearGradient(cx, cy, p.x, p.y);
        g.addColorStop(0, `rgba(${G},0)`);
        g.addColorStop(1, `rgba(${G},${0.22 + flare[i] * 0.5})`);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.stroke();
      });

      // light pulses running out to the small stars, one after another
      if (!reduce && bt >= 1) {
        pulseClock += dt * speed;
        if (pulseClock > PULSE_EVERY) {
          pulseClock = 0;
          pulses.push({ star: nextStar, t: 0 });
          nextStar = (nextStar + 1) % HOMES.length;
        }
      }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pl = pulses[k];
        pl.t += dt * speed * 1.25;
        const p = homes[pl.star];
        const u = Math.min(pl.t, 1);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; // ease in-out
        const x = cx + (p.x - cx) * e, y = cy + (p.y - cy) * e;
        const tail = Math.max(e - 0.18, 0);
        const tg = ctx.createLinearGradient(cx + (p.x - cx) * tail, cy + (p.y - cy) * tail, x, y);
        tg.addColorStop(0, `rgba(${G},0)`);
        tg.addColorStop(1, `rgba(${G},0.8)`);
        ctx.strokeStyle = tg; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx + (p.x - cx) * tail, cy + (p.y - cy) * tail); ctx.lineTo(x, y); ctx.stroke();
        const g = ctx.createRadialGradient(x, y, 0, x, y, S * 0.03);
        g.addColorStop(0, 'rgba(255,236,200,0.95)');
        g.addColorStop(1, `rgba(${G},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, S * 0.03, 0, Math.PI * 2); ctx.fill();
        if (pl.t >= 1) { flare[pl.star] = 1; age.fill(Infinity); age[pl.star] = 0; pulses.splice(k, 1); }
      }


      // small stars: float, twinkle, flare when a pulse arrives
      homes.forEach((p, i) => {
        const el = starRefs.current[i];
        if (!el) return;
        flare[i] *= Math.exp(-dt * 4);
        const tw = 1 + 0.08 * Math.sin(clock * 2.2 + i * 1.7) + flare[i] * 0.35;
        const rot = Math.sin(clock * 0.8 + i) * 10 + flare[i] * 25;
        el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${rot.toFixed(1)}deg) scale(${(tw * Math.max(grow, 0.01)).toFixed(3)})`;
        el.style.filter = `drop-shadow(0 0 ${(8 + flare[i] * 22).toFixed(1)}px rgba(229,192,138,${(0.45 + flare[i] * 0.5).toFixed(2)})) brightness(${(1 + flare[i] * 0.5).toFixed(2)})`;
      });

      // the flaring star's discipline: sharpens in, holds crisp, fades out.
      // One label at a time; on narrow screens it sits under the cluster.
      homes.forEach((p, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        age[i] += dt;
        const a = age[i];
        const enter = Math.min(a / 0.35, 1);
        const leave = Math.min(Math.max((a - PULSE_EVERY * 0.75) / 0.3, 0), 1);
        const side = HOMES[i].dx < 0 ? -1 : 1;
        el.style.transform = W < 380
          ? `translate(${cx.toFixed(1)}px, ${(cy - S * 0.27).toFixed(1)}px) translate(-50%, -50%)`
          : `translate(${(p.x + side * S * 0.07).toFixed(1)}px, ${p.y.toFixed(1)}px) translate(${side < 0 ? '-100%' : '0'}, -50%)`;
        el.style.setProperty('--l', enter.toFixed(3));
        el.style.opacity = Math.min(enter, 1 - leave).toFixed(3);
      });

      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true; last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const onScroll = () => {
      const y = window.scrollY;
      energy = Math.min(energy + Math.abs(y - lastY) / 50, 4);
      lastY = y;
    };

    resize();
    if (reduce) frame(performance.now());
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !reduce ? start() : stop()));
    io.observe(stage);
    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(performance.now()); });
    ro.observe(stage);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      stop(); io.disconnect(); ro.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={viewRef} className={`bx-art ${inView ? 'is-in' : ''} ${className}`} aria-hidden="true">
      <div ref={stageRef} className="bx-art-stage">
        <canvas ref={canvasRef} className="bx-art-canvas" />
        <img src="/brand/star.png" alt="" className="bx-hub" draggable="false" />
        {HOMES.map((_, i) => (
          <img
            key={i}
            ref={(el) => { starRefs.current[i] = el; }}
            src="/brand/star.png"
            alt=""
            className="bx-star"
            draggable="false"
          />
        ))}
        {LABELS.map((label, i) => (
          <span
            key={label}
            ref={(el) => { labelRefs.current[i] = el; }}
            className={`bx-label ${HOMES[i].dx < 0 ? 'is-left' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="bx-mark">
        <span className="bx-shine bx-wordmark" style={{ '--mask': 'url(/brand/wordmark.png)' }}>
          <img src="/brand/wordmark.png" alt="" width="520" height="98" draggable="false" />
        </span>
        <span className="bx-shine bx-tagline" style={{ '--mask': 'url(/brand/tagline.png)' }}>
          <img src="/brand/tagline.png" alt="" width="785" height="70" draggable="false" />
        </span>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

/* Site-wide sky: twinkling dots, a few four-point sparkles in the logo's
   star shape, and the occasional shooting star. A fixed layer above the
   sections (so it reaches photos and dark bands alike) that ignores the
   pointer. Three depth layers drift with the scroll. Sparse and faint so
   text stays readable; softer in light mode; a still sky when motion is
   reduced; paused when the tab is hidden. */
const LAYERS = [
  { count: 0.00009, depth: 0.04, size: [0.4, 0.9] },
  { count: 0.00005, depth: 0.09, size: [0.7, 1.3] },
  { count: 0.000018, depth: 0.16, size: [1.0, 1.8] },
];
const SPARKLE_SHARE = 0.12; // share of the nearest layer drawn as four-point stars

function sparkle(ctx, x, y, r) {
  // four-point star: long thin points, like the logo's stars
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.12, y - r * 0.12, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.12, y + r * 0.12, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.12, y + r * 0.12, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.12, y - r * 0.12, x, y - r);
  ctx.fill();
}

export default function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, stars = [], shooting = null, nextShot = 1.5, raf = 0, last = performance.now(), t = 0;

    const build = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      LAYERS.forEach((L, li) => {
        const n = Math.round(W * H * L.count);
        for (let i = 0; i < n; i++) {
          stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
            depth: L.depth,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.6,
            sparkle: li === LAYERS.length - 1 && Math.random() < SPARKLE_SHARE * 4,
            green: Math.random() < 0.18,
          });
        }
      });
    };

    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      const dark = document.documentElement.classList.contains('dark');
      const gold = dark ? '229,192,138' : '140,92,22';
      const green = dark ? '111,211,157' : '23,106,65';
      const base = dark ? 0.55 : 0.75;
      const sy = window.scrollY;

      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const y = (((s.y - sy * s.depth) % H) + H) % H;
        const tw = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const a = base * (0.25 + 0.75 * tw);
        ctx.fillStyle = `rgba(${s.green ? green : gold},${a.toFixed(3)})`;
        if (s.sparkle) {
          sparkle(ctx, s.x, y, s.r * (2.6 + 2.4 * tw));
        } else {
          ctx.beginPath();
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduce) {
        nextShot -= dt;
        if (!shooting && nextShot <= 0) {
          const fromLeft = Math.random() < 0.5;
          shooting = {
            x: fromLeft ? Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5,
            y: Math.random() * H * 0.4,
            vx: (fromLeft ? 1 : -1) * (600 + Math.random() * 300),
            vy: 260 + Math.random() * 160,
            life: 0,
          };
          nextShot = 2.5 + Math.random() * 3.5;
        }
        if (shooting) {
          const s = shooting;
          s.life += dt;
          s.x += s.vx * dt; s.y += s.vy * dt;
          const len = 0.12;
          const fade = Math.max(0, 1 - s.life / 1.1);
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * len, s.y - s.vy * len);
          g.addColorStop(0, `rgba(${gold},${(0.9 * fade).toFixed(3)})`);
          g.addColorStop(1, `rgba(${gold},0)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * len, s.y - s.vy * len);
          ctx.stroke();
          if (fade <= 0 || s.x < -200 || s.x > W + 200 || s.y > H + 200) shooting = null;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(draw); };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : !reduce && start());
    const onResize = () => { build(); if (reduce) draw(performance.now()); };
    const onScroll = () => { if (reduce) draw(performance.now()); };

    build();
    if (reduce) draw(performance.now()); else start();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    // redraw when the theme flips so colours update even when still
    const mo = new MutationObserver(() => { if (reduce) draw(performance.now()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      mo.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden="true" />;
}

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, ChevronsDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMG, PRODUCTS } from '../content/site';
import { StatusBadge } from './ui';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    headline: 'WE ENGINEER.',
    body: 'Research across AI, IoT and advanced electronics, carried all the way to products that can be manufactured.',
    img: IMG.lab,
  },
  {
    headline: 'WE INNOVATE.',
    body: 'Devices, sensors and software designed as one system, so the data turns into decisions.',
    img: IMG.network,
  },
  {
    headline: 'WE DELIVER.',
    body: 'Rooted in Nigeria, built for the world. Starting on Nigerian farms with AgroSense360.',
    img: IMG.field,
  },
];

/* Where the cinematic intro ends. The skip button and the hero's
   secondary scroll target both land here. */
export const INTRO_END_ID = 'overview';

const smoothTo = (el) => {
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' });
};

/* split a string into per-character spans for staggered reveal */
const SplitChars = ({ text }) => (
  <span className="split-text" aria-label={text}>
    {text.split('').map((c, i) => (
      <span key={i} className="split-char" aria-hidden="true">{c}</span>
    ))}
  </span>
);

export default function CinematicHero() {
  const rootRef    = useRef(null);
  const canvasRef  = useRef(null);
  const heroRef    = useRef(null);
  const taglineRef = useRef(null);
  const heroBgRef  = useRef(null);
  const heroFgRef  = useRef(null);
  const ringRef    = useRef(null);
  const storyRef   = useRef(null);
  const horizRef   = useRef(null);
  const trackRef   = useRef(null);
  const ctaRef     = useRef(null);
  const barRef     = useRef(null);

  const [showSkip, setShowSkip] = useState(true);

  /* ── Particle network canvas. Paused whenever the hero is off-screen
        so it never costs frames while the visitor reads further down. ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, running = false, pts = [];
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 16000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.55 + 0.15,
      }));
    };

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 200 && md > 0) { p.dx += (mdx / md) * 0.012; p.dy += (mdy / md) * 0.012; }
        p.dx *= 0.985; p.dy *= 0.985;
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,150,85,${p.o})`;
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
            ctx.strokeStyle = `rgba(189,138,76,${0.09 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(draw); } };
    const stop  = () => { running = false; cancelAnimationFrame(raf); };

    const onMove  = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    resize();
    if (reduce) draw(); // one static frame
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => {
      stop(); io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* ── Mouse-driven tilt on the hero foreground (fine pointers only) ── */
  useEffect(() => {
    const fg = heroFgRef.current;
    if (!fg || !window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const rx = gsap.quickTo(fg, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(fg, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      ry(x * 6); rx(-y * 6);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Scroll choreography ──────────────────────────────────────────
        Desktop: short pinned scenes (≈5 screens total, was ≈17).
        Phones:  no pinning at all; the same content scrolls normally
                 with one-shot reveals and a native swipe row.
        Reduced motion: everything static and visible. */
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(rootRef);

    mm.add(
      {
        desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        mobile:  '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const { desktop } = context.conditions;

        /* SCENE 1: intro letter reveal + hero fade-in */
        // Drop the transform afterwards: a transformed child breaks the gold
        // background-clip:text shimmer on its parent line.
        gsap.to('.split-char', {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.022, delay: 0.1,
          onComplete() {
            this.targets().forEach((el) => { el.style.transform = 'none'; el.style.opacity = '1'; el.style.willChange = 'auto'; });
          },
        });
        gsap.from('.hero-fadein', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.45 });

        /* SCENE 1: parallax on scroll-out (not pinned) */
        gsap.timeline({
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.3 },
        })
          .to(heroBgRef.current,  { scale: 1.2, y: -80, ease: 'none' }, 0)
          .to(heroFgRef.current,  { y: -160, opacity: 0, ease: 'none' }, 0)
          .to(taglineRef.current, { y: -100, opacity: 0, ease: 'none' }, 0)
          .to(ringRef.current,    { scale: 1.5, rotate: 90, opacity: 0, ease: 'none' }, 0);

        /* SCENE 2: chapters unravel bottom-to-top */
        const story = storyRef.current;
        const chapters = story ? gsap.utils.toArray(story.querySelectorAll('.chapter')) : [];
        const HIDDEN_CLIP = 'inset(100% 0% 0% 0% round 28px)';
        const FULL_CLIP   = 'inset(0% 0% 0% 0% round 28px)';

        if (desktop && chapters.length) {
          const parts = chapters.map((ch) => ({
            card:  ch.querySelector('.chapter-card'),
            img:   ch.querySelector('.chapter-img'),
            words: ch.querySelectorAll('.word-rise'),
          }));
          parts.forEach(({ card, img, words }) => {
            gsap.set(card,  { clipPath: HIDDEN_CLIP });
            gsap.set(img,   { scale: 1.3 });
            gsap.set(words, { yPercent: 110, opacity: 0 });
          });

          // Chapter 1 unravels while the section scrolls into view.
          gsap.timeline({ scrollTrigger: { trigger: story, start: 'top bottom', end: 'top top', scrub: 0.4 } })
            .to(parts[0].card,  { clipPath: FULL_CLIP, ease: 'power3.inOut' }, 0)
            .to(parts[0].img,   { scale: 1.05, ease: 'none' }, 0)
            .to(parts[0].words, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out' }, 0.2);

          // The rest unravel over it during a short pin (0.6 screens each).
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: story,
              start: 'top top',
              end: () => `+=${(chapters.length - 1) * window.innerHeight * 0.6 + window.innerHeight * 0.15}`,
              pin: true,
              scrub: 0.4,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          parts.slice(1).forEach(({ card, img, words }) => {
            tl.to(card,  { clipPath: FULL_CLIP, duration: 1, ease: 'power3.inOut' })
              .to(img,   { scale: 1.05, duration: 1.1, ease: 'none' }, '<')
              .to(words, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out' }, '<+=0.2')
              .to({}, { duration: 0.25 });
          });
        } else {
          // Phones: each card unravels once as it enters. No scrub, no pin.
          chapters.forEach((ch) => {
            const card  = ch.querySelector('.chapter-card');
            const words = ch.querySelectorAll('.word-rise');
            gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 82%', once: true } })
              .fromTo(card, { clipPath: HIDDEN_CLIP }, { clipPath: FULL_CLIP, duration: 0.9, ease: 'power3.inOut' })
              .from(words, { yPercent: 110, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, '-=0.45');
          });
        }

        /* SCENE 3: product line. Desktop: pinned horizontal track that moves
           ~1.8px sideways per 1px scrolled, so it is over in under two screens.
           Phones: a native swipe row, no JS needed. */
        const horiz = horizRef.current;
        const track = trackRef.current;
        if (desktop && horiz && track) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const horizTween = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: horiz,
              start: 'top top',
              end: () => `+=${distance() * 0.55}`,
              pin: true,
              scrub: 0.4,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          track.querySelectorAll('.panel').forEach((panel) => {
            const img = panel.querySelector('.panel-img');
            if (img) {
              gsap.fromTo(img, { scale: 1.2 }, {
                scale: 1, ease: 'none',
                scrollTrigger: { trigger: panel, containerAnimation: horizTween, start: 'left right', end: 'right left', scrub: true },
              });
            }
            const rises = panel.querySelectorAll('.panel-rise');
            if (rises.length) {
              gsap.fromTo(rises, { y: 40, opacity: 0 }, {
                y: 0, opacity: 1, stagger: 0.06, ease: 'power2.out',
                scrollTrigger: { trigger: panel, containerAnimation: horizTween, start: 'left 90%', end: 'left 55%', scrub: true },
              });
            }
          });
        }

        /* SCENE 4: brand stamp */
        const cta = ctaRef.current;
        if (cta) {
          gsap.from(cta.querySelectorAll('.cta-rise'), {
            y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: cta, start: 'top 75%', once: true },
          });
          const stamp = cta.querySelector('.brand-stamp');
          if (stamp) {
            gsap.from(stamp, {
              scale: 0.75, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out',
              scrollTrigger: { trigger: cta, start: 'top 70%', once: true },
            });
          }
        }
      },
    );

    /* Progress bar + skip button, all motion modes. Written straight to
       the DOM so scrolling never re-renders this component. */
    const progressST = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
        // Phones scroll the intro natively, so the pill only helps on the
        // first screen there; on desktop it stays until the pins are done.
        const show = window.innerWidth < 768
          ? window.scrollY < window.innerHeight * 0.8
          : self.progress < 0.9;
        setShowSkip((prev) => (prev === show ? prev : show));
      },
    });

    // Re-measure pins once fonts and images settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      mm.revert();
      progressST.kill();
      window.removeEventListener('load', refresh);
    };
  }, []);

  const skipIntro = () => smoothTo(document.getElementById(INTRO_END_ID));

  return (
    <div ref={rootRef} className="relative bg-black" data-cinematic data-always-dark>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-amber-500/10 pointer-events-none" aria-hidden="true">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"
          style={{ transform: 'scaleX(0)', boxShadow: '0 0 14px rgba(201,150,85,0.7)' }}
        />
      </div>

      {/* Skip intro */}
      <button
        type="button"
        onClick={skipIntro}
        tabIndex={showSkip ? 0 : -1}
        aria-hidden={!showSkip}
        className={`fixed z-[55] bottom-6 left-6 sm:bottom-8 sm:left-8 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/75 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-amber-200 shadow-lg shadow-black/40 hover:border-amber-400 hover:text-amber-100 transition-all duration-300 ${
          showSkip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        Skip intro <ChevronsDown size={16} />
      </button>

      {/* SCENE 1: hero */}
      <section
        id="home"
        ref={heroRef}
        className="relative h-[100svh] w-full overflow-hidden bg-black film-grain pin-stage"
      >
        <div ref={heroBgRef} className="absolute inset-0 will-change-transform">
          <img
            src={IMG.circuit}
            alt=""
            className="w-full h-full object-cover opacity-40"
            style={{ filter: 'saturate(1.1) contrast(1.05)' }}
            fetchPriority="high"
          />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 0%, rgba(0,0,0,0.55) 55%, #000 100%)' }} />
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[1] pointer-events-none" aria-hidden="true" />

        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(circle,rgba(189,138,76,0.18) 0%,transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(circle,rgba(168,116,60,0.14) 0%,transparent 70%)', filter: 'blur(100px)' }} />

        <div ref={ringRef}
          className="orbit-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vmin] h-[110vmin] pointer-events-none z-[2]">
          <div className="absolute inset-0 rounded-full border border-amber-500/15" />
          <div className="absolute inset-[6%] rounded-full border border-amber-500/10" />
          <div className="absolute inset-[14%] rounded-full border border-amber-500/8 border-dashed" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_18px_4px_rgba(201,150,85,0.8)]" />
        </div>

        <div ref={heroFgRef} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 tilt-card">
          <h1
            className="font-display font-black text-white leading-[0.92] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 9vw, 6rem)' }}
          >
            <span className="block overflow-hidden"><SplitChars text="ENGINEERING" /></span>
            <span className="block overflow-hidden text-shimmer"><SplitChars text="TOMORROW." /></span>
          </h1>

          <p ref={taglineRef} className="hero-fadein text-white/70 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-10">
            Bloxio is a Lagos engineering company building hardware, software and AI products,
            starting with AgroSense360 for Nigerian farms.
          </p>

          <div className="hero-fadein flex flex-wrap gap-3 justify-center">
            <Link
              to="/products/agrosense360"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-7 py-3.5 rounded-full font-bold text-sm tracking-[0.14em] uppercase hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 font-display"
            >
              See AgroSense360
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-amber-500/40 text-amber-200 px-7 py-3.5 rounded-full font-bold text-sm tracking-[0.14em] uppercase hover:bg-amber-500/10 hover:border-amber-500/70 hover:-translate-y-0.5 transition-all duration-300 font-display"
            >
              Work with us
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => smoothTo(storyRef.current)}
          className="hero-fadein absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-amber-500/80 hover:text-amber-300 transition-colors"
          aria-label="Scroll to the story"
        >
          <span className="text-micro tracking-[0.3em] font-semibold uppercase">Scroll</span>
          <span className="w-px h-10 bg-gradient-to-b from-amber-500/60 to-transparent" />
          <ChevronDown size={16} className="animate-bounce" />
        </button>

        <div className="fog-bottom absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none" />
      </section>

      {/* SCENE 2: chapters. Pinned stack on desktop, normal cards on phones. */}
      <section ref={storyRef} className="relative w-full bg-black md:motion-safe:h-screen md:motion-safe:overflow-hidden py-6 md:motion-safe:py-0">
        <div className="hidden md:motion-safe:block absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(189,138,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(189,138,76,0.05) 1px,transparent 1px)',
            backgroundSize: '70px 70px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)',
          }} />

        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.headline}
            className="chapter relative md:motion-safe:absolute md:motion-safe:inset-0 px-4 sm:px-8 py-3 md:motion-safe:pt-20 md:motion-safe:pb-10 flex items-center justify-center"
            style={{ zIndex: 10 + i }}
          >
            <div
              className="chapter-card relative w-full max-w-7xl h-[72svh] md:motion-safe:h-full rounded-[28px] overflow-hidden border border-amber-500/15 shadow-2xl shadow-black/70"
              style={{ willChange: 'clip-path' }}
            >
              <img
                src={ch.img}
                alt=""
                className="chapter-img absolute inset-0 w-full h-full object-cover will-change-transform"
                style={{ filter: 'brightness(0.55) saturate(0.95)' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 80%, rgba(189,138,76,0.22) 0%, transparent 60%)' }} />

              <div className="relative z-10 h-full flex flex-col justify-end max-w-5xl mx-auto px-6 sm:px-14 pb-10 sm:pb-16">
                <h2 className="font-display font-black text-white leading-[0.94] mb-6 tracking-tight"
                  style={{ fontSize: 'clamp(2.2rem, 8vw, 6rem)' }}>
                  {ch.headline.split(' ').map((w, j) => (
                    <span key={j} className="inline-block overflow-hidden align-bottom mr-[0.18em]">
                      <span className="word-rise inline-block">{w}</span>
                    </span>
                  ))}
                </h2>

                <p className="text-white/80 text-base sm:text-xl max-w-xl leading-relaxed mb-8">
                  <span className="inline-block overflow-hidden align-bottom">
                    <span className="word-rise inline-block">{ch.body}</span>
                  </span>
                </p>

                <div className="flex items-center gap-3" aria-hidden="true">
                  {CHAPTERS.map((_, j) => (
                    <div key={j} className={`h-px ${j === i ? 'w-16 bg-amber-400' : 'w-8 bg-amber-500/25'}`} />
                  ))}
                  <span className="text-white/50 text-xs font-display tracking-[0.3em] ml-3">
                    0{i + 1} / 0{CHAPTERS.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="hidden md:motion-safe:block fog-top absolute top-0 left-0 right-0 h-24 z-[2] pointer-events-none" />
        <div className="hidden md:motion-safe:block fog-bottom absolute bottom-0 left-0 right-0 h-24 z-[2] pointer-events-none" />
      </section>

      {/* SCENE 3: the product line. Pinned horizontal on desktop, swipe row on phones. */}
      <section ref={horizRef} className="relative w-full bg-black md:motion-safe:h-screen md:motion-safe:overflow-hidden py-16 md:motion-safe:py-0">
        <div className="md:motion-safe:hidden px-6 mb-8 md:max-w-2xl md:mx-auto md:text-center">
          <h2 className="font-display font-black text-white text-3xl leading-tight mb-3">What we’re building</h2>
          <p className="text-white/65 text-base leading-relaxed">
            One product in active development, five more lines we are exploring. Swipe to see them.
          </p>
        </div>

        <div
          ref={trackRef}
          className="h-track flex gap-4 md:motion-safe:gap-0 md:motion-safe:h-full overflow-x-auto md:motion-safe:overflow-visible snap-x snap-mandatory md:motion-safe:snap-none no-scrollbar px-6 md:motion-safe:px-0 md:motion-safe:w-max"
        >
          {/* Intro panel (desktop) */}
          <div className="panel hidden md:motion-safe:flex relative h-screen items-center px-16 shrink-0 w-[40vw] min-w-[440px]">
            <div className="max-w-md">
              <h2 className="panel-rise font-display font-black text-white leading-[0.98] mb-6"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.75rem)' }}>
                What we’re <span className="text-shimmer">building.</span>
              </h2>
              <p className="panel-rise text-white/65 text-lg leading-relaxed">
                One product in active development, and five product lines we are exploring next.
              </p>
            </div>
          </div>

          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              to={p.live ? `/products/${p.slug}` : `/products#${p.slug}`}
              className="panel group relative shrink-0 snap-center w-[82vw] h-[64svh] md:w-[36vw] md:min-w-[420px] md:motion-safe:h-screen md:motion-safe:py-16 md:motion-safe:px-3"
            >
              <div className="relative h-full rounded-3xl overflow-hidden border border-amber-500/15 group-hover:border-amber-500/45 transition-colors duration-300">
                <img
                  src={p.img}
                  alt=""
                  className="panel-img absolute inset-0 w-full h-full object-cover will-change-transform"
                  style={{ filter: 'brightness(0.62) saturate(1.05)' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                <div className="relative z-10 h-full flex flex-col justify-end p-7 sm:p-9">
                  <div className="panel-rise mb-4"><StatusBadge status={p.status} live={p.live} onDark /></div>
                  <h3 className="panel-rise font-display font-black text-white leading-[1.02] mb-3 text-2xl sm:text-3xl">
                    {p.name}
                  </h3>
                  <p className="panel-rise text-white/75 text-sm sm:text-base leading-relaxed max-w-sm mb-5">{p.blurb}</p>
                  <span className="panel-rise inline-flex items-center gap-2 text-amber-300 text-sm font-semibold">
                    {p.live ? 'See the product' : 'Learn more'}
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Outro panel (desktop) */}
          <div className="panel hidden md:motion-safe:flex relative h-screen items-center justify-center px-16 shrink-0 w-[28vw] min-w-[340px]">
            <Link
              to="/products"
              className="panel-rise inline-flex items-center gap-3 border border-amber-500/40 text-amber-200 px-6 py-3 rounded-full text-xs font-bold tracking-[0.22em] uppercase hover:bg-amber-500/10 hover:border-amber-500/70 transition-all font-display"
            >
              All products <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="md:motion-safe:hidden px-6 mt-8 md:text-center">
          <Link to="/products" className="inline-flex items-center gap-2 text-amber-300 font-semibold">
            All products <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* SCENE 4: brand stamp */}
      <section ref={ctaRef} className="relative py-20 md:py-24 w-full overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(189,138,76,0.10) 0%, transparent 70%)' }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] pointer-events-none orbit-spin">
          <div className="absolute inset-0 rounded-full border border-amber-500/10" />
          <div className="absolute inset-[8%] rounded-full border border-amber-500/8 border-dashed" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div className="cta-rise mb-10 flex justify-center">
            <img
              src="/bloxio-lockup.webp"
              alt="Bloxio. One step ahead of tech."
              width="1400"
              height="948"
              className="brand-stamp h-auto select-none pointer-events-none"
              style={{
                width: 'clamp(240px, 40vw, 520px)',
                filter: 'drop-shadow(0 0 60px rgba(189,138,76,0.4))',
              }}
              loading="lazy"
              draggable="false"
            />
          </div>

          <div className="cta-rise flex items-center gap-4 justify-center">
            <span className="block w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
            <span className="text-micro font-semibold text-amber-400 tracking-[0.3em] uppercase">Engineering Tomorrow</span>
            <span className="block w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ArrowRight, Cpu, Wifi, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────
   Cinematic visuals — large hero imagery sourced
   from Unsplash (stable photo IDs). Each layer is
   wrapped in a div so we can parallax it on scroll.
   ─────────────────────────────────────────────── */
const HERO_IMG  = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80';
const SKY_IMG   = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80';
const CITY_IMG  = 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1920&q=80';
const LAB_IMG   = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1920&q=80';
const FIELD_IMG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80';
const DRONE_IMG = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1920&q=80';
const NET_IMG   = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920&q=80';

const CHAPTERS = [
  {
    kicker: 'Chapter 01',
    headline: 'WE ENGINEER.',
    body: 'Deep-stack research across AI, IoT and advanced electronics — frontier science forged into manufacturable products.',
    img: LAB_IMG,
  },
  {
    kicker: 'Chapter 02',
    headline: 'WE INNOVATE.',
    body: 'From sketch to shelf. Smart device ecosystems that connect sensors, software and people into one fluent system.',
    img: NET_IMG,
  },
  {
    kicker: 'Chapter 03',
    headline: 'WE DELIVER.',
    body: 'Rooted in Nigeria, built for the world. Hardware and software that scale beyond borders with global standards.',
    img: FIELD_IMG,
  },
];

const SHOWCASE = [
  { tag: 'AI · IoT',     title: 'AgroSense360',     sub: 'Smart farming intelligence',  img: FIELD_IMG },
  { tag: 'R&D',          title: 'Adaptive Systems', sub: 'Sensors that think',          img: LAB_IMG },
  { tag: 'Edge',         title: 'Aerial Vision',    sub: 'Drones with foresight',       img: DRONE_IMG },
  { tag: 'Cloud',        title: 'Mesh Network',     sub: 'Devices that orchestrate',    img: NET_IMG },
  { tag: 'Future',       title: 'Lagos · 2030',     sub: 'Engineering tomorrow',        img: CITY_IMG },
];

/* split a string into per-character spans for staggered reveal */
const SplitChars = ({ text, className = '' }) => (
  <span className={`split-text ${className}`} aria-label={text}>
    {text.split('').map((c, i) => (
      <span key={i} className="split-char" aria-hidden="true">
        {c === ' ' ? ' ' : c}
      </span>
    ))}
  </span>
);

export default function CinematicHero() {
  const rootRef    = useRef(null);
  const canvasRef  = useRef(null);
  const heroRef    = useRef(null);
  const titleRef   = useRef(null);
  const taglineRef = useRef(null);
  const heroBgRef  = useRef(null);
  const heroFgRef  = useRef(null);
  const ringRef    = useRef(null);

  const storyRef     = useRef(null);
  const storyImgRefs = useRef([]);
  const storyTxtRefs = useRef([]);

  const horizRef  = useRef(null);
  const trackRef  = useRef(null);

  const stackRef  = useRef(null);
  const cardsRef  = useRef([]);

  const ctaRef    = useRef(null);

  const [progress, setProgress] = useState(0);

  /* ── Particle / network canvas (intro background) ────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, pts = [], mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(140, Math.floor((canvas.width * canvas.height) / 14000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.55 + 0.15,
      }));
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p, i) => {
        // gentle attraction toward cursor
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md  = Math.hypot(mdx, mdy);
        if (md < 200) {
          p.dx += (mdx / md) * 0.012;
          p.dy += (mdy / md) * 0.012;
        }
        p.dx *= 0.985; p.dy *= 0.985;
        p.x  += p.dx;  p.y  += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,150,85,${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(189,138,76,${0.09 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* ── Mouse-driven 3D tilt on the hero foreground ─────────── */
  useEffect(() => {
    const fg = heroFgRef.current;
    if (!fg) return;
    let rect = fg.getBoundingClientRect();
    const onResize = () => { rect = fg.getBoundingClientRect(); };
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      gsap.to(fg, {
        rotationY: x * 6,
        rotationX: -y * 6,
        x: x * 14,
        y: y * 14,
        duration: 0.9,
        ease: 'power3.out',
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* ── Master scroll-driven timeline ───────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      /* SCENE 1 — intro letter reveal on mount */
      gsap.to('.split-char', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.025,
        delay: 0.1,
      });

      gsap.from('.hero-fadein', {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.6,
      });

      /* SCENE 1 — pinned hero parallax on scroll out */
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
        .to(heroBgRef.current, { scale: 1.25, y: -80, ease: 'none' }, 0)
        .to(heroFgRef.current, { y: -180, opacity: 0, ease: 'none' }, 0)
        .to(taglineRef.current, { y: -120, opacity: 0, ease: 'none' }, 0)
        .to(ringRef.current,    { scale: 1.6, rotate: 90, opacity: 0, ease: 'none' }, 0);

      /* SCENE 2 — pinned story chapters: each card unravels bottom→top
         via animated clip-path with rounded edges. Text rises word-by-word
         from overflow-hidden masks. Scrolling up auto-reverses (scrub). */
      const story = storyRef.current;
      if (story) {
        const chapters = story.querySelectorAll('.chapter');
        const HIDDEN_CLIP = 'inset(100% 0% 0% 0% round 32px)';
        const FULL_CLIP   = 'inset(0% 0% 0% 0% round 32px)';

        // Pre-pin: chapter 0 unravels in as the section scrolls into view,
        // so when the pin engages it's already on screen.
        const ch0 = chapters[0];
        if (ch0) {
          const card0  = ch0.querySelector('.chapter-card');
          const img0   = ch0.querySelector('.chapter-img');
          const words0 = ch0.querySelectorAll('.word-rise');
          gsap.set(card0,  { clipPath: HIDDEN_CLIP, willChange: 'clip-path' });
          gsap.set(img0,   { scale: 1.35 });
          gsap.set(words0, { yPercent: 110, opacity: 0 });

          gsap.timeline({
            scrollTrigger: {
              trigger: story,
              start: 'top bottom',
              end: 'top top',
              scrub: 0.8,
            },
          })
            .to(card0,  { clipPath: FULL_CLIP, ease: 'power3.inOut' }, 0)
            .to(img0,   { scale: 1.05, ease: 'none' }, 0)
            .to(words0, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'power3.out' }, 0.2);
        }

        // Pinned timeline for chapters 1..n unraveling over the previous one.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: story,
            start: 'top top',
            end: () => `+=${(chapters.length - 1) * window.innerHeight * 1.25 + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        chapters.forEach((ch, i) => {
          if (i === 0) return; // chapter 0 handled by pre-pin trigger above
          const card  = ch.querySelector('.chapter-card');
          const img   = ch.querySelector('.chapter-img');
          const words = ch.querySelectorAll('.word-rise');

          gsap.set(card,  { clipPath: HIDDEN_CLIP, willChange: 'clip-path' });
          gsap.set(img,   { scale: 1.35 });
          gsap.set(words, { yPercent: 110, opacity: 0 });

          // Unravel the curved card bottom→top + image settles + words rise
          tl.to(card,  { clipPath: FULL_CLIP, duration: 1.2, ease: 'power3.inOut' }, '>+=0.05')
            .to(img,   { scale: 1.05, duration: 1.4, ease: 'none' }, '<')
            .to(words, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.045, ease: 'power3.out' }, '<+=0.25')
            .to({},    { duration: 0.6 }); // hold
        });
      }

      /* SCENE 3 — horizontal showcase */
      const horiz = horizRef.current;
      const track = trackRef.current;
      if (horiz && track) {
        const distance = () => track.scrollWidth - window.innerWidth;
        const horizTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: horiz,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // panel-level reveals (image scale & headline rise) tied to horiz scrub
        track.querySelectorAll('.panel').forEach((panel) => {
          const img = panel.querySelector('.panel-img');
          if (img) {
            gsap.fromTo(img, { scale: 1.25 }, {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizTween,
                start: 'left right',
                end:   'right left',
                scrub: true,
              },
            });
          }
          const rises = panel.querySelectorAll('.panel-rise');
          if (rises.length) {
            gsap.fromTo(rises, { y: 60, opacity: 0 }, {
              y: 0,
              opacity: 1,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizTween,
                start: 'left 85%',
                end:   'left 40%',
                scrub: true,
              },
            });
          }
        });
      }

      /* SCENE 4 — stacked cards reveal */
      const stack = stackRef.current;
      if (stack && cardsRef.current.length) {
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          if (i === 0) return; // first card already in place
          gsap.fromTo(card,
            { yPercent: 100, scale: 0.92, opacity: 0.6 },
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: stack,
                start: () => `top+=${(i - 0.7) * window.innerHeight * 0.7} top`,
                end:   () => `top+=${(i + 0.3) * window.innerHeight * 0.7} top`,
                scrub: 0.6,
              },
            },
          );
        });

        // pin the stack while cards animate
        ScrollTrigger.create({
          trigger: stack,
          start: 'top top',
          end:   () => `+=${cardsRef.current.length * window.innerHeight * 0.7}`,
          pin: true,
          anticipatePin: 1,
        });
      }

      /* SCENE 5 — final CTA reveal */
      gsap.from(ctaRef.current?.querySelectorAll('.cta-rise') || [], {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 75%',
        },
      });

      // Brand stamp — dramatic scale + glow swell
      const stamp = ctaRef.current?.querySelector('.brand-stamp');
      if (stamp) {
        gsap.fromTo(stamp,
          { scale: 0.7, opacity: 0, filter: 'drop-shadow(0 0 0 rgba(189,138,76,0)) blur(8px)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'drop-shadow(0 0 80px rgba(189,138,76,0.45)) drop-shadow(0 0 24px rgba(189,138,76,0.25)) blur(0px)',
            duration: 1.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 70%',
            },
          },
        );
      }

      /* Global progress bar */
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end:   'bottom bottom',
        onUpdate: (self) => setProgress(self.progress),
      });

    }, rootRef);

    // refresh after fonts/images load to keep pin math accurate
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = setTimeout(refresh, 800);

    return () => {
      ctx.revert();
      window.removeEventListener('load', refresh);
      clearTimeout(t);
    };
  }, []);

  const scrollToSection = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={rootRef} className="relative" data-cinematic>

      {/* ─────────── Scroll progress bar (fixed, top) ─────────── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-amber-500/10 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"
          style={{ width: `${progress * 100}%`, transition: 'width 0.06s linear', boxShadow: '0 0 14px rgba(201,150,85,0.7)' }}
        />
      </div>

      {/* ═════════════════════════════════════════════════════════
          SCENE 1 — Pinned cinematic hero
          ═════════════════════════════════════════════════════════ */}
      <section
        id="home"
        ref={heroRef}
        data-always-dark
        className="relative h-screen w-full overflow-hidden bg-black film-grain pin-stage"
      >
        {/* Background image layer (parallax + zoom) */}
        <div ref={heroBgRef} className="absolute inset-0 will-change-transform">
          <img
            src={HERO_IMG}
            alt=""
            className="w-full h-full object-cover opacity-40"
            style={{ filter: 'saturate(1.1) contrast(1.05)' }}
            loading="eager"
          />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 0%, rgba(0,0,0,0.55) 55%, #000 100%)' }} />
          <div className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(189,138,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(189,138,76,0.05) 1px,transparent 1px)',
              backgroundSize: '70px 70px',
              maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)',
            }}
          />
        </div>

        {/* Particle network */}
        <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />

        {/* Soft orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(circle,rgba(189,138,76,0.18) 0%,transparent 70%)', filter: 'blur(90px)' }} />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(circle,rgba(168,116,60,0.14) 0%,transparent 70%)', filter: 'blur(100px)' }} />

        {/* Rotating ambient ring */}
        <div ref={ringRef}
          className="orbit-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vmin] h-[110vmin] pointer-events-none z-[2]">
          <div className="absolute inset-0 rounded-full border border-amber-500/15" />
          <div className="absolute inset-[6%] rounded-full border border-amber-500/10" />
          <div className="absolute inset-[14%] rounded-full border border-amber-500/8 border-dashed" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_18px_4px_rgba(201,150,85,0.8)]" />
        </div>

        {/* Foreground content (3D tilt) */}
        <div ref={heroFgRef} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 tilt-card">

          <div className="hero-fadein inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-[11px] font-bold tracking-[0.22em] uppercase font-display">
              Pioneering Nigerian Technology
            </span>
          </div>

          <h1
            ref={titleRef}
            className="font-display font-black text-white leading-[0.92] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.6rem, 9vw, 8.5rem)' }}
          >
            <span className="block overflow-hidden">
              <SplitChars text="ENGINEERING" />
            </span>
            <span className="block overflow-hidden text-shimmer">
              <SplitChars text="TOMORROW." />
            </span>
          </h1>

          <p
            ref={taglineRef}
            className="hero-fadein text-white/55 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-10"
          >
            Hardware, software and intelligence — engineered in Nigeria,
            designed for the world. Bloxio builds the systems that move
            industries forward.
          </p>

          <div className="hero-fadein flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => scrollToSection('about')}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-8 py-3.5 rounded-full font-bold text-sm tracking-[0.18em] uppercase hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 font-display"
            >
              Begin the journey
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="inline-flex items-center gap-2 border border-amber-500/40 text-amber-300 px-8 py-3.5 rounded-full font-bold text-sm tracking-[0.18em] uppercase hover:bg-amber-500/5 hover:border-amber-500/70 hover:-translate-y-0.5 transition-all duration-300 font-display"
            >
              Start a conversation
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hero-fadein absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          <span className="text-[10px] tracking-[0.4em] text-amber-500/60 font-bold uppercase font-display">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/60 to-transparent" />
          <ChevronDown size={16} className="text-amber-500/60 animate-bounce" />
        </div>

        {/* Bottom fog */}
        <div className="fog-bottom absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none" />
      </section>

      {/* ═════════════════════════════════════════════════════════
          SCENE 2 — Curved cards unravel bottom→top (Joby-style)
          Each chapter is its own curved-edge card stacked above the
          previous; clip-path animates from inset(100% 0 0 0) → 0,
          revealing the image like a curtain rising. Scrolling up
          re-clips it (auto-reverse via GSAP scrub).
          ═════════════════════════════════════════════════════════ */}
      <section ref={storyRef} className="relative h-screen w-full overflow-hidden bg-black">
        {/* faint backdrop pattern visible while cards are clipped */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(189,138,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(189,138,76,0.05) 1px,transparent 1px)',
            backgroundSize: '70px 70px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)',
          }} />

        {CHAPTERS.map((ch, i) => (
          <div
            key={i}
            className="chapter absolute inset-0 px-4 sm:px-8 pt-16 pb-12 flex items-center justify-center"
            style={{ zIndex: 10 + i }}
          >
            {/* Curved card whose clip-path animates */}
            <div
              data-always-dark
              className="chapter-card relative w-full max-w-7xl h-full rounded-4xl overflow-hidden border border-amber-500/15 shadow-2xl shadow-black/70"
              style={{ willChange: 'clip-path' }}
            >
              {/* Background image (gently zooms while card unravels) */}
              <img
                src={ch.img}
                alt={ch.headline}
                className="chapter-img absolute inset-0 w-full h-full object-cover will-change-transform"
                style={{ filter: 'brightness(0.55) saturate(0.95)' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 80%, rgba(189,138,76,0.22) 0%, transparent 60%)' }} />

              {/* Inner content — words rise from overflow-hidden masks */}
              <div className="relative z-10 h-full flex flex-col justify-end max-w-5xl mx-auto px-8 sm:px-14 pb-12 sm:pb-16">

                {/* Kicker (single word-rise) */}
                <div className="overflow-hidden mb-5">
                  <span className="word-rise inline-block text-amber-400/90 font-display text-xs sm:text-sm tracking-[0.42em] uppercase">
                    {ch.kicker}
                  </span>
                </div>

                {/* Headline — split per word so each unravels in sequence */}
                <h2 className="font-display font-black text-white leading-[0.94] mb-7 tracking-tight"
                  style={{ fontSize: 'clamp(2.8rem, 10vw, 9rem)' }}>
                  {ch.headline.split(' ').map((w, j) => (
                    <span key={j} className="inline-block overflow-hidden align-bottom mr-[0.18em]">
                      <span className="word-rise inline-block">{w}</span>
                    </span>
                  ))}
                </h2>

                {/* Body — split on commas / em-dashes so it unravels in
                    a few clean phrases rather than a noisy word storm */}
                <p className="text-white/75 text-base sm:text-xl max-w-xl leading-relaxed mb-10">
                  {ch.body.split(/\s*[,—]\s*/).filter(Boolean).map((seg, j, arr) => (
                    <span key={j} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                      <span className="word-rise inline-block">
                        {seg}{j < arr.length - 1 ? ',' : ''}
                      </span>
                    </span>
                  ))}
                </p>

                {/* Progress dots */}
                <div className="flex items-center gap-3">
                  {CHAPTERS.map((_, j) => (
                    <div key={j} className={`h-px transition-all duration-500 ${
                      j === i ? 'w-16 bg-amber-400' : 'w-8 bg-amber-500/20'
                    }`} />
                  ))}
                  <span className="text-white/40 text-xs font-display tracking-[0.3em] ml-3">
                    0{i + 1} / 0{CHAPTERS.length}
                  </span>
                </div>
              </div>

              {/* corner glow inside the card */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle,rgba(201,150,85,0.25) 0%,transparent 70%)', filter: 'blur(70px)' }} />
            </div>
          </div>
        ))}

        {/* Edge fog */}
        <div className="fog-top absolute top-0 left-0 right-0 h-24 z-[2] pointer-events-none" />
        <div className="fog-bottom absolute bottom-0 left-0 right-0 h-24 z-[2] pointer-events-none" />
      </section>

      {/* ═════════════════════════════════════════════════════════
          SCENE 3 — Horizontal showcase (pin + scrub)
          ═════════════════════════════════════════════════════════ */}
      <section ref={horizRef} className="relative h-screen w-full overflow-hidden bg-black">
        {/* Section heading floats over the panels */}
        <div className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none">
          <span className="font-display text-[10px] tracking-[0.5em] uppercase text-amber-500/70">
            ◆ The Bloxio Universe ◆
          </span>
        </div>

        <div ref={trackRef} className="h-track flex h-full" style={{ width: 'max-content' }}>
          {/* Intro panel */}
          <div className="panel relative h-screen flex items-center justify-center px-12"
               style={{ width: '70vw', minWidth: '420px' }}>
            <div className="max-w-md">
              <span className="panel-rise font-display text-amber-400 text-xs tracking-[0.4em] uppercase mb-4 block">
                What we build
              </span>
              <h3 className="panel-rise font-display font-black text-white leading-[0.95] mb-5"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}>
                A universe of <span className="text-shimmer">connected</span> intelligence.
              </h3>
              <p className="panel-rise text-white/50 text-base leading-relaxed">
                Scroll →&nbsp; through the products, platforms and ideas
                that define how we engineer the future.
              </p>
            </div>
          </div>

          {/* Showcase panels */}
          {SHOWCASE.map((p, i) => (
            <div
              key={i}
              className="panel relative h-screen flex items-end px-10 pb-24"
              style={{ width: '85vw', minWidth: '560px' }}
            >
              <div data-always-dark className="absolute inset-6 rounded-3xl overflow-hidden border border-amber-500/15 group">
                <img
                  src={p.img}
                  alt={p.title}
                  className="panel-img absolute inset-0 w-full h-full object-cover will-change-transform"
                  style={{ filter: 'brightness(0.7) saturate(1.05)' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10 h-full flex flex-col justify-end p-10">
                  <span className="panel-rise inline-block w-fit text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300 border border-amber-500/40 rounded-full px-3 py-1 mb-5 backdrop-blur-sm bg-amber-500/10">
                    {p.tag}
                  </span>
                  <h4 className="panel-rise font-display font-black text-white leading-[0.95] mb-2"
                    style={{ fontSize: 'clamp(2rem, 4.6vw, 4rem)' }}>
                    {p.title}
                  </h4>
                  <p className="panel-rise text-white/65 text-sm sm:text-base max-w-md">
                    {p.sub}
                  </p>

                  {/* index */}
                  <span className="panel-rise absolute top-8 right-8 font-display text-amber-500/40 text-sm tracking-widest tabular-nums">
                    {String(i + 1).padStart(2, '0')} / {String(SHOWCASE.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Outro panel */}
          <div className="panel relative h-screen flex items-center justify-center px-12"
               style={{ width: '60vw', minWidth: '380px' }}>
            <div className="text-center">
              <span className="panel-rise font-display text-xs tracking-[0.4em] uppercase text-amber-400 mb-6 block">
                And much more →
              </span>
              <button
                onClick={() => scrollToSection('services')}
                className="panel-rise inline-flex items-center gap-3 border border-amber-500/40 text-amber-300 px-6 py-3 rounded-full text-xs font-bold tracking-[0.25em] uppercase hover:bg-amber-500/10 hover:border-amber-500/70 transition-all font-display"
              >
                Explore everything
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="fog-top absolute top-0 left-0 right-0 h-20 z-[2] pointer-events-none" />
      </section>

      {/* ═════════════════════════════════════════════════════════
          SCENE 4 — Stacked card reveal
          ═════════════════════════════════════════════════════════ */}
      <section ref={stackRef} className="relative h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(189,138,76,0.06) 0%, transparent 70%)' }} />

        <div className="absolute top-8 left-0 right-0 z-30 text-center pointer-events-none">
          <span className="font-display text-[10px] tracking-[0.5em] uppercase text-amber-500/70">
            ◆ The Bloxio DNA ◆
          </span>
        </div>

        {[
          { icon: Cpu,       title: 'Engineered',  copy: 'World-class hardware, manufactured to global standards.', img: LAB_IMG },
          { icon: Wifi,      title: 'Connected',   copy: 'Mesh networks of devices, sensors and intelligence.',     img: NET_IMG },
          { icon: Sparkles,  title: 'Intelligent', copy: 'AI that learns from the field and acts in real time.',    img: FIELD_IMG },
          { icon: ArrowRight,title: 'Unstoppable', copy: 'Built in Nigeria. Designed for everywhere.',              img: CITY_IMG },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              ref={el => (cardsRef.current[i] = el)}
              className="absolute inset-0 flex items-center justify-center px-6"
              style={{ zIndex: 10 + i }}
            >
              <div data-always-dark className="relative w-full max-w-5xl h-[78vh] rounded-3xl overflow-hidden border border-amber-500/15 shadow-2xl shadow-black/60">
                <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                  style={{ filter: 'brightness(0.5) saturate(1.05)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-amber-950/40" />

                <div className="relative z-10 h-full flex flex-col justify-end p-10 sm:p-14">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-amber-500/30 backdrop-blur-md"
                      style={{ background: 'rgba(189,138,76,0.15)' }}>
                      <Icon size={22} className="text-amber-300" />
                    </div>
                    <span className="font-display text-amber-400/80 text-xs tracking-[0.4em] uppercase">
                      0{i + 1} of 04
                    </span>
                  </div>
                  <h3 className="font-display font-black text-white leading-[0.95] mb-4"
                    style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)' }}>
                    {c.title}
                  </h3>
                  <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
                    {c.copy}
                  </p>
                </div>

                {/* corner glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle,rgba(201,150,85,0.25) 0%,transparent 70%)', filter: 'blur(60px)' }} />
              </div>
            </div>
          );
        })}
      </section>

      {/* ═════════════════════════════════════════════════════════
          SCENE 5 — Brand stamp + final CTA
          ═════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative py-12 w-full overflow-hidden bg-black">
        {/* warm radial wash */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(189,138,76,0.10) 0%, transparent 70%)' }} />

        {/* concentric rings around the logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] pointer-events-none orbit-spin">
          <div className="absolute inset-0 rounded-full border border-amber-500/10" />
          <div className="absolute inset-[8%] rounded-full border border-amber-500/8 border-dashed" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vmin] h-[55vmin] pointer-events-none orbit-spin-rev">
          <div className="absolute inset-0 rounded-full border border-amber-500/12" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <span className="cta-rise font-display text-[10px] tracking-[0.5em] uppercase text-amber-500/70 mb-10 block">
            ◆ The story continues ◆
          </span>

          {/* Brand stamp — full Bloxio logo (with built-in motto) */}
          <div className="cta-rise mb-10 flex justify-center">
            <img
              src="/bloxiofull.png"
              alt="Bloxio — One Step Ahead of Tech"
              className="brand-stamp h-auto select-none pointer-events-none"
              style={{
                width: 'clamp(280px, 52vw, 620px)',
                filter: 'drop-shadow(0 0 80px rgba(189,138,76,0.45)) drop-shadow(0 0 24px rgba(189,138,76,0.25))',
              }}
              draggable="false"
            />
          </div>

          {/* Decorative divider */}
          <div className="cta-rise flex items-center gap-4 justify-center mb-10">
            <span className="block w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
            <span className="font-display text-amber-400 text-[10px] tracking-[0.45em] uppercase">
              Engineering Tomorrow
            </span>
            <span className="block w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
          <button
            onClick={() => scrollToSection('about')}
            className="cta-rise group inline-flex items-center gap-3 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-9 py-4 rounded-full text-sm font-bold tracking-[0.22em] uppercase hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 font-display"
          >
            Continue exploring
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
}

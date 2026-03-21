import React, { useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef(null);

  const scrollToSection = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let pts = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      pts = Array.from({ length: Math.floor((canvas.width * canvas.height) / 18000) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        o: Math.random() * 0.5 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(189,138,76,${p.o})`;
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(189,138,76,${0.07 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const STATS = [
    { value: '2+', label: 'Flagship Products' },
    { value: '100%', label: 'Nigerian Innovation' },
    { value: 'Global', label: 'Vision & Reach' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />

      {/* Grid */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(189,138,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(189,138,76,0.04) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)',
        }}
      />

      {/* Orbs */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle,rgba(189,138,76,0.12) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle,rgba(168,116,60,0.1) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-6 pt-28 pb-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8"
          style={{ background: 'rgba(189,138,76,0.07)', animation: 'heroUp 0.7s ease 0.1s both' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-[11px] font-bold tracking-[0.14em] uppercase">Pioneering Nigerian Technology</span>
        </div>

        {/* Logo */}
        <div className="mb-8" style={{ animation: 'heroUp 0.7s ease 0.25s both' }}>
          <img src="/bloxiofull.png" alt="Bloxio Nigeria Limited"
            className="h-auto max-w-full"
            style={{ width: 'clamp(240px,42vw,520px)', filter: 'drop-shadow(0 0 60px rgba(189,138,76,0.25))' }}
          />
        </div>

        {/* Tagline */}
        <p className="text-white/40 text-base sm:text-lg max-w-md leading-relaxed mb-10"
          style={{ animation: 'heroUp 0.7s ease 0.4s both' }}>
          Research. Invent. Deliver.{' '}
          <span className="text-amber-400 font-semibold">The future is engineered here.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-14"
          style={{ animation: 'heroUp 0.7s ease 0.55s both' }}>
          <button
            onClick={() => scrollToSection('about')}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore Bloxio
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="inline-flex items-center gap-2 border border-amber-500/40 text-amber-400 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-amber-500/5 hover:border-amber-500/70 hover:-translate-y-0.5 transition-all duration-300"
          >
            Start a Conversation
          </button>
        </div>

        {/* Stats */}
        <div className="flex sm:divide-x divide-amber-500/10 border border-amber-500/15 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm flex-col sm:flex-row"
          style={{ animation: 'heroUp 0.7s ease 0.7s both' }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center px-8 sm:px-10 py-4 border-b sm:border-b-0 border-amber-500/10 last:border-b-0">
              <span className="text-2xl font-black bg-gradient-to-r from-gold-light to-gold-dark bg-clip-text text-transparent leading-tight">
                {s.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => scrollToSection('about')}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-10 h-10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400/60 bg-black/30 hover:bg-amber-500/10 hover:border-amber-500/60 hover:text-amber-400 transition-all duration-300"
        style={{ animation: 'scrollBounce 2.5s ease-in-out infinite' }}
      >
        <ChevronDown size={18} />
      </button>

      <style>{`
        @keyframes heroUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(7px);} }
      `}</style>
    </section>
  );
}
import React from 'react';
import { Eye, Sparkles, TrendingUp } from 'lucide-react';

const PILLARS = [
  { icon: Sparkles,   word: 'Innovation', sub: 'Leading through cutting-edge research and bold invention' },
  { icon: Eye,        word: 'Excellence', sub: 'Uncompromising quality in every product and service we ship' },
  { icon: TrendingUp, word: 'Impact',     sub: 'Creating lasting positive change for people and industries' },
];

export default function Vision() {
  return (
    <section id="vision" className="relative py-28 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(189,138,76,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            Where We're Headed
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Vision
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto" />
        </div>

        {/* Card */}
        <div className="relative bg-gradient-to-br from-amber-950/20 via-black to-amber-950/15 border border-amber-500/20 rounded-3xl px-8 sm:px-16 py-14 overflow-hidden">
          {/* Top glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.08) 0%,transparent 70%)' }} />
          {/* Corner orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(189,138,76,0.06) 0%,transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(168,116,60,0.05) 0%,transparent 70%)', filter: 'blur(40px)' }} />

          {/* Statement */}
          <p className="relative z-10 text-white/70 text-xl sm:text-2xl leading-relaxed text-center max-w-2xl mx-auto mb-12">
            To be recognized globally as a pioneering technology company that consistently delivers innovative solutions —
            setting new standards in quality, sustainability, and technological advancement.
          </p>

          {/* Divider */}
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent mx-auto mb-12" />

          {/* Pillars */}
          <div className="grid sm:grid-cols-3 gap-4 relative z-10">
            {PILLARS.map(({ icon: Icon, word, sub }) => (
              <div
                key={word}
                className="group text-center p-6 border border-amber-500/10 rounded-2xl hover:border-amber-500/25 hover:-translate-y-1 transition-all duration-300"
                style={{ background: 'rgba(189,138,76,0.03)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'rgba(189,138,76,0.1)', border: '1px solid rgba(189,138,76,0.15)' }}>
                  <Icon size={18} className="text-amber-500" />
                </div>
                <div className="text-amber-400 font-black text-base mb-2">{word}</div>
                <p className="text-white/35 text-xs leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
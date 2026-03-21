import React from 'react';
import { Target, Lightbulb, Zap, Globe } from 'lucide-react';

const PILLARS = [
  {
    icon: Target,
    title: 'Our Aim',
    body: 'To research, invent, develop, produce, market, and deliver innovative technology products and services that improve lives, solve real-world problems, and drive technological advancement globally.',
  },
  {
    icon: Lightbulb,
    title: 'Our Mission',
    body: "To become a leading force in technology innovation — delivering solutions that not only meet today's challenges but anticipate tomorrow's needs, while maintaining the highest standards of quality.",
  },
  {
    icon: Globe,
    title: 'Our Reach',
    body: 'Rooted in Nigeria, built for the world. We engineer products and platforms with a global perspective, ensuring every solution scales beyond borders and delivers meaningful impact.',
  },
  {
    icon: Zap,
    title: 'Our Edge',
    body: 'We combine deep engineering expertise with startup agility — moving fast, iterating boldly, and shipping products that set new benchmarks in quality, usability, and technological sophistication.',
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-28 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-100"
          style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.05) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(168,116,60,0.04) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            Who We Are
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            About{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Bloxio
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto mb-6" />
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A technology company built on innovation, excellence, and the vision to shape the future
          </p>
        </div>

        {/* Intro quote */}
        <div className="flex items-center gap-6 mb-16 max-w-3xl mx-auto px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
          <p className="text-white/50 text-sm sm:text-base text-center italic leading-relaxed max-w-lg flex-shrink-0">
            "A next-generation technology company dedicated to building hardware and software products that solve real problems — all designed and engineered with world-class standards."
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="group relative bg-white/[0.02] border border-amber-500/10 rounded-2xl p-7 hover:border-amber-500/25 hover:-translate-y-1 transition-all duration-400 overflow-hidden"
            >
              {/* Top shimmer on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              <div className="w-11 h-11 rounded-xl border border-amber-500/20 flex items-center justify-center mb-5 group-hover:border-amber-500/40 group-hover:rotate-6 transition-all duration-300"
                style={{ background: 'rgba(189,138,76,0.08)' }}>
                <Icon size={20} className="text-amber-500" />
              </div>
              <h3 className="text-amber-400 font-bold text-base mb-3 tracking-tight">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Registration badge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-black/50 border border-amber-500/12 rounded-2xl px-8 py-5 backdrop-blur-sm max-w-2xl mx-auto">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Registered Entity</span>
            <span className="text-amber-400 font-bold text-sm">Bloxio Nigeria Limited</span>
            <span className="text-white/30 text-xs">Plot AV 27B, 251 Road Festac Phase II · Lagos, Nigeria</span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-amber-500/15" />
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">CAC Registered</span>
            <span className="text-amber-400 font-bold text-sm">Nigeria</span>
            <span className="text-white/30 text-xs">Legally incorporated and operational</span>
          </div>
        </div>
      </div>
    </section>
  );
}
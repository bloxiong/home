import React from 'react';
import { Cpu, Layers, Wifi, MessageSquare, Lightbulb, Wrench } from 'lucide-react';

const SERVICES = [
  { icon: Cpu,          number: '01', title: 'R&D & Engineering',          tag: 'Core',     desc: 'Deep-stack research across AI, IoT, and advanced electronics — turning frontier science into manufacturable products.' },
  { icon: Layers,       number: '02', title: 'Product Design & Manufacturing', tag: 'Hardware', desc: 'From sketch to shelf. We prototype, test, and manufacture high-quality technology products built for real-world conditions.' },
  { icon: Wifi,         number: '03', title: 'Smart Device Ecosystems',    tag: 'IoT',      desc: 'Integrated smart platforms connecting devices, sensors, and cloud intelligence into cohesive connected systems.' },
  { icon: MessageSquare,number: '04', title: 'Technical Consulting',       tag: 'Advisory', desc: 'Strategic and technical guidance on implementing, optimising, and scaling technology systems across industries.' },
  { icon: Lightbulb,    number: '05', title: 'Innovation Solutions',       tag: 'Strategy', desc: 'We transform bold ideas into market-ready products — from concept validation through development to commercial launch.' },
  { icon: Wrench,       number: '06', title: 'Support & Maintenance',      tag: 'Support',  desc: 'Comprehensive technical support and lifecycle management ensuring peak performance long after deployment.' },
];

export default function Services() {
  return (
    <section id="services" className="relative py-28 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(189,138,76,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            What We Do
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto mb-6" />
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Comprehensive technology solutions engineered to meet the demands of modern industry
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 border border-amber-500/10 rounded-3xl overflow-hidden divide-y divide-amber-500/8 md:divide-y-0"
          style={{ background: 'rgba(5,5,5,0.95)' }}>
          {SERVICES.map(({ icon: Icon, number, title, tag, desc }, i) => (
            <div
              key={number}
              className="group relative p-9 hover:bg-amber-500/[0.03] transition-colors duration-300 border-b border-r border-amber-500/8 last:border-r-0"
              style={{
                /* right border only on cols 1,2 of the 3-col grid */
                borderRight: undefined,
              }}
            >
              {/* Ghost number */}
              <span className="absolute top-6 right-7 text-5xl font-black text-amber-500/[0.06] leading-none select-none group-hover:text-amber-500/[0.11] transition-colors duration-300 tabular-nums">
                {number}
              </span>

              {/* Icon + tag row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl border border-amber-500/18 flex items-center justify-center group-hover:border-amber-500/40 group-hover:rotate-6 transition-all duration-300"
                  style={{ background: 'rgba(189,138,76,0.09)' }}>
                  <Icon size={20} className="text-amber-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500/50 border border-amber-500/15 rounded-full px-2.5 py-0.5">
                  {tag}
                </span>
              </div>

              <h3 className="text-white font-bold text-[0.95rem] mb-3 tracking-tight">{title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{desc}</p>

              {/* Bottom line reveal */}
              <div className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-amber-500/40 to-transparent scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" style={{ width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
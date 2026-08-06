import React from 'react';
import { Mail, Phone, GraduationCap, Briefcase } from 'lucide-react';

const DIRECTORS = [
  {
    name: 'Anyakie Owen (GMNSE, P.COREN)',
    initials: 'AO',
    title: 'Co-Founder & Director',
    education: 'B.Eng Electrical Electronics Engineering',
    specialization: 'Major in Electronics and Computer Engineering',
    // email: 'owenanyakie@gmail.com',
    // phone: '07068919754',
  },
  {
    name: 'Austin Chris (GMNSE, P.COREN)',
    initials: 'AC',
    title: 'Co-Founder & Director',
    education: 'B.Eng Electrical Electronics Engineering',
    specialization: 'Major in Electronics and Computer Engineering',
    // email: 'austinchrisiwu@gmail.com',
    // phone: '08062439424',
  },
];

export default function Directors() {
  return (
    <section id="directors" className="relative py-28 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.04) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.04) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-micro font-semibold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            Meet the Team
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Leadership
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto mb-6" />
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Visionary engineers driving innovation and excellence at Bloxio
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DIRECTORS.map((d) => (
            <div
              key={d.name}
              className="group relative bg-gradient-to-br from-gray-900/80 via-black to-gray-900/80 border border-amber-500/15 rounded-3xl p-9 hover:border-amber-500/35 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 overflow-hidden"
            >
              {/* Top glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.08) 0%,transparent 70%)' }} />

              {/* Avatar */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-400 relative z-10">
                  {d.initials}
                </div>
                {/* Spinning ring */}
                <div className="absolute inset-[-5px] rounded-full border border-amber-500/20"
                  style={{ animation: 'spinRing 8s linear infinite' }}>
                  <div className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </div>
              </div>

              {/* Identity */}
              <div className="text-center mb-7">
                <h3 className="text-white text-xl font-black tracking-tight mb-1.5">{d.name}</h3>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{d.title}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-6" />

              {/* Details */}
              <div className="space-y-4 mb-6">
                {[
                  { icon: GraduationCap, label: 'Education', value: d.education, sub: d.specialization },
                  { icon: Briefcase,     label: 'Role',      value: 'Co-Founder & Director', sub: 'Bloxio Nigeria Limited' },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(189,138,76,0.1)', border: '1px solid rgba(189,138,76,0.15)' }}>
                      <Icon size={13} className="text-amber-500" />
                    </div>
                    <div>
                      <div className="text-micro uppercase tracking-[0.12em] text-white/50 font-semibold mb-0.5">{label}</div>
                      <div className="text-white/75 text-xs font-semibold leading-snug">{value}</div>
                      <div className="text-white/50 text-xs">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact strip */}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What is Bloxio Nigeria Limited?',
    a: 'Bloxio Nigeria Limited is a next-generation technology company headquartered in Lagos, Nigeria. We research, design, manufacture, and deliver innovative hardware and software products — from smart agricultural systems to consumer electronics — all built to world-class standards.',
  },
  {
    q: 'What is AgroSense360?',
    a: 'AgroSense360 is our flagship smart farming product. It combines AI, cameras, and IoT sensors to monitor crop health, soil conditions, and farm environment in real time — delivering actionable alerts and recommendations directly to farmers and agribusiness operators.',
  },
  {
    q: 'Who are the founders of Bloxio?',
    a: "Bloxio was co-founded by Anyakie Owen and Austin Chris, both B.Eng holders in Electrical Electronics Engineering (major in Electronics). Their combined engineering background drives the company's strong focus on hardware innovation.",
  },
  {
    q: 'Is Bloxio a registered company?',
    a: 'Yes. Bloxio Nigeria Limited is fully incorporated and CAC-registered in Nigeria. Our registered office is at Plot AV 27B, 251 Road Festac Phase II, Abule Ado, Lagos State, Nigeria.',
  },
  {
    q: 'What industries does Bloxio serve?',
    a: 'Our primary focus is agriculture (through AgroSense360) and consumer electronics. We also serve industrial, security, and energy sectors through smart device ecosystems, surveillance systems, and power management solutions.',
  },
  {
    q: 'Can I invest in or partner with Bloxio?',
    a: 'Absolutely. We are actively exploring partnerships and investment opportunities with individuals and organizations who share our vision. Reach out via our contact section or email bloxionigerialimited@gmail.com.',
  },
  {
    q: 'How do I get early access to AgroSense360?',
    a: "Sign up through our survey page. Leave your email and we'll notify you when our pilot programme begins — early users get exclusive benefits and direct input into the product's development.",
  },
  {
    q: 'Does Bloxio ship products internationally?',
    a: 'Our current operations are Nigeria-first, but our vision is explicitly global. We are building products and distribution infrastructure to serve markets across Africa and internationally in the near term.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`border-b border-amber-500/8 transition-colors duration-300 ${isOpen ? 'bg-amber-500/[0.025]' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left hover:bg-amber-500/[0.02] transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className={`text-sm font-semibold leading-snug transition-colors duration-200 ${isOpen ? 'text-white' : 'text-white/60 hover:text-white/80'}`}>
          {item.q}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-350 ${
            isOpen
              ? 'border-amber-500/40 text-amber-400 rotate-180'
              : 'border-amber-500/20 text-amber-500/50'
          }`}
          style={{ background: isOpen ? 'rgba(189,138,76,0.1)' : 'transparent' }}
        >
          <ChevronDown size={14} />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-[420ms] ease-in-out"
        style={{ maxHeight: isOpen ? '300px' : '0px' }}
      >
        <p className="text-white/40 text-sm leading-relaxed px-5 pb-5 pt-0">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="relative py-28 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(189,138,76,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            Got Questions?
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto mb-6" />
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know about Bloxio and our products
          </p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-12 items-start">
          {/* Sticky side column (desktop only) */}
          <div className="hidden lg:flex flex-col items-center gap-5 sticky top-28">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(189,138,76,0.1)', border: '1px solid rgba(189,138,76,0.2)' }}>
              <HelpCircle size={28} className="text-amber-500" />
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-amber-500/30 to-transparent" />
            <p className="text-white/30 text-xs text-center leading-relaxed">
              Still have questions?{' '}
              <a href="mailto:bloxionigerialimited@gmail.com" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                Email us
              </a>
            </p>
          </div>

          {/* Accordion list */}
          <div className="rounded-2xl overflow-hidden border border-amber-500/10"
            style={{ background: 'rgba(5,5,5,0.9)' }}>
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
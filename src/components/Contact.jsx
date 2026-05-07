import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const INFO = [
  {
    icon: MapPin,
    label: 'Office Address',
    lines: ['Plot AV 27B, 251 Road Festac Phase II,', 'Abule Ado, Lagos State, Nigeria'],
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['bloxionigerialimited@gmail.com'],
    href: 'mailto:bloxionigerialimited@gmail.com',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    const sub = encodeURIComponent(form.subject || `Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:bloxionigerialimited@gmail.com?subject=${sub}&body=${body}`;
    setSent(true);
  };

  const inputClass =
    'w-full bg-white/[0.03] border border-amber-500/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/40 focus:bg-amber-500/[0.03] transition-all duration-200 font-sans';

  return (
    <section id="contact" className="relative py-28 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse,rgba(189,138,76,0.05) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse,rgba(168,116,60,0.04) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-amber-500 border border-amber-500/25 rounded-full px-4 py-1.5 mb-5"
            style={{ background: 'rgba(189,138,76,0.07)' }}>
            Let's Talk
          </span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Get In{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <div className="w-14 h-[3px] bg-gradient-to-r from-gold-light to-gold-dark rounded-full mx-auto mb-6" />
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Ready to innovate together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_1.6fr] gap-6 items-start">
          {/* Info card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black border border-amber-500/12 rounded-3xl p-8">
            <h3 className="text-white font-bold text-base mb-1">Contact Information</h3>
            <p className="text-white/30 text-xs leading-relaxed mb-7">We respond within 24 hours.</p>

            <div className="space-y-5 mb-7">
              {INFO.map(({ icon: Icon, label, lines, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(189,138,76,0.1)', border: '1px solid rgba(189,138,76,0.15)' }}>
                    <Icon size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-0.5">{label}</div>
                    {lines.map((l, i) =>
                      href && i === 0 ? (
                        <a key={i} href={href} className="text-amber-400 hover:text-amber-300 text-xs font-semibold block transition-colors">{l}</a>
                      ) : (
                        <div key={i} className="text-white/45 text-xs">{l}</div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 pt-5 border-t border-amber-500/8 text-white/30 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)] flex-shrink-0" />
              Available Mon–Fri · 9AM – 6PM WAT
            </div>
          </div>

          {/* Form card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black border border-amber-500/12 rounded-3xl p-8">
            {sent ? (
              <div className="flex flex-col items-center text-center py-10 gap-4">
                <CheckCircle2 size={44} className="text-emerald-400" />
                <h4 className="text-white font-bold text-lg">Message Prepared!</h4>
                <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                  Your email client is opening with the message pre-filled. We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1.5">Your Name</label>
                    <input type="text" placeholder="Enter your name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1.5">Email Address</label>
                    <input type="email" placeholder="you@example.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1.5">Subject</label>
                  <input type="text" placeholder="What's this about?" value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1.5">Message</label>
                  <textarea placeholder="Tell us about your project or inquiry..." value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5} className={`${inputClass} resize-none`} />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black py-3.5 rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Send size={14} /> Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
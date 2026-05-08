import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const NAV = ['home', 'about', 'services', 'vision', 'directors', 'faq'];

  return (
    <footer className="bg-black border-t border-amber-500/10">
      <div className="container mx-auto px-6 max-w-7xl py-14">
        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/bloxio.png" alt="Bloxio" className="w-20 h-auto mb-4 object-contain" />
            </Link>
            <p className="text-white/25 text-xs leading-relaxed max-w-xs mb-6">
              Innovating tomorrow's technology today — pioneering research, development, and delivery of cutting-edge solutions from Nigeria to the world.
            </p>
            <div className="space-y-2">
              {[
                { icon: Mail, text: 'bloxionigerialimited@gmail.com', href: 'mailto:bloxionigerialimited@gmail.com' },
                { icon: Phone, text: '+2347068919754 · +2348062439424' },
                { icon: MapPin, text: 'Lagos State, Nigeria' },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={12} className="text-amber-500/40 flex-shrink-0" />
                  {href ? (
                    <a href={href} className="text-white/25 hover:text-amber-400 text-xs transition-colors">{text}</a>
                  ) : (
                    <span className="text-white/25 text-xs">{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/50 mb-4">Navigate</h4>
            <div className="space-y-2">
              {NAV.map((s) => (
                <button key={s} onClick={() => scrollTo(s)}
                  className="block text-white/35 hover:text-white/70 text-xs capitalize transition-colors duration-200">
                  {s === 'faq' ? 'FAQ' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <Link to="/survey" className="block text-white/35 hover:text-white/70 text-xs transition-colors duration-200">Survey</Link>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/50 mb-4">Products</h4>
            <div className="space-y-2.5">
              <Link to="/survey/AgroSense360" className="flex items-center gap-2 text-white/45 hover:text-white/70 text-xs transition-colors">
                AgroSense360
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500/60 border border-amber-500/20 rounded-full px-1.5 py-0.5"
                  style={{ background: 'rgba(189,138,76,0.08)' }}>Beta</span>
              </Link>
              {['Smart Electronics', 'Agricultural Drones', 'Smart Lighting'].map((p) => (
                <div key={p} className="flex items-center gap-2 text-white/20 text-xs">
                  {p}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 border border-white/10 rounded-full px-1.5 py-0.5">Soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-amber-500/8">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Bloxio Nigeria Limited. All rights reserved.
          </p>
          <a href="mailto:bloxionigerialimited@gmail.com"
            className="inline-flex items-center gap-1.5 text-amber-500/50 hover:text-amber-400 text-xs font-bold tracking-wide transition-colors">
            Work with us <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About',      section: 'about' },
  { label: 'Services',   section: 'services' },
  { label: 'Vision',     section: 'vision' },
  { label: 'Leadership', section: 'directors' },
  { label: 'FAQ',        section: 'faq' },
];

export default function Navigation() {
  const [isOpen, setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const scrollTo = (id) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-amber-500/10 shadow-lg shadow-black/40' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-[68px] gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/bloxio.png" alt="Bloxio" className="w-[85px] h-auto object-contain" />
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.section)}
                  className="relative px-4 py-2 text-sm font-semibold text-white/50 hover:text-white rounded-lg hover:bg-amber-500/5 transition-all duration-200 group"
                >
                  {l.label}
                  <span className="absolute bottom-1.5 left-4 right-4 h-px bg-amber-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-full" />
                </button>
              ))}
              <Link
                to="/survey"
                className="relative px-4 py-2 text-sm font-semibold text-white/50 hover:text-white rounded-lg hover:bg-amber-500/5 transition-all duration-200 group"
              >
                Survey
                <span className="absolute bottom-1.5 left-4 right-4 h-px bg-amber-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-full" />
              </Link>
            </div>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => scrollTo('contact')}
                className="hidden lg:inline-flex items-center bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-5 py-2 rounded-full text-sm font-bold tracking-wide hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px transition-all duration-300"
              >
                Contact Us
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center border border-amber-500/25 rounded-xl text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/50 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div className={`fixed inset-0 z-40 bg-black/97 backdrop-blur-2xl flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col items-center gap-2 w-full px-8 pt-20 pb-10">
          {NAV_LINKS.map((l, i) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.section)}
              className="text-3xl font-black text-white/40 hover:text-white py-1.5 transition-colors duration-200"
              style={{
                animation: isOpen ? `heroUp 0.4s ease ${i * 0.06}s both` : 'none',
              }}
            >
              {l.label}
            </button>
          ))}
          <Link
            to="/survey"
            className="text-3xl font-black text-white/40 hover:text-white py-1.5 transition-colors duration-200"
            style={{ animation: isOpen ? `heroUp 0.4s ease ${NAV_LINKS.length * 0.06}s both` : 'none' }}
          >
            Survey
          </Link>
          <button
            onClick={() => scrollTo('contact')}
            className="mt-6 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-10 py-4 rounded-full text-base font-bold tracking-wide hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
            style={{ animation: isOpen ? `heroUp 0.4s ease ${(NAV_LINKS.length + 1) * 0.06}s both` : 'none' }}
          >
            Contact Us
          </button>
        </div>
      </div>

      <style>{`
        @keyframes heroUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}
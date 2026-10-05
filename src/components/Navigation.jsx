import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NAV_LINKS = [
  { label: 'Products', to: '/products' },
  { label: 'Services', to: '/services' },
  { label: 'About',    to: '/about' },
  { label: 'Careers',  to: '/careers' },
];

function ThemeToggle({ overDark }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 flex items-center justify-center border rounded-xl transition-colors duration-200 overflow-hidden ${
        overDark
          ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
          : 'border-line text-accent hover:bg-accent/10'
      }`}
    >
      <Moon size={17} className={`absolute transition-all duration-500 ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
      <Sun  size={17} className={`absolute transition-all duration-500 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
    </button>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close the mobile menu on navigation (adjust state during render,
  // not in an effect).
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // The home page opens on the always-dark cinematic hero.
  const overDark = location.pathname === '/' && !scrolled && !isOpen;

  const linkCls = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
      overDark
        ? isActive ? 'text-white' : 'text-white/70 hover:text-white'
        : isActive ? 'text-accent' : 'text-muted hover:text-ink'
    }`;

  return (
    <>
      <nav
        {...(overDark ? { 'data-always-dark': '' } : {})}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || isOpen
            ? 'bg-canvas/90 backdrop-blur-xl border-b border-line shadow-[0_8px_24px_-16px_rgba(0,0,0,0.4)]'
            : 'bg-transparent border-b border-transparent'
        }`}
        aria-label="Main"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px] gap-6">
            <Link to="/" className="flex items-center flex-shrink-0" aria-label="Bloxio home">
              <img
                src="/bloxio-logo.png"
                alt="Bloxio"
                width="400"
                height="75"
                className={`w-[92px] h-auto object-contain ${overDark ? '' : 'logo-adapt'}`}
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkCls}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      <span className={`absolute bottom-1 left-4 right-4 h-px bg-amber-500 origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <ThemeToggle overDark={overDark} />
              <Link
                to="/contact"
                className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_rgba(189,138,76,0.8)] transition-all duration-200"
              >
                Contact us
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden w-10 h-10 flex items-center justify-center border rounded-xl transition-colors duration-200 ${
                  overDark ? 'border-amber-500/30 text-amber-400' : 'border-line text-accent'
                }`}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-canvas transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col px-6 pt-28 pb-10">
          <nav className="flex flex-col border-t border-line" aria-label="Mobile">
            {[{ label: 'Home', to: '/' }, ...NAV_LINKS, { label: 'Contact', to: '/contact' }].map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                tabIndex={isOpen ? 0 : -1}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-line py-4 font-display text-2xl font-black transition-colors ${
                    isActive ? 'text-accent' : 'text-ink'
                  }`
                }
                style={{ animation: isOpen ? `menuIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both` : 'none' }}
              >
                {l.label}
                <ArrowRight size={20} className="text-muted" />
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-1 text-sm text-muted">
            <a href="mailto:contact@bloxio.tech" className="block text-accent font-semibold" tabIndex={isOpen ? 0 : -1}>contact@bloxio.tech</a>
            <p>Festac, Lagos, Nigeria</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes menuIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
      `}</style>
    </>
  );
}

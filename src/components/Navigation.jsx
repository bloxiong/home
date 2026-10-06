import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { COMPANY } from '../content/site';

const NAV_LINKS = [
  { label: 'Products',    to: '/products' },
  { label: 'Engineering', to: '/engineering' },
  { label: 'Research',    to: '/research' },
  { label: 'Company',     to: '/about' },
  { label: 'Journal',     to: '/journal' },
  { label: 'Contact',     to: '/contact' },
];


function ThemeToggle({ overDark }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-colors duration-200 ${
        overDark ? 'border-forest-line text-on-forest hover:border-signal' : 'border-line text-ink hover:border-accent'
      }`}
    >
      <Moon size={17} className={`absolute transition-all duration-500 ${isDark ? 'scale-50 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
      <Sun  size={17} className={`absolute transition-all duration-500 ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0'}`} />
    </button>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen]     = useState(false);
  const [origin, setOrigin]     = useState({ x: '90%', y: '34px' });
  const buttonRef = useRef(null);
  const firstLinkRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navRef = useRef(null);
  const [onDark, setOnDark] = useState(true);

  // The bar is transparent, so its icons and links follow whatever is
  // behind it: read the background colour just under the bar and switch
  // to light ink over dark sections, dark ink over light ones.
  useEffect(() => {
    let raf = 0;
    const sample = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const nav = navRef.current;
      const y = (nav?.offsetHeight ?? 68) / 2;
      const stack = document.elementsFromPoint(window.innerWidth / 2, y);
      for (const el of stack) {
        if (nav?.contains(el) || el.tagName === 'CANVAS') continue;
        let node = el;
        while (node && node !== document.documentElement) {
          const bg = getComputedStyle(node).backgroundColor;
          const m = bg.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const [r, g, b, a = 1] = m[1].split(',').map(Number);
            if (a > 0.5) {
              const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
              setOnDark(lum < 0.5);
              return;
            }
          }
          node = node.parentElement;
        }
      }
      setOnDark(document.documentElement.classList.contains('dark'));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sample); };
    // sample after the new page has painted, and whenever the theme flips
    const t = setTimeout(sample, 80);
    const mo = new MutationObserver(onScroll);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t); cancelAnimationFrame(raf); mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  // Close the mobile menu on navigation (adjust state during render).
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) return () => { document.body.style.overflow = ''; };
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => firstLinkRef.current?.focus({ preventScroll: true }), 350);
    const button = buttonRef.current;
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      button?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // the panel grows out of the menu button, wherever it sits
  const toggleMenu = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setOrigin({ x: `${r.left + r.width / 2}px`, y: `${r.top + r.height / 2}px` });
    setIsOpen((o) => !o);
  };

  const overDark = isOpen || onDark;

  const linkCls = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      overDark
        ? isActive ? 'text-on-forest' : 'text-forest-muted hover:text-on-forest'
        : isActive ? 'text-accent' : 'text-muted hover:text-ink'
    }`;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          isOpen
            ? 'border-b border-forest-line bg-forest'
            : scrolled
              ? 'border-b border-transparent bg-transparent backdrop-blur-md'
              : 'border-b border-transparent bg-transparent shadow-none'
        } ${overDark ? 'on-forest' : ''}`}
        aria-label="Main"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <Link to="/" className="flex shrink-0 items-center" aria-label="BLOXio home">
              <img src="/bloxio-logo.png" alt="BLOXio" width="400" height="75" className="h-auto w-[96px] object-contain" />
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkCls}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      <span
                        className={`absolute inset-x-3 -bottom-0.5 h-px origin-left transition-transform duration-300 ${
                          overDark ? 'bg-signal' : 'bg-accent'
                        } ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle overDark={overDark} />
              <Link
                to="/contact?topic=project"
                className={`group hidden min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 lg:inline-flex ${
                  overDark ? 'bg-on-forest text-forest hover:bg-white' : 'bg-accent text-on-accent hover:brightness-110'
                }`}
              >
                Start a project
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                ref={buttonRef}
                type="button"
                onClick={toggleMenu}
                className={`burger flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 lg:hidden ${
                  overDark ? 'border-forest-line text-on-forest' : 'border-line text-ink'
                }`}
                data-open={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                <span className="burger-lines" aria-hidden="true"><i /><i /><i /></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu: grows out of the button as a circle, links follow */}
      <div
        id="mobile-menu"
        className="menu-panel on-forest fixed inset-0 z-40 bg-forest text-on-forest lg:hidden"
        data-open={isOpen}
        style={{ '--mx': origin.x, '--my': origin.y }}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="field-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative flex h-full flex-col overflow-y-auto px-5 pt-24 pb-10 sm:px-6">
          <nav className="flex flex-col border-t border-forest-line" aria-label="Mobile">
            {[{ label: 'Home', to: '/' }, ...NAV_LINKS].map((l, i) => (
              <NavLink
                key={l.to}
                ref={i === 0 ? firstLinkRef : undefined}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `menu-item group flex items-center justify-between border-b border-forest-line py-4 ${isActive ? 'text-signal' : 'text-on-forest'}`
                }
                style={{ '--k': i }}
              >
                <span className="font-display text-2xl uppercase transition-transform duration-300 group-hover:translate-x-1">{l.label}</span>
                <ArrowRight size={20} className="text-forest-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-signal" />
              </NavLink>
            ))}
          </nav>
          <Link
            to="/contact?topic=project"
            className="menu-item mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-on-forest px-6 font-semibold text-forest"
            style={{ '--k': NAV_LINKS.length + 1 }}
          >
            Start a project <ArrowRight size={16} />
          </Link>
          <div className="menu-item mt-auto space-y-1 pt-10 text-sm text-forest-muted" style={{ '--k': NAV_LINKS.length + 2 }}>
            <a href={`mailto:${COMPANY.email}`} className="block font-semibold text-signal">{COMPANY.email}</a>
            <p>Festac, Lagos, Nigeria</p>
          </div>
        </div>
      </div>
    </>
  );
}

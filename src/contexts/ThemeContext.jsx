import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const STORAGE_KEY = 'bloxio-theme';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  // the cookie is shared across *.bloxio.tech, so the choice follows you between sites
  const shared = document.cookie.match(/(?:^|; )bx-theme=(dark|light)/)?.[1];
  const saved = shared || window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // System preference fallback: default to dark since the brand is dark-first
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage blocked: theme still applies */ }
    const domain = /(^|\.)bloxio\.tech$/.test(window.location.hostname) ? '; domain=.bloxio.tech' : '';
    document.cookie = `bx-theme=${theme}; path=/; max-age=31536000; SameSite=Lax${domain}${window.location.protocol === 'https:' ? '; Secure' : ''}`;
  }, [theme]);

  const setTheme = (next) => {
    if (next === 'dark' || next === 'light') setThemeState(next);
  };
  /* The new theme spreads out as a circle from the toggle (`origin`, in
     viewport px), using the View Transitions API. Without it, or with reduced motion, the
     theme simply switches. */
  const toggleTheme = (origin) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      flushSync(() => setThemeState(next));
      document.documentElement.classList.toggle('dark', next === 'dark');
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { apply(); return; }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = origin?.x ?? w - 60;
    const y = origin?.y ?? 34;
    // Position and size the circle in percentages of the screen, not pixels:
    // some mobile browsers scale the transition snapshot, which would pull a
    // pixel-placed circle towards the middle. For circle(), a % radius is
    // measured against sqrt((w² + h²) / 2).
    const px = (x / w) * 100;
    const py = (y / h) * 100;
    const rPct = (Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) / Math.sqrt((w * w + h * h) / 2)) * 100;
    const t = document.startViewTransition(apply);
    // Phones get a slightly longer, softer reveal so the circle reads well
    // as it travels down a tall screen.
    const phone = window.innerWidth < 768;
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0% at ${px}% ${py}%)`, `circle(${rPct + 1}% at ${px}% ${py}%)`] },
        { duration: phone ? 950 : 750, easing: phone ? 'cubic-bezier(0.45, 0, 0.2, 1)' : 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

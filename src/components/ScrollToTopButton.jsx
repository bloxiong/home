import { useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SHOW_AFTER = 320;

const scrollToTop = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduceMotion ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTo({ top: 0, left: 0, behavior });
  document.body.scrollTo({ top: 0, left: 0, behavior });
};

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  // the survey has its own Back/Next bar where this button would sit
  const { pathname } = useLocation();
  const hidden = pathname.endsWith('/survey');

  useEffect(() => {
    const update = () => {
      const scrollY =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setVisible(scrollY > SHOW_AFTER);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToTop();
  }, []);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={visible ? 0 : -1}
      className={`nav-gold gold-ring group fixed bottom-6 right-5 z-[45] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full
        transition-all duration-300 ease-out sm:bottom-8 sm:right-8
        ${visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ChevronUp
        size={26}
        strokeWidth={2.5}
        // the same metallic gold as the nav icons (gradient defined in Navigation)
        stroke="url(#bx-nav-gold)"
        className="relative pointer-events-none transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}

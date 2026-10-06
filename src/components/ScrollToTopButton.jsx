import { useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

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

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-6 right-5 z-[45] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full
        border border-line bg-surface/90 text-accent backdrop-blur-md transition-all duration-300 ease-out
        hover:border-accent sm:bottom-8 sm:right-8
        ${visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ChevronUp
        size={20}
        strokeWidth={2.5}
        className="relative pointer-events-none transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}

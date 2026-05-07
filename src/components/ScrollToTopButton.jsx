import { useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

const SHOW_AFTER = 320;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const scrollToTop = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduceMotion ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTo({ top: 0, left: 0, behavior });
  document.body.scrollTo({ top: 0, left: 0, behavior });
};

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollY =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const max =
        (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      setVisible(scrollY > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(scrollY / max, 1) : 0);
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
      className={`group fixed z-60 bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 rounded-full
        flex items-center justify-center
        bg-white/80 dark:bg-black/70 backdrop-blur-md
        border border-amber-500/30 hover:border-amber-500/70
        shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25
        text-amber-600 dark:text-amber-400 hover:text-amber-500
        transition-all duration-300 ease-out cursor-pointer
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>
      <ChevronUp
        size={20}
        strokeWidth={2.5}
        className="relative pointer-events-none transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}

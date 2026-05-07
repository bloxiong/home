import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        if (window.scrollY === 0) return;

        // Respect users who've asked for less motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, 0);
            return;
        }

        // Kill any in-flight scroll tween (rapid route changes) before starting a new one
        gsap.killTweensOf(window);
        gsap.to(window, {
            duration: 0.9,
            scrollTo: { y: 0, autoKill: true },
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;

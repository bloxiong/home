import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import Starfield from './components/Starfield';
import { isAgroHost, isMainLiveHost, MAIN_URL, AGRO_URL } from './lib/hosts';
import { trackView } from './lib/track';

// Everything except the home page loads on demand.
const Products     = lazy(() => import('./pages/Products'));
const AgroSense360 = lazy(() => import('./pages/AgroSense360'));
const Engineering  = lazy(() => import('./pages/Engineering'));
const Research     = lazy(() => import('./pages/Research'));
const Journal      = lazy(() => import('./pages/Journal'));
const JournalArticle = lazy(() => import('./pages/JournalArticle'));
const About        = lazy(() => import('./pages/About'));
const Careers      = lazy(() => import('./pages/Careers'));
const Contact      = lazy(() => import('./pages/Contact'));
const Privacy      = lazy(() => import('./pages/Privacy'));
const Survey       = lazy(() => import('./pages/Survey'));

/* Each page change remounts its content so it rises in (see .page-enter).
   Hash links within a page don't trigger it. */
/* One page view per route change (live site only) */
function PageViews() {
  const { pathname } = useLocation();
  React.useEffect(() => { trackView(pathname); }, [pathname]);
  return null;
}

function PageTransition({ children }) {
  const { pathname } = useLocation();
  // count route changes (React's "adjust state while rendering" pattern) so
  // the first load gets no curtain and every later change gets a fresh one
  const [prev, setPrev] = useState(pathname);
  const [moves, setMoves] = useState(0);
  if (pathname !== prev) {
    setPrev(pathname);
    setMoves((m) => m + 1);
  }
  return (
    <>
      {/* the loader's curtain, with its gold planet-edge, lifts off each new page (not on first load) */}
      {moves > 0 && (
        <div key={moves} className="route-curtain" aria-hidden="true">
          <img src="/brand/star.png" alt="" width="160" height="159" className="route-curtain-star" />
        </div>
      )}
      <PageErrorBoundary key={pathname}>
        <div className="page-enter">{children}</div>
      </PageErrorBoundary>
    </>
  );
}

/* A page that throws should never blank the whole site. A stale chunk after a
   deploy gets one reload; anything else shows a way back home. */
class PageErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    const stale = /dynamically imported module|Loading chunk|Importing a module script/i.test(String(error?.message));
    if (stale && !sessionStorage.getItem('bx-reloaded')) {
      sessionStorage.setItem('bx-reloaded', '1');
      window.location.reload();
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-5 pt-32 pb-16 sm:px-6">
        <p className="text-label text-accent">Something went wrong</p>
        <h1 className="font-display mt-4 text-3xl uppercase text-ink">This page didn't load.</h1>
        <a href="/" className="mt-8 inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-canvas">Back to home</a>
      </div>
    );
  }
}

/* Leaves this site for the same path on another one (full page load). */
function GoTo({ to }) {
  const { search, hash } = useLocation();
  React.useEffect(() => { window.location.replace(to + search + hash); }, [to, search, hash]);
  return <div className="min-h-screen bg-canvas" />;
}

function ToMainSite() {
  const { pathname } = useLocation();
  return <GoTo to={MAIN_URL + pathname} />;
}

/* agrosense360.bloxio.tech: the product page at /, the survey at /survey,
   everything else belongs to the main site */
function AgroRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AgroSense360 />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/__home" element={<GoTo to={`${MAIN_URL}/`} />} />
      <Route path="/products/agrosense360" element={<Navigate to="/" replace />} />
      <Route path="/products/agrosense360/survey" element={<Navigate to="/survey" replace />} />
      <Route path="*" element={<ToMainSite />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <PageViews />
      <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas text-ink">
        <Navigation />
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
            <PageTransition>
            {isAgroHost ? <AgroRoutes /> : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/agrosense360" element={isMainLiveHost ? <GoTo to={`${AGRO_URL}/`} /> : <AgroSense360 />} />
              <Route path="/engineering" element={<Engineering />} />
              <Route path="/services" element={<Navigate to="/engineering" replace />} />
              <Route path="/research" element={<Research />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/journal/:slug" element={<JournalArticle />} />
              <Route path="/company" element={<Navigate to="/about" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/products/agrosense360/survey" element={isMainLiveHost ? <GoTo to={`${AGRO_URL}/survey`} /> : <Survey />} />
              <Route path="/survey" element={<Navigate to="/products/agrosense360/survey" replace />} />
              <Route path="/survey/AgroSense360" element={<Navigate to="/products/agrosense360/survey" replace />} />
              {/* Any unknown address goes home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            )}
            </PageTransition>
          </Suspense>
        </main>
        <Footer />
        <ScrollToTopButton />
        <Starfield />
      </div>
    </Router>
  );
}

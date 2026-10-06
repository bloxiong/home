import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import Starfield from './components/Starfield';

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
function PageTransition({ children }) {
  const { pathname } = useLocation();
  return <div key={pathname} className="page-enter">{children}</div>;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas text-ink">
        <Navigation />
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
            <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/agrosense360" element={<AgroSense360 />} />
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
              <Route path="/products/agrosense360/survey" element={<Survey />} />
              <Route path="/survey" element={<Navigate to="/products/agrosense360/survey" replace />} />
              <Route path="/survey/AgroSense360" element={<Navigate to="/products/agrosense360/survey" replace />} />
              {/* Any unknown address goes home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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

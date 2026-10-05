import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

// Everything except the home page loads on demand.
const Products     = lazy(() => import('./pages/Products'));
const AgroSense360 = lazy(() => import('./pages/AgroSense360'));
const Services     = lazy(() => import('./pages/Services'));
const About        = lazy(() => import('./pages/About'));
const Careers      = lazy(() => import('./pages/Careers'));
const Contact      = lazy(() => import('./pages/Contact'));
const Privacy      = lazy(() => import('./pages/Privacy'));
const Survey       = lazy(() => import('./pages/Survey'));
const SurveyForm   = lazy(() => import('./pages/AgroSense360-Survey'));
const NotFound     = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="bg-canvas text-ink min-h-screen flex flex-col overflow-x-clip">
        <Navigation />
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/agrosense360" element={<AgroSense360 />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/survey/AgroSense360" element={<SurveyForm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </Router>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Survey from './pages/Survey';
import AgroSense360_Survey from './pages/AgroSense360-Survey';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="bg-stone-50 text-stone-900 dark:bg-black dark:text-white min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/survey/AgroSense360" element={<AgroSense360_Survey />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
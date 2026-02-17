import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Survey from './pages/Survey';

export default function App() {
  return (
    <Router>
      <div className="bg-black text-white min-h-screen flex flex-col overflow-x-hidden">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<Survey />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
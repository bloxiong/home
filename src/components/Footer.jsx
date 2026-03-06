import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="bg-black border-t border-amber-500/20 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/bloxio.png" alt="Bloxio" className="w-20 h-8 object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Innovating tomorrow's technology today. Pioneering research, development, and delivery of cutting-edge solutions.
            </p>
          </div>
          
          <div>
            <h4 className="text-gold-light font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                About
              </button>
              <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                Services
              </button>
              <button onClick={() => scrollToSection('vision')} className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                Vision
              </button>
              <button onClick={() => scrollToSection('directors')} className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                Directors
              </button>
              <Link to="/survey" className="block text-gray-400 hover:text-gold-light transition-colors text-sm">
                Survey
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-gold-light font-bold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>bloxionigerialimited@gmail.com</p>
              <p>[removed] | [removed]</p>
              <p>Lagos State, Nigeria</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-amber-500/10 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Bloxio Nigeria Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const scrollToSection = (sectionId) => {
    setIsOpen(false);
    
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-lg shadow-lg shadow-amber-900/20' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/bloxio.jpg" alt="Bloxio" className="w-16 h-7 sm:w-20 sm:h-8 object-contain" />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              About
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              Services
            </button>
            <button onClick={() => scrollToSection('vision')} className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              Vision
            </button>
            <button onClick={() => scrollToSection('directors')} className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              Directors
            </button>
            <Link to="/survey" className="text-gray-300 hover:text-gold-light transition-all duration-300 font-medium">
              Survey
            </Link>
            <button onClick={() => scrollToSection('contact')} className="bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden text-gold-light p-2 hover:bg-amber-500/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-amber-500/20 pt-4 animate-slideDown">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('vision')} 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                Vision
              </button>
              <button 
                onClick={() => scrollToSection('directors')} 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                Directors
              </button>
              <Link 
                to="/survey" 
                className="text-left text-gray-300 hover:text-gold-light hover:bg-amber-500/10 transition-all px-4 py-3 rounded-lg font-medium"
              >
                Survey
              </Link>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-left bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all mt-2"
              >
                Contact Us
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}
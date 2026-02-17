import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-amber-900/5 via-transparent to-amber-950/5"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20 sm:py-0">
        <div className="text-center">
          <div className="mb-8 sm:mb-12 flex justify-center animate-float">
            <img 
              src="/bloxio.gif" 
              alt="Bloxio Logo" 
              className="w-64 sm:w-80 h-auto drop-shadow-2xl max-w-full"
            />
          </div>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-4 sm:mb-6 max-w-4xl mx-auto font-light px-4">
            One step ahead of tech
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Pioneering research, development, and delivery of cutting-edge technology solutions that transform industries and improve lives across the globe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <button onClick={() => scrollToSection('about')} className="group bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-2">
              Discover More
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button onClick={() => scrollToSection('contact')} className="border-2 border-gold-dark text-gold px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gold-light hover:text-black transition-all duration-300 transform hover:scale-110">
              Get in Touch
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
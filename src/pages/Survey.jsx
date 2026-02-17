import React, { useState } from 'react';
import { ClipboardCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Survey() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gold-light hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/50">
              <ClipboardCheck className="text-black" size={40} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Customer Survey
            </span>
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your feedback helps us innovate better. Share your thoughts and help shape the future of technology with Bloxio.
          </p>
        </div>

        {/* Survey Container */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-amber-500/30 shadow-2xl shadow-amber-900/20 overflow-hidden">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-900/40 to-amber-950/40 border-b border-amber-500/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1">Bloxio Technology Survey</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Takes approximately 3-5 minutes to complete</p>
                  </div>
                </div>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfq7-m6lHGLhZ6a0EJmi6CbUO1TXRiIkWEck6nLtaWLkA5e9Q/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-gold-light to-gold text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                >
                  Open in New Tab
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Embedded Form */}
            <div className="relative bg-white" style={{ minHeight: '600px' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading survey...</p>
                  </div>
                </div>
              )}
              
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSfq7-m6lHGLhZ6a0EJmi6CbUO1TXRiIkWEck6nLtaWLkA5e9Q/viewform?embedded=true"
                className="w-full border-0"
                style={{ height: '800px', maxHeight: '90vh' }}
                onLoad={() => setIsLoading(false)}
                title="Bloxio Customer Survey"
              >
                Loading survey...
              </iframe>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-gray-900 to-black border-t border-amber-500/20 p-4 sm:p-6">
              <div className="text-center text-gray-400 text-xs sm:text-sm">
                <p className="mb-2">
                  <span className="text-amber-400 font-semibold">🔒 Your privacy matters:</span> All responses are confidential and will only be used to improve our services.
                </p>
                <p className="text-gray-500">
                  Thank you for taking the time to help us serve you better!
                </p>
              </div>
            </div>
          </div>

          {/* Additional CTAs */}
          <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <h4 className="text-gold-light font-bold text-lg mb-2">Need Help?</h4>
              <p className="text-gray-400 text-sm mb-4">
                If you encounter any issues with the survey, please contact our support team.
              </p>
              <a 
                href="mailto:bloxionigerialimited@gmail.com" 
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-1"
              >
                Contact Support
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <h4 className="text-gold-light font-bold text-lg mb-2">Learn More</h4>
              <p className="text-gray-400 text-sm mb-4">
                Discover how Bloxio is innovating technology solutions for the future.
              </p>
              <Link 
                to="/#about" 
                className="text-amber-400 hover:text-amber-300 text-sm font-medium inline-flex items-center gap-1"
              >
                Explore Our Vision
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
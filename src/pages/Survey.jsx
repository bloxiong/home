import React, { useState } from 'react';
import { ClipboardCheck, ExternalLink, ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Eye, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AgroSense360_Survey from './AgroSense360-Survey';

export default function Survey() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-800/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/4 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* Page header */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
            <span className="font-medium text-sm">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 rounded-2xl blur-xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40">
                <ClipboardCheck className="text-black" size={38} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Customer Survey
            </span>
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full mb-5" />
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Your feedback helps us innovate better. Share your thoughts and help shape the future of technology with Bloxio.
          </p>
        </div>
        <AgroSense360_Survey/>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
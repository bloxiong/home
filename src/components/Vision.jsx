import React from 'react';

export default function Vision() {
  return (
    <section id="vision" className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-amber-900/20 via-black to-amber-950/20 rounded-3xl p-12 md:p-16 border-2 border-amber-500/30 shadow-2xl shadow-amber-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-700/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                    Our Vision
                  </span>
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-gray-200 text-xl md:text-2xl leading-relaxed text-center mb-12">
                To be recognized globally as a pioneering technology company that consistently delivers innovative solutions, setting new standards in quality, sustainability, and technological advancement.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-black/40 rounded-2xl border border-amber-500/20">
                  <div className="text-4xl font-black text-gold-light mb-2">Innovation</div>
                  <p className="text-gray-400">Leading through cutting-edge research</p>
                </div>
                <div className="text-center p-6 bg-black/40 rounded-2xl border border-amber-500/20">
                  <div className="text-4xl font-black text-gold-light mb-2">Excellence</div>
                  <p className="text-gray-400">Delivering quality in every solution</p>
                </div>
                <div className="text-center p-6 bg-black/40 rounded-2xl border border-amber-500/20">
                  <div className="text-4xl font-black text-gold-light mb-2">Impact</div>
                  <p className="text-gray-400">Creating positive global change</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Target, Users, Lightbulb, Award, Zap, Globe, Shield, TrendingUp, Cpu, Rocket } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhNzhmMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djEwaC0xMFYxNmgxMHpNMTQgMTZ2MTBINFYxNmgxMHptNDQgMHYxMGgtMTBWMTZoMTB6TTE0IDR2MTBINFY0aDEwem00NCAwdjEwaC0xMFY0aDEwek0zNiA0djEwaC0xMFY0aDEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              About Bloxio
            </span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            A technology company built on innovation, excellence, and the vision to shape the future
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 border border-amber-500/20 shadow-2xl shadow-amber-900/10 hover:border-amber-500/40 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Target className="text-black" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-gold-dark mb-6">Our Aim</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              To research, invent, develop, produce, market, and deliver innovative and high-quality technology products and services that improve lives, solve real-world problems, and drive technological advancement globally.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 border border-amber-500/20 shadow-2xl shadow-amber-900/10 hover:border-amber-500/40 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Lightbulb className="text-black" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-gold-dark mb-6">Our Mission</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              To become a leading force in technology innovation, delivering solutions that not only meet today's challenges but anticipate tomorrow's needs, while maintaining the highest standards of quality and sustainability.
            </p>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-10 md:p-14 border border-amber-500/20 shadow-2xl shadow-amber-900/10">
            <h3 className="text-3xl md:text-4xl font-bold text-gold-light mb-10 text-center">Our Strategic Objectives</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Cpu, text: "Conduct extensive research in emerging and advanced technologies" },
                { icon: Rocket, text: "Invent and develop new technological solutions that address industry needs" },
                { icon: Award, text: "Design, prototype, and manufacture high-quality tech products" },
                { icon: Globe, text: "Create integrated ecosystems of smart devices and platforms" },
                { icon: TrendingUp, text: "Market and distribute technology products globally" },
                { icon: Zap, text: "Transform research findings into commercially successful solutions" },
                { icon: Shield, text: "Provide technical services, maintenance, and customer support" },
                { icon: Target, text: "Uphold sustainability and energy-efficient practices" },
                { icon: Lightbulb, text: "Ensure continuous improvement through innovation" },
                { icon: Users, text: "Build partnerships for growth and market expansion" }
              ].map((objective, index) => {
                const Icon = objective.icon;
                return (
                  <div key={index} className="flex items-start gap-4 bg-black/40 p-5 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="text-black" size={24} />
                    </div>
                    <p className="text-gray-300 text-base leading-relaxed pt-2">{objective.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function Directors() {
  const directors = [
    {
      name: "Anyakie Owen",
      title: "Co-Founder & Director",
      education: "B.Eng Electrical Electronics Engineering",
      specialization: "Major in Electronics",
      email: "owenanyakie@gmail.com",
      phone: "[removed]",
    },
    {
      name: "Austin Chris",
      title: "Co-Founder & Director",
      education: "B.Eng Electrical Electronics Engineering",
      specialization: "Major in Electronics",
      email: "austinchrisiwu@gmail.com",
      phone: "[removed]",
    }
  ];

  return (
    <section id="directors" className="py-24 bg-black relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Our Leadership
            </span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Meet the visionary leaders driving innovation and excellence at Bloxio
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {directors.map((director, index) => (
            <div key={index} className="group bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-10 border-2 border-amber-500/30 hover:border-amber-500/60 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 transform hover:scale-105">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-28 h-28 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-full flex items-center justify-center text-black text-4xl font-black mb-6 shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform">
                  {director.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-3xl font-black text-gold-light mb-2">{director.name}</h3>
                <p className="text-amber-500 text-lg font-semibold mb-3">{director.title}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-amber-500/10">
                  <p className="text-gray-400 text-sm mb-1">Education</p>
                  <p className="text-gray-200 font-semibold">{director.education}</p>
                  <p className="text-gold-light text-sm">{director.specialization}</p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-2xl border border-amber-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail size={18} className="text-amber-500" />
                    <a href={`mailto:${director.email}`} className="text-gray-300 hover:text-gold-light transition-colors text-sm">
                      {director.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-amber-500" />
                    <p className="text-gray-300 text-sm">{director.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
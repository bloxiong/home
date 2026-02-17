import React from 'react';
import { Cpu, Award, Globe, Users, Lightbulb, Shield } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: "Technology Research & Development",
      description: "Cutting-edge R&D in emerging technologies including AI, IoT, and advanced electronics systems",
      icon: Cpu
    },
    {
      title: "Product Design & Manufacturing",
      description: "From concept to production, we design and manufacture high-quality technology products",
      icon: Award
    },
    {
      title: "Smart Device Ecosystems",
      description: "Integrated platforms and smart device solutions for modern connected living",
      icon: Globe
    },
    {
      title: "Technical Consulting",
      description: "Expert consultation services for technology implementation and system optimization",
      icon: Users
    },
    {
      title: "Innovation Solutions",
      description: "Transforming innovative ideas into market-ready technology solutions",
      icon: Lightbulb
    },
    {
      title: "Technical Support & Maintenance",
      description: "Comprehensive support services ensuring optimal performance of technology systems",
      icon: Shield
    }
  ];

  return (
    <section id="services" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/5 via-transparent to-amber-950/5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Comprehensive technology solutions tailored to meet modern industry demands
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="group bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-amber-500/20 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Icon className="text-black" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gold-light mb-4">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
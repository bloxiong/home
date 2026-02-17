import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = () => {
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:bloxionigerialimited@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Ready to innovate together? We'd love to hear from you
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 border border-amber-500/20 shadow-2xl">
            <h3 className="text-3xl font-bold text-gold-light mb-8">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-amber-500/10">
                <MapPin className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                <div>
                  <p className="text-gray-300 font-bold mb-2 text-lg">Company Address</p>
                  <p className="text-gray-400 leading-relaxed">
                    Plot AV 27B 251 Road Festac Phase II,<br />
                    Abule Ado, Lagos State, Nigeria
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-amber-500/10">
                <Mail className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                <div>
                  <p className="text-gray-300 font-bold mb-2 text-lg">Email Address</p>
                  <a href="mailto:bloxionigerialimited@gmail.com" className="text-gold-light hover:text-amber-300 transition-colors text-lg">
                    bloxionigerialimited@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-amber-500/10">
                <Phone className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                <div>
                  <p className="text-gray-300 font-bold mb-2 text-lg">Phone Numbers</p>
                  <p className="text-gray-400 mb-1 text-lg">[removed] (Owen)</p>
                  <p className="text-gray-400 text-lg">[removed] (Austin)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 border border-amber-500/20 shadow-2xl">
            <h3 className="text-3xl font-bold text-gold-light mb-8">Send Us a Message</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-5 py-4 text-gray-300 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Your Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-5 py-4 text-gray-300 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Your Message</label>
                <textarea 
                  placeholder="Tell us about your project or inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-5 py-4 text-gray-300 focus:border-amber-500 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>
              
              <button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-gold-light via-gold to-gold-dark text-black px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
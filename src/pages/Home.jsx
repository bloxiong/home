import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Vision from '../components/Vision';
import Directors from '../components/Directors';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Vision />
      <Directors />
      <Contact />
    </>
  );
}
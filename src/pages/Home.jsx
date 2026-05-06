import React from 'react';
import CinematicHero from '../components/CinematicHero';
import About from '../components/About';
import Services from '../components/Services';
import Vision from '../components/Vision';
import Directors from '../components/Directors';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <>
      <CinematicHero />
      <About />
      <Services />
      <Vision />
      <Directors />
      <FAQ />
      <Contact />
    </>
  );
}

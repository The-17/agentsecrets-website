'use client';

import React from 'react';
import Nav from '@/components/nav';
import Hero from '@/components/hero';
import ModelSection from '@/components/model-section';
import VisWorkflowWheel from '@/components/vis-workflow-wheel';
import FeaturesGrid from '@/components/features-grid';
import StatsSection from '@/components/stats-section';
import PlatformSection from '@/components/platform-section';
import BuildSection from '@/components/build-section';
import FAQSection from '@/components/faq-section';
import Footer from '@/components/footer';

export default function HomePage() {
  React.useEffect(() => {
    // Check if there is a hash in the URL on mount/transition (e.g., coming from /docs)
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        // A short timeout to ensure the DOM elements are fully mounted and laid out
        const timer = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 450);
        return () => clearTimeout(timer);
      }
    };

    handleHashScroll();
    
    // Also listen to hash changes
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  return (
    <main className='selection-teal min-h-screen bg-white overflow-x-hidden'>
      <Nav />
      <Hero />
      <ModelSection />
      <VisWorkflowWheel />
      <div className='hidden md:block h-[200vh] pointer-events-none' />
      <div className='relative z-10'>
        <FeaturesGrid />
      </div>
      <StatsSection />
      <PlatformSection />
      <BuildSection />
      <FAQSection />
      <Footer />
    </main>
  );
}

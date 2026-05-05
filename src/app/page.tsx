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

export default function HomePage() {
  return (
    <main className='selection-teal min-h-screen bg-white'>
      <Nav />
      <Hero />
      <ModelSection />
      <VisWorkflowWheel />
      <div className='h-[200vh] pointer-events-none' />
      <div className='relative z-10'>
        <FeaturesGrid />
      </div>
      <StatsSection />
      <PlatformSection />
      <BuildSection />
    </main>
  );
}

import React from 'react';
import PlaybookHero from '@/components/dashboard/PlaybookHero';
import ImpactMetrics from '@/components/dashboard/ImpactMetrics';
import ProblemSolutionMap from '@/components/dashboard/ProblemSolutionMap';
import PitchEngine from '@/components/dashboard/PitchEngine';

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <PlaybookHero />
      <ImpactMetrics />
      <ProblemSolutionMap />
      <PitchEngine />
    </div>
  );
}
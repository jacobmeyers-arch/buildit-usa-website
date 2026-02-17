import React from 'react';
import { useProject } from '../context/ProjectContext';

export default function SplashScreen() {
  const { setAppScreen } = useProject();

  const handleCTA = () => {
    setAppScreen('camera');
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Branding */}
        <div className="space-y-2">
          <h1 className="font-pencil-hand text-5xl text-parchment">
            BuildIt USA
          </h1>
          <p className="font-serif text-parchment/80 text-lg">
            Turn your vision into a build plan
          </p>
        </div>

        {/* Value prop */}
        <div className="space-y-4 text-parchment/70 font-serif">
          <p className="text-base">
            Snap a photo of your project site. Get a detailed scope, timeline, and budget — powered by AI.
          </p>
          <p className="text-sm">
            Free estimate. Upgrade for full construction docs.
          </p>
        </div>

        {/* CTA button - 44x44 min tap target */}
        <button
          onClick={handleCTA}
          className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
          aria-label="Start your project estimate"
        >
          Let's Go
        </button>

        {/* Footer tagline */}
        <p className="text-parchment/50 text-xs font-serif">
          Built by builders, for builders.
        </p>
      </div>
    </div>
  );
}

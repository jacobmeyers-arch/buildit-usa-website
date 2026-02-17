import React, { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export default function AnalyzingScreen() {
  const { setAppScreen } = useProject();

  // Auto-transition to analysis screen after component mounts
  // The AIAnalysis component will handle the actual API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppScreen('analysis');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [setAppScreen]);

  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Animated spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-wood"></div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Analyzing Your Project
          </h2>
          <p className="font-serif text-parchment/70 text-base">
            Looking at materials, structure, and scope...
          </p>
        </div>

        {/* Subtle hint */}
        <p className="font-serif text-parchment/50 text-sm pt-4">
          This usually takes 10-15 seconds
        </p>
      </div>
    </div>
  );
}

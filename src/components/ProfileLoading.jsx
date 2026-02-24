/**
 * ProfileLoading — Animated loading screen during property profile generation
 * 
 * Calls generateProfile() on mount and shows animated step indicators.
 * On success, stores profile in context and transitions to propertyProfile.
 * Includes error state with retry and AbortController for cleanup.
 * 
 * Created: 2026-02-17
 */

import React, { useEffect, useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { generateProfile } from '../lib/api';

// Loading steps shown to the user (timed for visual effect)
const LOADING_STEPS = [
  { label: 'Finding your property...', delay: 0 },
  { label: 'Pulling structure data...', delay: 1500 },
  { label: 'Checking exterior imagery...', delay: 3000 },
  { label: 'Analyzing project opportunities...', delay: 5000 }
];

export default function ProfileLoading() {
  const { validatedAddress, setPropertyProfile, setAppScreen } = useProject();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Advance through visual steps on a timer
  useEffect(() => {
    const timers = LOADING_STEPS.map((step, index) => {
      if (index === 0) return null; // First step is immediate
      return setTimeout(() => setActiveStep(index), step.delay);
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, []);

  // Call the profile generation API on mount
  // Ensures a minimum 2.5s display so loading steps don't flash by on cached results
  useEffect(() => {
    if (!validatedAddress) {
      setAppScreen('addressInput');
      return;
    }

    // AbortController for cleanup on unmount (guards state updates, not the fetch itself)
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const mountTime = Date.now();
    const MIN_DISPLAY_MS = 2500;

    async function fetchProfile() {
      try {
        const result = await generateProfile(validatedAddress, false);

        // Check if component was unmounted
        if (controller.signal.aborted) return;

        // Ensure minimum display time so loading steps don't flash
        const elapsed = Date.now() - mountTime;
        if (elapsed < MIN_DISPLAY_MS) {
          await new Promise(resolve => setTimeout(resolve, MIN_DISPLAY_MS - elapsed));
        }

        if (controller.signal.aborted) return;

        if (result.success && result.profile) {
          setPropertyProfile({
            ...result.profile,
            id: result.cacheId,
            cached: result.cached
          });
          setAppScreen('propertyProfile');
        } else {
          setError('Could not generate a property profile. Please try a different address.');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Profile generation error:', err);
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }

    fetchProfile();

    return () => {
      controller.abort();
    };
  }, [validatedAddress]);

  // Retry handler
  const handleRetry = () => {
    setError(null);
    setActiveStep(0);
    // Re-trigger by going back to addressInput
    setAppScreen('addressInput');
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Address being looked up */}
        <div className="space-y-2">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Looking Up Your Property
          </h2>
          <p className="font-serif text-parchment/60 text-sm">
            {validatedAddress?.formattedAddress || 'Loading...'}
          </p>
        </div>

        {error ? (
          /* Error state */
          <div className="space-y-4">
            <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-4">
              <p className="font-serif text-parchment text-sm">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-2 px-6 rounded-md transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Loading steps */
          <div className="space-y-4 text-left">
            {LOADING_STEPS.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-opacity duration-500 ${
                  index <= activeStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {/* Step indicator */}
                {index < activeStep ? (
                  // Completed step — checkmark
                  <div className="w-6 h-6 rounded-full bg-brass/80 flex items-center justify-center flex-shrink-0">
                    <span className="text-iron text-xs font-bold">✓</span>
                  </div>
                ) : index === activeStep ? (
                  // Active step — spinning
                  <div className="w-6 h-6 flex-shrink-0">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brass"></div>
                  </div>
                ) : (
                  // Future step — empty circle
                  <div className="w-6 h-6 rounded-full border border-parchment/30 flex-shrink-0"></div>
                )}

                {/* Step label */}
                <p className={`font-serif text-sm ${
                  index <= activeStep ? 'text-parchment' : 'text-parchment/50'
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

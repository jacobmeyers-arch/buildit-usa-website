/**
 * SplashScreen — Landing page with dual CTA
 * 
 * Modified: 2026-02-17 — Added "Enter Your Address" secondary CTA button
 *   for the address-to-profile flow alongside the existing camera flow.
 */

import React from 'react';
import { useProject } from '../context/ProjectContext';

export default function SplashScreen() {
  const { setAppScreen } = useProject();

  const handleCameraFlow = () => {
    setAppScreen('camera');
  };

  const handleAddressFlow = () => {
    setAppScreen('addressInput');
  };

  return (
    <div className="min-h-screen bg-workshop flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Branding */}
        <div className="space-y-2">
          <h1 className="font-pencil-hand text-5xl text-parchment">
            BuildIt USA
          </h1>
          <p className="font-serif text-parchment/80 text-lg">
            Turn your vision into a <span className="sketch-underline">build plan</span>
          </p>
        </div>

        {/* Value prop */}
        <div className="space-y-4 text-parchment/70 font-serif">
          <p className="text-base">
            Snap a photo of your project site. Get a detailed scope, timeline, and budget in minutes.
          </p>
          <p className="text-sm">
            Free estimate. Upgrade for full construction docs.
          </p>
        </div>

        {/* Primary CTA — camera flow */}
        <button
          onClick={handleCameraFlow}
          className="btn-iron-light w-full min-h-[50px] text-xl py-3 px-8 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Start your project estimate with a photo"
        >
          Let's Go
        </button>

        {/* Divider with brass nail accents */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-iron-mid"></div>
          <span className="brass-nail"></span>
          <span className="font-serif text-parchment/40 text-sm">or</span>
          <span className="brass-nail"></span>
          <div className="flex-1 h-px bg-iron-mid"></div>
        </div>

        {/* Secondary CTA — address flow */}
        <button
          onClick={handleAddressFlow}
          className="btn-ghost-parchment w-full min-h-[50px] text-lg py-3 px-8 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Start your project estimate with your address"
        >
          Enter Your Address
        </button>

        {/* Footer tagline */}
        <p className="text-parchment/50 text-xs font-serif">
          Built by builders, for builders.
        </p>
      </div>
    </div>
  );
}

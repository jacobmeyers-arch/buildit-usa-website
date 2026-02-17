/**
 * UpsellScreen — "How many projects?" + value anchor + upgrade CTA
 * Step 13 UI. Shows after first free project estimate.
 */
import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';

export default function UpsellScreen() {
  const { currentUser, setAppScreen, setPlanStatus } = useProject();
  const [projectCount, setProjectCount] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProjectCount = (e) => {
    const val = e.target.value;
    setProjectCount(val);
    if (val && parseInt(val) > 0) {
      setShowValue(true);
      // Fire analytics event
      trackEvent('upsell_shown', { project_count: parseInt(val) });
    } else {
      setShowValue(false);
    }
  };

  const trackEvent = async (eventType, metadata = {}) => {
    try {
      await fetch('/api/plan-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          eventType,
          metadata
        })
      });
    } catch (err) {
      console.warn('Analytics event failed:', err);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Trigger magic link auth for payment verification
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: currentUser?.email
      });
      if (authError) throw authError;
      
      // Fire analytics
      trackEvent('upsell_clicked', { project_count: parseInt(projectCount) || 0 });
      
      // Navigate to magic link pending screen
      setAppScreen('magicLinkPending');
    } catch (err) {
      console.error('Magic link failed:', err);
      setError('Failed to send verification email. Please try again.');
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    trackEvent('upsell_declined');
    setAppScreen('estimate');
  };

  const count = parseInt(projectCount) || 0;
  const consultantLow = count * 75;
  const consultantHigh = count * 150;

  return (
    <div className="min-h-screen bg-iron text-parchment flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Heading */}
        <h1 className="font-pencil-hand text-3xl">
          Plan Your Whole House
        </h1>
        <p className="font-serif text-parchment/80">
          One project down. How many more are on your list?
        </p>

        {/* Project count input */}
        <div className="space-y-4">
          <label className="block font-serif text-sm text-parchment/70">
            How many projects are on your list?
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={projectCount}
            onChange={handleProjectCount}
            placeholder="e.g., 5"
            className="w-24 mx-auto block text-center text-2xl font-hand-accent bg-iron-light border-2 border-parchment/30 rounded-lg px-4 py-3 text-parchment focus:border-brass focus:outline-none"
          />
        </div>

        {/* Dynamic value anchor */}
        {showValue && count > 0 && (
          <div className="bg-wood/20 rounded-xl p-6 space-y-2 animate-fadeIn">
            <p className="font-serif text-sm text-parchment/70">
              {count} projects × individual estimates
            </p>
            <p className="font-hand-accent text-2xl text-brass">
              = ${consultantLow.toLocaleString()}–${consultantHigh.toLocaleString()} in consultant time
            </p>
            <p className="font-pencil-hand text-xl text-parchment mt-2">
              Your whole-house plan: <span className="font-hand-accent text-brass">$19.99</span>
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-muted-red text-sm font-serif">{error}</p>
        )}

        {/* CTAs */}
        <div className="space-y-4 pt-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-parchment text-iron font-pencil-hand text-lg py-4 px-6 rounded-xl min-h-[44px] hover:bg-parchment/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending verification...' : 'Plan My Whole House'}
          </button>
          <button
            onClick={handleMaybeLater}
            className="w-full text-parchment/60 font-serif text-sm py-3 hover:text-parchment/80 transition-colors min-h-[44px]"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

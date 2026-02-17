import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { createUserAndProject } from '../lib/api';

export default function EmailCapture() {
  const { sessionId, setAppScreen, setCurrentUser, setActiveProject } = useProject();
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !zipCode) {
      setError('Please fill in all fields');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Zip code validation (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create user and project (server moves photos from temp to final path)
      const { user, project } = await createUserAndProject(
        email,
        zipCode,
        sessionId,
        null // aiAnalysis - will be set from project_photos later
      );
      
      // Store user_id in localStorage for session persistence
      localStorage.setItem('user_id', user.id);
      
      // Update context
      setCurrentUser(user);
      setActiveProject(project);
      
      // Transition to budget question (no magic link, no waiting)
      setAppScreen('budgetQuestion');
      
    } catch (err) {
      console.error('Create user/project error:', err);
      setError(err.message || 'Failed to save your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          Let's Get Your Estimate
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Intro text */}
          <p className="font-serif text-parchment/80 text-center">
            Enter your email and zip code to receive your detailed scope and cost estimate.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label 
                htmlFor="email" 
                className="block font-serif text-parchment text-sm mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-parchment/10 border border-wood/40 rounded-md px-4 py-3 font-serif text-parchment placeholder-parchment/50 focus:outline-none focus:border-wood"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {/* Zip code input */}
            <div>
              <label 
                htmlFor="zipCode" 
                className="block font-serif text-parchment text-sm mb-2"
              >
                Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                placeholder="12345"
                className="w-full bg-parchment/10 border border-wood/40 rounded-md px-4 py-3 font-serif text-parchment placeholder-parchment/50 focus:outline-none focus:border-wood"
                disabled={isSubmitting}
                autoComplete="postal-code"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-3">
                <p className="font-serif text-parchment text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !zipCode}
              className="w-full min-h-[50px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
          </form>

          {/* Privacy note */}
          <p className="font-serif text-parchment/50 text-xs text-center">
            We'll never share your email. Estimates are free.
          </p>
        </div>
      </div>
    </div>
  );
}

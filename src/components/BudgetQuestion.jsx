/**
 * BudgetQuestion — Budget approach selection
 * 
 * Modified: 2026-02-17 — Wired updateBudget() API call in proceedToScoping()
 */

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { updateBudget } from '../lib/api';
import { trackEvent } from '../lib/analytics';

export default function BudgetQuestion() {
  const { setAppScreen, activeProject } = useProject();
  const [budgetApproach, setBudgetApproach] = useState('');
  const [budgetTarget, setBudgetTarget] = useState('');
  const [showTargetInput, setShowTargetInput] = useState(false);

  const handleApproachSelect = (approach) => {
    setBudgetApproach(approach);
    
    if (approach === 'target_budget') {
      setShowTargetInput(true);
    } else {
      setShowTargetInput(false);
      proceedToScoping(approach, null);
    }
  };

  const handleTargetSubmit = (e) => {
    e.preventDefault();
    if (!budgetTarget) return;
    proceedToScoping(budgetApproach, budgetTarget);
  };

  const proceedToScoping = async (approach, target) => {
    // Save budget to project via API (non-blocking — proceed even if save fails)
    if (activeProject?.id) {
      try {
        await updateBudget(activeProject.id, approach, target);
      } catch (err) {
        console.error('Budget save failed (non-blocking):', err);
      }
    }

    trackEvent('scoping_started', activeProject?.user_id || null, { approach, target });
    setAppScreen('scoping');
  };

  return (
    <div className="min-h-screen bg-workshop flex flex-col">
      {/* Header */}
      <div className="bg-iron-mid px-6 py-4 border-b border-iron-warm">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          How Do You Want to Approach This?
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {!showTargetInput ? (
            <>
              <p className="font-serif text-parchment/80 text-center mb-8">
                Choose how you'd like to build your estimate:
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleApproachSelect('target_budget')}
                  className="w-full min-h-[100px] card-workshop hover:bg-iron-mid border-2 border-iron-mid hover:border-iron-light rounded-lg p-6 text-left transition-all group"
                >
                  <h3 className="font-pencil-hand text-xl text-parchment mb-2 group-hover:text-wood">
                    I Have a Budget in Mind
                  </h3>
                  <p className="font-serif text-parchment/70 text-sm">
                    Tell me your target number, and I'll build a scope that fits.
                  </p>
                </button>

                <button
                  onClick={() => handleApproachSelect('dream_version')}
                  className="w-full min-h-[100px] card-workshop hover:bg-iron-mid border-2 border-iron-mid hover:border-iron-light rounded-lg p-6 text-left transition-all group"
                >
                  <h3 className="font-pencil-hand text-xl text-parchment mb-2 group-hover:text-wood">
                    Show Me the Full Scope
                  </h3>
                  <p className="font-serif text-parchment/70 text-sm">
                    Build the complete project first, then we'll find ways to optimize.
                  </p>
                </button>
              </div>

              <p className="font-serif text-parchment/50 text-xs text-center pt-4">
                You can always adjust this later
              </p>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <p className="font-serif text-parchment/80 text-center">
                  What's your target budget for this project?
                </p>

                <form onSubmit={handleTargetSubmit} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-parchment text-lg">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={budgetTarget}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setBudgetTarget(value);
                      }}
                      placeholder="10000"
                      className="input-workshop w-full pl-8 pr-4 py-4 font-serif text-xl text-center"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!budgetTarget}
                    className="btn-iron-light w-full min-h-[50px] text-xl py-3 px-8 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTargetInput(false);
                      setBudgetApproach('');
                      setBudgetTarget('');
                    }}
                    className="w-full min-h-[44px] text-parchment/70 font-serif text-sm underline"
                  >
                    Go back
                  </button>
                </form>

                <p className="font-serif text-parchment/50 text-xs text-center">
                  This helps me prioritize decisions that keep your project on track
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

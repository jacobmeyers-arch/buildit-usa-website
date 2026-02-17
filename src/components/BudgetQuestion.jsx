import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';

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
      // Dream version - proceed immediately
      setShowTargetInput(false);
      // TODO: Save budget_approach to project via API
      proceedToScoping(approach, null);
    }
  };

  const handleTargetSubmit = (e) => {
    e.preventDefault();
    if (!budgetTarget) return;
    
    // TODO: Save budget_approach and budget_target to project via API
    proceedToScoping(budgetApproach, budgetTarget);
  };

  const proceedToScoping = (approach, target) => {
    // For now, just transition to scoping screen
    // In production, would save to project record first
    console.log('Budget approach:', approach, 'Target:', target);
    setAppScreen('scoping');
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          How Do You Want to Approach This?
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {!showTargetInput ? (
            <>
              {/* Intro text */}
              <p className="font-serif text-parchment/80 text-center mb-8">
                Choose how you'd like to build your estimate:
              </p>

              {/* Budget approach options */}
              <div className="space-y-4">
                {/* Target budget option */}
                <button
                  onClick={() => handleApproachSelect('target_budget')}
                  className="w-full min-h-[100px] bg-wood/20 hover:bg-wood/30 border-2 border-wood/40 hover:border-wood rounded-lg p-6 text-left transition-all group"
                >
                  <h3 className="font-pencil-hand text-xl text-parchment mb-2 group-hover:text-wood">
                    I Have a Budget in Mind
                  </h3>
                  <p className="font-serif text-parchment/70 text-sm">
                    Tell me your target number, and I'll build a scope that fits.
                  </p>
                </button>

                {/* Dream version option */}
                <button
                  onClick={() => handleApproachSelect('dream_version')}
                  className="w-full min-h-[100px] bg-wood/20 hover:bg-wood/30 border-2 border-wood/40 hover:border-wood rounded-lg p-6 text-left transition-all group"
                >
                  <h3 className="font-pencil-hand text-xl text-parchment mb-2 group-hover:text-wood">
                    Show Me the Full Scope
                  </h3>
                  <p className="font-serif text-parchment/70 text-sm">
                    Build the complete project first, then we'll find ways to optimize.
                  </p>
                </button>
              </div>

              {/* Help text */}
              <p className="font-serif text-parchment/50 text-xs text-center pt-4">
                You can always adjust this later
              </p>
            </>
          ) : (
            <>
              {/* Budget target input */}
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
                      className="w-full bg-parchment/10 border border-wood/40 rounded-md pl-8 pr-4 py-4 font-serif text-parchment text-xl placeholder-parchment/50 focus:outline-none focus:border-wood text-center"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!budgetTarget}
                    className="w-full min-h-[50px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:scale-100"
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

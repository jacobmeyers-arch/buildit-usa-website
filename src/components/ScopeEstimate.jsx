import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export default function ScopeEstimate() {
  const { activeProject, setAppScreen } = useProject();
  const [estimate, setEstimate] = useState(null);
  const [scopeSummary, setScopeSummary] = useState('');
  
  // Load estimate from activeProject
  useEffect(() => {
    if (activeProject?.cost_estimate) {
      setEstimate(activeProject.cost_estimate);
    }
    if (activeProject?.scope_summary) {
      setScopeSummary(activeProject.scope_summary);
    }
  }, [activeProject]);
  
  if (!estimate) {
    return (
      <div className="min-h-screen bg-iron flex items-center justify-center px-6">
        <p className="font-serif text-parchment/70">Loading estimate...</p>
      </div>
    );
  }
  
  // Calculate total range
  const totalLow = estimate.line_items?.reduce((sum, item) => sum + (item.cost_range?.low || 0), 0) || 0;
  const totalHigh = estimate.line_items?.reduce((sum, item) => sum + (item.cost_range?.high || 0), 0) || 0;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          Your Project Estimate
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Total cost range */}
        <div className="bg-brass/20 border-2 border-brass rounded-lg p-6 text-center">
          <p className="font-serif text-parchment/80 text-sm mb-2">
            Estimated Total Cost
          </p>
          <p className="font-pencil-hand text-4xl text-brass">
            {formatCurrency(totalLow)} - {formatCurrency(totalHigh)}
          </p>
          {estimate.timeline && (
            <p className="font-serif text-parchment/70 text-sm mt-2">
              Timeline: {estimate.timeline}
            </p>
          )}
        </div>

        {/* Scope summary */}
        {scopeSummary && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Scope Summary
            </h3>
            <div className="font-serif text-parchment/90 text-base leading-relaxed whitespace-pre-wrap">
              {scopeSummary}
            </div>
          </div>
        )}

        {/* Line items */}
        {estimate.line_items && estimate.line_items.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Cost Breakdown
            </h3>
            <div className="space-y-2">
              {estimate.line_items.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-parchment/10 border border-wood/30 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-serif font-semibold text-parchment">
                        {item.category}
                      </h4>
                      {item.description && (
                        <p className="font-serif text-sm text-parchment/70 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-pencil-hand text-lg text-brass whitespace-nowrap">
                        {formatCurrency(item.cost_range.low)} - {formatCurrency(item.cost_range.high)}
                      </p>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <p className="font-serif text-xs text-parchment/60 italic">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assumptions */}
        {estimate.assumptions && estimate.assumptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Assumptions
            </h3>
            <ul className="space-y-2 font-serif text-parchment/80 text-sm">
              {estimate.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Not included */}
        {estimate.not_included && estimate.not_included.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Not Included
            </h3>
            <ul className="space-y-2 font-serif text-parchment/80 text-sm">
              {estimate.not_included.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next steps */}
        {estimate.next_steps && estimate.next_steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Recommended Next Steps
            </h3>
            <ol className="space-y-2 font-serif text-parchment/80 text-sm">
              {estimate.next_steps.map((step, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="bg-wood/10 px-6 py-4 border-t border-wood/30 space-y-3">
        <button
          onClick={() => setAppScreen('upsell')}
          className="w-full min-h-[50px] bg-brass hover:bg-brass/90 text-iron font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          Get the Full Plan
        </button>
        
        <button
          onClick={() => setAppScreen('scoping')}
          className="w-full min-h-[44px] text-parchment/70 font-serif text-sm underline"
        >
          Refine scope
        </button>
      </div>
    </div>
  );
}

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
  
  // Use totals from the locked schema (total_low/total_high are top-level fields)
  // Fall back to summing line items if top-level totals are missing
  const totalLow = estimate.total_low ?? estimate.line_items?.reduce((sum, item) => sum + (item.low || 0), 0) ?? 0;
  const totalHigh = estimate.total_high ?? estimate.line_items?.reduce((sum, item) => sum + (item.high || 0), 0) ?? 0;
  
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
                        {item.item}
                      </h4>
                      <p className="font-serif text-xs text-parchment/50 mt-0.5">
                        {item.category}
                      </p>
                      {item.assumed && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brass/20 text-brass text-xs font-serif rounded">
                          ASSUMED
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-pencil-hand text-lg text-brass whitespace-nowrap">
                        {formatCurrency(item.low)} - {formatCurrency(item.high)}
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

        {/* Confidence + unresolved areas */}
        {estimate.confidence && (
          <div className="space-y-3">
            <h3 className="font-pencil-hand text-xl text-parchment">
              Estimate Confidence
            </h3>
            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded font-pencil-hand text-base ${
                estimate.confidence === 'high' ? 'bg-green-800/30 text-green-300' :
                estimate.confidence === 'medium' ? 'bg-brass/20 text-brass' :
                'bg-muted-red/20 text-rose'
              }`}>
                {estimate.confidence.charAt(0).toUpperCase() + estimate.confidence.slice(1)}
              </span>
            </div>
            {estimate.unresolved_areas && estimate.unresolved_areas.length > 0 && (
              <div className="mt-2">
                <p className="font-serif text-parchment/70 text-sm mb-1">Areas with wider ranges:</p>
                <ul className="space-y-1 font-serif text-parchment/60 text-sm">
                  {estimate.unresolved_areas.map((area, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Regional note */}
        {estimate.regional_note && (
          <div className="bg-parchment/5 border border-wood/20 rounded-lg p-4">
            <p className="font-serif text-parchment/70 text-sm italic">
              {estimate.regional_note}
            </p>
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

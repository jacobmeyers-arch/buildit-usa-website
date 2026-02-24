/**
 * PropertyReport — Displays the full project scope and cost estimate
 * 
 * Shows activeProject.scope_summary and formatted cost_estimate data.
 * Sections: Project Summary, Scope of Work, Cost Breakdown, Confidence, Next Steps.
 * 
 * Created: 2026-02-17
 */

import React from 'react';
import { useProject } from '../context/ProjectContext';

export default function PropertyReport() {
  const { activeProject, setAppScreen } = useProject();

  // Extract cost estimate data (structured JSON from Claude's generate_estimate tool)
  const estimate = activeProject?.cost_estimate;
  const scopeSummary = activeProject?.scope_summary;

  // Format dollar amounts with commas
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—';
    return `$${Math.round(amount).toLocaleString()}`;
  };

  // Map confidence levels to display labels
  const confidenceLabel = {
    low: 'Low — several assumptions made',
    medium: 'Medium — most details confirmed',
    high: 'High — well-defined scope'
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30 flex items-center gap-4">
        <button
          onClick={() => setAppScreen('dashboard')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-parchment/70 hover:text-parchment"
          aria-label="Back to dashboard"
        >
          ←
        </button>
        <h1 className="font-pencil-hand text-3xl text-parchment">
          Project Report
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Project Summary */}
          {scopeSummary && (
            <section className="space-y-3">
              <h2 className="font-pencil-hand text-2xl text-brass">
                Project Summary
              </h2>
              <div className="font-serif text-parchment/80 text-base leading-relaxed whitespace-pre-line">
                {scopeSummary}
              </div>
            </section>
          )}

          {/* Cost Breakdown */}
          {estimate?.line_items && estimate.line_items.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-pencil-hand text-2xl text-brass">
                Cost Breakdown
              </h2>

              {/* Total range */}
              <div className="bg-wood/20 border border-wood/30 rounded-lg p-4 text-center">
                <p className="font-serif text-parchment/60 text-sm mb-1">Estimated Total</p>
                <p className="font-pencil-hand text-3xl text-brass">
                  {formatCurrency(estimate.total_low)} – {formatCurrency(estimate.total_high)}
                </p>
              </div>

              {/* Line items table */}
              <div className="space-y-2">
                {estimate.line_items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-parchment/10 border border-wood/20 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-serif text-parchment text-sm font-medium">
                          {item.item}
                          {item.assumed && (
                            <span className="ml-2 text-xs text-brass/80 italic">ASSUMED</span>
                          )}
                        </p>
                        <p className="font-serif text-parchment/50 text-xs mt-1">
                          {item.category}
                        </p>
                        {item.notes && (
                          <p className="font-serif text-parchment/60 text-xs mt-1 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <p className="font-serif text-parchment/80 text-sm whitespace-nowrap">
                        {formatCurrency(item.low)} – {formatCurrency(item.high)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Confidence */}
          {estimate?.confidence && (
            <section className="space-y-2">
              <h2 className="font-pencil-hand text-2xl text-brass">
                Confidence
              </h2>
              <p className="font-serif text-parchment/70 text-sm">
                {confidenceLabel[estimate.confidence] || estimate.confidence}
              </p>
              {estimate.unresolved_areas && estimate.unresolved_areas.length > 0 && (
                <div className="mt-2">
                  <p className="font-serif text-parchment/60 text-xs mb-1">Unresolved areas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {estimate.unresolved_areas.map((area, i) => (
                      <li key={i} className="font-serif text-parchment/60 text-xs">{area}</li>
                    ))}
                  </ul>
                </div>
              )}
              {estimate.regional_note && (
                <p className="font-serif text-parchment/50 text-xs italic mt-2">
                  {estimate.regional_note}
                </p>
              )}
            </section>
          )}

          {/* Next Steps */}
          <section className="space-y-2">
            <h2 className="font-pencil-hand text-2xl text-brass">
              Next Steps
            </h2>
            <div className="font-serif text-parchment/70 text-sm space-y-2">
              <p>1. Review the scope and flag anything that doesn't match your vision.</p>
              <p>2. Share this estimate with 2-3 local contractors for firm bids.</p>
              <p>3. Ask contractors to break their bids into the same line items above — makes comparison easier.</p>
            </div>
          </section>

          {/* No data fallback */}
          {!scopeSummary && !estimate && (
            <div className="text-center py-12">
              <p className="font-serif text-parchment/60">
                No report data available yet. Complete the scoping session to generate your estimate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

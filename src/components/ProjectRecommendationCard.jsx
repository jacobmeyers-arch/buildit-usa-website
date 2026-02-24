/**
 * ProjectRecommendationCard — Displays a single AI project recommendation
 * 
 * Shows category label, urgency badge, title, reasoning, and cost range.
 * Follows design system: parchment/iron colors, pencil-hand headings,
 * serif body, Caveat for dollar amounts.
 * 
 * Created: 2026-02-17
 */

import React from 'react';

// Urgency badge colors: priority=red, soon=brass, routine=muted
const URGENCY_STYLES = {
  priority: 'bg-muted-red/30 text-parchment border-muted-red/50',
  soon: 'bg-brass/20 text-brass border-brass/40',
  routine: 'bg-parchment/10 text-parchment/60 border-parchment/20'
};

const URGENCY_LABELS = {
  priority: 'Priority',
  soon: 'Soon',
  routine: 'Routine'
};

export default function ProjectRecommendationCard({ recommendation }) {
  const {
    category,
    title,
    reasoning,
    urgency = 'routine',
    estimatedCostRange,
    relatedAttributes
  } = recommendation;

  const urgencyStyle = URGENCY_STYLES[urgency] || URGENCY_STYLES.routine;
  const urgencyLabel = URGENCY_LABELS[urgency] || 'Routine';

  return (
    <div className="bg-parchment/10 border border-wood/20 rounded-lg p-4 space-y-3">
      {/* Top row: category + urgency badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-serif text-parchment/50 text-xs uppercase tracking-wide">
          {category}
        </span>
        <span className={`text-xs font-serif px-2 py-0.5 rounded-full border ${urgencyStyle}`}>
          {urgencyLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-pencil-hand text-xl text-parchment">
        {title}
      </h3>

      {/* Reasoning */}
      <p className="font-serif text-parchment/70 text-sm leading-relaxed">
        {reasoning}
      </p>

      {/* Cost range */}
      {estimatedCostRange && (
        <p className="font-pencil-hand text-brass text-lg">
          {estimatedCostRange}
        </p>
      )}

      {/* Related attributes (what data triggered this recommendation) */}
      {relatedAttributes && relatedAttributes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {relatedAttributes.map((attr, i) => (
            <span
              key={i}
              className="font-serif text-xs text-parchment/40 bg-parchment/5 px-2 py-0.5 rounded"
            >
              {attr}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

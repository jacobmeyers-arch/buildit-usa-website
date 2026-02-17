import React, { useState, useEffect } from 'react';

export default function UnderstandingMeter({ 
  score = 0, 
  previousScore = 0,
  nextUnresolved = null,
  showDelta = false 
}) {
  const [displayScore, setDisplayScore] = useState(previousScore);
  const [delta, setDelta] = useState(0);
  
  // Animate score changes
  useEffect(() => {
    if (score !== displayScore) {
      const diff = score - previousScore;
      setDelta(diff);
      
      // Smooth transition via CSS
      setDisplayScore(score);
      
      // Hide delta after 3 seconds
      if (diff > 0) {
        const timer = setTimeout(() => setDelta(0), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [score, previousScore, displayScore]);
  
  // Get contextual label based on score
  const getLabel = (scoreValue) => {
    if (scoreValue >= 90) return "Ready to build your scope and cost estimate";
    if (scoreValue >= 75) return "Almost there";
    if (scoreValue >= 50) return "Getting a clear picture";
    if (scoreValue >= 25) return "Building the picture";
    return "Just getting started";
  };
  
  // Get color based on score
  const getColor = (scoreValue) => {
    if (scoreValue >= 75) return "text-wood";
    if (scoreValue >= 50) return "text-brass";
    return "text-parchment/70";
  };
  
  return (
    <div className="space-y-3">
      {/* Horizontal progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-pencil-hand text-lg text-parchment">
            Understanding
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-pencil-hand text-2xl transition-all duration-500 ${getColor(displayScore)}`}>
              {Math.round(displayScore)}%
            </span>
            {delta > 0 && showDelta && (
              <span className="font-serif text-sm text-brass animate-fade-in">
                +{delta}%
              </span>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-3 bg-iron rounded-full overflow-hidden border border-wood/30">
          <div 
            className="h-full bg-gradient-to-r from-brass to-wood transition-all duration-1000 ease-out"
            style={{ width: `${displayScore}%` }}
          />
        </div>
        
        {/* Contextual label */}
        <p className={`font-serif text-sm transition-colors duration-500 ${getColor(displayScore)}`}>
          {getLabel(displayScore)}
        </p>
      </div>
      
      {/* Next unresolved dimension hint */}
      {nextUnresolved && (
        <p className="font-serif text-xs text-parchment/50 italic">
          Still need to understand: {nextUnresolved}
        </p>
      )}
    </div>
  );
}

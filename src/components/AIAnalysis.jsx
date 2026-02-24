import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { trackEvent } from '../lib/analytics';
import { useStreaming } from '../hooks/useStreaming';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function AIAnalysis() {
  const { sessionId, setAppScreen, photos } = useProject();
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [isCorrection, setIsCorrection] = useState(false);
  
  // Determine storage path (temp path before user creation)
  const storagePath = `temp/${sessionId}/${photos.length - 1}.jpg`;
  
  // Initial analysis request
  const initialRequestBody = {
    type: 'initial',
    storagePath
  };
  
  // Correction request (if user submits correction)
  const correctionRequestBody = isCorrection ? {
    type: 'correction',
    storagePath,
    correctionText
  } : null;
  
  const {
    streamingText,
    metadata,
    isStreaming,
    isDone,
    error,
    startStreaming
  } = useStreaming(
    `${API_BASE}/analyze`,
    correctionRequestBody || initialRequestBody,
    { autoStart: !isCorrection }
  );

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!correctionText.trim()) return;
    
    setIsCorrection(true);
    setShowCorrection(false);
    
    // Trigger re-analysis with correction
    startStreaming();
  };

  const handleContinue = () => {
    setAppScreen('email');
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          What I See
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {/* Streaming text with typing animation */}
        <div className="prose prose-invert max-w-none">
          <div className="font-serif text-parchment/90 text-base leading-relaxed whitespace-pre-wrap">
            {streamingText}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-parchment ml-1 animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-4">
            <p className="font-serif text-parchment text-sm">
              {error.message}
            </p>
            {error.retryable && (
              <button
                onClick={startStreaming}
                className="mt-3 min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-sm py-2 px-4 rounded-md"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* "Not Your Project?" correction UI */}
        {isDone && !showCorrection && !isCorrection && (
          <div className="pt-4">
            <button
              onClick={() => setShowCorrection(true)}
              className="font-serif text-parchment/60 text-sm underline hover:text-parchment"
            >
              Not quite what you're working on? Tell me more
            </button>
          </div>
        )}

        {showCorrection && (
          <form onSubmit={handleCorrectionSubmit} className="space-y-3">
            <textarea
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Tell me what this project is really about..."
              className="w-full min-h-[100px] bg-parchment/10 border border-wood/40 rounded-md p-3 font-serif text-parchment placeholder-parchment/50 focus:outline-none focus:border-wood"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!correctionText.trim()}
                className="flex-1 min-h-[44px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-base py-2 px-4 rounded-md"
              >
                Update Analysis
              </button>
              <button
                type="button"
                onClick={() => setShowCorrection(false)}
                className="min-h-[44px] bg-iron border-2 border-wood/40 hover:bg-wood/20 text-parchment font-pencil-hand text-base py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Continue button (shows when done) */}
      {isDone && !error && (
        <div className="bg-wood/10 px-6 py-4 border-t border-wood/30">
          <button
            onClick={handleContinue}
            className="w-full min-h-[50px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

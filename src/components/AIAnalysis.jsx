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
    <div className="min-h-screen bg-workshop flex flex-col">
      {/* Header */}
      <div className="bg-iron-mid px-6 py-4 border-b border-iron-warm">
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
                className="btn-iron mt-3 min-h-[44px] text-sm py-2 px-4"
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
              className="input-workshop w-full min-h-[100px] p-3 font-serif resize-y"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!correctionText.trim()}
                className="btn-iron flex-1 min-h-[44px] text-base py-2 px-4 disabled:opacity-50"
              >
                Update Analysis
              </button>
              <button
                type="button"
                onClick={() => setShowCorrection(false)}
                className="btn-ghost-parchment min-h-[44px] text-base py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Continue button (shows when done) */}
      {isDone && !error && (
        <div className="bg-iron-warm px-6 py-4 border-t border-iron-mid">
          <button
            onClick={handleContinue}
            className="btn-iron-light w-full min-h-[50px] text-xl py-3 px-8 transition-all transform hover:scale-105 active:scale-95"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

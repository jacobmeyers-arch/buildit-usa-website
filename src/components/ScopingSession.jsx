import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { useStreaming } from '../hooks/useStreaming';
import { uploadPhoto } from '../lib/api';
import UnderstandingMeter from './UnderstandingMeter';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function ScopingSession() {
  const { 
    activeProject, 
    currentUser,
    setAppScreen,
    photos,
    setPhotos 
  } = useProject();
  
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [understandingScore, setUnderstandingScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [nextUnresolved, setNextUnresolved] = useState(null);
  const [costFlags, setCostFlags] = useState([]);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showEscapeHatch, setShowEscapeHatch] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Request body for streaming
  const [requestBody, setRequestBody] = useState(null);
  
  const {
    streamingText,
    metadata,
    isStreaming,
    isDone,
    error,
    startStreaming
  } = useStreaming(
    `${API_BASE}/scope`,
    requestBody,
    { autoStart: false }
  );

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Handle metadata updates (understanding score, cost flags)
  useEffect(() => {
    if (metadata) {
      // Update understanding score if present
      if (metadata.understanding_score !== undefined) {
        setPreviousScore(understandingScore);
        setUnderstandingScore(metadata.understanding_score);
      }
      
      // Update next unresolved dimension
      if (metadata.next_unresolved) {
        setNextUnresolved(metadata.next_unresolved);
      }
      
      // Add cost flag if present
      if (metadata.cost_flag) {
        setCostFlags(prev => [...prev, metadata.cost_flag]);
      }
      
      // Check for suggest_estimate flag (escape hatch)
      if (metadata.suggest_estimate) {
        setShowEscapeHatch(true);
      }
    }
  }, [metadata, understandingScore]);

  // When streaming completes, add AI message to chat
  useEffect(() => {
    if (isDone && streamingText) {
      setMessages(prev => [...prev, {
        type: 'ai',
        text: streamingText,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isDone, streamingText]);

  const handleSendMessage = () => {
    if (!userInput.trim() || !activeProject) return;
    
    // Add user message to chat
    const userMessage = {
      type: 'user',
      text: userInput.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Prepare API request
    setRequestBody({
      projectId: activeProject.id,
      action: 'question',
      userInput: userInput.trim()
    });
    
    // Clear input
    setUserInput('');
    
    // Start streaming
    setTimeout(() => startStreaming(), 100);
  };

  const handleGenerateEstimate = () => {
    if (!activeProject) return;
    
    // Call /api/scope with action: 'generate'
    setRequestBody({
      projectId: activeProject.id,
      action: 'generate'
    });
    
    setTimeout(() => startStreaming(), 100);
  };

  const handlePhotoCapture = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeProject || !currentUser) return;
    
    setIsUploadingPhoto(true);
    
    try {
      // Add to photos array
      const photoIndex = photos.length;
      setPhotos([...photos, file]);
      
      // Upload to final path (user exists at this point)
      await uploadPhoto(file, photoIndex, {
        userId: currentUser.id,
        projectId: activeProject.id
      });
      
      // Add system message
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Photo uploaded. Analyzing...',
        timestamp: new Date().toISOString()
      }]);
      
      // Call /api/analyze with type: 'additional'
      // This would need to be implemented similar to streaming
      
      setIsUploadingPhoto(false);
      setShowPhotoCapture(false);
      
    } catch (err) {
      console.error('Photo upload error:', err);
      setIsUploadingPhoto(false);
      alert('Failed to upload photo. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header with understanding meter */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30 space-y-3">
        <h2 className="font-pencil-hand text-2xl text-parchment">
          Building Your Scope
        </h2>
        
        <UnderstandingMeter 
          score={understandingScore}
          previousScore={previousScore}
          nextUnresolved={nextUnresolved}
          showDelta={messages.length > 0}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`${
              msg.type === 'user' 
                ? 'ml-auto max-w-[80%] bg-wood/30 text-parchment' 
                : msg.type === 'system'
                ? 'mx-auto max-w-[80%] bg-brass/20 text-parchment/70 text-center text-sm italic'
                : 'mr-auto max-w-[80%] bg-parchment/10 text-parchment'
            } rounded-lg p-4 font-serif text-base leading-relaxed`}
          >
            {msg.text}
            
            {/* Cost flags */}
            {msg.type === 'ai' && costFlags.length > 0 && idx === messages.length - 1 && (
              <div className="mt-3 pt-3 border-t border-brass/30">
                {costFlags.map((flag, i) => (
                  <p key={i} className="text-brass text-sm">
                    💡 {flag}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Streaming AI response */}
        {isStreaming && streamingText && (
          <div className="mr-auto max-w-[80%] bg-parchment/10 text-parchment rounded-lg p-4 font-serif text-base leading-relaxed">
            {streamingText}
            <span className="inline-block w-2 h-5 bg-parchment ml-1 animate-pulse"></span>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mx-auto max-w-[80%] bg-muted-red/20 border border-muted-red/40 rounded-lg p-4">
            <p className="font-serif text-parchment text-sm">{error.message}</p>
            {error.retryable && (
              <button
                onClick={startStreaming}
                className="mt-2 min-h-[36px] bg-wood hover:bg-wood/90 text-parchment font-serif text-sm py-1 px-3 rounded"
              >
                Retry
              </button>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-wood/10 px-6 py-4 border-t border-wood/30 space-y-3">
        {/* Escape hatch — offered at 8+ interactions, 60-80% understanding */}
        {showEscapeHatch && !isStreaming && (
          <div className="bg-brass/10 border border-brass/30 rounded-lg p-4 space-y-3">
            <p className="font-serif text-parchment text-sm">
              I have a solid picture — enough for a good estimate with some wider ranges on the unresolved areas. Want me to build your scope and estimate now, or keep refining?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEscapeHatch(false); handleGenerateEstimate(); }}
                className="flex-1 min-h-[44px] bg-brass hover:bg-brass/90 text-iron font-pencil-hand text-base py-2 px-4 rounded-md shadow-lg transition-all"
              >
                Build My Estimate
              </button>
              <button
                onClick={() => setShowEscapeHatch(false)}
                className="flex-1 min-h-[44px] border border-parchment/30 hover:border-parchment/60 text-parchment font-pencil-hand text-base py-2 px-4 rounded-md transition-all"
              >
                Keep Refining
              </button>
            </div>
          </div>
        )}

        {/* Generate estimate button (shows when understanding >= 80% or user can request at >= 60%) */}
        {!showEscapeHatch && understandingScore >= 80 && !isStreaming && (
          <button
            onClick={handleGenerateEstimate}
            className="w-full min-h-[44px] bg-brass hover:bg-brass/90 text-iron font-pencil-hand text-lg py-2 px-6 rounded-md shadow-lg transition-all"
          >
            Generate My Estimate
          </button>
        )}
        
        {/* Text input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your answer..."
            className="flex-1 bg-parchment/10 border border-wood/40 rounded-md px-4 py-3 font-serif text-parchment placeholder-parchment/50 focus:outline-none focus:border-wood"
            disabled={isStreaming}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isStreaming}
            className="min-h-[44px] min-w-[44px] bg-wood hover:bg-wood/90 disabled:bg-wood/50 text-parchment font-pencil-hand text-lg px-4 rounded-md transition-all"
          >
            Send
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || isUploadingPhoto}
            className="min-h-[44px] min-w-[44px] bg-wood/50 hover:bg-wood/70 disabled:bg-wood/30 text-parchment text-xl rounded-md transition-all"
            title="Add photo"
          >
            📷
          </button>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />
      </div>
    </div>
  );
}

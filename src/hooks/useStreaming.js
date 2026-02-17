/**
 * useStreaming hook
 * 
 * Consumes SSE from /api/analyze or /api/scope
 * Buffers tokens and flushes to DOM every ~50ms via requestAnimationFrame
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useStreaming(apiEndpoint, requestBody, options = {}) {
  const { autoStart = false } = options;
  
  const [streamingText, setStreamingText] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);
  
  const textBufferRef = useRef('');
  const rafIdRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Flush buffer to DOM via requestAnimationFrame
  const flushBuffer = useCallback(() => {
    if (textBufferRef.current) {
      setStreamingText(prev => prev + textBufferRef.current);
      textBufferRef.current = '';
    }
    rafIdRef.current = null;
  }, []);

  // Schedule flush if not already scheduled
  const scheduleFlush = useCallback(() => {
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(flushBuffer);
    }
  }, [flushBuffer]);

  // Start streaming
  const startStreaming = useCallback(async () => {
    if (!apiEndpoint || !requestBody) return;

    setStreamingText('');
    setMetadata(null);
    setIsStreaming(true);
    setIsDone(false);
    setError(null);
    textBufferRef.current = '';

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is event-stream
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        // Not SSE, try to parse as JSON error
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unexpected response type');
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = null;
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const data = JSON.parse(line.substring(5).trim());
            
            if (currentEvent === 'token') {
              // Buffer token and schedule flush
              textBufferRef.current += data.text || '';
              scheduleFlush();
            } else if (currentEvent === 'metadata') {
              // Update metadata immediately
              setMetadata(data);
            } else if (currentEvent === 'done') {
              // Flush remaining buffer and mark done
              if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
              }
              flushBuffer();
              setIsDone(true);
              setIsStreaming(false);
            } else if (currentEvent === 'error') {
              // Handle error event
              setError({
                message: data.message || 'An error occurred',
                retryable: data.retryable || false
              });
              setIsStreaming(false);
            }
            
            currentEvent = null;
          }
        }
      }

    } catch (err) {
      console.error('Streaming error:', err);
      setError({
        message: err.message || 'Failed to connect to server',
        retryable: true
      });
      setIsStreaming(false);
    }
  }, [apiEndpoint, requestBody, scheduleFlush, flushBuffer]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startStreaming();
    }
    
    // Cleanup
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [autoStart, startStreaming]);

  return {
    streamingText,
    metadata,
    isStreaming,
    isDone,
    error,
    startStreaming,
  };
}

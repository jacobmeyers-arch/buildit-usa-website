import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { trackEvent } from '../lib/analytics';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function PaymentSuccess() {
  const { setPlanStatus, setAppScreen, currentUser } = useProject();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const MAX_RETRIES = 5;
  
  useEffect(() => {
    verifyPayment();
  }, []);
  
  const verifyPayment = async () => {
    // Get session_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) {
      setVerificationError('Missing payment session ID');
      setIsVerifying(false);
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE}/verify-payment?session_id=${encodeURIComponent(sessionId)}`
      );
      
      const data = await response.json();
      
      if (response.ok && data.verified) {
        // Payment verified
        setPlanStatus('paid');
        localStorage.setItem('plan_status', 'paid');
        setIsVerifying(false);
        
        // Fire payment_completed analytics event
        trackEvent('payment_completed', currentUser?.id, { session_id: sessionId });
        
        // Transition to dashboard after 2 seconds
        setTimeout(() => {
          setAppScreen('dashboard');
        }, 2000);
        
      } else {
        // Verification failed
        if (retryCount < MAX_RETRIES) {
          // Webhook may be delayed, retry after 3 seconds
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPayment();
          }, 3000);
        } else {
          setVerificationError(data.error || 'Payment verification failed');
          setIsVerifying(false);
        }
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifyPayment();
        }, 3000);
      } else {
        setVerificationError('Unable to verify payment. Please contact support.');
        setIsVerifying(false);
      }
    }
  };
  
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brass"></div>
          </div>
          
          {/* Message */}
          <div className="space-y-3">
            <h2 className="font-pencil-hand text-3xl text-parchment">
              Verifying Your Payment
            </h2>
            <p className="font-serif text-parchment/70 text-sm">
              This usually takes just a few seconds...
            </p>
            {retryCount > 0 && (
              <p className="font-serif text-parchment/50 text-xs">
                Retry {retryCount}/{MAX_RETRIES}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (verificationError) {
    return (
      <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-6 text-center space-y-3">
            <div className="text-4xl">⚠️</div>
            <h2 className="font-pencil-hand text-2xl text-parchment">
              Verification Issue
            </h2>
            <p className="font-serif text-parchment/80 text-sm">
              {verificationError}
            </p>
          </div>
          
          <button
            onClick={() => {
              setRetryCount(0);
              setVerificationError(null);
              setIsVerifying(true);
              verifyPayment();
            }}
            className="w-full min-h-[44px] bg-wood hover:bg-wood/90 text-parchment font-pencil-hand text-lg py-2 px-6 rounded-md transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Success state
  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success icon */}
        <div className="text-6xl">
          ✓
        </div>
        
        {/* Message */}
        <div className="space-y-3">
          <h2 className="font-pencil-hand text-4xl text-brass">
            Welcome to Your Plan!
          </h2>
          <p className="font-serif text-parchment/80">
            Your whole-house plan is ready. Let's build your roadmap.
          </p>
        </div>
        
        {/* Redirect message */}
        <p className="font-serif text-parchment/60 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}

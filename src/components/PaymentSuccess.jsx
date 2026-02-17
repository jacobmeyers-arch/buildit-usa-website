/**
 * PaymentSuccess — Verifies payment and transitions to dashboard
 * Calls /api/verify-payment with session_id from URL params
 */
import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export default function PaymentSuccess() {
  const { setPlanStatus, setAppScreen } = useProject();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    setStatus('verifying');
    try {
      // Get session_id from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        // Try hash params as fallback
        const hashParams = new URLSearchParams(window.location.hash.replace('#paymentSuccess?', ''));
        const hashSessionId = hashParams.get('session_id');
        if (!hashSessionId) {
          setStatus('error');
          return;
        }
      }

      const response = await fetch(`/api/verify-payment?session_id=${sessionId || ''}`);
      const data = await response.json();

      if (data.verified) {
        setStatus('success');
        setPlanStatus('paid');
        // Transition to dashboard after brief success message
        setTimeout(() => setAppScreen('dashboard'), 2000);
      } else if (retryCount < 3) {
        // Webhook may be delayed — retry after 3 seconds
        setRetryCount(prev => prev + 1);
        setTimeout(verifyPayment, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(verifyPayment, 3000);
      } else {
        setStatus('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-iron text-parchment flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <h1 className="font-pencil-hand text-2xl">Verifying Your Payment...</h1>
            <p className="font-serif text-parchment/70">
              {retryCount > 0 ? `Checking again (${retryCount}/3)...` : 'Just a moment...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-pencil-hand text-3xl">You're All Set!</h1>
            <p className="font-serif text-parchment/80">
              Your Whole-House Plan is unlocked. Taking you to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="font-pencil-hand text-2xl">Verification Issue</h1>
            <p className="font-serif text-parchment/70">
              We couldn't verify your payment yet. This sometimes takes a minute.
            </p>
            <button
              onClick={() => { setRetryCount(0); verifyPayment(); }}
              className="bg-parchment text-iron font-pencil-hand py-3 px-6 rounded-xl min-h-[44px] hover:bg-parchment/90 transition-colors"
            >
              Try Again
            </button>
            <p className="text-parchment/50 font-serif text-sm">
              If this persists, email <a href="mailto:support@builditusa.com" className="text-brass underline">support@builditusa.com</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

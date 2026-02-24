import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { signInWithMagicLink, onAuthChange } from '../lib/supabase';
import { redirectToCheckout } from '../lib/stripe';

export default function MagicLinkPending() {
  const { currentUser, setAppScreen } = useProject();
  const [checkoutError, setCheckoutError] = useState(null);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const MAX_RESENDS = 2;
  
  // Enable resend after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanResend(true);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [resendCount]);
  
  // Listen for auth state change
  useEffect(() => {
    const { data: subscription } = onAuthChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User authenticated — redirect to Stripe Checkout
        redirectToCheckout(currentUser?.id).catch(err => {
          console.error('Stripe checkout redirect failed:', err);
          setCheckoutError('Failed to start checkout. Please try again.');
        });
        // Note: redirectToCheckout does window.location.href = url
        // PaymentSuccess screen loads after Stripe redirects back
      }
    });
    
    return () => subscription?.subscription?.unsubscribe();
  }, [setAppScreen]);
  
  const handleResend = async () => {
    if (!currentUser?.email || resendCount >= MAX_RESENDS) return;
    
    setIsResending(true);
    setCanResend(false);
    
    try {
      await signInWithMagicLink(currentUser.email);
      setResendCount(prev => prev + 1);
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend link. Please try again.');
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };
  
  const handleTryDifferentEmail = () => {
    // Return to email capture
    setAppScreen('email');
  };
  
  return (
    <div className="min-h-screen bg-iron flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="text-6xl">
          📧
        </div>
        
        {/* Message */}
        <div className="space-y-3">
          <h2 className="font-pencil-hand text-3xl text-parchment">
            Check Your Email
          </h2>
          <p className="font-serif text-parchment/80">
            We sent a magic link to <span className="font-semibold">{currentUser?.email}</span>
          </p>
          <p className="font-serif text-parchment/60 text-sm">
            Click the link in your email to continue to payment.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3 pt-4">
          {/* Resend button */}
          {canResend && resendCount < MAX_RESENDS && (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full min-h-[44px] bg-wood/50 hover:bg-wood/70 disabled:bg-wood/30 text-parchment font-serif text-sm py-2 px-4 rounded-md transition-all"
            >
              {isResending ? 'Sending...' : 'Resend Link'}
            </button>
          )}
          
          {/* Waiting message */}
          {!canResend && resendCount < MAX_RESENDS && (
            <p className="font-serif text-parchment/50 text-xs">
              Resend available in 30 seconds
            </p>
          )}
          
          {/* Try different email */}
          <button
            onClick={handleTryDifferentEmail}
            className="w-full min-h-[44px] text-parchment/70 font-serif text-sm underline"
          >
            Try a different email
          </button>
          
          {/* Support contact (after 2 resends) */}
          {resendCount >= MAX_RESENDS && (
            <div className="bg-brass/20 border border-brass/40 rounded-lg p-4 mt-6">
              <p className="font-serif text-parchment/90 text-sm">
                Still not receiving the email? Contact support for help.
              </p>
            </div>
          )}
          
          {/* Checkout error */}
          {checkoutError && (
            <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-4 mt-4">
              <p className="font-serif text-parchment text-sm">{checkoutError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

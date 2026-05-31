/**
 * Stripe Client Helpers
 * 
 * Frontend helpers for Stripe Checkout redirect.
 */

import { createCheckoutSession } from './api.js';

/**
 * Redirect to Stripe Checkout
 * @param {string} userId - User ID
 */
export async function redirectToCheckout(userId) {
  try {
    const { sessionId, url } = await createCheckoutSession(userId);
    
    // Validate checkout URL points to Stripe before redirecting
    if (!url || !url.startsWith('https://checkout.stripe.com/')) {
      throw new Error('Invalid checkout URL received');
    }
    window.location.href = url;
    
    return { sessionId };
  } catch (error) {
    console.error('Failed to redirect to checkout:', error);
    throw error;
  }
}

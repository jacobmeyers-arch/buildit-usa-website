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
    
    // Redirect to Stripe Checkout
    window.location.href = url;
    
    return { sessionId };
  } catch (error) {
    console.error('Failed to redirect to checkout:', error);
    throw error;
  }
}

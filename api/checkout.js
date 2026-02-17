/**
 * /api/checkout - Create Stripe Checkout Session
 * 
 * Creates a Stripe Checkout session for the $19.99 (or $29.99) whole-house plan.
 * Supports A/B price testing via PRICE_TIER environment variable.
 */

import Stripe from 'stripe';
import { supabaseAdmin } from './lib/supabase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * Validate UUID format
 */
function isValidUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  // Origin verification
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: 'Forbidden', code: 403 });
  }

  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId',
        code: 400
      });
    }

    if (!isValidUuid(userId)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        code: 400
      });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 404
      });
    }

    // Select price based on A/B test tier
    const priceTier = process.env.PRICE_TIER || 'standard';
    const priceId = priceTier === 'premium' 
      ? process.env.STRIPE_PRICE_ID_PREMIUM 
      : process.env.STRIPE_PRICE_ID_STANDARD;

    if (!priceId) {
      console.error('Missing Stripe price ID for tier:', priceTier);
      return res.status(500).json({
        error: 'Payment configuration error',
        code: 500
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${ALLOWED_ORIGIN}?screen=paymentSuccess&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ALLOWED_ORIGIN}?screen=estimate`,
      customer_email: user.email,
      metadata: {
        user_id: userId
      }
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      code: 500
    });
  }
}

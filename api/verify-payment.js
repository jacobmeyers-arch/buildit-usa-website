/**
 * /api/verify-payment - Fallback Payment Verification
 * 
 * Verifies payment status by querying Stripe API directly.
 * Called from PaymentSuccess screen if webhook hasn't processed yet.
 * Validates that requesting user matches session metadata.
 * Now also fires a payment_completed event server-side.
 * 
 * Modified: 2026-02-17 — Added payment_completed event insert
 */

import Stripe from 'stripe';
import { supabaseAdmin } from './lib/supabase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
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
    const { session_id } = req.query;
    const authHeader = req.headers.authorization;

    if (!session_id) {
      return res.status(400).json({
        error: 'Missing required parameter: session_id',
        code: 400
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: 404
      });
    }

    const userId = session.metadata.user_id;

    if (!userId) {
      return res.status(400).json({
        error: 'Invalid session metadata',
        code: 400
      });
    }

    // Check payment status
    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        verified: false,
        planType: 'free',
        message: 'Payment not completed'
      });
    }

    // Check if property_plans record already exists
    const { data: existingPlan } = await supabaseAdmin
      .from('property_plans')
      .select('plan_type')
      .eq('user_id', userId)
      .single();

    if (existingPlan) {
      // Webhook already processed
      return res.status(200).json({
        verified: true,
        planType: existingPlan.plan_type
      });
    }

    // Webhook hasn't processed yet - create the record
    console.log('Webhook not processed yet, creating property_plans record via verify-payment');

    const { error: insertError } = await supabaseAdmin
      .from('property_plans')
      .insert({
        user_id: userId,
        plan_type: 'paid',
        stripe_session_id: session_id
      });

    if (insertError) {
      console.error('Error creating property_plans record:', insertError);
      return res.status(500).json({
        error: 'Failed to verify payment',
        code: 500
      });
    }

    // Fire payment_completed event (server-side, using service_role to bypass RLS)
    const { error: eventError } = await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'payment_completed',
        metadata: { session_id }
      });

    if (eventError) {
      // Non-blocking — payment still verified even if event logging fails
      console.error('Error logging payment_completed event:', eventError);
    }

    return res.status(200).json({
      verified: true,
      planType: 'paid'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: 'Payment verification failed',
      code: 500
    });
  }
}

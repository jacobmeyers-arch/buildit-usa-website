/**
 * /api/track-event - Analytics Event Endpoint
 *
 * Writes analytics events to the Supabase events table.
 * Used by src/lib/analytics.js on the frontend.
 *
 * Created: 2026-02-23
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

const VALID_EVENT_TYPES = [
  'photo_captured',
  'analysis_viewed',
  'email_submitted',
  'scoping_started',
  'estimate_generated',
  'upsell_shown',
  'upsell_clicked',
  'payment_completed',
  'upsell_declined'
];

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  try {
    const { userId, eventType, metadata } = req.body;

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type', code: 400 });
    }

    const { error: insertError } = await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId || null,
        event_type: eventType,
        metadata: metadata || {}
      });

    if (insertError) {
      console.error('Error logging event:', insertError);
      return res.status(500).json({ error: 'Failed to log event', code: 500 });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in /api/track-event:', error);
    return res.status(500).json({ error: 'Unexpected error', code: 500 });
  }
}

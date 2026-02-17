/**
 * /api/webhook - Stripe Webhook Handler
 * 
 * Handles Stripe events, primarily checkout.session.completed.
 * Creates property_plans record and triggers cross-project analysis + report generation if applicable.
 */

import Stripe from 'stripe';
import { supabaseAdmin } from './lib/supabase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.user_id;

      if (!userId) {
        console.error('No user_id in session metadata');
        return res.status(400).json({ error: 'Missing user_id in metadata' });
      }

      console.log('Processing payment for user:', userId);

      // Create or update property_plans record
      const { data: existingPlan } = await supabaseAdmin
        .from('property_plans')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPlan) {
        // Update existing plan
        await supabaseAdmin
          .from('property_plans')
          .update({
            plan_type: 'paid',
            stripe_session_id: session.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Create new plan
        await supabaseAdmin
          .from('property_plans')
          .insert({
            user_id: userId,
            plan_type: 'paid',
            stripe_session_id: session.id
          });
      }

      console.log('Property plan created/updated for user:', userId);

      // Check if user has 2+ projects at estimate_ready status
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'estimate_ready')
        .is('deleted_at', null);

      if (!projectsError && projects && projects.length >= 2) {
        console.log(`User has ${projects.length} estimate_ready projects - triggering cross-project analysis`);
        
        // TODO: Trigger cross-project analysis and report generation
        // This will be implemented in Step 16
        // For now, just log that it should happen
        console.log('Cross-project analysis would be triggered here (Step 16)');
      }

      return res.status(200).json({ received: true });
    }

    // Handle other event types if needed
    console.log(`Unhandled event type: ${event.type}`);
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Disable body parsing for webhook - Stripe needs raw body
export const config = {
  api: {
    bodyParser: false
  }
};

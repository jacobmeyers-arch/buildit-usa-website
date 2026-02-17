/**
 * /api/webhook - Stripe Webhook Handler
 * 
 * Handles Stripe events, primarily checkout.session.completed.
 * Creates property_plans record and triggers cross-project analysis + report generation if applicable.
 */

import Stripe from 'stripe';
import { supabaseAdmin } from './lib/supabase-admin.js';
import { generateCrossProjectAnalysis } from './lib/claude.js';
import { validateCrossProjectAnalysis } from './lib/validators.js';
import { generatePropertyReport } from './lib/pdf-generator.js';
import { sendReportEmail } from './lib/email.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Generate and send Property Summary Report
 */
async function generateAndSendReport(userId, userEmail, zipCode) {
  try {
    console.log('Starting cross-project analysis for user:', userId);

    // Fetch all estimate_ready projects
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'estimate_ready')
      .is('deleted_at', null);

    if (projectsError || !projects || projects.length === 0) {
      console.log('No estimate_ready projects found');
      return;
    }

    console.log(`Found ${projects.length} estimate_ready projects`);

    // Generate cross-project analysis
    const analysis = await generateCrossProjectAnalysis(projects, zipCode);

    // Validate analysis
    const validProjectIds = projects.map(p => p.id);
    const validation = validateCrossProjectAnalysis(analysis, validProjectIds);

    if (!validation.valid) {
      console.error('Cross-project analysis validation failed:', validation.error);
      throw new Error(`Analysis validation failed: ${validation.error}`);
    }

    console.log('Cross-project analysis generated and validated');

    // Save priority data to project records
    for (const sp of analysis.sequenced_projects) {
      await supabaseAdmin
        .from('projects')
        .update({
          priority_score: sp.priority_score,
          priority_reason: sp.reasoning,
          recommended_sequence: sp.recommended_sequence,
          bundle_group: null, // Will be set in next loop
          updated_at: new Date().toISOString()
        })
        .eq('id', sp.project_id);
    }

    // Save bundle group assignments
    for (const bundle of analysis.bundle_groups || []) {
      for (const projectId of bundle.project_ids) {
        await supabaseAdmin
          .from('projects')
          .update({
            bundle_group: bundle.bundle_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);
      }
    }

    console.log('Priority scores and bundle groups saved to projects');

    // Generate PDF
    const reportData = {
      userEmail,
      zipCode,
      projectCount: projects.length,
      projects,
      crossProjectAnalysis: analysis,
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const pdfBuffer = await generatePropertyReport(reportData);
    console.log('PDF generated, size:', pdfBuffer.length, 'bytes');

    // Upload PDF to Supabase Storage
    const reportPath = `${userId}/property-report.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('property-reports')
      .upload(reportPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to upload PDF to storage:', uploadError);
      // Continue anyway - we can still email it
    } else {
      console.log('PDF uploaded to storage:', reportPath);
    }

    // Update property_plans with report path
    await supabaseAdmin
      .from('property_plans')
      .update({
        report_storage_path: reportPath,
        report_generated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Send email with PDF
    const emailSummary = {
      projectCount: projects.length,
      totalLow: analysis.total_cost_range.low,
      totalHigh: analysis.total_cost_range.high
    };

    await sendReportEmail(userEmail, pdfBuffer, emailSummary);
    console.log('Report email sent to:', userEmail);

  } catch (error) {
    console.error('Error generating/sending report:', error);
    // Don't throw - webhook should still return 200
  }
}

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

      // Get user data
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, zip_code')
        .eq('id', userId)
        .single();

      // Create or update property_plans record
      const { data: existingPlan } = await supabaseAdmin
        .from('property_plans')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPlan) {
        await supabaseAdmin
          .from('property_plans')
          .update({
            plan_type: 'paid',
            stripe_session_id: session.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        await supabaseAdmin
          .from('property_plans')
          .insert({
            user_id: userId,
            plan_type: 'paid',
            stripe_session_id: session.id
          });
      }

      console.log('Property plan created/updated for user:', userId);

      // Check for 2+ estimate_ready projects and generate report
      const { data: projects } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'estimate_ready')
        .is('deleted_at', null);

      if (projects && projects.length >= 2 && user) {
        console.log(`User has ${projects.length} projects - generating report`);
        // Trigger report generation asynchronously
        generateAndSendReport(userId, user.email, user.zip_code);
      } else if (projects && projects.length === 1 && user) {
        console.log('User has 1 project - generating single-project report');
        // TODO: Could generate simplified single-project report
        generateAndSendReport(userId, user.email, user.zip_code);
      }

      return res.status(200).json({ received: true });
    }

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

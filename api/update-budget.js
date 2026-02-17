/**
 * /api/update-budget - Update Project Budget
 * 
 * Saves budget_approach and budget_target to project record.
 * Called from BudgetQuestion screen after user makes selection.
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * Validate UUID format
 */
function isValidUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize text input
 */
function sanitizeText(text) {
  if (!text) return text;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    const { projectId, budgetApproach, budgetTarget } = req.body;

    // Validate required fields
    if (!projectId || !budgetApproach) {
      return res.status(400).json({
        error: 'Missing required fields: projectId, budgetApproach',
        code: 400
      });
    }

    if (!isValidUuid(projectId)) {
      return res.status(400).json({
        error: 'Invalid projectId format',
        code: 400
      });
    }

    // Validate budgetApproach enum
    if (!['target_budget', 'dream_version'].includes(budgetApproach)) {
      return res.status(400).json({
        error: 'Invalid budgetApproach. Must be: target_budget or dream_version',
        code: 400
      });
    }

    // Sanitize budgetTarget if provided
    const sanitizedTarget = budgetTarget ? sanitizeText(budgetTarget) : null;

    // Update project
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        budget_approach: budgetApproach,
        budget_target: sanitizedTarget,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project budget:', error);
      return res.status(500).json({
        error: 'Failed to update budget',
        code: 500
      });
    }

    return res.status(200).json({
      success: true,
      project: {
        id: data.id,
        budget_approach: data.budget_approach,
        budget_target: data.budget_target
      }
    });

  } catch (error) {
    console.error('Error in /api/update-budget:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      code: 500
    });
  }
}

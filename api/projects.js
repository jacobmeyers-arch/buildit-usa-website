/**
 * /api/projects - Fetch User Projects
 * 
 * GET endpoint that returns all non-deleted projects for a user.
 * Used by ProjectDashboard to display the user's project list.
 * 
 * Created: 2026-02-17
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter: userId',
        code: 400
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        code: 400
      });
    }

    // Fetch all non-deleted projects for this user, newest first
    const { data: projects, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
      return res.status(500).json({
        error: 'Failed to fetch projects',
        code: 500
      });
    }

    return res.status(200).json({ projects: projects || [] });

  } catch (error) {
    console.error('Error in /api/projects:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      code: 500
    });
  }
}

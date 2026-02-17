/**
 * /api/project-count - Get Project Count for User
 * 
 * Returns the number of non-deleted projects for a user.
 * Used for free tier project limit enforcement.
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

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter: userId',
        code: 400
      });
    }

    if (!isValidUuid(userId)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        code: 400
      });
    }

    // Count projects (non-deleted only)
    const { count, error: countError } = await supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (countError) {
      console.error('Error counting projects:', countError);
      return res.status(500).json({
        error: 'Failed to count projects',
        code: 500
      });
    }

    return res.status(200).json({
      count: count || 0
    });

  } catch (error) {
    console.error('Error in /api/project-count:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      code: 500
    });
  }
}

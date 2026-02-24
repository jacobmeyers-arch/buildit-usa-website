/**
 * /api/delete-project - Soft-delete a project
 *
 * Sets deleted_at timestamp on project. Never hard deletes.
 * Validates that the requesting user owns the project.
 *
 * Created: 2026-02-23
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

function isValidUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

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

  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: 'Forbidden', code: 403 });
  }

  try {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Missing required fields: projectId, userId', code: 400 });
    }

    if (!isValidUuid(projectId) || !isValidUuid(userId)) {
      return res.status(400).json({ error: 'Invalid ID format', code: 400 });
    }

    // Verify ownership — project must belong to user and not already deleted
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ error: 'Project not found', code: 404 });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden', code: 403 });
    }

    // Soft delete
    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error soft-deleting project:', updateError);
      return res.status(500).json({ error: 'Failed to delete project', code: 500 });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in /api/delete-project:', error);
    return res.status(500).json({ error: 'Unexpected error', code: 500 });
  }
}

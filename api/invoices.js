/**
 * /api/invoices - List invoices for a user
 *
 * GET /api/invoices?userId=xxx - Returns all invoices for a user
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

function isValidUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  try {
    const { userId } = req.query;

    if (!userId || !isValidUuid(userId)) {
      return res.status(400).json({ error: 'Valid userId required' });
    }

    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }

    return res.status(200).json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Error in invoices handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

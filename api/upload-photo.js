/**
 * /api/upload-photo - Photo Upload Endpoint
 * 
 * Handles uploading photos to Supabase Storage.
 * Before user creation: uploads to temp/{sessionId}/{photoOrder}.jpg
 * After user creation: uploads to {userId}/{projectId}/{photoOrder}.jpg
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
    const { sessionId, userId, projectId, photoOrder, photoData } = req.body;

    // Validate required fields
    if (!photoData || photoOrder === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: photoData, photoOrder',
        code: 400
      });
    }

    // Determine storage path
    let storagePath;
    
    if (userId && projectId) {
      // User exists - upload to final location
      if (!isValidUuid(userId) || !isValidUuid(projectId)) {
        return res.status(400).json({
          error: 'Invalid userId or projectId format',
          code: 400
        });
      }
      storagePath = `${userId}/${projectId}/${photoOrder}.jpg`;
    } else if (sessionId) {
      // Before user creation - upload to temp
      if (!isValidUuid(sessionId)) {
        return res.status(400).json({
          error: 'Invalid sessionId format',
          code: 400
        });
      }
      storagePath = `temp/${sessionId}/${photoOrder}.jpg`;
    } else {
      return res.status(400).json({
        error: 'Either sessionId or (userId + projectId) required',
        code: 400
      });
    }

    // Convert base64 to buffer
    let buffer;
    try {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid photo data format',
        code: 400
      });
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('project-photos')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true // Allow overwrite for retry scenarios
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return res.status(500).json({
        error: 'Photo upload failed',
        code: 500,
        retryable: true
      });
    }

    console.log('Photo uploaded successfully:', storagePath);

    // Return success with storage path
    return res.status(200).json({
      success: true,
      storagePath: storagePath,
      photoOrder: photoOrder
    });

  } catch (error) {
    console.error('Error in /api/upload-photo:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      code: 500,
      retryable: true
    });
  }
}

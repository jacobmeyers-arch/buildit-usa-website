/**
 * /api/upload-photo - Photo Upload Endpoint
 * 
 * Handles uploading photos to Supabase Storage.
 * Before user creation: uploads to temp/{sessionId}/{photoOrder}.jpg
 * After user creation: uploads to {userId}/{projectId}/{photoOrder}.jpg
 */

import { supabaseAdmin } from './lib/supabase-admin.js';
import { checkRateLimit } from './lib/rate-limiter.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
// Max photo size: 5MB base64 (decodes to ~3.75MB image)
const MAX_PHOTO_BASE64_LENGTH = 5 * 1024 * 1024 * 1.37; // ~6.85M chars
// JPEG magic bytes: FF D8 FF
const JPEG_MAGIC = [0xFF, 0xD8, 0xFF];

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
    // Rate limit: 20 uploads per hour per IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || 'unknown';
    const rateLimitResult = checkRateLimit(clientIp, false, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: "You've reached the upload limit. Try again in a few minutes.",
        code: 429
      });
    }

    const { sessionId, userId, projectId, photoOrder, photoData } = req.body;

    // Validate required fields
    if (!photoData || photoOrder === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: photoData, photoOrder',
        code: 400
      });
    }

    // Validate photoOrder is a positive integer within range
    const order = Number(photoOrder);
    if (!Number.isInteger(order) || order < 1 || order > 20) {
      return res.status(400).json({
        error: 'photoOrder must be an integer between 1 and 20',
        code: 400
      });
    }

    // Validate photo data size
    if (photoData.length > MAX_PHOTO_BASE64_LENGTH) {
      return res.status(400).json({
        error: 'Photo exceeds maximum size of 5MB',
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

    // Validate JPEG magic bytes
    if (buffer.length < 3 || buffer[0] !== JPEG_MAGIC[0] || buffer[1] !== JPEG_MAGIC[1] || buffer[2] !== JPEG_MAGIC[2]) {
      return res.status(400).json({
        error: 'Invalid file type — only JPEG images are accepted',
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

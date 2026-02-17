/**
 * /api/create-user-project - User and Project Creation Endpoint
 * 
 * Option B auth: Creates free tier users server-side without magic link.
 * Moves photos from temp/{sessionId}/ to {user_id}/{project_id}/.
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate zip code format (5 digits)
 */
function isValidZipCode(zip) {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zip);
}

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

/**
 * Move photos from temp to final location
 */
async function movePhotos(sessionId, userId, projectId) {
  const tempPath = `temp/${sessionId}`;
  const finalPath = `${userId}/${projectId}`;
  
  // List all files in temp folder
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from('project-photos')
    .list(tempPath);

  if (listError) {
    console.error('Error listing temp photos:', listError);
    throw new Error('Failed to list temporary photos');
  }

  if (!files || files.length === 0) {
    console.warn('No photos found in temp folder:', tempPath);
    return [];
  }

  const movedPhotos = [];

  // Move each file
  for (const file of files) {
    const tempFilePath = `${tempPath}/${file.name}`;
    const finalFilePath = `${finalPath}/${file.name}`;

    try {
      // Download from temp location
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('project-photos')
        .download(tempFilePath);

      if (downloadError) {
        console.error(`Error downloading ${tempFilePath}:`, downloadError);
        continue;
      }

      // Upload to final location
      const { error: uploadError } = await supabaseAdmin.storage
        .from('project-photos')
        .upload(finalFilePath, fileData, {
          contentType: file.metadata?.mimetype || 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error(`Error uploading ${finalFilePath}:`, uploadError);
        continue;
      }

      // Delete temp file
      const { error: deleteError } = await supabaseAdmin.storage
        .from('project-photos')
        .remove([tempFilePath]);

      if (deleteError) {
        console.warn(`Error deleting temp file ${tempFilePath}:`, deleteError);
      }

      movedPhotos.push({
        filename: file.name,
        storagePath: finalFilePath,
        photoOrder: parseInt(file.name.split('.')[0]) || 1
      });

    } catch (error) {
      console.error(`Error moving file ${file.name}:`, error);
    }
  }

  // Try to remove the temp folder (may fail if not empty, which is ok)
  try {
    await supabaseAdmin.storage
      .from('project-photos')
      .remove([tempPath]);
  } catch (error) {
    console.warn('Could not remove temp folder (may not be empty):', error);
  }

  return movedPhotos;
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
    const { email, zipCode, sessionId, aiAnalysis } = req.body;

    // Validate required fields
    if (!email || !zipCode || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields: email, zipCode, sessionId',
        code: 400
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 400
      });
    }

    // Validate zip code format
    if (!isValidZipCode(zipCode)) {
      return res.status(400).json({
        error: 'Invalid zip code. Must be 5 digits.',
        code: 400
      });
    }

    // Validate sessionId format
    if (!isValidUuid(sessionId)) {
      return res.status(400).json({
        error: 'Invalid sessionId format',
        code: 400
      });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeText(email.toLowerCase().trim());
    const sanitizedZip = zipCode.trim();
    const sanitizedAnalysis = sanitizeText(aiAnalysis);

    // Check if user already exists
    let userId;
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      // User exists, use their ID
      userId = existingUser.id;
      console.log('Existing user found:', sanitizedEmail);
    } else {
      // Create new user
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          email: sanitizedEmail,
          zip_code: sanitizedZip
        })
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return res.status(500).json({
          error: 'Failed to create user account',
          code: 500
        });
      }

      userId = newUser.id;
      console.log('New user created:', sanitizedEmail, userId);
    }

    // Create project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId,
        title: 'New Project', // Will be updated from AI analysis
        status: 'analyzing'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return res.status(500).json({
        error: 'Failed to create project',
        code: 500
      });
    }

    console.log('Project created:', project.id);

    // Move photos from temp to final location
    let movedPhotos = [];
    try {
      movedPhotos = await movePhotos(sessionId, userId, project.id);
      console.log(`Moved ${movedPhotos.length} photos from temp to final location`);
    } catch (moveError) {
      console.error('Error moving photos:', moveError);
      
      // Rollback: delete project
      await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', project.id);
      
      // Only rollback user if we just created them
      if (!existingUser) {
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId);
      }
      
      return res.status(500).json({
        error: 'Failed to process photos. Please try again.',
        code: 500
      });
    }

    // Create project_photos records
    if (movedPhotos.length > 0) {
      const photoRecords = movedPhotos.map((photo, index) => ({
        project_id: project.id,
        photo_order: photo.photoOrder,
        storage_path: photo.storagePath,
        ai_analysis: index === 0 ? sanitizedAnalysis : null // First photo gets the analysis
      }));

      const { error: photosError } = await supabaseAdmin
        .from('project_photos')
        .insert(photoRecords);

      if (photosError) {
        console.error('Error creating project_photos records:', photosError);
        // Non-fatal - photos are moved, records can be created later
      } else {
        console.log(`Created ${photoRecords.length} project_photos records`);
      }
    }

    // Update project status to 'created' (analysis complete)
    await supabaseAdmin
      .from('projects')
      .update({ status: 'created' })
      .eq('id', project.id);

    // Return user and project data
    return res.status(200).json({
      user: {
        id: userId,
        email: sanitizedEmail,
        zipCode: sanitizedZip
      },
      project: {
        id: project.id,
        status: 'created',
        title: project.title
      }
    });

  } catch (error) {
    console.error('Error in /api/create-user-project:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      code: 500
    });
  }
}

/**
 * /api/create-user-project - User and Project Creation Endpoint
 * 
 * Option B auth: Creates free tier users server-side without magic link.
 * Moves photos from temp/{sessionId}/ to {user_id}/{project_id}/.
 * 
 * Modified: 2026-02-17 — Handles propertyProfileId and entry_type for
 *   address flow. Skips photo move when propertyProfileId is present.
 */

import { supabaseAdmin } from './lib/supabase-admin.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidZipCode(zip) {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zip);
}

function isValidUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeText(text) {
  if (!text) return text;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function movePhotos(sessionId, userId, projectId) {
  const tempPath = `temp/${sessionId}`;
  const finalPath = `${userId}/${projectId}`;
  
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

  for (const file of files) {
    const tempFilePath = `${tempPath}/${file.name}`;
    const finalFilePath = `${finalPath}/${file.name}`;

    try {
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('project-photos')
        .download(tempFilePath);

      if (downloadError) {
        console.error(`Error downloading ${tempFilePath}:`, downloadError);
        continue;
      }

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
    const { email, zipCode, sessionId, aiAnalysis, propertyProfileId } = req.body;

    // Determine flow type: address flow (has propertyProfileId) or camera flow
    const isAddressFlow = !!propertyProfileId;

    // Validate required fields (sessionId only required for camera flow)
    if (!email || !zipCode) {
      return res.status(400).json({
        error: 'Missing required fields: email, zipCode',
        code: 400
      });
    }

    if (!isAddressFlow && !sessionId) {
      return res.status(400).json({
        error: 'Missing required field: sessionId (for camera flow)',
        code: 400
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format', code: 400 });
    }

    if (!isValidZipCode(zipCode)) {
      return res.status(400).json({ error: 'Invalid zip code. Must be 5 digits.', code: 400 });
    }

    if (sessionId && !isValidUuid(sessionId)) {
      return res.status(400).json({ error: 'Invalid sessionId format', code: 400 });
    }

    if (propertyProfileId && !isValidUuid(propertyProfileId)) {
      return res.status(400).json({ error: 'Invalid propertyProfileId format', code: 400 });
    }

    const sanitizedEmail = sanitizeText(email.toLowerCase().trim());
    const sanitizedZip = zipCode.trim();
    const sanitizedAnalysis = sanitizeText(aiAnalysis);

    // Check if user already exists
    let userId;
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      // Update zip_code for returning users (may have changed)
      await supabaseAdmin
        .from('users')
        .update({ zip_code: sanitizedZip })
        .eq('id', userId);
      console.log('Existing user found:', sanitizedEmail);
    } else {
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({ email: sanitizedEmail, zip_code: sanitizedZip })
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return res.status(500).json({ error: 'Failed to create user account', code: 500 });
      }

      userId = newUser.id;
      console.log('New user created:', sanitizedEmail, userId);
    }

    // Build project record — differs by flow type
    const projectData = {
      user_id: userId,
      status: 'analyzing'
    };

    if (isAddressFlow) {
      // Address flow: link to property profile, set entry_type
      projectData.title = 'Property Assessment';
      projectData.property_profile_id = propertyProfileId;
      projectData.entry_type = 'address';
    } else {
      // Camera flow: default entry_type
      projectData.title = 'New Project';
      projectData.entry_type = 'camera';
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return res.status(500).json({ error: 'Failed to create project', code: 500 });
    }

    console.log('Project created:', project.id, `(${projectData.entry_type} flow)`);

    // Only move photos for camera flow (address flow has no temp photos)
    let movedPhotos = [];
    if (!isAddressFlow) {
      try {
        movedPhotos = await movePhotos(sessionId, userId, project.id);
        console.log(`Moved ${movedPhotos.length} photos from temp to final location`);
      } catch (moveError) {
        console.error('Error moving photos:', moveError);
        
        await supabaseAdmin.from('projects').delete().eq('id', project.id);
        if (!existingUser) {
          await supabaseAdmin.from('users').delete().eq('id', userId);
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
          ai_analysis: index === 0 ? sanitizedAnalysis : null
        }));

        const { error: photosError } = await supabaseAdmin
          .from('project_photos')
          .insert(photoRecords);

        if (photosError) {
          console.error('Error creating project_photos records:', photosError);
        } else {
          console.log(`Created ${photoRecords.length} project_photos records`);
        }
      }
    }

    // Update project status
    await supabaseAdmin
      .from('projects')
      .update({ status: 'created' })
      .eq('id', project.id);

    return res.status(200).json({
      user: { id: userId, email: sanitizedEmail, zipCode: sanitizedZip },
      project: { id: project.id, status: 'created', title: project.title }
    });

  } catch (error) {
    console.error('Error in /api/create-user-project:', error);
    return res.status(500).json({ error: 'An unexpected error occurred', code: 500 });
  }
}

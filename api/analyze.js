/**
 * /api/analyze - Photo Analysis Endpoint
 * 
 * Consolidated endpoint handling 3 types:
 * - initial: First photo analysis (Phase 1)
 * - additional: Additional photo during scoping (Phase 2)
 * - correction: Re-analysis with user correction
 */

import { checkRateLimit } from './lib/rate-limiter.js';
import { supabaseAdmin } from './lib/supabase-admin.js';
import {
  streamInitialAnalysis,
  streamAdditionalPhoto,
  streamCorrectionAnalysis
} from './lib/claude.js';
import { validateUnderstandingUpdate } from './lib/validators.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * Get client IP address
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown';
}

/**
 * Validate UUID format
 */
function isValidUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize text input (strip HTML/script tags)
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Origin verification
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: 'Forbidden', code: 403 });
  }

  try {
    const { storagePath, type, projectId, correctionText } = req.body;

    // Validate required fields
    if (!storagePath || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: storagePath, type', 
        code: 400 
      });
    }

    // Validate type
    if (!['initial', 'additional', 'correction'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: initial, additional, or correction', 
        code: 400 
      });
    }

    // Validate projectId for additional/correction types
    if ((type === 'additional' || type === 'correction') && !projectId) {
      return res.status(400).json({ 
        error: `projectId required for type: ${type}`, 
        code: 400 
      });
    }

    if (projectId && !isValidUuid(projectId)) {
      return res.status(400).json({ 
        error: 'Invalid projectId format', 
        code: 400 
      });
    }

    // Sanitize text inputs
    const sanitizedCorrectionText = sanitizeText(correctionText);

    // Rate limiting
    const clientIp = getClientIp(req);
    const isAuthenticated = false; // TODO: Check auth token when implemented
    const rateLimit = checkRateLimit(clientIp, isAuthenticated);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return res.status(429).json({
        error: "You've reached the limit for now. Try again in a few minutes.",
        code: 429,
        resetAt: resetDate.toISOString()
      });
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const writer = {
      write: (chunk) => {
        res.write(chunk);
      }
    };

    // Route to appropriate analysis function
    let result;
    
    if (type === 'initial') {
      result = await streamInitialAnalysis(storagePath, supabaseAdmin, writer);
    } 
    else if (type === 'additional') {
      // Fetch project context for additional photo
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found', code: 404 });
      }

      // Build resolved/unresolved dimensions summary
      const dimensions = project.understanding_dimensions || {};
      const resolvedDims = Object.entries(dimensions)
        .filter(([_, resolved]) => resolved)
        .map(([dim, _]) => dim.replace(/_/g, ' '))
        .join(', ') || 'none yet';
      
      const unresolvedDims = Object.entries(dimensions)
        .filter(([_, resolved]) => !resolved)
        .map(([dim, _]) => dim.replace(/_/g, ' '))
        .join(', ') || 'none';

      const projectContext = {
        projectTitle: project.title || 'Untitled project',
        understandingScore: project.understanding_score || 0,
        resolvedDimensionsSummary: resolvedDims,
        unresolvedDimensions: unresolvedDims
      };

      result = await streamAdditionalPhoto(projectContext, storagePath, supabaseAdmin, writer);
      
      // Update project understanding if tool_use received and valid
      if (result.toolUseBlock?.input) {
        const validation = validateUnderstandingUpdate(result.toolUseBlock.input);
        
        if (validation.valid) {
          const { understanding, dimensions_resolved } = result.toolUseBlock.input;
          
          await supabaseAdmin
            .from('projects')
            .update({
              understanding_score: understanding,
              understanding_dimensions: dimensions_resolved,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectId);
        } else {
          console.warn('Invalid understanding update from additional photo:', validation.error);
        }
      }

      // Log interaction
      await supabaseAdmin.from('interactions').insert({
        project_id: projectId,
        type: 'additional_photo',
        user_input: null,
        ai_response: 'Additional photo analysis',
        metadata: result.toolUseBlock?.input || {}
      });
    }
    else if (type === 'correction') {
      result = await streamCorrectionAnalysis(
        storagePath, 
        sanitizedCorrectionText, 
        supabaseAdmin, 
        writer
      );
      
      if (projectId && result.success) {
        // Extract project title from the first line of the AI response
        // Prompt 6A format: "PROJECT: <specific project name>. <detail>"
        let correctedTitle = null;
        if (result.fullText) {
          const firstLine = result.fullText.split('\n')[0] || '';
          const projectMatch = firstLine.match(/^(?:PROJECT:\s*)?(.+?)\./);
          if (projectMatch) {
            correctedTitle = projectMatch[1].trim().substring(0, 100);
          }
        }

        // Update project title if extracted
        if (correctedTitle) {
          await supabaseAdmin
            .from('projects')
            .update({ title: correctedTitle, updated_at: new Date().toISOString() })
            .eq('id', projectId);
          console.log('Updated project title from correction:', correctedTitle);
        }

        await supabaseAdmin.from('interactions').insert({
          project_id: projectId,
          type: 'correction',
          user_input: sanitizedCorrectionText,
          ai_response: result.fullText || 'Correction analysis',
          metadata: {}
        });
      }
    }

    // End the stream
    res.end();

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    
    // Send error event if stream is still open
    try {
      const encoder = new TextEncoder();
      res.write(encoder.encode(`event: error\n`));
      res.write(encoder.encode(`data: ${JSON.stringify({
        message: 'An unexpected error occurred. Please try again.',
        retryable: true
      })}\n\n`));
    } catch (writeError) {
      // Stream already closed
    }
    
    res.end();
  }
}

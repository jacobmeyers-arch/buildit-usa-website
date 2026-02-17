/**
 * /api/scope - Scoping Session Endpoint
 * 
 * Handles Phase 2 scoping:
 * - action: 'question' - Q&A session
 * - action: 'generate' - Generate final scope + cost estimate
 */

import { checkRateLimit } from './lib/rate-limiter.js';
import { supabaseAdmin } from './lib/supabase-admin.js';
import { buildContext, getUserZipCode } from './lib/context-manager.js';
import { streamScopingQA, generateEstimate } from './lib/claude.js';
import { validateUnderstandingUpdate, validateCostEstimate } from './lib/validators.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
const ESCAPE_HATCH_THRESHOLD = 8; // interactions
const ESCAPE_HATCH_SCORE_MIN = 60;
const ESCAPE_HATCH_SCORE_MAX = 80;

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
    const { projectId, action, userInput } = req.body;

    // Validate required fields
    if (!projectId || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, action', 
        code: 400 
      });
    }

    if (!isValidUuid(projectId)) {
      return res.status(400).json({ 
        error: 'Invalid projectId format', 
        code: 400 
      });
    }

    // Validate action
    if (!['question', 'generate'].includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action. Must be: question or generate', 
        code: 400 
      });
    }

    // Validate userInput for 'question' action
    if (action === 'question' && !userInput) {
      return res.status(400).json({ 
        error: 'userInput required for action: question', 
        code: 400 
      });
    }

    // Sanitize user input
    const sanitizedInput = sanitizeText(userInput);

    // Rate limiting
    const clientIp = getClientIp(req);
    const isAuthenticated = false; // TODO: Check auth token
    const rateLimit = checkRateLimit(clientIp, isAuthenticated);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return res.status(429).json({
        error: "You've reached the limit for now. Try again in a few minutes.",
        code: 429,
        resetAt: resetDate.toISOString()
      });
    }

    // Fetch project to verify it exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found', code: 404 });
    }

    // Build rolling context
    const context = await buildContext(projectId);
    
    // Add zip code for estimate generation
    if (action === 'generate') {
      context.zipCode = await getUserZipCode(projectId);
    }

    // Set up SSE stream writer
    const writer = {
      write: (chunk) => {
        res.write(chunk);
      }
    };

    // Route to appropriate action
    if (action === 'question') {
      // Check for escape hatch condition
      const shouldSuggestEstimate = 
        project.interaction_count >= ESCAPE_HATCH_THRESHOLD &&
        project.understanding_score >= ESCAPE_HATCH_SCORE_MIN &&
        project.understanding_score <= ESCAPE_HATCH_SCORE_MAX;

      if (shouldSuggestEstimate) {
        context.interactionLog += '\n\n[SYSTEM NOTE: The homeowner has been very engaged. If you feel you have enough to generate a useful estimate (even with some wider ranges), offer to generate it now.]';
      }

      // Stream Q&A response
      const result = await streamScopingQA(context, sanitizedInput, writer);

      // Log interaction
      await supabaseAdmin.from('interactions').insert({
        project_id: projectId,
        type: 'question',
        user_input: sanitizedInput,
        ai_response: 'Streamed response', // Full text not stored to save space
        metadata: result.toolUseBlock || {}
      });

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
              interaction_count: project.interaction_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectId);
        } else {
          console.warn('Invalid understanding update:', validation.error);
        }
      }

      // Send suggest_estimate metadata if escape hatch triggered
      if (shouldSuggestEstimate && result.success) {
        const encoder = new TextEncoder();
        res.write(encoder.encode('event: metadata\n'));
        res.write(encoder.encode(`data: ${JSON.stringify({ suggest_estimate: true })}\n\n`));
      }
    } 
    else if (action === 'generate') {
      // Generate estimate - returns {toolUseBlock, fullText}
      let estimateResult = await generateEstimate(context, writer);
      let scopeNarrative = estimateResult?.fullText || '';

      if (!estimateResult || !estimateResult.toolUseBlock || !estimateResult.toolUseBlock.input) {
        console.error('No estimate tool_use block received from Claude');
        
        // Retry once
        console.log('Retrying estimate generation...');
        const retryEstimate = await generateEstimate(context, writer);
        const retryResult = retryEstimate?.toolUseBlock;
        if (retryEstimate?.fullText) scopeNarrative = retryEstimate.fullText;
        
        if (!retryResult || !retryResult.input) {
          // Send error event
          const encoder = new TextEncoder();
          res.write(encoder.encode('event: error\n'));
          res.write(encoder.encode(`data: ${JSON.stringify({
            message: 'Failed to generate structured estimate. Please try again.',
            retryable: true
          })}\n\n`));
          res.end();
          return;
        }
        
        estimateResult = { toolUseBlock: retryResult, fullText: scopeNarrative };
      }

      // Validate cost estimate
      const validation = validateCostEstimate(estimateResult.toolUseBlock.input);
      
      if (!validation.valid) {
        console.error('Invalid cost estimate:', validation.error);
        const encoder = new TextEncoder();
        res.write(encoder.encode('event: error\n'));
        res.write(encoder.encode(`data: ${JSON.stringify({
          message: 'Generated estimate failed validation. Please try again.',
          retryable: true
        })}\n\n`));
        res.end();
        return;
      }

      // Update project with scope summary and cost estimate
      await supabaseAdmin
        .from('projects')
        .update({
          scope_summary: scopeNarrative,
          cost_estimate: estimateResult.toolUseBlock.input,
          status: 'estimate_ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      // Log interaction
      await supabaseAdmin.from('interactions').insert({
        project_id: projectId,
        type: 'estimate_request',
        user_input: null,
        ai_response: scopeNarrative,
        metadata: estimateResult.toolUseBlock.input
      });
    }

    // End the stream
    res.end();

  } catch (error) {
    console.error('Error in /api/scope:', error);
    
    // Send error event
    try {
      const encoder = new TextEncoder();
      res.write(encoder.encode('event: error\n'));
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

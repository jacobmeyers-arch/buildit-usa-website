/**
 * Rolling Context Manager
 * 
 * Manages context for scoping sessions to stay within token limits.
 * Hard cap: ~4,000 tokens total for injected context.
 */

import { supabaseAdmin } from './supabase-admin.js';

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Summarize an interaction programmatically
 */
function summarizeInteraction(interaction) {
  const userPart = interaction.user_input 
    ? `Q: ${interaction.user_input.substring(0, 100)}` 
    : 'Q: [photo provided]';
  
  const aiPart = interaction.ai_response 
    ? `A: ${interaction.ai_response.substring(0, 100)}` 
    : 'A: [response]';
  
  return `[${userPart}] → [${aiPart}]`;
}

/**
 * Build rolling context for a project
 * @param {string} projectId - Project UUID
 * @returns {Promise<Object>} Context object with formatted strings
 */
export async function buildContext(projectId) {
  // Fetch project data
  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    throw new Error('Project not found');
  }

  // Fetch all photo analyses
  const { data: photos, error: photosError } = await supabaseAdmin
    .from('project_photos')
    .select('*')
    .eq('project_id', projectId)
    .order('photo_order', { ascending: true });

  if (photosError) {
    throw new Error('Failed to fetch photos');
  }

  // Fetch interactions (ordered by created_at)
  const { data: interactions, error: interactionsError } = await supabaseAdmin
    .from('interactions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (interactionsError) {
    throw new Error('Failed to fetch interactions');
  }

  // Build photo analyses section (always include all)
  let photoAnalyses = '';
  if (photos && photos.length > 0) {
    photoAnalyses = photos
      .filter(p => p.ai_analysis)
      .map((p, idx) => `Photo ${idx + 1}: ${p.ai_analysis}`)
      .join('\n\n');
  }

  // Build interaction log
  let interactionLog = '';
  const interactionCount = interactions?.length || 0;
  
  if (interactionCount > 0) {
    // Last 3 interactions: full content
    const recentInteractions = interactions.slice(-3);
    const recentLog = recentInteractions
      .map(int => {
        const userPart = int.user_input ? `User: ${int.user_input}` : 'User: [provided photo]';
        const aiPart = int.ai_response ? `Assistant: ${int.ai_response}` : 'Assistant: [response]';
        return `${userPart}\n${aiPart}`;
      })
      .join('\n\n');
    
    // Older interactions (4+): summarized
    const olderInteractions = interactions.slice(0, -3);
    const olderLog = olderInteractions.length > 0
      ? 'Previous interactions (summarized):\n' + 
        olderInteractions.map(summarizeInteraction).join('\n')
      : '';
    
    interactionLog = [olderLog, recentLog].filter(Boolean).join('\n\n---\n\n');
  }

  // Build resolved/unresolved dimensions summary
  const dimensions = project.understanding_dimensions || {};
  const resolvedDimensions = Object.entries(dimensions)
    .filter(([_, resolved]) => resolved)
    .map(([dim, _]) => dim.replace(/_/g, ' '));
  
  const unresolvedDimensions = Object.entries(dimensions)
    .filter(([_, resolved]) => !resolved)
    .map(([dim, _]) => dim.replace(/_/g, ' '));

  const resolvedDimensionsSummary = resolvedDimensions.length > 0
    ? resolvedDimensions.join(', ')
    : 'none yet';
  
  const unresolvedDimensionsList = unresolvedDimensions.length > 0
    ? unresolvedDimensions.join(', ')
    : 'none';

  // Assemble full context
  const context = {
    projectTitle: project.title || 'Untitled project',
    budgetApproach: project.budget_approach || 'not set',
    budgetTarget: project.budget_target || null,
    understandingScore: project.understanding_score || 0,
    dimensionsResolved: dimensions,
    photoAnalyses,
    interactionLog,
    resolvedDimensionsSummary,
    unresolvedDimensions: unresolvedDimensionsList,
    zipCode: null // Will be fetched from user if needed
  };

  // Calculate total token estimate
  const totalText = JSON.stringify(context);
  const totalTokens = estimateTokens(totalText);
  
  console.log(`[Context Manager] Built context for project ${projectId}: ~${totalTokens} tokens`);
  
  // Warn if over cap (shouldn't happen with our summarization strategy)
  if (totalTokens > 4500) {
    console.warn(`[Context Manager] Context exceeds 4,000 token target: ${totalTokens} tokens`);
  }

  return context;
}

/**
 * Fetch user's zip code for a project
 */
export async function getUserZipCode(projectId) {
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (!project) return null;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('zip_code')
    .eq('id', project.user_id)
    .single();

  return user?.zip_code || null;
}

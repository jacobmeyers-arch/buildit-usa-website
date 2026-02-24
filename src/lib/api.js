/**
 * API client for BuildIt USA
 * 
 * Client-side functions for calling serverless API endpoints.
 * 
 * Modified: 2026-02-17 — Added fetchProjects, generateProfile,
 *   updated createUserAndProject with propertyProfileId param
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Convert blob to base64 string
 */
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload photo to Supabase Storage
 * @param {Blob} photoBlob - Image blob to upload
 * @param {number} photoOrder - Photo order/index (0, 1, 2, etc.)
 * @param {Object} options - Upload options
 * @param {string} options.sessionId - Session ID for temp upload (before user creation)
 * @param {string} options.userId - User ID (after user creation)
 * @param {string} options.projectId - Project ID (after user creation)
 * @returns {Promise<Object>} { success, storagePath, photoOrder }
 */
export async function uploadPhoto(photoBlob, photoOrder, options = {}) {
  const { sessionId, userId, projectId } = options;
  
  // Convert blob to base64
  const base64Data = await blobToBase64(photoBlob);
  
  const response = await fetch(`${API_BASE}/upload-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      userId,
      projectId,
      photoOrder,
      photoData: base64Data
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  
  return data;
}

/**
 * Create user and project (called from EmailCapture)
 * @param {string} email - User email
 * @param {string} zipCode - User zip code
 * @param {string} sessionId - Session ID (for photo migration)
 * @param {string} aiAnalysis - AI analysis text from Phase 1
 * @param {string} [propertyProfileId] - Optional profile cache ID (address flow)
 * @returns {Promise<Object>} { user, project }
 */
export async function createUserAndProject(email, zipCode, sessionId, aiAnalysis, propertyProfileId = null) {
  const response = await fetch(`${API_BASE}/create-user-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      zipCode,
      sessionId,
      aiAnalysis,
      propertyProfileId
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create account');
  }
  
  return data;
}

/**
 * Update project budget settings
 * Called from BudgetQuestion screen
 * @param {string} projectId - Project UUID
 * @param {string} budgetApproach - 'target_budget' or 'dream_version'
 * @param {string} budgetTarget - Optional budget amount for target_budget approach
 */
export async function updateBudget(projectId, budgetApproach, budgetTarget = null) {
  const response = await fetch(`${API_BASE}/update-budget`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      budgetApproach,
      budgetTarget
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update budget');
  }
  
  return data;
}

/**
 * Fetch all projects for a user
 * Called from ProjectDashboard
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} { projects: Array }
 */
export async function fetchProjects(userId) {
  const response = await fetch(`${API_BASE}/projects?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch projects');
  }

  return data;
}

/**
 * Generate a property profile from a validated address
 * Called from ProfileLoading screen
 * @param {Object} address - Validated address object from Google Places
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} { success, profile, cached, cacheId, generationTimeMs }
 */
export async function generateProfile(address, forceRefresh = false) {
  const response = await fetch(`${API_BASE}/profile-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address,
      forceRefresh
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate profile');
  }

  return data;
}

/**
 * Create a Stripe Checkout session
 * Called from stripe.js redirectToCheckout
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} { sessionId, url }
 */
export async function createCheckoutSession(userId) {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  return data;
}

/**
 * Soft-delete a project
 * Called from ProjectDashboard
 * @param {string} projectId - Project UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} { success: true }
 */
export async function deleteProject(projectId, userId) {
  const response = await fetch(`${API_BASE}/delete-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, userId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete project');
  }

  return data;
}

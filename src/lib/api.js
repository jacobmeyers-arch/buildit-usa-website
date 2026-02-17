/**
 * API Client
 * 
 * Frontend helpers for calling serverless API endpoints.
 * All server-side logic uses service_role key for free tier users.
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * Create user and project (free tier - no auth)
 * Called from EmailCapture screen
 * 
 * Moves photos from temp/{sessionId}/ to {user_id}/{project_id}/
 * Creates user record, project record, and project_photos records
 */
export async function createUserAndProject(email, zipCode, sessionId, aiAnalysis) {
  const response = await fetch(`${API_BASE}/api/create-user-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, zipCode, sessionId, aiAnalysis })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create user and project')
  }
  
  return response.json()
}

/**
 * Check plan status for a user
 * Returns plan type and project count
 */
export async function checkPlanStatus(userId) {
  const response = await fetch(`${API_BASE}/api/plan-status?userId=${userId}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to check plan status')
  }
  
  return response.json()
}

/**
 * Get project count for a user
 * Only counts non-deleted projects
 */
export async function getProjectCount(userId) {
  const response = await fetch(`${API_BASE}/api/project-count?userId=${userId}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get project count')
  }
  
  const data = await response.json()
  return data.count
}

/**
 * Upload photo to Supabase storage
 * Before user creation: temp/{sessionId}/{photoOrder}.jpg
 * After user creation: {userId}/{projectId}/{photoOrder}.jpg
 */
export async function uploadPhoto(file, storagePath) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', storagePath)
  
  const response = await fetch(`${API_BASE}/api/upload-photo`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload photo')
  }
  
  return response.json()
}

/**
 * Get initial photo analysis
 * Streams response via SSE
 */
export function analyzePhoto(storagePath, type = 'initial', projectId = null, correctionText = null) {
  return fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      storagePath, 
      type, 
      projectId, 
      correctionText 
    })
  })
}

/**
 * Scoping session API
 * action: 'question' | 'generate'
 */
export function scopeSession(projectId, action, userInput = null) {
  return fetch(`${API_BASE}/api/scope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      projectId, 
      action, 
      userInput 
    })
  })
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(userId) {
  const response = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create checkout session')
  }
  
  return response.json()
}

/**
 * Verify payment (fallback)
 */
export async function verifyPayment(sessionId, authToken) {
  const response = await fetch(`${API_BASE}/api/verify-payment?session_id=${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to verify payment')
  }
  
  return response.json()
}

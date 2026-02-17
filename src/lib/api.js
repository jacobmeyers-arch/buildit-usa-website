/**
 * API client for BuildIt USA
 * 
 * Client-side functions for calling serverless API endpoints
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
 * @returns {Promise<Object>} { user, project }
 */
export async function createUserAndProject(email, zipCode, sessionId, aiAnalysis) {
  const response = await fetch(`${API_BASE}/create-user-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      zipCode,
      sessionId,
      aiAnalysis
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create account');
  }
  
  return data;
}

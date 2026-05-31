/**
 * Rate Limiter
 * 
 * In-memory rate limiting for API endpoints.
 * Per-IP tracking with TTL. State resets on cold start (acceptable for MVP).
 */

const rateLimitStore = new Map();

const LIMITS = {
  unauthenticated: { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  authenticated: { requests: 15, windowMs: 60 * 60 * 1000 }   // 15 per hour
};

/**
 * Check rate limit for an IP address
 * @param {string} ip - IP address
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Object} [overrides] - Optional custom limits { maxRequests, windowMs }
 * @returns {{allowed: boolean, remaining: number, resetAt: number}}
 */
export function checkRateLimit(ip, isAuthenticated = false, overrides = null) {
  const now = Date.now();
  const defaultLimit = isAuthenticated ? LIMITS.authenticated : LIMITS.unauthenticated;
  const limit = overrides
    ? { requests: overrides.maxRequests, windowMs: overrides.windowMs }
    : defaultLimit;

  // Include override hash in key so different endpoints get separate buckets
  const bucketSuffix = overrides ? `:${overrides.maxRequests}/${overrides.windowMs}` : '';
  const key = `${ip}:${isAuthenticated ? 'auth' : 'unauth'}${bucketSuffix}`;
  let record = rateLimitStore.get(key);
  
  // Initialize or reset if expired
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + limit.windowMs
    };
    rateLimitStore.set(key, record);
  }
  
  // Clean up expired entries lazily (every 100 checks) instead of setInterval
  // setInterval keeps the process alive and conflicts with serverless cold shutdown
  if (rateLimitStore.size > 50 && record.count % 100 === 0) {
    cleanupExpiredEntries();
  }
  
  // Check if limit exceeded
  if (record.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    };
  }
  
  // Increment and allow
  record.count++;
  
  return {
    allowed: true,
    remaining: limit.requests - record.count,
    resetAt: record.resetAt
  };
}

/**
 * Clean up expired entries (called lazily, not on interval)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

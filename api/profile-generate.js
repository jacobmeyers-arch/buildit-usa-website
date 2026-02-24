/**
 * /api/profile-generate - Property Profile Generation Endpoint
 * 
 * Main orchestrator for the address-to-profile flow.
 * Pipeline: validate → check cache → parallel fetch (Rentcast + Street View)
 *           → normalize → AI enrich → cache → return
 * 
 * Created: 2026-02-17
 */

import { checkRateLimit } from './lib/rate-limiter.js';
import { fetchPropertyData } from './lib/rentcast.js';
import { getStreetViewUrl } from './lib/streetview.js';
import { generateCacheKey, getCachedProfile, setCachedProfile } from './lib/profile-cache.js';
import { buildPropertyProfile } from './lib/profile-normalizer.js';
import { generateRecommendations } from './lib/ai-enrichment.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

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

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(ip, false);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 429,
      resetAt: rateCheck.resetAt
    });
  }

  const startTime = Date.now();

  try {
    const { address, forceRefresh } = req.body;

    // Validate address object
    if (!address || !address.formattedAddress) {
      return res.status(400).json({
        error: 'Missing required field: address with formattedAddress',
        code: 400
      });
    }

    if (typeof address.lat !== 'number' || typeof address.lng !== 'number' ||
        isNaN(address.lat) || isNaN(address.lng)) {
      return res.status(400).json({
        error: 'address.lat and address.lng must be valid numbers',
        code: 400
      });
    }

    if (address.lat < -90 || address.lat > 90 || address.lng < -180 || address.lng > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates: lat must be -90..90 and lng must be -180..180',
        code: 400
      });
    }

    // Check cache first (unless forceRefresh requested)
    const cacheKey = generateCacheKey(address.formattedAddress);

    if (!forceRefresh) {
      const cached = await getCachedProfile(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          profile: cached.profile_data,
          cached: true,
          cacheId: cached.id,
          generationTimeMs: Date.now() - startTime
        });
      }
    }

    // Parallel fetch: Rentcast property data + Street View image
    // Promise.allSettled ensures one failure doesn't block the other
    const [rentcastResult, streetViewResult] = await Promise.allSettled([
      fetchPropertyData(address.formattedAddress),
      getStreetViewUrl(address.lat, address.lng)
    ]);

    // Extract results (default to failure if promise rejected)
    const rentcast = rentcastResult.status === 'fulfilled'
      ? rentcastResult.value
      : { success: false, data: null, fieldsPopulated: 0, latencyMs: 0 };

    const streetView = streetViewResult.status === 'fulfilled'
      ? streetViewResult.value
      : { available: false, imageUrl: null, latencyMs: 0 };

    // Normalize all data into unified profile
    const profile = buildPropertyProfile(address, rentcast, streetView);

    // AI enrichment: generate project recommendations
    const recommendations = await generateRecommendations(profile);
    profile.recommendations = recommendations;

    // Cache the result for future lookups
    const cacheRecord = await setCachedProfile(
      cacheKey,
      address,
      profile,
      address.formattedAddress
    );

    return res.status(200).json({
      success: true,
      profile,
      cached: false,
      cacheId: cacheRecord?.id || null,
      generationTimeMs: Date.now() - startTime
    });

  } catch (error) {
    console.error('Error in /api/profile-generate:', error);
    return res.status(500).json({
      error: 'Failed to generate property profile',
      code: 500
    });
  }
}

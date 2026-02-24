/**
 * Profile Cache
 * 
 * Caches property profiles in Supabase to avoid repeated API calls.
 * Uses SHA-256 hash of the normalized address as the cache key.
 * Entries expire after 30 days.
 * 
 * Created: 2026-02-17
 */

import crypto from 'crypto';
import { supabaseAdmin } from './supabase-admin.js';

/**
 * Generate a deterministic cache key from an address
 * Normalizes the address (lowercase, trimmed) before hashing.
 * 
 * @param {string} formattedAddress - The formatted address string
 * @returns {string} SHA-256 hex hash
 */
export function generateCacheKey(formattedAddress) {
  const normalized = formattedAddress.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Look up a cached profile by cache key
 * Only returns entries that haven't expired yet.
 * 
 * @param {string} cacheKey - SHA-256 hash of the address
 * @returns {Object|null} Cached profile data, or null if not found/expired
 */
export async function getCachedProfile(cacheKey) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profile_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data;

  } catch (error) {
    console.error('Cache lookup error:', error.message);
    return null;
  }
}

/**
 * Store a profile in the cache
 * Uses upsert so re-lookups of the same address refresh the entry.
 * TTL is 30 days from now.
 * 
 * @param {string} cacheKey - SHA-256 hash of the address
 * @param {Object} addressData - Validated address fields (lat, lng, etc.)
 * @param {Object} profileData - Full property profile with recommendations
 * @param {string} addressFormatted - Human-readable address string
 * @returns {Object|null} The cached record, or null on failure
 */
export async function setCachedProfile(cacheKey, addressData, profileData, addressFormatted) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabaseAdmin
      .from('profile_cache')
      .upsert({
        cache_key: cacheKey,
        address_data: addressData,
        profile_data: profileData,
        address_formatted: addressFormatted,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'cache_key'
      })
      .select()
      .single();

    if (error) {
      console.error('Cache write error:', error.message);
      return null;
    }

    return data;

  } catch (error) {
    console.error('Cache write error:', error.message);
    return null;
  }
}

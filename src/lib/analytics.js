/**
 * Analytics — Centralized event tracking for BuildIt USA
 *
 * Writes events to the Supabase events table via service_role API.
 * All 9 spec events route through this module.
 *
 * Created: 2026-02-23
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Track an analytics event
 * @param {string} eventType - One of the defined event types
 * @param {string} userId - User UUID (nullable for pre-auth events)
 * @param {Object} metadata - Optional event metadata
 *
 * Event types:
 *   photo_captured, analysis_viewed, email_submitted, scoping_started,
 *   estimate_generated, upsell_shown, upsell_clicked, payment_completed,
 *   upsell_declined
 */
export async function trackEvent(eventType, userId, metadata = {}) {
  try {
    await fetch(`${API_BASE}/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        eventType,
        metadata
      })
    });
  } catch (err) {
    // Non-blocking — never let analytics break the app
    console.warn(`Analytics event failed (${eventType}):`, err);
  }
}

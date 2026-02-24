/**
 * Google Street View Client
 * 
 * Checks Street View availability and returns image URL.
 * Uses the server-side Google Maps API key for metadata checks.
 * Returns image URL using the client-side key (VITE_GOOGLE_MAPS_API_KEY)
 * since the image is rendered in the browser via <img> tag.
 * 
 * Created: 2026-02-17
 */

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;
const GOOGLE_MAPS_CLIENT_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const STREET_VIEW_BASE = 'https://maps.googleapis.com/maps/api/streetview';

/**
 * Get Street View image URL for a location
 * Checks metadata endpoint first to confirm availability before returning image URL.
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} { available, imageUrl, latencyMs }
 */
export async function getStreetViewUrl(lat, lng) {
  const startTime = Date.now();

  if (!GOOGLE_MAPS_SERVER_KEY) {
    console.error('GOOGLE_MAPS_SERVER_KEY not configured');
    return { available: false, imageUrl: null, latencyMs: 0 };
  }

  try {
    // Check metadata endpoint first — this doesn't cost an image request
    const metadataUrl = `${STREET_VIEW_BASE}/metadata?location=${lat},${lng}&key=${GOOGLE_MAPS_SERVER_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(metadataUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Street View metadata error: ${response.status}`);
      return { available: false, imageUrl: null, latencyMs: Date.now() - startTime };
    }

    const metadata = await response.json();

    // Only return image URL if Street View imagery exists at this location
    if (metadata.status !== 'OK') {
      return {
        available: false,
        imageUrl: null,
        latencyMs: Date.now() - startTime
      };
    }

    // Build the image URL using the CLIENT key (this URL is rendered in browser <img> tags)
    // The client key should be restricted to HTTP referrers in Google Cloud Console
    const imageKey = GOOGLE_MAPS_CLIENT_KEY || GOOGLE_MAPS_SERVER_KEY;
    const imageUrl = `${STREET_VIEW_BASE}?size=600x400&location=${lat},${lng}&key=${imageKey}`;

    return {
      available: true,
      imageUrl,
      latencyMs: Date.now() - startTime
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Street View metadata timeout');
    } else {
      console.error('Street View error:', error.message);
    }

    return {
      available: false,
      imageUrl: null,
      latencyMs: Date.now() - startTime
    };
  }
}

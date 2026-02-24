/**
 * Rentcast API Client
 * 
 * Fetches property data from Rentcast's v1 API (replaced Estated).
 * Normalizes response fields to our internal schema.
 * 
 * Created: 2026-02-17
 */

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const RENTCAST_BASE_URL = 'https://api.rentcast.io/v1';

/**
 * Fetch property data from Rentcast
 * @param {string} formattedAddress - Full address string (e.g., "123 Main St, Austin, TX 78701")
 * @returns {Object} { success, data, fieldsPopulated, latencyMs }
 */
export async function fetchPropertyData(formattedAddress) {
  const startTime = Date.now();

  if (!RENTCAST_API_KEY) {
    console.error('RENTCAST_API_KEY not configured');
    return { success: false, data: null, fieldsPopulated: 0, latencyMs: 0 };
  }

  try {
    // Rentcast expects address as a query parameter
    const url = new URL(`${RENTCAST_BASE_URL}/properties`);
    url.searchParams.set('address', formattedAddress);
    url.searchParams.set('limit', '1');

    // 10-second timeout using AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': RENTCAST_API_KEY
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Rentcast API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        data: null,
        fieldsPopulated: 0,
        latencyMs: Date.now() - startTime
      };
    }

    const results = await response.json();

    // Rentcast returns an array — take the first match
    if (!results || !Array.isArray(results) || results.length === 0) {
      console.warn('Rentcast returned no results for:', formattedAddress);
      return {
        success: false,
        data: null,
        fieldsPopulated: 0,
        latencyMs: Date.now() - startTime
      };
    }

    const property = results[0];
    const normalized = normalizeRentcastData(property);
    const fieldsPopulated = Object.values(normalized).filter(v => v !== null && v !== undefined).length;

    return {
      success: true,
      data: normalized,
      fieldsPopulated,
      latencyMs: Date.now() - startTime
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Rentcast API timeout for:', formattedAddress);
    } else {
      console.error('Rentcast API error:', error.message);
    }

    return {
      success: false,
      data: null,
      fieldsPopulated: 0,
      latencyMs: Date.now() - startTime
    };
  }
}

/**
 * Normalize Rentcast response to our internal schema
 * Maps Rentcast's field names to our consistent property profile format
 */
function normalizeRentcastData(property) {
  const features = property.features || {};
  
  // Get most recent tax assessment and property tax
  const taxAssessments = property.taxAssessments || {};
  const taxYears = Object.keys(taxAssessments).sort().reverse();
  const latestAssessment = taxYears.length > 0 ? taxAssessments[taxYears[0]] : null;

  const propertyTaxes = property.propertyTaxes || {};
  const taxTaxYears = Object.keys(propertyTaxes).sort().reverse();
  const latestTax = taxTaxYears.length > 0 ? propertyTaxes[taxTaxYears[0]] : null;

  return {
    yearBuilt: property.yearBuilt || null,
    livingAreaSqFt: property.squareFootage || null,
    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    stories: features.floorCount || null,
    roofType: features.roofType || null,
    heatingType: features.heatingType || null,
    coolingType: features.coolingType || null,
    exteriorWall: features.exteriorType || null,
    foundationType: features.foundationType || null,
    hasPool: features.pool || false,
    lotAcres: property.lotSize ? +(property.lotSize / 43560).toFixed(2) : null,
    county: property.county || null,
    estimatedValue: latestAssessment?.value || null,
    annualTaxes: latestTax?.total || null,
    lastSalePrice: property.lastSalePrice || null,
    lastSaleDate: property.lastSaleDate || null,
    propertyType: property.propertyType || null,
    architectureType: features.architectureType || null,
    garageSpaces: features.garageSpaces || null,
    ownerOccupied: property.ownerOccupied || null
  };
}

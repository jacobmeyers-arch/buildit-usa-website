/**
 * Profile Normalizer
 * 
 * Merges data from multiple sources (Rentcast, Street View, Google Places)
 * into a unified PropertyProfile object.
 * 
 * Created: 2026-02-17
 */

/**
 * Build a unified property profile from multiple data sources
 * 
 * @param {Object} address - Validated address fields from Google Places
 * @param {Object} rentcastResult - Result from fetchPropertyData()
 * @param {Object} streetViewResult - Result from getStreetViewUrl()
 * @returns {Object} Unified PropertyProfile
 */
export function buildPropertyProfile(address, rentcastResult, streetViewResult) {
  const currentYear = new Date().getFullYear();
  const propertyData = rentcastResult?.data || {};

  // Calculate property age from year built
  const propertyAge = propertyData.yearBuilt
    ? currentYear - propertyData.yearBuilt
    : null;

  // Track which of 16 key fields have data (for completeness score)
  const trackableFields = [
    'yearBuilt', 'livingAreaSqFt', 'bedrooms', 'bathrooms',
    'stories', 'roofType', 'heatingType', 'coolingType',
    'exteriorWall', 'foundationType', 'hasPool', 'lotAcres',
    'county', 'estimatedValue', 'lastSalePrice', 'propertyType'
  ];

  const populatedCount = trackableFields.filter(
    field => propertyData[field] !== null && propertyData[field] !== undefined
  ).length;

  const dataCompleteness = +(populatedCount / trackableFields.length).toFixed(2);

  // Build data sources tracking array
  const dataSources = [
    {
      name: 'Google Places',
      status: 'success',
      latencyMs: 0 // Already resolved before this function runs
    },
    {
      name: 'Rentcast',
      status: rentcastResult?.success ? 'success' : 'failed',
      latencyMs: rentcastResult?.latencyMs || 0,
      fieldsPopulated: rentcastResult?.fieldsPopulated || 0
    },
    {
      name: 'Street View',
      status: streetViewResult?.available ? 'success' : 'unavailable',
      latencyMs: streetViewResult?.latencyMs || 0
    }
  ];

  return {
    // Address info
    address: {
      formatted: address.formattedAddress,
      street: `${address.streetNumber || ''} ${address.streetName || ''}`.trim(),
      city: address.city,
      state: address.state,
      zip: address.zip,
      county: propertyData.county || address.county || null,
      lat: address.lat,
      lng: address.lng,
      googlePlaceId: address.googlePlaceId
    },

    // Property characteristics
    property: {
      yearBuilt: propertyData.yearBuilt ?? null,
      propertyAge,
      livingAreaSqFt: propertyData.livingAreaSqFt ?? null,
      bedrooms: propertyData.bedrooms ?? null,
      bathrooms: propertyData.bathrooms ?? null,
      stories: propertyData.stories ?? null,
      propertyType: propertyData.propertyType || null,
      architectureType: propertyData.architectureType || null,
      lotAcres: propertyData.lotAcres || null,
      garageSpaces: propertyData.garageSpaces ?? null
    },

    // Building materials & systems
    systems: {
      roofType: propertyData.roofType || null,
      heatingType: propertyData.heatingType || null,
      coolingType: propertyData.coolingType || null,
      exteriorWall: propertyData.exteriorWall || null,
      foundationType: propertyData.foundationType || null,
      hasPool: propertyData.hasPool || false
    },

    // Financial data
    financial: {
      estimatedValue: propertyData.estimatedValue || null,
      annualTaxes: propertyData.annualTaxes || null,
      lastSalePrice: propertyData.lastSalePrice || null,
      lastSaleDate: propertyData.lastSaleDate || null
    },

    // Street View imagery
    streetView: {
      available: streetViewResult?.available || false,
      imageUrl: streetViewResult?.imageUrl || null
    },

    // Quality metrics
    dataCompleteness,
    dataSources,

    // Recommendations will be added by AI enrichment
    recommendations: []
  };
}

/**
 * PropertyProfileCard — Full property profile display
 * 
 * Shows: address, Street View image (or placeholder), data completeness bar,
 * property details grid (only non-null fields), AI recommendations list,
 * and sticky "Get Full Report — $20" CTA.
 * 
 * Created: 2026-02-17
 */

import React, { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import ProjectRecommendationCard from './ProjectRecommendationCard';

export default function PropertyProfileCard() {
  const { propertyProfile, setAppScreen } = useProject();

  // Redirect to addressInput if no profile (must be in useEffect, not render)
  useEffect(() => {
    if (!propertyProfile) {
      setAppScreen('addressInput');
    }
  }, [propertyProfile, setAppScreen]);

  if (!propertyProfile) {
    return null;
  }

  const { address, property, systems, financial, streetView, dataCompleteness, recommendations } = propertyProfile;

  // Format dollar amounts
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return null;
    return `$${Math.round(amount).toLocaleString()}`;
  };

  // Build property details list (only show non-null fields)
  const details = [
    { label: 'Type', value: property.propertyType },
    { label: 'Year Built', value: property.yearBuilt },
    { label: 'Age', value: property.propertyAge ? `${property.propertyAge} years` : null },
    { label: 'Living Area', value: property.livingAreaSqFt ? `${property.livingAreaSqFt.toLocaleString()} sq ft` : null },
    { label: 'Bedrooms', value: property.bedrooms },
    { label: 'Bathrooms', value: property.bathrooms },
    { label: 'Stories', value: property.stories },
    { label: 'Lot Size', value: property.lotAcres ? `${property.lotAcres} acres` : null },
    { label: 'Garage', value: property.garageSpaces ? `${property.garageSpaces} spaces` : null },
    { label: 'Roof', value: systems.roofType },
    { label: 'Heating', value: systems.heatingType },
    { label: 'Cooling', value: systems.coolingType },
    { label: 'Exterior', value: systems.exteriorWall },
    { label: 'Foundation', value: systems.foundationType },
    { label: 'Pool', value: systems.hasPool ? 'Yes' : null },
    { label: 'Est. Value', value: formatCurrency(financial.estimatedValue) },
    { label: 'Last Sale', value: financial.lastSalePrice ? `${formatCurrency(financial.lastSalePrice)} (${financial.lastSaleDate || 'unknown'})` : null },
  ].filter(d => d.value !== null && d.value !== undefined);

  const completenessPercent = Math.round((dataCompleteness || 0) * 100);

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header with back button */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30 flex items-center gap-4">
        <button
          onClick={() => setAppScreen('addressInput')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-parchment/70 hover:text-parchment"
          aria-label="Back to address search"
        >
          ←
        </button>
        <h2 className="font-pencil-hand text-2xl text-parchment">
          Property Profile
        </h2>
      </div>

      {/* Scrollable content — leave room for sticky CTA at bottom */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Address */}
          <div className="text-center space-y-1">
            <h1 className="font-pencil-hand text-3xl text-parchment">
              {address.street}
            </h1>
            <p className="font-serif text-parchment/60 text-sm">
              {address.city}, {address.state} {address.zip}
            </p>
          </div>

          {/* Street View image */}
          {streetView.available && streetView.imageUrl ? (
            <div className="rounded-lg overflow-hidden border border-wood/30">
              <img
                src={streetView.imageUrl}
                alt={`Street view of ${address.formatted}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-wood/20 bg-parchment/5 h-32 flex items-center justify-center">
              <p className="font-serif text-parchment/40 text-sm">
                Street View not available for this address
              </p>
            </div>
          )}

          {/* Data completeness bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-serif text-parchment/60 text-xs">Data Completeness</span>
              <span className="font-serif text-parchment/60 text-xs">{completenessPercent}%</span>
            </div>
            <div className="h-2 bg-parchment/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brass transition-all duration-500"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
          </div>

          {/* Property details grid */}
          {details.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-pencil-hand text-xl text-brass">
                Property Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {details.map((detail, i) => (
                  <div key={i} className="bg-parchment/5 rounded-md px-3 py-2">
                    <p className="font-serif text-parchment/50 text-xs">{detail.label}</p>
                    <p className="font-serif text-parchment text-sm">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-pencil-hand text-xl text-brass">
                Recommended Projects
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <ProjectRecommendationCard key={i} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* No recommendations fallback */}
          {(!recommendations || recommendations.length === 0) && (
            <div className="bg-parchment/5 border border-wood/20 rounded-lg p-4 text-center">
              <p className="font-serif text-parchment/60 text-sm">
                Get a full AI-powered analysis with specific project recommendations, cost estimates, and contractor-ready scope documents.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-iron/95 border-t border-wood/30 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setAppScreen('email')}
            className="w-full min-h-[50px] bg-brass hover:bg-brass/90 text-iron font-pencil-hand text-xl py-3 px-8 rounded-md shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            Get Full Report — $20
          </button>
        </div>
      </div>
    </div>
  );
}

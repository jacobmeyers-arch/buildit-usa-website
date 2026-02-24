/**
 * AI Enrichment
 * 
 * Sends a PropertyProfile to Claude Sonnet for home improvement
 * recommendations. Returns 3-5 project suggestions with urgency,
 * cost ranges, and reasoning.
 * 
 * Created: 2026-02-17
 */

import Anthropic from '@anthropic-ai/sdk';
import { getPropertyEnrichmentPrompt } from './prompts.js';

const anthropic = new Anthropic({ timeout: 30000 });

/**
 * Generate AI-powered project recommendations from a property profile
 * 
 * @param {Object} profile - Unified PropertyProfile from buildPropertyProfile()
 * @returns {Array} Array of ProjectRecommendation objects, or empty array on failure
 */
export async function generateRecommendations(profile) {
  try {
    const systemPrompt = getPropertyEnrichmentPrompt();

    // Build a concise summary of the property for Claude
    const propertyDescription = buildPropertyDescription(profile);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this property and suggest home improvement projects:\n\n${propertyDescription}`
        }
      ]
    });

    // Extract text content from response
    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock) {
      console.error('No text block in Claude response');
      return [];
    }

    // Strip markdown code fences if Claude wrapped the JSON (common with JSON-only prompts)
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Parse JSON from response
    const parsed = JSON.parse(jsonText);

    // Validate the response has the expected shape
    if (!Array.isArray(parsed.recommendations)) {
      console.error('Unexpected response shape from Claude');
      return [];
    }

    return parsed.recommendations;

  } catch (error) {
    console.error('AI enrichment error:', error.message);
    // Graceful fallback — address flow still works without recommendations
    return [];
  }
}

/**
 * Build a human-readable property description for Claude
 * Only includes non-null fields to avoid confusing the model.
 */
function buildPropertyDescription(profile) {
  const lines = [];
  const { address, property, systems, financial } = profile;

  lines.push(`Address: ${address.formatted}`);

  if (property.propertyType) lines.push(`Type: ${property.propertyType}`);
  if (property.yearBuilt) lines.push(`Year Built: ${property.yearBuilt} (${property.propertyAge} years old)`);
  if (property.livingAreaSqFt) lines.push(`Living Area: ${property.livingAreaSqFt.toLocaleString()} sq ft`);
  if (property.bedrooms) lines.push(`Bedrooms: ${property.bedrooms}`);
  if (property.bathrooms) lines.push(`Bathrooms: ${property.bathrooms}`);
  if (property.stories) lines.push(`Stories: ${property.stories}`);
  if (property.lotAcres) lines.push(`Lot Size: ${property.lotAcres} acres`);
  if (property.garageSpaces) lines.push(`Garage: ${property.garageSpaces} spaces`);

  if (systems.roofType) lines.push(`Roof: ${systems.roofType}`);
  if (systems.heatingType) lines.push(`Heating: ${systems.heatingType}`);
  if (systems.coolingType) lines.push(`Cooling: ${systems.coolingType}`);
  if (systems.exteriorWall) lines.push(`Exterior: ${systems.exteriorWall}`);
  if (systems.foundationType) lines.push(`Foundation: ${systems.foundationType}`);
  if (systems.hasPool) lines.push(`Pool: Yes`);

  if (financial.estimatedValue) lines.push(`Estimated Value: $${financial.estimatedValue.toLocaleString()}`);
  if (financial.lastSalePrice) lines.push(`Last Sale: $${financial.lastSalePrice.toLocaleString()} (${financial.lastSaleDate || 'date unknown'})`);

  lines.push(`\nData Completeness: ${Math.round(profile.dataCompleteness * 100)}%`);
  lines.push(`Street View: ${profile.streetView.available ? 'Available' : 'Not available'}`);

  return lines.join('\n');
}

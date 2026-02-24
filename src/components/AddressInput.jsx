/**
 * AddressInput — Google Places Autocomplete for US addresses
 * 
 * Loads Google Maps JS API via dynamic <script> tag (no npm package needed).
 * Restricts to US addresses. Extracts structured address fields on selection.
 * Stores validated address in context and transitions to profileLoading.
 * 
 * Created: 2026-02-17
 */

import React, { useEffect, useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext';

// Google Maps API key (VITE_ prefix exposes it to the browser — intentional)
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function AddressInput() {
  const { setAppScreen, setValidatedAddress } = useProject();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Google Maps JS API and initialize autocomplete
  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Check if script is already being loaded (prevents duplicate tags on fast remount)
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => initAutocomplete());
      return;
    }

    // Create script tag to load Google Maps JS API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      initAutocomplete();
    };

    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your connection.');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup: remove script on unmount (autocomplete cleans itself up)
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  /**
   * Initialize Google Places Autocomplete on the input element
   */
  function initAutocomplete() {
    if (!inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
    });

    autocomplete.addListener('place_changed', () => {
      handlePlaceSelect(autocomplete);
    });

    autocompleteRef.current = autocomplete;
    setIsLoading(false);

    // Auto-focus the input
    inputRef.current.focus();
  }

  /**
   * Extract structured address fields from the selected Google Place
   */
  function handlePlaceSelect(autocomplete) {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      setError('Please select an address from the dropdown.');
      return;
    }

    // Extract address components
    const components = place.address_components || [];
    const getComponent = (type) => {
      const comp = components.find(c => c.types.includes(type));
      return comp?.long_name || '';
    };
    const getShortComponent = (type) => {
      const comp = components.find(c => c.types.includes(type));
      return comp?.short_name || '';
    };

    const streetNumber = getComponent('street_number');
    const streetName = getComponent('route');
    const city = getComponent('locality') || getComponent('sublocality_level_1');
    const state = getShortComponent('administrative_area_level_1');
    const zip = getComponent('postal_code');
    const county = getComponent('administrative_area_level_2');

    // Validate required fields
    if (!streetNumber || !streetName || !city || !state || !zip) {
      setError('Please select a complete street address (not just a city or zip).');
      return;
    }

    // Build validated address object
    const validatedAddress = {
      streetNumber,
      streetName,
      city,
      state,
      zip,
      county,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      googlePlaceId: place.place_id,
      formattedAddress: place.formatted_address
    };

    // Store in context and advance to loading screen
    setValidatedAddress(validatedAddress);
    setAppScreen('profileLoading');
  }

  return (
    <div className="min-h-screen bg-iron flex flex-col">
      {/* Header with back button */}
      <div className="bg-wood/20 px-6 py-4 border-b border-wood/30 flex items-center gap-4">
        <button
          onClick={() => setAppScreen('splash')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-parchment/70 hover:text-parchment"
          aria-label="Back to home"
        >
          ←
        </button>
        <h2 className="font-pencil-hand text-2xl text-parchment">
          Find Your Property
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Instruction */}
          <p className="font-serif text-parchment/80 text-center">
            Enter your property address and we'll pull up everything we know about your home.
          </p>

          {/* Address input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={isLoading ? 'Loading...' : 'Start typing your address...'}
              disabled={isLoading}
              className="w-full bg-parchment/10 border border-wood/40 rounded-md px-4 py-4 font-serif text-parchment text-lg placeholder-parchment/50 focus:outline-none focus:border-wood disabled:opacity-50"
              aria-label="Property address"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brass"></div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-3">
              <p className="font-serif text-parchment text-sm">{error}</p>
            </div>
          )}

          {/* Help text */}
          <p className="font-serif text-parchment/50 text-xs text-center">
            Select a US street address from the dropdown. We'll analyze your property's structure, age, and systems to recommend projects.
          </p>
        </div>
      </div>
    </div>
  );
}

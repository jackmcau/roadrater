/**
 * Google Maps integration module
 * Handles map initialization, markers, and user interaction
 */

const BOULDER_CENTER = { lat: 40.014986, lng: -105.270546 };
const GOOGLE_MAPS_API_KEY = 'AIzaSyCI607tCmSCUhTJC6jZUmSJwDozv8crFDw';

let map = null;
let markers = [];
let infoWindow = null;
let loadingPromise = null;

/**
 * Load Google Maps API script
 * Only loads once - subsequent calls return the same promise
 * @returns {Promise<void>}
 */
export function loadGoogleMapsAPI() {
  // Return existing promise if already loading or loaded
  if (loadingPromise) {
    return loadingPromise;
  }

  // Check if already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        reject(new Error('Google Maps API loaded but google.maps is not available'));
      }
    };
    
    script.onerror = () => {
      loadingPromise = null; // Reset so it can be retried
      reject(new Error('Failed to load Google Maps API. Please check your API key and internet connection.'));
    };
    
    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Initialize Google Map
 * @param {HTMLElement} mapElement - Container element for the map
 * @param {object} options - Map configuration options
 * @returns {google.maps.Map} The initialized map instance
 */
export function initMap(mapElement, options = {}) {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps API not loaded. Call loadGoogleMapsAPI() first.');
  }

  const defaultOptions = {
    center: BOULDER_CENTER,
    zoom: 12,
    mapTypeId: 'roadmap',
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  map = new google.maps.Map(mapElement, { ...defaultOptions, ...options });
  infoWindow = new google.maps.InfoWindow();
  
  return map;
}

/**
 * Add road markers to the map
 * @param {Array} roads - Array of road objects with id, name, lat, lng, average_rating, rating_count
 * @param {Function} onMarkerClick - Callback when marker is clicked
 */
export function addRoadMarkers(roads, onMarkerClick) {
  if (!map) {
    console.error('Map not initialized. Call initMap() first.');
    return;
  }

  // Clear existing markers
  clearMarkers();

  const bounds = new google.maps.LatLngBounds();
  let validMarkerCount = 0;

  roads.forEach(road => {
    // Skip roads without valid coordinates
    if (!road.lat || !road.lng) {
      console.warn(`Road "${road.name}" has no coordinates, skipping marker`);
      return;
    }

    const position = { 
      lat: parseFloat(road.lat), 
      lng: parseFloat(road.lng) 
    };

    // Validate coordinates
    if (isNaN(position.lat) || isNaN(position.lng)) {
      console.warn(`Road "${road.name}" has invalid coordinates, skipping marker`);
      return;
    }

    const marker = new google.maps.Marker({
      position,
      map,
      title: road.name,
      animation: google.maps.Animation.DROP,
    });

    // Create info window content
    const avgRating = parseFloat(road.average_rating || 0).toFixed(1);
    const ratingCount = road.rating_count || 0;
    const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));

    const content = `
      <div style="padding: 12px; min-width: 200px; max-width: 300px;">
        <h3 style="font-weight: bold; font-size: 1.125rem; color: #4338ca; margin-bottom: 8px;">${road.name}</h3>
        <div style="color: #eab308; font-size: 1.25rem; margin-bottom: 4px;">${stars}</div>
        <p style="color: #6b7280; margin-bottom: 8px;">Average: ${avgRating} / 5.0 (${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})</p>
        <a href="road-detail.html?id=${road.id}" 
           style="display: inline-block; background-color: #4f46e5; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-weight: 500;">
          View Details →
        </a>
      </div>
    `;

    marker.addListener('click', () => {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
      
      // Call custom onClick handler if provided
      if (onMarkerClick && typeof onMarkerClick === 'function') {
        onMarkerClick(road, marker);
      }
    });

    markers.push(marker);
    bounds.extend(position);
    validMarkerCount++;
  });

  // Fit map to show all markers if we have any
  if (validMarkerCount > 0) {
    map.fitBounds(bounds);
    
    // Don't zoom in too much if there's only one marker
    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (validMarkerCount === 1 && map.getZoom() > 15) {
        map.setZoom(15);
      }
    });
  }
}

/**
 * Clear all markers from the map
 */
export function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

/**
 * Center map on specific coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (optional)
 */
export function centerMap(lat, lng, zoom = 15) {
  if (map) {
    map.setCenter({ lat, lng });
    if (zoom) map.setZoom(zoom);
  }
}

/**
 * Get current map instance
 * @returns {google.maps.Map|null}
 */
export function getMap() {
  return map;
}

/**
 * Initialize Street View
 * @param {HTMLElement} element - Container element for Street View
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {object} options - Street View options
 * @returns {google.maps.StreetViewPanorama}
 */
export function initStreetView(element, lat, lng, options = {}) {
  const defaultOptions = {
    position: { lat, lng },
    pov: { heading: 0, pitch: 0 },
    zoom: 1,
    addressControl: true,
    linksControl: true,
    panControl: true,
    enableCloseButton: false,
  };

  return new google.maps.StreetViewPanorama(
    element,
    { ...defaultOptions, ...options }
  );
}


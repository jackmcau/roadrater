/**
 * Google Maps integration module
 * Handles map initialization, markers, and user interaction
 */

const BOULDER_CENTER = { lat: 40.0150, lng: -105.2705 };
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual key

let map = null;
let markers = [];
let infoWindow = null;

/**
 * Load Google Maps API script
 * @returns {Promise<void>}
 */
export function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Map
 * @param {HTMLElement} mapElement - Container element for the map
 * @param {object} options - Map configuration options
 * @returns {google.maps.Map} The initialized map instance
 */
export function initMap(mapElement, options = {}) {
  const defaultOptions = {
    center: BOULDER_CENTER,
    zoom: 12,
    mapTypeId: 'roadmap',
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
  };

  map = new google.maps.Map(mapElement, { ...defaultOptions, ...options });
  infoWindow = new google.maps.InfoWindow();
  
  return map;
}

/**
 * Add road markers to the map
 * @param {Array} roads - Array of road objects with lat, lng, name, etc.
 * @param {Function} onMarkerClick - Callback when marker is clicked
 */
export function addRoadMarkers(roads, onMarkerClick) {
  // Clear existing markers
  clearMarkers();

  roads.forEach(road => {
    if (!road.lat || !road.lng) return;

    const marker = new google.maps.Marker({
      position: { lat: parseFloat(road.lat), lng: parseFloat(road.lng) },
      map: map,
      title: road.name,
      animation: google.maps.Animation.DROP,
    });

    // Create info window content
    const avgRating = parseFloat(road.average_rating || 0).toFixed(1);
    const ratingCount = road.rating_count || 0;
    const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));

    const content = `
      <div class="p-3 max-w-xs">
        <h3 class="font-bold text-lg text-indigo-700 mb-2">${road.name}</h3>
        <div class="text-yellow-500 text-xl mb-1">${stars}</div>
        <p class="text-gray-600 mb-2">Average: ${avgRating} / 5.0 (${ratingCount} ratings)</p>
        <a href="road-detail.html?id=${road.id}" 
           class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          View Details
        </a>
      </div>
    `;

    marker.addListener('click', () => {
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
      
      if (onMarkerClick) {
        onMarkerClick(road, marker);
      }
    });

    markers.push(marker);
  });
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

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

/**
 * Generic GET request helper
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<any>} Response data
 */
export async function getJSON(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Generic POST request helper
 * @param {string} endpoint - API endpoint path
 * @param {object} body - Request body data
 * @returns {Promise<any>} Response data
 */
export async function postJSON(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    throw error;
  }
}

// API Methods
export const api = {
  /**
   * Get all roads with ratings
   */
  getRoads: () => getJSON('/roads'),

  /**
   * Get single road by ID
   * @param {number} id - Road segment ID
   */
  getRoad: (id) => getJSON(`/roads/${id}`),

  /**
   * Get ratings for a road segment
   * @param {number} segmentId - Road segment ID
   */
  getRatings: (segmentId) => getJSON(`/ratings/${segmentId}`),

  /**
   * Submit a new rating
   * @param {object} rating - Rating data
   */
  submitRating: (rating) => postJSON('/ratings', rating),

  /**
   * Check API health
   */
  healthCheck: () => getJSON('/health'),
};

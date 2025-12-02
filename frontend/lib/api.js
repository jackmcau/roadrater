const DEFAULT_STORAGE_KEYS = {
  token: 'token',
};

const getRuntimeConfig = () => {
  const runtime = window.__ROADRATER_CONFIG__ || {};
  const apiBaseUrl = runtime.apiBaseUrl || window.location.origin;
  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    storageKeys: { ...DEFAULT_STORAGE_KEYS, ...(runtime.storageKeys || {}) },
  };
};

const { apiBaseUrl, storageKeys } = getRuntimeConfig();

class ApiError extends Error {
  constructor(message, { status, details, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.body = body;
  }
}

const buildUrl = (endpoint) => {
  if (/^https?:/i.test(endpoint)) return endpoint;
  const normalized = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiBaseUrl}/${normalized}`;
};

const getStoredToken = () => localStorage.getItem(storageKeys.token);
const setStoredToken = (token) => {
  if (!token) {
    localStorage.removeItem(storageKeys.token);
    return;
  }
  localStorage.setItem(storageKeys.token, token);
};

const handleUnauthorized = () => {
  setStoredToken(null);
  window.dispatchEvent(new CustomEvent('roadrater:unauthorized'));
};

const parseJsonBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const request = async (endpoint, { method = 'GET', body, auth = false, headers = {} } = {}) => {
  console.log(`[api] ${method} ${endpoint}`);
  const token = getStoredToken();
  const computedHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (auth && !token) {
    throw new ApiError('Authentication required', { status: 401 });
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      method,
      headers: computedHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    const payload = await parseJsonBody(response);

    if (response.status === 401) {
      handleUnauthorized();
    }

    if (!response.ok) {
      const message = payload?.error || payload?.message || response.statusText;
      console.error(`[api] ${method} ${endpoint} failed: ${response.status} ${response.statusText}`);
      throw new ApiError(message, { status: response.status, details: payload?.details, body: payload });
    }

    if (payload && payload.success === false) {
      const message = payload.error || 'Request failed';
      console.error(`[api] ${method} ${endpoint} returned success=false:`, message);
      throw new ApiError(message, { status: response.status, details: payload.details, body: payload });
    }

    return payload?.data ?? payload ?? null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`[api] ${method} ${endpoint} network error:`, error);
    throw new ApiError(`Network error: ${error.message}`, { status: 0 });
  }
};

export const api = {
  getRoads: async (params = {}) => {
    const search = new URLSearchParams(params);
    const queryString = search.toString();
    const endpoint = queryString ? `/roads?${queryString}` : '/roads';
    const result = await request(endpoint);
    
    // Normalize: backend returns { count, page, limit, total, roads }
    // request() already unwrapped payload.data
    if (!result || typeof result !== 'object') {
      throw new ApiError('Invalid response from /roads endpoint');
    }
    
    return {
      roads: result.roads || [],
      count: result.count || 0,
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 25,
    };
  },
  
  getRoad: async (id) => {
    const result = await request(`/roads/${id}`);
    
    // Normalize: backend returns { road: {...} }
    if (!result || !result.road) {
      throw new ApiError(`Road with id ${id} not found or invalid response`);
    }
    
    return result.road;
  },
  
  getRatings: (segmentId) => request(`/ratings/${segmentId}`),
  submitRating: (rating) => request('/ratings', { method: 'POST', body: rating, auth: true }),
  
  getTopRoads: async () => {
    const result = await request('/top5');
    
    // Normalize: handle both Road[] or { roads: Road[] }
    if (Array.isArray(result)) {
      return result;
    }
    if (result && Array.isArray(result.roads)) {
      return result.roads;
    }
    if (!result) {
      return [];
    }
    
    throw new ApiError('Invalid response from /top5 endpoint');
  },
  
  healthCheck: () => request('/health'),
  login: async (credentials) => {
    const data = await request('/auth/login', { method: 'POST', body: credentials });
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  },
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),
  logout: () => {
    setStoredToken(null);
  },
};

export const authStore = {
  getToken: getStoredToken,
  setToken: setStoredToken,
  clear: () => setStoredToken(null),
};

export { ApiError };

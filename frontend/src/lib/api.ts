import axios from 'axios';

// Determine the base URL for API requests.  We prioritize an explicit
// environment variable, falling back to a sensible default for development.
// When no environment variable is provided, we attempt to derive the base
// URL using the current browser hostname and the standard backend port.  On
// the server (SSR) we fall back to localhost.  See README for more.
const getBaseURL = (): string => {
  // Use the provided environment variable if available
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl;
  }
  // In the browser, derive the URL from the current host.  We assume the
  // backend runs on port 8080 with the /api prefix.  This supports cases
  // where the frontend is accessed via a LAN IP or custom hostname.
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8080/api`;
  }
  // Default fallback for server environments or when window is undefined.
  return 'http://localhost:8080/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Attach the JWT token stored in localStorage (if any) on every request.  This
// allows the backend to authenticate the current user without manual header
// configuration in each page.  Note: this runs in the browser (window is defined)
// so reading from localStorage is safe.  On the server (SSR) the token won't
// be attached because window is undefined.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
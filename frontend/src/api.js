import axios from 'axios';

// Create a configured instance of Axios
const API = axios.create({
  // It's a good practice to use an environment variable for the base URL.
  // You can create a .env file in your 'frontend' directory to set this.
  // Example .env file: VITE_API_BASE_URL=http://localhost:8000/api
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically adds the auth token to every request.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles global errors, like 401 for expired tokens.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Specifically check for a 401 Unauthorized error.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
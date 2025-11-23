import axios from 'axios';

const API = axios.create({
  // Set the base URL to your backend server's address
  baseURL: 'http://localhost:3001/api', 
});

// Add a request interceptor to include the auth token in every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
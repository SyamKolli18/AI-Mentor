import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai_mentor_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Parse errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'Something went wrong',
      errors: error.response?.data?.errors,
      status: error.response?.status,
    };

    // If unauthorized, clean storage (token might have expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('ai_mentor_token');
      // We can also trigger a redirect or context reset in the app layer
    }

    return Promise.reject(customError);
  }
);

export default api;

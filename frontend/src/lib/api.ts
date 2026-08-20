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

// Response Interceptor: Parse errors & auto-refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/signup') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      const refreshToken = localStorage.getItem('ai_mentor_refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('ai_mentor_token');
        localStorage.removeItem('ai_mentor_refresh_token');
        return Promise.reject({
          message: error.response?.data?.message || 'Session expired',
          status: 401,
        });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        if (res.data?.token) {
          const newAccessToken = res.data.token;
          const newRefreshToken = res.data.refreshToken;

          localStorage.setItem('ai_mentor_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('ai_mentor_refresh_token', newRefreshToken);
          }

          api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('ai_mentor_token');
        localStorage.removeItem('ai_mentor_refresh_token');
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    let errorMessage = error.response?.data?.message || 'Something went wrong';
    if (
      (errorMessage === 'Validation error' || !error.response?.data?.message) &&
      Array.isArray(error.response?.data?.errors) &&
      error.response.data.errors.length > 0 &&
      error.response.data.errors[0]?.message
    ) {
      errorMessage = error.response.data.errors[0].message;
    }

    const customError = {
      message: errorMessage,
      errors: error.response?.data?.errors,
      status: error.response?.status,
    };

    return Promise.reject(customError);
  }
);

export default api;

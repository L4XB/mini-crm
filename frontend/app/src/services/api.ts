import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const response = await axios.post(
          `${api.defaults.baseURL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        const { token } = response.data;
        
        if (token) {
          // Update localStorage and header
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('token');
        toast.error('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
        window.location.href = '/login';
      }
    }
    
    // Handle specific error messages
    const errorMessage = error.response?.data?.error || 'Ein Fehler ist aufgetreten';
    
    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

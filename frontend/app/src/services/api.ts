import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
export const api = axios.create({
  // Leere baseURL, da alle API-Anfragen mit /api/v1/ beginnen
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  // CORS wird durch den Proxy vermieden
  withCredentials: true
});

// Keine Pfadkorrektur mehr notwendig, da alle Pfade mit '/api/v1/' beginnen

// Add request interceptor for authentication with logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      error: error.message
    });
    
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting token refresh...');
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
        console.error('Token refresh failed:', refreshError);
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

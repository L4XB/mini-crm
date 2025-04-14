import axios from 'axios';

// Debugging-Funktion für API-Anfragen
const debugFetch = (method: string, url: string, data?: Record<string, unknown>) => {
  console.log(`API ${method} Request:`, url, data ? { data } : '');
};

// API-Konfiguration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s Timeout
  withCredentials: true // Wichtig für CORS mit Credentials
});

// Request Interceptor für JWT-Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor für Token-Erneuerung
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Wenn 401 und nicht bereits versucht wurde, Token zu erneuern
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Bei Token-Erneuerungsfehler zum Login weiterleiten
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    debugFetch('POST', '/api/v1/auth/login', { email });
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      console.log('Login response:', response);
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    }
  },
  register: async (userData: { email: string; password: string; username: string }) => {
    debugFetch('POST', '/api/v1/auth/register', { email: userData.email });
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  refreshToken: async (refreshToken: string) => {
    debugFetch('POST', '/api/v1/auth/refresh', { refresh_token: refreshToken });
    const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  setCurrentUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Contacts Services
export const contactsService = {
  getAll: async () => {
    debugFetch('GET', '/api/v1/contacts');
    try {
      const response = await api.get('/api/v1/contacts');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  },
  get: async (id: number) => {
    debugFetch('GET', `/api/v1/contacts/${id}`);
    const response = await api.get(`/api/v1/contacts/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    debugFetch('POST', '/api/v1/contacts', data);
    const response = await api.post('/api/v1/contacts', data);
    return response.data.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    debugFetch('PUT', `/api/v1/contacts/${id}`, data);
    const response = await api.put(`/api/v1/contacts/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    debugFetch('DELETE', `/api/v1/contacts/${id}`);
    const response = await api.delete(`/api/v1/contacts/${id}`);
    return response.data;
  }
};

// Deals Services
export const dealsService = {
  getAll: async () => {
    debugFetch('GET', '/api/v1/deals');
    try {
      const response = await api.get('/api/v1/deals');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  },
  get: async (id: number) => {
    debugFetch('GET', `/api/v1/deals/${id}`);
    const response = await api.get(`/api/v1/deals/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    debugFetch('POST', '/api/v1/deals', data);
    const response = await api.post('/api/v1/deals', data);
    return response.data.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    debugFetch('PUT', `/api/v1/deals/${id}`, data);
    const response = await api.put(`/api/v1/deals/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    debugFetch('DELETE', `/api/v1/deals/${id}`);
    const response = await api.delete(`/api/v1/deals/${id}`);
    return response.data;
  }
};

// Tasks Services
export const tasksService = {
  getAll: async () => {
    debugFetch('GET', '/api/v1/tasks');
    try {
      const response = await api.get('/api/v1/tasks');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },
  get: async (id: number) => {
    debugFetch('GET', `/api/v1/tasks/${id}`);
    const response = await api.get(`/api/v1/tasks/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    debugFetch('POST', '/api/v1/tasks', data);
    const response = await api.post('/api/v1/tasks', data);
    return response.data.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    debugFetch('PUT', `/api/v1/tasks/${id}`, data);
    const response = await api.put(`/api/v1/tasks/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    debugFetch('DELETE', `/api/v1/tasks/${id}`);
    const response = await api.delete(`/api/v1/tasks/${id}`);
    return response.data;
  },
  toggleComplete: async (id: number) => {
    debugFetch('PATCH', `/api/v1/tasks/${id}/toggle`);
    const response = await api.patch(`/api/v1/tasks/${id}/toggle`);
    return response.data.data;
  }
};

// Notes Services
export const notesService = {
  getAll: async () => {
    debugFetch('GET', '/api/v1/notes');
    try {
      const response = await api.get('/api/v1/notes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },
  get: async (id: number) => {
    debugFetch('GET', `/api/v1/notes/${id}`);
    const response = await api.get(`/api/v1/notes/${id}`);
    return response.data.data;
  },
  create: async (data: Record<string, unknown>) => {
    debugFetch('POST', '/api/v1/notes', data);
    const response = await api.post('/api/v1/notes', data);
    return response.data.data;
  },
  update: async (id: number, data: Record<string, unknown>) => {
    debugFetch('PUT', `/api/v1/notes/${id}`, data);
    const response = await api.put(`/api/v1/notes/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    debugFetch('DELETE', `/api/v1/notes/${id}`);
    const response = await api.delete(`/api/v1/notes/${id}`);
    return response.data;
  }
};

// Health und Metrics Services
export const systemService = {
  getHealth: async () => {
    debugFetch('GET', '/api/v1/health');
    const response = await api.get('/api/v1/health');
    return response.data;
  },
  getDetailedHealth: async () => {
    debugFetch('GET', '/api/v1/health?detailed=true');
    const response = await api.get('/api/v1/health?detailed=true');
    return response.data;
  },
  getMetrics: async () => {
    debugFetch('GET', '/api/v1/metrics');
    const response = await api.get('/api/v1/metrics');
    return response.data;
  },
  getReadiness: async () => {
    debugFetch('GET', '/api/v1/ready');
    const response = await api.get('/api/v1/ready');
    return response.data;
  }
};

export default api;

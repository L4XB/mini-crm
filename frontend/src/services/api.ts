import axios from 'axios';

// API-Konfiguration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s Timeout
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
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: { email: string; password: string; username: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
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
    const response = await api.get('/contacts');
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  }
};

// Deals Services
export const dealsService = {
  getAll: async () => {
    const response = await api.get('/deals');
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/deals/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/deals', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/deals/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/deals/${id}`);
    return response.data;
  }
};

// Tasks Services
export const tasksService = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  toggleComplete: async (id: number) => {
    const response = await api.patch(`/tasks/${id}/toggle`);
    return response.data;
  }
};

// Notes Services
export const notesService = {
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/notes', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  }
};

// Health und Metrics Services
export const systemService = {
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  getDetailedHealth: async () => {
    const response = await api.get('/health?detailed=true');
    return response.data;
  },
  getMetrics: async () => {
    const response = await api.get('/metrics');
    return response.data;
  },
  getReadiness: async () => {
    const response = await api.get('/ready');
    return response.data;
  }
};

export default api;

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthToken, User, Contact, Deal, Task, Note, Settings, ApiResponse, PaginatedResponse } from '../types';
import { Logger } from '../utils/Logger';

/**
 * API Client for interacting with the Mini CRM backend
 */
export class ApiClient {
  private axios: AxiosInstance;
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private logger: Logger;

  /**
   * Create a new API client
   * @param baseUrl Base URL of the API
   * @param logger Logger instance
   */
  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl;
    this.logger = logger;
    
    // Create axios instance with defaults
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Add request interceptor for auth token
    this.axios.interceptors.request.use(async (config) => {
      // If token exists and not expired, add to headers
      if (this.token && this.tokenExpiry > Date.now()) {
        config.headers.Authorization = `Bearer ${this.token}`;
      } else if (this.refreshToken) {
        // Try to refresh token if available
        try {
          await this.refreshAuthToken();
          config.headers.Authorization = `Bearer ${this.token}`;
        } catch (error) {
          this.logger.warn('Failed to refresh token', error);
        }
      }
      return config;
    });
    
    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle 401 errors
        if (error.response && error.response.status === 401 && this.refreshToken) {
          try {
            // Try to refresh token
            await this.refreshAuthToken();
            
            // Retry the original request
            const config = error.config;
            config.headers.Authorization = `Bearer ${this.token}`;
            return this.axios.request(config);
          } catch (refreshError) {
            // If refresh fails, clear tokens
            this.clearAuth();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login to the API
   * @param email User email
   * @param password User password
   * @returns Auth token data
   */
  async login(email: string, password: string): Promise<AuthToken> {
    try {
      const response = await this.axios.post<ApiResponse<AuthToken>>('/auth/login', {
        email,
        password
      });
      
      if (response.data.success && response.data.data) {
        this.setAuth(response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Login failed');
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param username Username
   * @param email Email
   * @param password Password
   * @returns User data
   */
  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await this.axios.post<ApiResponse<User>>('/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Registration failed');
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Get current user data
   * @returns User data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.axios.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to get current user');
    } catch (error) {
      this.logger.error('Failed to get current user', error);
      throw error;
    }
  }

  /**
   * Manually set authentication token
   * @param token JWT token string
   * @param expiryMs Optional expiration time in milliseconds
   */
  setAuthToken(token: string, expiryMs: number = 3600000): void {
    this.token = token;
    this.tokenExpiry = Date.now() + expiryMs;
    this.logger.debug('Auth token set manually');
  }

  /**
   * Refresh auth token
   * @returns New auth token data
   */
  async refreshAuthToken(): Promise<AuthToken> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await this.axios.post<ApiResponse<AuthToken>>('/auth/refresh', {
        refreshToken: this.refreshToken
      });
      
      if (response.data.success && response.data.data) {
        this.setAuth(response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Token refresh failed');
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Logout and clear auth tokens
   */
  logout(): void {
    this.clearAuth();
  }

  /**
   * Set authentication data
   * @param authData Auth token data
   */
  private setAuth(authData: AuthToken): void {
    this.token = authData.token;
    this.refreshToken = authData.refreshToken;
    this.tokenExpiry = authData.expiresAt;
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Generic GET request
   * @param path API path
   * @param config Axios request config
   * @returns Response data
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.get<ApiResponse<T>>(path, config);
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Request failed');
    } catch (error) {
      this.logger.error(`GET ${path} failed`, error);
      throw error;
    }
  }

  /**
   * Generic POST request
   * @param path API path
   * @param data Request data
   * @param config Axios request config
   * @returns Response data
   */
  async post<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.post<ApiResponse<T>>(path, data, config);
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Request failed');
    } catch (error) {
      this.logger.error(`POST ${path} failed`, error);
      throw error;
    }
  }

  /**
   * Generic PUT request
   * @param path API path
   * @param data Request data
   * @param config Axios request config
   * @returns Response data
   */
  async put<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.put<ApiResponse<T>>(path, data, config);
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Request failed');
    } catch (error) {
      this.logger.error(`PUT ${path} failed`, error);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   * @param path API path
   * @param config Axios request config
   * @returns Response data
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.delete<ApiResponse<T>>(path, config);
      
      if (response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Request failed');
    } catch (error) {
      this.logger.error(`DELETE ${path} failed`, error);
      throw error;
    }
  }

  // Predefined entity clients
  
  /**
   * Users API client
   */
  users = {
    getAll: () => this.get<User[]>('/users'),
    getById: (id: number) => this.get<User>(`/users/${id}`),
    create: (data: Partial<User>) => this.post<User>('/users', data),
    update: (id: number, data: Partial<User>) => this.put<User>(`/users/${id}`, data),
    delete: (id: number) => this.delete<boolean>(`/users/${id}`)
  };

  /**
   * Contacts API client
   */
  contacts = {
    getAll: () => this.get<Contact[]>('/contacts'),
    getById: (id: number) => this.get<Contact>(`/contacts/${id}`),
    create: (data: Partial<Contact>) => this.post<Contact>('/contacts', data),
    update: (id: number, data: Partial<Contact>) => this.put<Contact>(`/contacts/${id}`, data),
    delete: (id: number) => this.delete<boolean>(`/contacts/${id}`)
  };

  /**
   * Deals API client
   */
  deals = {
    getAll: () => this.get<Deal[]>('/deals'),
    getById: (id: number) => this.get<Deal>(`/deals/${id}`),
    create: (data: Partial<Deal>) => this.post<Deal>('/deals', data),
    update: (id: number, data: Partial<Deal>) => this.put<Deal>(`/deals/${id}`, data),
    delete: (id: number) => this.delete<boolean>(`/deals/${id}`)
  };

  /**
   * Tasks API client
   */
  tasks = {
    getAll: () => this.get<Task[]>('/tasks'),
    getById: (id: number) => this.get<Task>(`/tasks/${id}`),
    create: (data: Partial<Task>) => this.post<Task>('/tasks', data),
    update: (id: number, data: Partial<Task>) => this.put<Task>(`/tasks/${id}`, data),
    delete: (id: number) => this.delete<boolean>(`/tasks/${id}`),
    toggleCompletion: (id: number) => this.put<Task>(`/tasks/${id}/toggle`, {})
  };

  /**
   * Notes API client
   */
  notes = {
    getAll: () => this.get<Note[]>('/notes'),
    getById: (id: number) => this.get<Note>(`/notes/${id}`),
    create: (data: Partial<Note>) => this.post<Note>('/notes', data),
    update: (id: number, data: Partial<Note>) => this.put<Note>(`/notes/${id}`, data),
    delete: (id: number) => this.delete<boolean>(`/notes/${id}`)
  };

  /**
   * Settings API client
   */
  settings = {
    get: () => this.get<Settings>('/settings'),
    update: (data: Partial<Settings>) => this.put<Settings>('/settings', data)
  };

  /**
   * Get a generic entity client for custom models
   * @param entityName Name of the entity
   * @returns Client for the entity
   */
  getEntityClient(entityName: string) {
    const path = `/${entityName.toLowerCase()}`;
    
    return {
      getAll: () => this.get<any[]>(path),
      getById: (id: number) => this.get<any>(`${path}/${id}`),
      create: (data: any) => this.post<any>(path, data),
      update: (id: number, data: any) => this.put<any>(`${path}/${id}`, data),
      delete: (id: number) => this.delete<boolean>(`${path}/${id}`)
    };
  }
}

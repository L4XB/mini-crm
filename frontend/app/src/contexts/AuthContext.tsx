import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshToken: async () => {},
  getMe: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await getMe();
        } catch (error) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success('Erfolgreich eingeloggt!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login fehlgeschlagen';
      toast.error(message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/v1/auth/register', { username, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success('Account erfolgreich erstellt!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registrierung fehlgeschlagen';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Erfolgreich ausgeloggt');
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/api/v1/auth/refresh');
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return token;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const getMe = async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      login, 
      register, 
      logout,
      refreshToken,
      getMe
    }}>
      {children}
    </AuthContext.Provider>
  );
};

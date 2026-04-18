import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import { CONFIG } from '../config';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  coins: number;
  rank?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token on startup
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Refresh profile in background to ensure data is up to date
          fetchProfile(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await apiService.get(CONFIG.ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
      // If unauthorized, logout
      if ((e as any).response?.status === 401) {
        logout();
      }
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post(CONFIG.ENDPOINTS.LOGIN, { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        setToken(newToken);
        setUser(userData);
        await AsyncStorage.setItem('auth_token', newToken);
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post(CONFIG.ENDPOINTS.REGISTER, { username, email, password });
      
      if (response.data.success) {
        const authData = response.data.data || response.data;
        const newToken = authData.token;
        const userData = authData.user;

        if (newToken && userData) {
          setToken(newToken);
          setUser(userData);
          await AsyncStorage.setItem('auth_token', newToken);
          await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
        } else {
          console.error('Registration successful but missing token/user details:', authData);
          throw new Error('Registration successful but session could not be established. Please login.');
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (e: any) {
      console.error('Registration process error:', e);
      throw new Error(e.response?.data?.message || e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (<AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshProfile }}>{children}</AuthContext.Provider>);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

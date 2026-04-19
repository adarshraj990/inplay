import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { createAuthClient } from "better-auth/react";
import { expoClient } from "better-auth/expo";
import { CONFIG } from '../config';

// Better-Auth Client Initialization
const authBaseURL = process.env.EXPO_PUBLIC_BASE_URL || CONFIG.API_BASE_URL.replace('/api/v1', '');

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    expoClient({
      storage: SecureStore,
      storagePrefix: "indplay",
    }),
  ],
});

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
  session: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { data: session, isPending: isLoadingSession, error: sessionError } = authClient.useSession();
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Map Better-Auth user to our app's User interface
      const mappedUser: User = {
        id: session.user.id,
        email: session.user.email,
        username: (session.user as any).username || session.user.email.split('@')[0],
        displayName: session.user.name || (session.user as any).displayName || '',
        avatarUrl: session.user.image || undefined,
        level: (session.user as any).level || 1,
        xp: (session.user as any).xp || 0,
        coins: (session.user as any).coins || 0,
      };
      setUser(mappedUser);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    setIsActionLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) throw new Error(error.message || 'Login failed');
    } catch (e: any) {
      console.error('Login error:', e);
      throw new Error(e.message || 'Login failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsActionLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: username, // Better-Auth uses 'name'
        username, // Dash plugin / custom schema supports this
      });
      
      if (error) throw new Error(error.message || 'Registration failed');
    } catch (e: any) {
      console.error('Registration error:', e);
      throw new Error(e.message || 'Registration failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const logout = async () => {
    setIsActionLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsActionLoading(true);
    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      if (error) throw new Error(error.message || 'Failed to send reset email');
    } catch (e: any) {
      console.error('Forgot password error:', e);
      throw e;
    } finally {
      setIsActionLoading(false);
    }
  };

  const refreshProfile = async () => {
    // Better-Auth useSession hook automatically manages this, 
    // but we can manually re-fetch if needed.
  };

  const isLoading = isLoadingSession || isActionLoading;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      login, 
      register, 
      logout, 
      refreshProfile,
      forgotPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ─── Simple Import ──────────────────────────────────────────────────────────
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import { CONFIG } from '../config';

// Use centralized config for authentication
const AUTH_URL = CONFIG.AUTH_BASE_URL;

let authClient: any;
let isInitialized = false;

try {
  authClient = createAuthClient({
    baseURL: AUTH_URL,
    storage: {
      async getItem(key: string) {
        try {
          if (key.includes('token') || key.includes('session')) {
            const creds = await Keychain.getGenericPassword({ service: key });
            return creds ? creds.password : null;
          }
          return await AsyncStorage.getItem(key);
        } catch { return null; }
      },
      async setItem(key: string, value: string) {
        try {
          if (key.includes('token') || key.includes('session')) {
            await Keychain.setGenericPassword('auth_token', value, { service: key });
          } else {
            await AsyncStorage.setItem(key, value);
          }
        } catch {}
      },
      async removeItem(key: string) {
        try {
          if (key.includes('token') || key.includes('session')) {
            await Keychain.resetGenericPassword({ service: key });
          } else {
            await AsyncStorage.removeItem(key);
          }
        } catch {}
      },
    },
    plugins: [
      adminClient()
    ]
  });
  isInitialized = true;
} catch (e: any) {
  console.warn('[Auth] Initialization failed:', e);
  console.error('[Auth] Error Details:', {
    message: e.message,
    stack: e.stack,
    url: AUTH_URL
  });
  // Robust fallback to prevent "cannot read property email of undefined"
  authClient = {
    useSession: () => ({ data: null, isPending: false }),
    signIn: { email: () => Promise.reject(new Error('Auth not initialized')) },
    signUp: { email: () => Promise.reject(new Error('Auth not initialized')) },
    signOut: () => Promise.resolve(),
  };
}

export { authClient };

// ─── Types & Context ──────────────────────────────────────────────────────────
interface AuthContextType {
  user: any;
  session: any;
  isLoading: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (u: string, e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { data: session, isPending: isLoadingSession } = authClient?.useSession?.() || { data: null, isPending: false };

  useEffect(() => {
    if (session?.user) {
      setUser({
        ...session.user,
        username: session.user.email?.split('@')[0] || 'user',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    if (!isInitialized) throw new Error('Authentication system failed to start. Please check your internet or try again later.');
    setIsActionLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result?.error) throw new Error(result.error.message || 'Login failed');
    } catch (e: any) {
      throw new Error(e.message || 'Login failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    if (!isInitialized) throw new Error('Authentication system failed to start. Please check your internet or try again later.');
    setIsActionLoading(true);
    try {
      const result = await (authClient.signUp.email as any)({ email, password, name: username, username });
      if (result?.error) throw new Error(result.error.message || 'Registration failed');
    } catch (e: any) {
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

  return (
    <AuthContext.Provider value={{ user, session, isLoading: isLoadingSession || isActionLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

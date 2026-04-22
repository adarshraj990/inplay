import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ─── Import Strategy ──────────────────────────────────────────────────────────
// Use default import to avoid Hermes ESM named-export resolution failure.
// "better-auth/react" exports createAuthClient as a named export inside an
// ESM module; on Hermes the bundled form sometimes resolves the module as
// `undefined` when using destructured imports.
import BetterAuthReact from 'better-auth/react';
const createAuthClient: typeof BetterAuthReact.createAuthClient =
  (BetterAuthReact as any).createAuthClient ??
  (BetterAuthReact as any).default?.createAuthClient;

// ─── Base URL ─────────────────────────────────────────────────────────────────
// CRITICAL: better-auth expects the SERVER root URL (no /api/v1 suffix).
// Passing a URL with a path suffix causes "Invalid base URL" BetterAuthError.
const AUTH_BASE_URL = 'https://indplay-backend-v3.onrender.com';

// ─── Auth Client ─────────────────────────────────────────────────────────────
export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  storage: {
    async getItem(key: string) {
      try {
        if (key.includes('token') || key.includes('session')) {
          const credentials = await Keychain.getGenericPassword({ service: key });
          return credentials ? credentials.password : null;
        }
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
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
});

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Guard: useSession may not exist if module resolved incorrectly
  const sessionHook = authClient?.useSession;
  const { data: session, isPending: isLoadingSession } = sessionHook
    ? sessionHook()
    : { data: null, isPending: false };

  useEffect(() => {
    if (session?.user) {
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
      const { error } = await authClient.signIn.email({ email, password });
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
      const { error } = await (authClient.signUp.email as any)({
        email,
        password,
        name: username,
        username,
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
      const { error } = await (authClient as any).password.forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      if (error) throw new Error(error.message || 'Failed to send reset email');
    } catch (e: any) {
      console.error('Forgot password error:', e);
      throw e;
    } finally {
      setIsActionLoading(false);
    }
  };

  const refreshProfile = async () => {};

  const isLoading = isLoadingSession || isActionLoading;

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, login, register, logout, refreshProfile, forgotPassword }}
    >
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

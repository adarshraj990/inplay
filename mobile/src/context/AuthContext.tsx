import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ─── Import Strategy ──────────────────────────────────────────────────────────
import BetterAuthReact from 'better-auth/react';

// ─── Resilience Wrapper ───────────────────────────────────────────────────────
// We wrap the client creation in a function to avoid top-level crashes.
// If better-auth fails to initialize (e.g. due to URL validation in Hermes),
// the app module will still load, preventing the "AuthProvider is undefined" crash.
let authClient: any = null;

try {
  const createAuthClient = (BetterAuthReact as any).createAuthClient ?? 
                          (BetterAuthReact as any).default?.createAuthClient;

  if (typeof createAuthClient === 'function') {
    authClient = createAuthClient({
      // Adding trailing slash to ensure URL parser is happy
      baseURL: 'https://indplay-backend-v3.onrender.com/',
      storage: {
        async getItem(key: string) {
          try {
            if (key.includes('token') || key.includes('session')) {
              const credentials = await Keychain.getGenericPassword({ service: key });
              return credentials ? credentials.password : null;
            }
            return await AsyncStorage.getItem(key);
          } catch (e) {
            console.warn('[Auth] Storage Get Error:', e);
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
          } catch (e) {
            console.warn('[Auth] Storage Set Error:', e);
          }
        },
        async removeItem(key: string) {
          try {
            if (key.includes('token') || key.includes('session')) {
              await Keychain.resetGenericPassword({ service: key });
            } else {
              await AsyncStorage.removeItem(key);
            }
          } catch (e) {
            console.warn('[Auth] Storage Remove Error:', e);
          }
        },
      },
    });
  } else {
    console.error('[Auth] createAuthClient is not a function. Import failed.');
  }
} catch (error) {
  console.error('[Auth] CRITICAL: Failed to initialize Better-Auth client:', error);
  // Create a dummy object to prevent property access crashes
  authClient = {
    useSession: () => ({ data: null, isPending: false, error: error }),
    signIn: { email: async () => ({ error: { message: 'Auth failed to init' } }) },
    signUp: { email: async () => ({ error: { message: 'Auth failed to init' } }) },
    signOut: async () => {},
  };
}

export { authClient };

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Safety: Ensure authClient exists
  const sessionHook = authClient?.useSession;
  const sessionData = sessionHook ? sessionHook() : { data: null, isPending: false };
  const { data: session, isPending: isLoadingSession } = sessionData;

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
      if (!authClient?.signIn?.email) throw new Error('Auth client not initialized');
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
      if (!authClient?.signUp?.email) throw new Error('Auth client not initialized');
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
      if (authClient?.signOut) {
        await authClient.signOut();
      }
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
      if (authClient?.password?.forgetPassword) {
        const { error } = await authClient.password.forgetPassword({
          email,
          redirectTo: '/reset-password',
        });
        if (error) throw new Error(error.message || 'Failed to send reset email');
      }
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

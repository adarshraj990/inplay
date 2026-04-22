import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ─── Import Strategy ──────────────────────────────────────────────────────────
import BetterAuthReact from 'better-auth/react';

// ─── Resilience Wrapper ───────────────────────────────────────────────────────
let authClient: any = null;
let authInitError: string | null = null;

try {
  const createAuthClient = (BetterAuthReact as any).createAuthClient ?? 
                          (BetterAuthReact as any).default?.createAuthClient;

  if (typeof createAuthClient === 'function') {
    // CRITICAL: better-auth client initialization
    // We use a clean URL and explicitly set the basePath to match the server mounting point.
    authClient = createAuthClient({
      baseURL: 'https://indplay-backend-v3.onrender.com',
      // Explicitly pointing to where the auth handler is mounted on the Express server
      basePath: '/api/auth', 
      storage: {
        async getItem(key: string) {
          try {
            if (key.includes('token') || key.includes('session')) {
              const credentials = await Keychain.getGenericPassword({ service: key });
              return credentials ? credentials.password : null;
            }
            return await AsyncStorage.getItem(key);
          } catch (e) {
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
          } catch (e) {}
        },
        async removeItem(key: string) {
          try {
            if (key.includes('token') || key.includes('session')) {
              await Keychain.resetGenericPassword({ service: key });
            } else {
              await AsyncStorage.removeItem(key);
            }
          } catch (e) {}
        },
      },
      // Headers/Fetch options for Android stability
      fetchOptions: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // If the server is warming up (Render), we want a decent timeout
        timeout: 30000,
      }
    });
    console.log('[Auth] Success: Better-Auth client initialized with baseURL: https://indplay-backend-v3.onrender.com');
  } else {
    authInitError = 'createAuthClient is not a function - Import resolution failure';
    console.error('[Auth] Error:', authInitError);
  }
} catch (error: any) {
  authInitError = error?.message || String(error);
  // DETAILED LOGGING FOR LOGCAT AS REQUESTED
  console.error('============================================================');
  console.error('[Auth] FATAL INITIALIZATION ERROR');
  console.error('[Auth] Message:', authInitError);
  if (error?.stack) console.error('[Auth] Stack:', error.stack);
  console.error('============================================================');
  
  // Fallback dummy object to prevent app-wide crash
  authClient = {
    useSession: () => ({ data: null, isPending: false, error: authInitError }),
    signIn: { email: async () => ({ error: { message: 'Auth failed to init: ' + authInitError } }) },
    signUp: { email: async () => ({ error: { message: 'Auth failed to init: ' + authInitError } }) },
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
  initError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Safety: check if session hook exists
  const sessionHook = authClient?.useSession;
  const sessionResult = sessionHook ? sessionHook() : { data: null, isPending: false };
  const { data: session, isPending: isLoadingSession } = sessionResult;

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
      if (authInitError) throw new Error('Auth system failed to initialize: ' + authInitError);
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
      if (authInitError) throw new Error('Auth system failed to initialize: ' + authInitError);
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
      value={{ 
        user, 
        session, 
        isLoading, 
        login, 
        register, 
        logout, 
        refreshProfile, 
        forgotPassword,
        initError: authInitError 
      }}
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

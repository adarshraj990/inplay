import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// ─── Simple Import ──────────────────────────────────────────────────────────
import BetterAuthReact from 'better-auth/react';

// Use simple creation with requested trailing slash
const AUTH_URL = 'https://indplay-backend-v3.onrender.com/';

// Keep creation in a simple try-catch to prevent "Invalid URL" top-level crash
// but keep the logic "smooth" as requested.
let authClient: any;

try {
  const factory = (BetterAuthReact as any).createAuthClient || (BetterAuthReact as any).default?.createAuthClient;
  authClient = factory({
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
  });
} catch (e) {
  console.warn('BetterAuth failed to initialize, using fallback');
  authClient = { useSession: () => ({ data: null, isPending: false }) };
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
        username: session.user.email.split('@')[0],
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    setIsActionLoading(true);
    try {
      await authClient.signIn.email({ email, password });
    } finally {
      setIsActionLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsActionLoading(true);
    try {
      await (authClient.signUp.email as any)({ email, password, name: username, username });
    } finally {
      setIsActionLoading(false);
    }
  };

  const logout = async () => {
    setIsActionLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
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

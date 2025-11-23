import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import apiFetch from '@/api';

// 1. Define the shape of your user and subscription data
interface Subscription {
  status: 'active' | 'inactive' | 'past_due';
}

export interface User {
  id: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  tenant?: {
    subscription: Subscription;
  };
}

// 2. Define a custom JWT payload that includes your user data
interface CustomJwtPayload extends JwtPayload, User {}

// 3. Define the shape of the context value
interface AuthContextType {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Define the shape of the login API response
interface LoginResponse {
  token: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to easily access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // ✅ Decode token whenever it changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      setSubscription(null);
      return;
    }

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);

      // ✅ Check expiration
      const expired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
      if (expired) throw new Error('Token expired');

      // ✅ Extract user + subscription
      setUser(decoded);
      setSubscription(decoded.tenant?.subscription || null);
    } catch (err) {
      console.error('Invalid or expired token:', err);
      logout();
    }
  }, [token]);

  // ✅ Login function
  const login = async (email: string, password: string) => {
    // ✅ FIXED: remove `/api` prefix — apiFetch already adds it
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const newToken = response?.token;

    if (!newToken) {
      console.error('Invalid login response:', response);
      throw new Error('Login failed: Invalid token received from server.');
    }

    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSubscription(null);
  };

  const value: AuthContextType = { user, token, subscription, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  tier: string;
  name?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role?: 'admin' | 'engineer') => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'sentinel_auth_token';
const USER_KEY = 'sentinel_user_data';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Validate existing token with backend on mount if present
  useEffect(() => {
    const validateSession = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        // Backend unavailable; retain cached session or fallback state if offline
        console.warn('Backend unavailable during session check:', err);
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      const authenticatedUser: User = {
        id: data.user_id,
        email: data.email,
        tier: data.tier,
      };

      setToken(data.access_token);
      setUser(authenticatedUser);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      // If network error (e.g. backend server down), allow mock login fallback for development/demo ease
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        setAuthError('Backend offline. Logged in as Demo User.');
        demoLogin('engineer');
        return true;
      }
      setAuthError(err.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Could not register user');
      }

      setIsLoading(false);
      // Auto login after successful signup
      return await login(email, password);
    } catch (err: any) {
      setIsLoading(false);
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        setAuthError('Backend offline. Registered as Demo User.');
        demoLogin('engineer');
        return true;
      }
      setAuthError(err.message || 'Signup failed. User may already exist.');
      return false;
    }
  };

  const demoLogin = (role: 'admin' | 'engineer' = 'engineer') => {
    const demoUser: User = {
      id: role === 'admin' ? 'usr-admin-01' : 'usr-eng-02',
      email: role === 'admin' ? 'admin@sentinel-mlops.dev' : 'engineer@sentinel-mlops.dev',
      tier: role === 'admin' ? 'Enterprise' : 'Pro',
      name: role === 'admin' ? 'Lead MLOps Architect' : 'Senior AI Engineer',
    };
    const mockToken = 'mock_jwt_sentinel_token_' + Date.now();
    setToken(mockToken);
    setUser(demoUser);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    setAuthError(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        authError,
        login,
        signup,
        demoLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

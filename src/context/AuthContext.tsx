import React, { useState, useEffect, createContext, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  registerFirstAdmin: (email: string, password: string, full_name: string) => Promise<void>;
  error: string | null;
}

// Export the context so the hook can use it
export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
          full_name: data.full_name,
          phone: data.phone,
          avatar_url: data.avatar_url,
          is_active: true,
        });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Authentication failed');
        setUser(null);
      }
    } catch (err: any) {
      console.error('Auth check failed:', err);
      setError(err.message || 'Network error occurred');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const registerFirstAdmin = async (email: string, password: string, full_name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register-first-admin`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, full_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.error || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
      setUser(null);
      setError('Logout failed');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
    registerFirstAdmin,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles = ['ADMIN'] 
}) => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('ProtectedRoute must be used within AuthProvider');
  }

  const { user, isLoading, error } = context;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    console.error('Auth error:', error);
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toUpperCase())) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50">
    <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
    <p className="text-stone-400 font-serif tracking-wider animate-pulse">Loading...</p>
  </div>
);

export { AuthProvider, ProtectedRoute, ScrollToTop, PageLoader };
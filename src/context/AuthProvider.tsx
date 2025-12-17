import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext, AuthContextType, User } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
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
        return true;
      } else if (response.status === 401) {
        // 401 is expected when not logged in - don't treat as error
        setUser(null);
        setError(null);
        return false;
      } else {
        const errorData = await response.json();
        console.warn('Auth check failed:', errorData);
        setError(errorData.msg || 'Authentication failed');
        setUser(null);
        return false;
      }
    } catch (err: any) {
      console.warn('Auth check error:', err.message);
      // Don't treat network errors as authentication failures
      setError(null);
      setUser(null);
      return false;
    }
  };

  const checkAdminExists = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/check-admin`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminExists(data.admin_exists);
        console.log('Admin exists:', data.admin_exists);
      } else {
        // If we can't check admin status, assume false to be safe
        setAdminExists(false);
        console.warn('Failed to check admin status, assuming false');
      }
    } catch (err: any) {
      console.warn('Failed to check admin status:', err.message);
      // On error, assume no admin exists to prevent showing register link incorrectly
      setAdminExists(false);
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
      // Check admin status again after login
      await checkAdminExists();
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
      // Update admin status after registration
      setAdminExists(true);
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
      // Update admin status after logout (it should still exist)
      await checkAdminExists();
    } catch (err: any) {
      console.error('Logout failed:', err);
      setUser(null);
      setError('Logout failed');
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      await checkAuth();
      await checkAdminExists();
    } catch (err) {
      console.error('Auth refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Run checks sequentially to ensure proper order
        await checkAuth();
        await checkAdminExists();
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    adminExists,
    login,
    logout,
    checkAuth,
    registerFirstAdmin,
    checkAdminExists,
    error,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['ADMIN'] 
}) => {
  const context = React.useContext(AuthContext);
  
  if (!context) {
    throw new Error('ProtectedRoute must be used within AuthProvider');
  }

  const { user, isLoading } = context;

  if (isLoading) {
    return <PageLoader />;
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
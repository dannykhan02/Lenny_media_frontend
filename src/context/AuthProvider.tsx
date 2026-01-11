import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// CRITICAL FIX: Ensure API_URL points to your backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('🔧 API_URL configured as:', API_URL);
export { API_URL };

// Auth Context Types
export interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminExists: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  registerFirstAdmin: (email: string, password: string, full_name: string) => Promise<void>;
  checkAdminExists: () => Promise<void>;
  error: string | null;
  refreshAuth: () => Promise<void>;
  setAccessToken: (token: string) => void;
  getAccessToken: () => string | null;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Auth Provider Component
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Token management
  const storeToken = (token: string) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
  };

  const getStoredToken = (): string | null => {
    return localStorage.getItem('accessToken');
  };

  const removeToken = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
  };

  // Auth functions
  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        return false;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        removeToken();
        setUser(null);
        setError(null);
        return false;
      } else {
        let errorMsg = 'Authentication failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorData.message || errorMsg;
        } catch {}
        setError(errorMsg);
        setUser(null);
        return false;
      }
    } catch (err: any) {
      setError(null);
      setUser(null);
      return false;
    }
  };

  const checkAdminExists = async (): Promise<void> => {
    try {
      const token = getStoredToken();
      if (!token) {
        setAdminExists(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/check-admin`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminExists(data.admin_exists);
      } else {
        setAdminExists(false);
      }
    } catch {
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
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.msg || errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.access_token) {
        storeToken(data.access_token);
      } else {
        throw new Error('No access token received');
      }
      
      setUser(data.user);
      setError(null);
      await checkAdminExists();
      const authSuccess = await checkAuth();
      if (!authSuccess) {
        console.error('⚠️ WARNING: Login succeeded but auth check failed');
      }
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
        body: JSON.stringify({ email, password, full_name }),
      });

      if (!response.ok) {
        let errorMsg = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorData.error || errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.access_token) {
        storeToken(data.access_token);
      } else {
        throw new Error('No access token received');
      }
      
      setUser(data.user);
      setError(null);
      setAdminExists(true);
      const authSuccess = await checkAuth();
      if (!authSuccess) {
        console.error('⚠️ WARNING: Registration succeeded but auth check failed');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      removeToken();
      setUser(null);
      setError(null);
      await checkAdminExists();
    } catch {
      removeToken();
      setUser(null);
      setError('Logout failed');
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      await checkAuth();
      await checkAdminExists();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        await checkAuth();
        await checkAdminExists();
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
    setAccessToken: storeToken,
    getAccessToken: getStoredToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['ADMIN'] 
}) => {
  const context = useContext(AuthContext);
  
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

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Page loader component
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50">
    <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
    <p className="text-stone-400 font-serif tracking-wider animate-pulse">Loading...</p>
  </div>
);

export { AuthProvider, ProtectedRoute, ScrollToTop, PageLoader };
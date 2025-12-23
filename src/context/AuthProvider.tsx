import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext, AuthContextType, User } from './AuthContext';

// CRITICAL FIX: Ensure API_URL points to your backend server
// If VITE_API_URL is not set, default to backend URL (e.g., http://localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Log the API URL being used for debugging
console.log('🔧 API_URL configured as:', API_URL);

// Export API_URL for use in other components
export { API_URL };

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    console.log('\n🔐 checkAuth() called');
    
    try {
      const url = `${API_URL}/api/auth/me`;
      console.log('📡 Making request to:', url);
      console.log('Request will include cookies automatically via credentials: include');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Browser will send HttpOnly cookies automatically
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth successful, user data:', data);
        
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
        console.log('⚠️ 401 Unauthorized - User not logged in');
        setUser(null);
        setError(null);
        return false;
      } else {
        // Try to parse error response
        let errorMsg = 'Authentication failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorData.message || errorMsg;
          console.error('❌ Auth check failed:', errorData);
        } catch (parseError) {
          console.error('❌ Auth check failed with status:', response.status);
        }
        setError(errorMsg);
        setUser(null);
        return false;
      }
    } catch (err: any) {
      console.error('💥 Auth check error:', err.message);
      console.error('💥 Full error:', err);
      setError(null);
      setUser(null);
      return false;
    }
  };

  const checkAdminExists = async (): Promise<void> => {
    console.log('\n👤 checkAdminExists() called');
    
    try {
      const url = `${API_URL}/api/auth/check-admin`;
      console.log('📡 Checking admin at:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAdminExists(data.admin_exists);
        console.log('✅ Admin exists:', data.admin_exists);
      } else {
        setAdminExists(false);
        console.warn('⚠️ Failed to check admin status, assuming false');
      }
    } catch (err: any) {
      console.warn('❌ Failed to check admin status:', err.message);
      setAdminExists(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('\n🔑 login() called for:', email);
    
    try {
      const url = `${API_URL}/api/auth/login`;
      console.log('📡 Posting to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.msg || errorData.message || errorMsg;
          console.error('❌ Login failed:', errorData);
        } catch (parseError) {
          console.error('❌ Login failed with status:', response.status);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ Login successful, user data:', data.user);
      
      setUser(data.user);
      setError(null);
      
      console.log('🍪 Cookie should be set by server (HttpOnly - not readable by JS)');
      console.log('🍪 Browser will automatically send it with future requests');
      
      // IMPORTANT: Wait a moment for cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check admin status again after login
      await checkAdminExists();
      
      // Verify auth immediately after login
      console.log('🔍 Running post-login auth verification...');
      const authSuccess = await checkAuth();
      console.log('🔐 Post-login auth check:', authSuccess ? 'SUCCESS ✅' : 'FAILED ❌');
      
      if (!authSuccess) {
        console.error('⚠️ WARNING: Login succeeded but auth check failed - cookie may not be set properly');
        console.error('⚠️ This usually indicates a CORS or cookie configuration issue');
      }
    } catch (err: any) {
      console.error('💥 Login error:', err.message);
      throw new Error(err.message || 'Login failed');
    }
  };

  const registerFirstAdmin = async (email: string, password: string, full_name: string) => {
    console.log('\n👤 registerFirstAdmin() called for:', email);
    
    try {
      const url = `${API_URL}/api/auth/register-first-admin`;
      console.log('📡 Posting to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, full_name }),
      });

      console.log('📥 Registration response status:', response.status);

      if (!response.ok) {
        let errorMsg = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorData.error || errorData.message || errorMsg;
          console.error('❌ Registration failed:', errorData);
        } catch (parseError) {
          console.error('❌ Registration failed with status:', response.status);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ Registration successful, user data:', data.user);
      
      setUser(data.user);
      setError(null);
      setAdminExists(true);
      
      console.log('🍪 Cookie set by server');
      
      // IMPORTANT: Wait a moment for cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify auth immediately after registration
      console.log('🔍 Running post-registration auth verification...');
      const authSuccess = await checkAuth();
      console.log('🔐 Post-registration auth check:', authSuccess ? 'SUCCESS ✅' : 'FAILED ❌');
      
      if (!authSuccess) {
        console.error('⚠️ WARNING: Registration succeeded but auth check failed - cookie may not be set properly');
        console.error('⚠️ This usually indicates a CORS or cookie configuration issue');
      }
    } catch (err: any) {
      console.error('💥 Registration error:', err.message);
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = async () => {
    console.log('\n🚪 logout() called');
    
    try {
      const url = `${API_URL}/api/auth/logout`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('✅ Logout successful');
      setUser(null);
      setError(null);
      
      await checkAdminExists();
    } catch (err: any) {
      console.error('💥 Logout failed:', err);
      setUser(null);
      setError('Logout failed');
    }
  };

  const refreshAuth = async () => {
    console.log('\n🔄 refreshAuth() called');
    setIsLoading(true);
    
    try {
      await checkAuth();
      await checkAdminExists();
    } catch (err) {
      console.error('💥 Auth refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('\n🚀 Initializing auth...');
      console.log('🔧 Using API_URL:', API_URL);
      setIsLoading(true);
      
      try {
        await checkAuth();
        await checkAdminExists();
      } catch (err) {
        console.error('💥 Auth initialization failed:', err);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
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
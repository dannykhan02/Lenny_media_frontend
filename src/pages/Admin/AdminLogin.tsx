// pages/Admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminAuthLayout from '../../components/AdminAuthLayout';
import { useTheme } from '../../context/ThemeContext';

const AdminLogin: React.FC = () => {
  const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to dashboard or to the intended destination
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Uses token-based login (handled by useAuth hook)
      await login(email, password);
      
      // Login successful - navigation will happen via useEffect
      // because isAuthenticated will change
    } catch (err: any) {
      // More specific error messages
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else if (err.message.includes('Invalid') || err.message.includes('credentials')) {
        setError('Invalid email or password');
      } else if (err.message.includes('token')) {
        setError('Authentication error. Please try again.');
      } else {
        setError(err.message || 'An error occurred during login');
      }
      setIsLoading(false);
    }
  };

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-gold-500 animate-spin mb-4" />
          <p className="text-stone-600 dark:text-stone-400 font-serif tracking-wider animate-pulse">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthLayout>
      <div className="w-full max-w-md">
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-8 py-10 text-center relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl mb-4 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img 
                    src="/images/lenny-logo.png" 
                    alt="Lenny Media Kenya" 
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-logo.png';
                    }}
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white font-serif mb-2 tracking-tight">
                Admin Login
              </h1>
              <p className="text-stone-300 font-light">
                Secure access to Lenny Media Management Portal
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-10">
            {error && (
              <div className={`mb-6 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300 ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800/50' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>Authentication Error</p>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className={`text-sm font-medium px-3 py-1 rounded ${
                    isDarkMode 
                      ? 'text-red-300 hover:text-red-200 hover:bg-red-900/30' 
                      : 'text-red-700 hover:text-red-800 hover:bg-red-100'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className={`block text-sm font-semibold ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Mail className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className={`block w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-400 hover:border-stone-400'
                    }`}
                    placeholder="admin@lennymedia.co.ke"
                    disabled={isLoading || authLoading}
                    required
                    autoComplete="email"
                  />
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                  Use your registered admin email
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className={`block text-sm font-semibold ${
                    isDarkMode ? 'text-stone-300' : 'text-stone-700'
                  }`}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`text-xs font-medium ${
                      isDarkMode 
                        ? 'text-stone-400 hover:text-gold-400' 
                        : 'text-stone-600 hover:text-gold-600'
                    } transition-colors`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide password' : 'Show password'}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-12 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-400 hover:border-stone-400'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading || authLoading}
                    required
                    autoComplete="current-password"
                  />
                  {/* Password Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform hover:scale-110"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading || authLoading}
                  >
                    {showPassword ? (
                      <EyeOff className={`h-5 w-5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                    ) : (
                      <Eye className={`h-5 w-5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                    )}
                  </button>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                  Minimum 8 characters with letters and numbers
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full bg-gradient-to-r from-gold-500 to-amber-500 text-stone-900 py-4 rounded-lg font-bold tracking-wide shadow-lg hover:from-gold-400 hover:to-amber-400 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0" />
                {isLoading || authLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                    <span className="relative z-10">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Login to Dashboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className={`mt-8 pt-6 text-center ${
              isDarkMode ? 'border-stone-800' : 'border-stone-200'
            } border-t`}>
              <p className={`text-sm ${
                isDarkMode ? 'text-stone-400' : 'text-stone-600'
              }`}>
                <span className="font-semibold">Note:</span> This portal uses secure token-based authentication
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                  Tokens are securely stored in your browser
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminAuthLayout>
  );
};

export default AdminLogin;
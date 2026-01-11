import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AdminAuthLayout from '../../components/AdminAuthLayout';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RegisterFirstAdmin: React.FC = () => {
  const { registerFirstAdmin } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Visibility states for toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean>(false);

  // ✅ Get auth headers for token-based requests
  const getAuthHeaders = () => {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/admin/exists`, {
          method: 'GET',
          headers: getAuthHeaders(), // ✅ Use token-based headers
          // REMOVED: credentials: 'include' - we're using tokens now
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setAdminExists(true);
            setTimeout(() => {
              navigate('/admin/login');
            }, 2000);
          }
        } else {
          // Handle non-OK responses
          console.error('Failed to check admin status:', response.status);
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.full_name) {
      setError('All fields are required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.email.split('@')[0].length < 3) {
      setError('Email username must be at least 3 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address (e.g., admin@lennymedia.co.ke)');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password.length > 128) {
      setError('Password must be less than 128 characters');
      return false;
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.full_name.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return false;
    }

    if (formData.full_name.trim().length > 100) {
      setError('Full name must be less than 100 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // ✅ The registerFirstAdmin function from useAuth should already handle token-based auth
      // but let's ensure it doesn't use cookies internally
      await registerFirstAdmin(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.full_name.trim()
      );

      setSuccess('🎉 Admin account created successfully! Redirecting to dashboard...');
      
      // Clear form data
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
      });

      // Reset password visibility
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2500);

    } catch (err: any) {
      // Handle specific error cases
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to server. Please check your connection and try again.');
      } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
        setError('Invalid request data. Please check all fields and try again.');
      } else if (err.message.includes('409') || err.message.includes('already exists')) {
        setError('An admin account already exists. Please use the login page instead.');
      } else if (err.message.includes('500') || err.message.includes('server')) {
        setError('Server error. Please try again in a few moments.');
      } else {
        setError(err.message || 'An unexpected error occurred during registration');
      }
      
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <AdminAuthLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full animate-pulse" />
            <Loader2 className={`relative animate-spin h-12 w-12 ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`} />
          </div>
          <p className={`mt-6 font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Checking admin status...</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>This may take a moment</p>
        </div>
      </AdminAuthLayout>
    );
  }

  if (adminExists) {
    return (
      <AdminAuthLayout>
        <div className="w-full max-w-md">
          <div className={`rounded-2xl shadow-xl p-8 text-center ${
            isDarkMode ? 'bg-stone-900' : 'bg-white'
          }`}>
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-4 font-serif ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>Admin Account Exists</h2>
            <p className={`mb-6 ${
              isDarkMode ? 'text-stone-400' : 'text-stone-600'
            }`}>
              An admin account has already been registered. Redirecting to login page...
            </p>
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
              <span className={`text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Redirecting...</span>
            </div>
            <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                Not redirected automatically?
              </p>
              <a
                href="/admin/login"
                className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 font-medium px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-colors"
              >
                Click here to go to login
              </a>
            </div>
          </div>
        </div>
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout>
      <div className="w-full max-w-md">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-stone-900' : 'bg-white'
        }`}>
          {/* Header Section */}
          <div className="relative px-8 py-10 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-600 via-gold-500 to-amber-500" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl bg-white/10 transform translate-x-32 -translate-y-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl bg-white/5 transform -translate-x-20 translate-y-20" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center bg-white/10 p-4 rounded-2xl mb-4 shadow-lg backdrop-blur-sm border border-white/20">
                <img 
                  src="/images/lenny-logo.png" 
                  alt="Lenny Media Kenya" 
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5'/%3E%3Cpath d='M12 8v8'/%3E%3Cpath d='M8 12h8'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-white font-serif mb-2 tracking-tight">
                First Admin Setup
              </h1>
              <p className="text-gold-100/90 font-light">
                Create the initial admin account for Lenny Media
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-8 py-10">
            {error && (
              <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800/50 backdrop-blur-sm' 
                  : 'bg-red-50 border border-red-200'
              } animate-fadeIn`}>
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Registration Error</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${
                isDarkMode 
                  ? 'bg-green-900/20 border border-green-800/50 backdrop-blur-sm' 
                  : 'bg-green-50 border border-green-200'
              } animate-fadeIn`}>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Success!</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="full_name" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-gold-500">
                    <User className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3.5 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600 focus:bg-stone-800/50' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-500 hover:border-stone-400 focus:bg-white'
                    }`}
                    placeholder="Enter your full name"
                    disabled={isLoading || !!success}
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-gold-500">
                    <Mail className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3.5 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600 focus:bg-stone-800/50' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-500 hover:border-stone-400 focus:bg-white'
                    }`}
                    placeholder="admin@lennymedia.co.ke"
                    disabled={isLoading || !!success}
                    required
                    autoComplete="email"
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    title="Please enter a valid email address"
                  />
                </div>
                <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                  This will be your admin login email
                </p>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-gold-500">
                    <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3.5 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600 focus:bg-stone-800/50' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-500 hover:border-stone-400 focus:bg-white'
                    }`}
                    placeholder="Create a strong password"
                    disabled={isLoading || !!success}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                      isDarkMode ? 'text-stone-400 hover:text-gold-400' : 'text-stone-500 hover:text-gold-600'
                    }`}
                    disabled={isLoading || !!success}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className={`mt-1.5 text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-gold-500">
                    <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-gold-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3.5 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500 hover:border-stone-600 focus:bg-stone-800/50' 
                        : 'border border-stone-300 text-stone-900 placeholder-stone-500 hover:border-stone-400 focus:bg-white'
                    }`}
                    placeholder="Re-enter your password"
                    disabled={isLoading || !!success}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                      isDarkMode ? 'text-stone-400 hover:text-gold-400' : 'text-stone-500 hover:text-gold-600'
                    }`}
                    disabled={isLoading || !!success}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!success}
                className={`w-full py-4 rounded-lg font-bold tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
                  isLoading || success
                    ? 'bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-not-allowed'
                    : 'bg-gold-500 text-stone-900 hover:bg-gold-400 hover:shadow-xl active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Admin Account...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Account Created!</span>
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </div>

            {/* Information Box */}
            <div className={`mt-8 pt-6 ${isDarkMode ? 'border-stone-800' : 'border-stone-200'} border-t`}>
              <div className={`rounded-xl p-4 ${
                isDarkMode 
                  ? 'bg-blue-900/20 border border-blue-800/50 backdrop-blur-sm' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Important Information
                    </p>
                    <ul className={`text-xs space-y-1.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <li className="flex items-start gap-1.5">
                        <span className="text-gold-500 mt-0.5">•</span>
                        <span>This will create the first admin account for Lenny Media</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-gold-500 mt-0.5">•</span>
                        <span>You'll have full access to the admin dashboard</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-gold-500 mt-0.5">•</span>
                        <span>Keep your login credentials secure and confidential</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-gold-500 mt-0.5">•</span>
                        <span>You can create additional admin accounts after login</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminAuthLayout>
  );
};

export default RegisterFirstAdmin;
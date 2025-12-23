// pages/Admin/RegisterFirstAdmin.tsx
import React, { useState, useEffect } from 'react';
import { Camera, Lock, Mail, User, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState<boolean>(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/admin/exists`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setAdminExists(true);
            setTimeout(() => {
              navigate('/admin/login');
            }, 2000);
          }
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

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      await registerFirstAdmin(
        formData.email.trim(),
        formData.password,
        formData.full_name.trim()
      );

      setSuccess('Admin account created successfully! Redirecting to dashboard...');
      
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
      });

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <AdminAuthLayout>
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Checking admin status...</p>
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>Admin Already Exists</h2>
            <p className={`mb-6 ${
              isDarkMode ? 'text-stone-400' : 'text-stone-600'
            }`}>
              An admin account has already been registered. Redirecting to login page...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
            </div>
            <div className="mt-6">
              <a
                href="/#/admin/login"
                className="text-gold-600 hover:text-gold-700 font-medium"
              >
                Click here if not redirected
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
        {/* Registration Card */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-stone-900' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-600 to-gold-500 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center bg-white text-gold-600 p-4 rounded-2xl mb-4 shadow-lg">
              <Camera className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white font-serif mb-2">
              Create First Admin
            </h1>
            <p className="text-gold-100">
              Set up your Lenny Media admin account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-10">
            {error && (
              <div className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800/50' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>Error</p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
                isDarkMode 
                  ? 'bg-green-900/20 border border-green-800/50' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-green-300' : 'text-green-800'
                  }`}>Success!</p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>{success}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="John Doe"
                    disabled={isLoading || !!success}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="admin@lennymedia.co.ke"
                    disabled={isLoading || !!success}
                    required
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="Min. 8 characters"
                    disabled={isLoading || !!success}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-auto"
                    disabled={isLoading || !!success}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    )}
                  </button>
                </div>
                <p className={`mt-1 text-xs ${
                  isDarkMode ? 'text-stone-500' : 'text-stone-500'
                }`}>
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field with Eye Toggle */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="Re-enter password"
                    disabled={isLoading || !!success}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-auto"
                    disabled={isLoading || !!success}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!success}
                className="w-full bg-gold-500 text-stone-900 py-4 rounded-lg font-bold tracking-wide shadow-lg hover:bg-gold-400 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Admin Account...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Account Created!
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className={`mt-8 pt-6 ${
              isDarkMode ? 'border-stone-800' : 'border-stone-200'
            } border-t`}>
              <div className={`rounded-lg p-4 ${
                isDarkMode 
                  ? 'bg-blue-900/20 border border-blue-800/50' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  First-time setup
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  This will create the first admin account for your Lenny Media platform. 
                  You'll be able to create additional admin and staff accounts after logging in.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminAuthLayout>
  );
};

export default RegisterFirstAdmin;
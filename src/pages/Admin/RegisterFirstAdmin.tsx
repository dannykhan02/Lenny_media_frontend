import React, { useState, useEffect } from 'react';
import { Camera, Lock, Mail, User, Phone, AlertCircle, CheckCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RegisterFirstAdmin: React.FC = () => {
  const { registerFirstAdmin, checkAuth, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        await checkAuth();
        setCheckingAdmin(false);
      } catch (err) {
        console.error('Failed to check admin status:', err);
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [checkAuth]);

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

  const handleSubmit = async (e: React.MouseEvent) => {
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
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/#/admin/dashboard';
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className="text-stone-600 font-serif">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (adminExists === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Admin Already Exists</h2>
          <p className="text-stone-600 mb-8">
            An admin account has already been created. Redirecting to login...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-gold-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Home</span>
        </a>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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
          <div className="px-8 py-10">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Success!</p>
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-stone-700 mb-2">
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
                    className="block w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
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
                    className="block w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="admin@lennymedia.co.ke"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-2">
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
                    className="block w-full pl-12 pr-12 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Min. 8 characters"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-auto"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field with Eye Toggle */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-stone-700 mb-2">
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                    className="block w-full pl-12 pr-12 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    placeholder="Re-enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-auto"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400 hover:text-stone-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-600 hover:text-stone-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
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
            <div className="mt-8 pt-6 border-t border-stone-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  First-time setup
                </p>
                <p className="text-xs text-blue-600">
                  This will create the first admin account for your Lenny Media platform. 
                  You'll be able to create additional admin and staff accounts after logging in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFirstAdmin;
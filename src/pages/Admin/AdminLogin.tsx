// pages/Admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { Camera, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AdminAuthLayout from '../../components/AdminAuthLayout';

const AdminLogin: React.FC = () => {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthLayout>
      <div className="w-full max-w-md">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-stone-900' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center bg-gold-500 text-stone-900 p-4 rounded-2xl mb-4 shadow-lg">
              <Camera className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white font-serif mb-2">
              Admin Login
            </h1>
            <p className="text-stone-300">
              Lenny Media Management Portal
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

            <div className="space-y-6">
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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="admin@lennymedia.co.ke"
                    disabled={isLoading || authLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'border border-stone-300 text-stone-900'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading || authLoading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full bg-gold-500 text-stone-900 py-4 rounded-lg font-bold tracking-wide shadow-lg hover:bg-gold-400 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login to Dashboard'
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
                Secure admin access only
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminAuthLayout>
  );
};

export default AdminLogin;
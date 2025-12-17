import React, { useState, useEffect } from 'react';
import { Camera, LogOut, Users, Settings, BarChart, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, refreshAuth } = useAuth();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
      // Redirect to login if not authenticated
      window.location.href = '/#/admin/login';
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Force refresh auth state
      refreshAuth();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className="text-stone-600 font-serif">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 mb-4">{error || 'Authentication required'}</p>
          <a href="/#/admin/login" className="text-gold-500 hover:text-gold-600">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="bg-stone-900 text-gold-500 p-2 rounded-lg">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 font-serif">
                  Lenny<span className="text-gold-500">Media</span>
                </h1>
                <p className="text-sm text-stone-600">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-stone-900">{user.full_name}</p>
                <p className="text-xs text-stone-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle className="h-12 w-12" />
            <div>
              <h2 className="text-3xl font-bold">Welcome back, {user.full_name.split(' ')[0]}!</h2>
              <p className="text-gold-100 mt-1">You're logged in as an administrator</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">0</span>
            </div>
            <h3 className="text-stone-600 font-medium">Total Users</h3>
            <p className="text-xs text-stone-500 mt-1">All registered users</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">0</span>
            </div>
            <h3 className="text-stone-600 font-medium">Bookings</h3>
            <p className="text-xs text-stone-500 mt-1">Total sessions booked</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">Active</span>
            </div>
            <h3 className="text-stone-600 font-medium">System Status</h3>
            <p className="text-xs text-stone-500 mt-1">All systems operational</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all">
              <Users className="h-5 w-5 text-gold-600" />
              <span className="font-medium text-stone-900">Manage Users</span>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all">
              <BarChart className="h-5 w-5 text-gold-600" />
              <span className="font-medium text-stone-900">View Reports</span>
            </button>
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all">
              <Settings className="h-5 w-5 text-gold-500" />
              <span className="font-medium text-stone-900">Settings</span>
            </button>
            <a 
              href="/"
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all"
            >
              <Camera className="h-5 w-5 text-gold-600" />
              <span className="font-medium text-stone-900">View Website</span>
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 mb-2">Dashboard Under Development</h4>
          <p className="text-blue-700 text-sm">
            Your admin dashboard is being built! More features and management tools will be added soon. 
            For now, you have access to the complete ticketing-style admin panel functionality.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
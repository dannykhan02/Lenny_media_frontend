// pages/Admin/BookingCleanup.tsx
import React, { useState, useEffect } from 'react';
import { 
  Trash2, Loader2, AlertCircle, Calendar, RefreshCw, 
  ShieldAlert, Clock, CheckCircle, XCircle, Filter,
  Download, ChevronDown, ChevronUp, Info, User, Mail, Phone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // ✅ Import useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CleanupPreview {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  created_at: string;
  status: string;
  age_days: number;
  preferred_date: string;
  assigned_to: number | null;
  internal_notes: string | null;
}

interface CleanupStats {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  eligible_for_cleanup: number;
  cutoff_date: string;
}

const BookingCleanup: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user: authUser, getAccessToken, logout } = useAuth(); // ✅ Use auth context
  const [monthsThreshold, setMonthsThreshold] = useState(3);
  const [previewBookings, setPreviewBookings] = useState<CleanupPreview[]>([]);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedBookings, setExpandedBookings] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'CANCELLED'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Get token from auth context
  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    // ✅ Check authentication
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If no user in auth context after initialization, redirect to login
        if (!authUser) {
          const token = getAccessToken();
          if (!token) {
            navigate('/admin/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
  }, [authUser, getAccessToken, navigate]);

  useEffect(() => {
    if (authUser) {
      fetchPreview();
      fetchStats();
    }
  }, [monthsThreshold, statusFilter, authUser]);

  const fetchPreview = async () => {
    if (!authUser) return;
    
    setIsLoadingPreview(true);
    setError('');
    try {
      const params = new URLSearchParams({
        months_threshold: monthsThreshold.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `${API_URL}/admin/bookings/cleanup/preview?${params}`,
        {
          method: 'GET',
          headers: getAuthHeaders(), // ✅ Use token-based headers
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error(`Failed to fetch preview (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      setPreviewBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const fetchStats = async () => {
    if (!authUser) return;
    
    try {
      const params = new URLSearchParams({
        months_threshold: monthsThreshold.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `${API_URL}/admin/bookings/cleanup/stats?${params}`,
        {
          method: 'GET',
          headers: getAuthHeaders(), // ✅ Use token-based headers
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error(`Failed to fetch stats (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCleanup = async () => {
    if (!authUser) return;
    
    if (!confirm(`Are you sure you want to delete ${previewBookings.length} bookings older than ${monthsThreshold} months? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError('');
    try {
      const params = new URLSearchParams({
        months_threshold: monthsThreshold.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_URL}/admin/bookings/cleanup?${params}`, {
        method: 'POST',
        headers: getAuthHeaders(), // ✅ Use token-based headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error(`Cleanup failed (HTTP ${response.status})`);
      }

      const data = await response.json();
      setSuccessMessage(`✅ Successfully deleted ${data.deleted_count} bookings older than ${monthsThreshold} months`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Refresh preview and stats
      fetchPreview();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleBookingExpansion = (bookingId: number) => {
    setExpandedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'CANCELLED': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default: return isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportPreview = () => {
    const csvContent = [
      ['ID', 'Client Name', 'Email', 'Phone', 'Service Type', 'Status', 'Created Date', 'Age (Days)', 'Preferred Date'].join(','),
      ...previewBookings.map(booking => [
        booking.id,
        `"${booking.client_name}"`,
        booking.client_email,
        booking.client_phone,
        `"${booking.service_type}"`,
        booking.status,
        formatDate(booking.created_at),
        booking.age_days,
        formatDate(booking.preferred_date)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-cleanup-preview-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full animate-pulse" />
          <Loader2 className={`relative animate-spin h-12 w-12 ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`} />
        </div>
      </div>
    );
  }

  // ✅ Check if user is authenticated
  if (!authUser) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar user={authUser} />
      
      <main className="flex-1 min-h-screen overflow-y-auto pt-20 lg:pt-0 lg:ml-72">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Booking Cleanup
            </h1>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Automated cleanup of old completed/cancelled bookings to maintain database performance
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${
              isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'
            }`}>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${
              isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Total Bookings</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {stats.total_bookings.toLocaleString()}
                    </p>
                  </div>
                  <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-stone-600' : 'text-gray-400'}`} />
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Completed</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      {stats.completed_bookings.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-green-500' : 'text-green-600'}`} />
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Cancelled</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                      {stats.cancelled_bookings.toLocaleString()}
                    </p>
                  </div>
                  <XCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} />
                </div>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Eligible for Cleanup</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      {stats.eligible_for_cleanup.toLocaleString()}
                    </p>
                  </div>
                  <Trash2 className={`w-8 h-8 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} />
                </div>
              </div>
            </div>
          )}

          {/* Configuration Card */}
          <div className={`rounded-xl p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Cleanup Configuration
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Configure automatic cleanup rules for old bookings
                </p>
              </div>
              
              {previewBookings.length > 0 && (
                <button
                  onClick={exportPreview}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isDarkMode
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'bg-gray-100 text-stone-700 hover:bg-gray-200'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export Preview
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Delete bookings older than:
                </label>
                <select
                  value={monthsThreshold}
                  onChange={(e) => setMonthsThreshold(Number(e.target.value))}
                  disabled={isDeleting}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-stone-800 border-stone-700 text-white' 
                      : 'bg-white border-gray-300 text-stone-900'
                  } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                >
                  <option value={1}>1 month</option>
                  <option value={2}>2 months</option>
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={12}>1 year</option>
                  <option value={24}>2 years</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Filter by Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  disabled={isDeleting}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-stone-800 border-stone-700 text-white' 
                      : 'bg-white border-gray-300 text-stone-900'
                  } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                >
                  <option value="all">All Statuses (Completed & Cancelled)</option>
                  <option value="COMPLETED">Completed Only</option>
                  <option value="CANCELLED">Cancelled Only</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Cutoff Date:
                </label>
                <div className={`px-4 py-2.5 rounded-lg border ${
                  isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-gray-50 border-gray-300 text-stone-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>
                      {stats?.cutoff_date ? formatDate(stats.cutoff_date) : 'Calculating...'}
                    </span>
                    <Clock className="w-4 h-4 text-stone-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    ⚠️ Important Notice
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    This action will permanently delete {previewBookings.length} booking{previewBookings.length !== 1 ? 's' : ''} 
                    older than {monthsThreshold} month{monthsThreshold !== 1 ? 's' : ''}. 
                    This includes all associated data and cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchPreview}
                disabled={isLoadingPreview || isDeleting}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${
                  isDarkMode
                    ? 'bg-stone-800 text-white hover:bg-stone-700'
                    : 'bg-gray-100 text-stone-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Refreshing Preview...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Refresh Preview
                  </>
                )}
              </button>

              {previewBookings.length > 0 && (
                <button
                  onClick={handleCleanup}
                  disabled={isDeleting || isLoadingPreview}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting {previewBookings.length} bookings...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete {previewBookings.length} Old Bookings
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Preview Table */}
          {previewBookings.length > 0 && (
            <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
              <div className="p-4 sm:p-6 border-b border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Bookings to be Deleted ({previewBookings.length})
                    </h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      These bookings match your cleanup criteria and will be permanently deleted
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Booking Details
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Status
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Created
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Age
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {previewBookings.map((booking) => (
                      <React.Fragment key={booking.id}>
                        <tr className={isDarkMode ? 'hover:bg-stone-800/50' : 'hover:bg-gray-50'}>
                          <td className={`px-4 sm:px-6 py-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            <div>
                              <div className="font-bold">{booking.client_name}</div>
                              <div className="text-sm opacity-75">{booking.service_type}</div>
                              <div className="text-xs opacity-50 mt-1">
                                #{booking.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </td>
                          <td className={`px-4 sm:px-6 py-4 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            {formatDate(booking.created_at)}
                          </td>
                          <td className={`px-4 sm:px-6 py-4 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {booking.age_days} days
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <button
                              onClick={() => toggleBookingExpansion(booking.id)}
                              className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-gray-100'}`}
                            >
                              {expandedBookings.includes(booking.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {expandedBookings.includes(booking.id) && (
                          <tr className={isDarkMode ? 'bg-stone-800/30' : 'bg-gray-50'}>
                            <td colSpan={5} className="px-4 sm:px-6 py-4">
                              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-white border border-gray-200'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                      <User className="w-4 h-4" />
                                      Client Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-stone-500" />
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                          {booking.client_email}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-stone-500" />
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                          {booking.client_phone}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                      <Calendar className="w-4 h-4" />
                                      Booking Details
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Preferred Date:</span>
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                          {formatDate(booking.preferred_date)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Assigned:</span>
                                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                          {booking.assigned_to ? `Staff #${booking.assigned_to}` : 'Unassigned'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {booking.internal_notes && (
                                  <div className="mt-4 pt-4 border-t border-stone-700">
                                    <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Internal Notes</h4>
                                    <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                      {booking.internal_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {previewBookings.length === 0 && !isLoadingPreview && (
            <div className={`rounded-xl p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
              <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-green-500' : 'text-green-600'}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                No Bookings to Clean Up
              </h3>
              <p className={`mb-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                All completed and cancelled bookings are within the {monthsThreshold}-month retention period.
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                Try adjusting the timeframe or status filter above.
              </p>
            </div>
          )}

          {/* Information Footer */}
          <div className={`mt-6 rounded-xl p-4 sm:p-6 ${isDarkMode ? 'bg-stone-900/50 border border-stone-800' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  How Automated Cleanup Works
                </h4>
                <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></div>
                    <span>Only <strong>COMPLETED</strong> and <strong>CANCELLED</strong> bookings are eligible for automated cleanup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></div>
                    <span>Bookings with <strong>PENDING</strong> or <strong>CONFIRMED</strong> status are never automatically deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></div>
                    <span>All deletions are permanent and cannot be recovered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></div>
                    <span>For manual deletion of specific bookings, use the <strong>Bulk Actions</strong> feature in the Bookings page</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingCleanup;
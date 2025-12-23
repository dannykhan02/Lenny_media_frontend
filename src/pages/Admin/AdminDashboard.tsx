// pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CheckCircle, Users, BarChart, Settings, Loader2, Calendar, Image, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdminNavbar from '../../components/AdminNavbar';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../context/AuthProvider'; // Import from AuthProvider

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, refreshAuth } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    console.log('🔍 AdminDashboard: Fetching current user from:', `${API_URL}/api/auth/me`);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📥 AdminDashboard: Response status:', response.status);

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      console.log('✅ AdminDashboard: User data fetched successfully');
      setUser(data);
    } catch (err: any) {
      console.error('❌ AdminDashboard: Failed to fetch user:', err.message);
      setError(err.message);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      refreshAuth();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <div className={`p-8 rounded-lg shadow-lg text-center ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          <p className={`mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error || 'Authentication required'}</p>
          <a href="/#/admin/login" className="text-gold-500 hover:text-gold-600">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      {/* Admin Navbar Sidebar */}
      <AdminNavbar user={user} onCollapsedChange={setSidebarCollapsed} />
      
      {/* Main Content Area - Properly offset from sidebar */}
      <main 
        className={`
          flex-1 
          min-h-screen
          overflow-y-auto 
          transition-all 
          duration-300
          pt-20 lg:pt-0
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Welcome Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>
              Welcome back, <span className="text-gold-600">{user.full_name.split(' ')[0]}</span>!
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Grid - Fully responsive */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
              isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>0</span>
              </div>
              <h3 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Total Users</h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>All registered users</p>
            </div>

            <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
              isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${isDarkMode ? 'bg-green-900/50' : 'bg-green-50'}`}>
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>0</span>
              </div>
              <h3 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Bookings</h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Total sessions booked</p>
            </div>

            <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
              isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                  <Image className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>0</span>
              </div>
              <h3 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Projects</h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Portfolio items</p>
            </div>

            <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
              isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${isDarkMode ? 'bg-gold-900/50' : 'bg-gold-50'}`}>
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600" />
                </div>
                <span className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Active</span>
              </div>
              <h3 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>System Status</h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>All systems operational</p>
            </div>
          </div>

          {/* Two Column Layout - Responsive stacking */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Today's Schedule Section */}
              <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Today's Schedule</h3>
                  <span className="text-sm text-gold-600 font-medium cursor-pointer hover:text-gold-700">View All</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { time: '09:00 - 10:00', title: 'Client Meeting', person: 'John Doe', status: 'completed' },
                    { time: '11:30 - 12:30', title: 'Photo Shoot', person: 'Wedding Client', status: 'upcoming' },
                    { time: '14:00 - 16:00', title: 'Editing Session', person: 'Internal', status: 'upcoming' },
                    { time: '17:00 - 18:00', title: 'Consultation', person: 'New Client', status: 'upcoming' },
                  ].map((item, index) => (
                    <div key={index} className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                      isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-gray-50'
                    }`}>
                      <div className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 ${
                        item.status === 'completed' 
                          ? `${isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`
                          : `${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`
                      }`}>
                        {item.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{item.title}</h4>
                        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{item.person}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Overall Performance</h2>
                    <p className="text-gold-100 text-sm">System running smoothly</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 sm:p-5 rounded-xl backdrop-blur-sm">
                    <p className="text-sm opacity-90">Uptime</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">99.9%</p>
                  </div>
                  <div className="bg-white/10 p-4 sm:p-5 rounded-xl backdrop-blur-sm">
                    <p className="text-sm opacity-90">Response Time</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1">120ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Pending Tasks */}
              <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Pending Tasks</h3>
                  <span className="text-sm text-gold-600 font-medium">2 Pending</span>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 sm:p-5 border rounded-xl ${
                    isDarkMode ? 'border-stone-800' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Review New Bookings</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Due Today</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 rounded-full h-2 ${
                        isDarkMode ? 'bg-stone-800' : 'bg-gray-200'
                      }`}>
                        <div className="bg-gold-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>75%</span>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 border rounded-xl ${
                    isDarkMode ? 'border-stone-800' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Update Portfolio</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Tomorrow</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 rounded-full h-2 ${
                        isDarkMode ? 'bg-stone-800' : 'bg-gray-200'
                      }`}>
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>45%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`rounded-2xl shadow-sm border p-5 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg sm:text-xl font-bold mb-5 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                    isDarkMode 
                      ? 'border border-stone-700 hover:border-gold-500/30 hover:bg-stone-800' 
                      : 'border-2 border-gray-200 hover:border-gold-500 hover:bg-gold-50'
                  }`}>
                    <div className={`p-3 rounded-lg mb-3 ${
                      isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Add User</span>
                  </button>
                  <button className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                    isDarkMode 
                      ? 'border border-stone-700 hover:border-gold-500/30 hover:bg-stone-800' 
                      : 'border-2 border-gray-200 hover:border-gold-500 hover:bg-gold-50'
                  }`}>
                    <div className={`p-3 rounded-lg mb-3 ${
                      isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                    }`}>
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>New Booking</span>
                  </button>
                  <button className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                    isDarkMode 
                      ? 'border border-stone-700 hover:border-gold-500/30 hover:bg-stone-800' 
                      : 'border-2 border-gray-200 hover:border-gold-500 hover:bg-gold-50'
                  }`}>
                    <div className={`p-3 rounded-lg mb-3 ${
                      isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                    }`}>
                      <Image className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Add Project</span>
                  </button>
                  <button className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                    isDarkMode 
                      ? 'border border-stone-700 hover:border-gold-500/30 hover:bg-stone-800' 
                      : 'border-2 border-gray-200 hover:border-gold-500 hover:bg-gold-50'
                  }`}>
                    <div className={`p-3 rounded-lg mb-3 ${
                      isDarkMode ? 'bg-gold-900/50' : 'bg-gold-100'
                    }`}>
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600" />
                    </div>
                    <span className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Settings</span>
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className={`rounded-2xl p-5 sm:p-6 ${
                isDarkMode 
                  ? 'bg-blue-900/20 border border-blue-800/50 text-blue-300' 
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                <h4 className={`font-bold mb-2 text-sm sm:text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                  Dashboard Under Development
                </h4>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Your admin dashboard is being built! More features and management tools will be added soon. 
                  For now, you have access to the complete ticketing-style admin panel functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
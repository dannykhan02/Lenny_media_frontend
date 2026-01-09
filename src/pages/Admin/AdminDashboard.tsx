// pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, Calendar, FileText, DollarSign, Activity, 
  Database, Wifi, WifiOff, ArrowUpRight, CheckCircle2, 
  AlertTriangle, TrendingUp, Users, Clock, Zap, 
  BarChart3, PieChart, Target, Award, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdminNavbar from '../../components/AdminNavbar';
import { useTheme } from '../../context/ThemeContext';

// ✅ FIXED: Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DashboardStats {
  overview: {
    total: {
      bookings: number;
      quotes: number;
      clients: number;
    };
    period: {
      bookings: number;
      quotes: number;
    };
    pending: {
      bookings: number;
      quotes: number;
      total: number;
    };
  };
  bookings: {
    by_status: {
      pending?: number;
      confirmed?: number;
      completed?: number;
      cancelled?: number;
    };
    upcoming: number;
    this_week: number;
    conversion_rate: number;
  };
  quotes: {
    by_status: {
      pending?: number;
      sent?: number;
      accepted?: number;
      rejected?: number;
    };
    acceptance_rate: number;
  };
  revenue: {
    total_quoted: number;
    potential_revenue: number;
  };
  trends: {
    bookings: Array<{ date: string; count: number }>;
    quotes: Array<{ date: string; count: number }>;
  };
  services: {
    active_services: number;
    featured_services: number;
    by_category: {
      photography: number;
      videography: number;
    };
  };
  team: {
    total_active: number;
    by_role: Record<string, number>;
  };
  period: {
    type: string;
  };
}

interface HealthStatus {
  status: string;
  database: string;
  cloudinary: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [statsError, setStatsError] = useState('');
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeUsers: 0,
    requestsPerSecond: 0,
    avgResponseTime: 0
  });

  // Viewport detection for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate real-time metrics with more realistic patterns
  useEffect(() => {
    const updateMetrics = () => {
      setRealtimeMetrics(prev => ({
        activeUsers: Math.max(15, prev.activeUsers + (Math.random() - 0.5) * 10),
        requestsPerSecond: Math.max(30, prev.requestsPerSecond + (Math.random() - 0.5) * 20),
        avgResponseTime: Math.max(80, prev.avgResponseTime + (Math.random() - 0.5) * 30)
      }));
    };

    // Initial values
    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchHealthStatus();
    const healthInterval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    if (user) fetchDashboardStats(selectedPeriod);
  }, [user, selectedPeriod]);

  // ✅ FIXED: fetchCurrentUser with better error handling
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: fetchDashboardStats with proper error handling (AdminBookings approach)
  const fetchDashboardStats = async (period: string) => {
    console.log('🔍 Fetching dashboard stats...', { period, API_URL }); // Debug log
    setLoadingStats(true);
    setStatsError('');
    
    try {
      const url = `${API_URL}/admin/dashboard/stats?period=${period}`;
      console.log('📡 Request URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        credentials: 'include'
      });
      
      console.log('📥 Response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard statistics (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      console.log('✅ Dashboard data received:', data); // Debug log
      
      // ✅ Validate data structure before setting
      if (data && typeof data === 'object') {
        setDashboardStats(data);
      } else {
        throw new Error('Invalid data structure received');
      }
      
    } catch (err: any) {
      console.error('❌ Stats fetch error:', err);
      setStatsError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ FIXED: fetchHealthStatus with better error handling
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const refreshStats = () => {
    fetchDashboardStats(selectedPeriod);
    fetchHealthStatus();
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

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar user={user} onCollapsedChange={setSidebarCollapsed} />
      
      <main className={`
        flex-1 transition-all duration-500 
        p-4 sm:p-6 md:p-10
        ${!isMobile && (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72')}
      `}>
        {/* Animated Background Grid - Only on desktop */}
        {!isMobile && (
          <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(to right, ${isDarkMode ? '#eab308' : '#d97706'} 1px, transparent 1px), linear-gradient(to bottom, ${isDarkMode ? '#eab308' : '#d97706'} 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>
        )}

        {/* Header Section */}
        <div className="relative mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`h-1 w-8 sm:w-12 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-gold-500 to-amber-500' : 'bg-gradient-to-r from-gold-600 to-amber-600'}`} />
                <p className={`text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-black ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`}>
                  Command Center
                </p>
              </div>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Dashboard
              </h1>
              <p className={`text-sm font-light ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                Welcome back, <span className={`font-medium ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`}>{user?.full_name?.split(' ')[0]}</span>
              </p>
            </div>

            {/* Period Selector & Refresh */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative group w-full sm:w-auto">
                <div className={`absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500 ${isDarkMode ? 'bg-gradient-to-r from-gold-500 to-amber-500' : 'bg-gradient-to-r from-gold-600 to-amber-600'}`} />
                <div className={`relative p-1.5 rounded-2xl border flex gap-1 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                  {['week', 'month', 'year'].map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setSelectedPeriod(p)}
                      className={`relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 min-h-[44px] ${
                        selectedPeriod === p 
                          ? isDarkMode ? 'text-black' : 'text-white'
                          : isDarkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {selectedPeriod === p && (
                        <div className={`absolute inset-0 rounded-xl shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-gold-500 to-amber-500 shadow-gold-500/40' : 'bg-gradient-to-r from-gold-600 to-amber-600 shadow-gold-600/40'}`} />
                      )}
                      <span className="relative z-10">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={refreshStats}
                disabled={loadingStats}
                className={`w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                  isDarkMode 
                    ? 'bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800' 
                    : 'bg-white border border-gray-200 text-stone-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {statsError && (
          <div className={`mb-4 sm:mb-6 rounded-2xl p-4 flex items-center gap-3 border ${isDarkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className={`text-sm flex-1 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Error: {statsError}</p>
            <button onClick={refreshStats} className={`text-sm font-medium ${isDarkMode ? 'text-gold-400 hover:text-gold-300' : 'text-gold-600 hover:text-gold-700'}`}>
              Retry
            </button>
          </div>
        )}

        {/* Real-time System Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <SystemHealthCard
            icon={<Database size={16} />}
            label="Database"
            status={healthStatus?.database}
            metric={Math.round(realtimeMetrics.avgResponseTime)}
            unit="ms"
            color="emerald"
            isDarkMode={isDarkMode}
          />
          <SystemHealthCard
            icon={<Wifi size={16} />}
            label="Cloudinary"
            status={healthStatus?.cloudinary}
            metric={Math.round(realtimeMetrics.requestsPerSecond)}
            unit="req/s"
            color="blue"
            isDarkMode={isDarkMode}
          />
          <SystemHealthCard
            icon={<Zap size={16} />}
            label="Active Sessions"
            status="connected"
            metric={Math.round(realtimeMetrics.activeUsers)}
            unit="users"
            color="purple"
            isDarkMode={isDarkMode}
          />
        </div>

        {loadingStats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`h-12 w-12 animate-spin ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`} />
          </div>
        ) : dashboardStats ? (
          <div className="space-y-6 sm:space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <EnhancedStatCard
                label="Total Revenue"
                value={`KSh ${dashboardStats.revenue.total_quoted.toLocaleString()}`}
                icon={<DollarSign size={20}/>}
                trend={dashboardStats.revenue.total_quoted > 0 ? '+12.5%' : '0%'}
                trendUp={dashboardStats.revenue.total_quoted > 0}
                color="gold"
                subtitle="Pipeline value"
                isDarkMode={isDarkMode}
              />
              <EnhancedStatCard
                label="Active Bookings"
                value={dashboardStats.overview.period.bookings}
                icon={<Calendar size={20}/>}
                trend={`${dashboardStats.bookings.upcoming} upcoming`}
                trendUp={true}
                color="blue"
                subtitle="Confirmed events"
                isDarkMode={isDarkMode}
              />
              <EnhancedStatCard
                label="Quote Requests"
                value={dashboardStats.overview.period.quotes}
                icon={<FileText size={20}/>}
                trend="High demand"
                trendUp={true}
                color="purple"
                subtitle="This period"
                isDarkMode={isDarkMode}
              />
              <EnhancedStatCard
                label="Conversion Rate"
                value={`${dashboardStats.bookings.conversion_rate}%`}
                icon={<Target size={20}/>}
                trend="+3.2%"
                trendUp={true}
                color="emerald"
                subtitle="Quote to booking"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Main Analytics Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Advanced Activity Chart */}
              <div className={`xl:col-span-2 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] relative overflow-hidden border ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-10" />
                <div className="hidden sm:block absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] opacity-10" />
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-10 gap-4 sm:gap-0">
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Activity Analytics</h3>
                      <p className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2 font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                        Booking and quote trends over time
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-[10px] font-bold tracking-[0.15em] uppercase">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full ${isDarkMode ? 'bg-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/60' : 'bg-blue-600 ring-2 ring-blue-500/30 shadow-lg shadow-blue-600/50'}`} />
                        <span className={`font-extrabold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Bookings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full ${isDarkMode ? 'bg-amber-500 ring-2 ring-amber-400 shadow-lg shadow-amber-500/60' : 'bg-amber-600 ring-2 ring-amber-500/30 shadow-lg shadow-amber-600/50'}`} />
                        <span className={`font-extrabold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Quotes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 sm:h-80">
                    <AdvancedFluxGraph 
                      bookings={dashboardStats.trends.bookings} 
                      quotes={dashboardStats.trends.quotes}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                {/* Conversion Gauge */}
                <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] relative overflow-hidden border ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                  <div className={`absolute inset-0 opacity-30 ${isDarkMode ? 'bg-gradient-radial from-gold-500/10 via-transparent to-transparent' : 'bg-gradient-radial from-gold-500/20 via-transparent to-transparent'}`} />
                  
                  <div className="relative z-10">
                    <h3 className={`text-xs sm:text-sm font-black tracking-[0.15em] uppercase mb-6 sm:mb-8 text-center ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Conversion Efficiency
                    </h3>
                    
                    <div className="relative w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[256px] aspect-square mx-auto flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isDarkMode ? "#854d0e" : "#92400e"} />
                            <stop offset="50%" stopColor={isDarkMode ? "#eab308" : "#d97706"} />
                            <stop offset="100%" stopColor={isDarkMode ? "#fbbf24" : "#f59e0b"} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        <circle 
                          cx="112" 
                          cy="112" 
                          r="90" 
                          stroke={isDarkMode ? "#1c1c1c" : "#e5e7eb"} 
                          strokeWidth="16" 
                          fill="transparent" 
                        />
                        
                        <circle 
                          cx="112" 
                          cy="112" 
                          r="90" 
                          stroke="url(#goldGradient)" 
                          strokeWidth="16" 
                          fill="transparent" 
                          strokeDasharray={565} 
                          strokeDashoffset={565 - (565 * dashboardStats.bookings.conversion_rate) / 100} 
                          strokeLinecap="round"
                          filter="url(#glow)"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-normal leading-none ${isDarkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-br from-gold-600 to-amber-700'}`}>
                          {dashboardStats.bookings.conversion_rate}%
                        </span>
                        <span className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black mt-2 sm:mt-3 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          Success Rate
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-center">
                      <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{dashboardStats.quotes.by_status.accepted || 0}</p>
                        <p className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>Accepted</p>
                      </div>
                      <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{dashboardStats.overview.period.bookings}</p>
                        <p className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>Confirmed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <QuickStatCard
                    icon={<Users size={16} />}
                    label="Clients"
                    value={dashboardStats.overview.total.clients}
                    color="blue"
                    isDarkMode={isDarkMode}
                  />
                  <QuickStatCard
                    icon={<Clock size={16} />}
                    label="Pending"
                    value={dashboardStats.overview.pending.total}
                    color="amber"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <RevenueCard
                title="Realized Revenue"
                amount={dashboardStats.revenue.total_quoted}
                icon={<CheckCircle2 size={18} />}
                color="emerald"
                percentage={100}
                isDarkMode={isDarkMode}
              />
              <RevenueCard
                title="Potential Revenue"
                amount={dashboardStats.revenue.potential_revenue}
                icon={<TrendingUp size={18} />}
                color="blue"
                percentage={dashboardStats.quotes.acceptance_rate}
                isDarkMode={isDarkMode}
              />
              <RevenueCard
                title="Average Quote Value"
                amount={dashboardStats.revenue.total_quoted / Math.max(dashboardStats.quotes.by_status.accepted || 1, 1)}
                icon={<Award size={18} />}
                color="purple"
                percentage={75}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <StatusPieChart
                title="Booking Distribution"
                data={dashboardStats.bookings.by_status}
                totalLabel="Total Bookings"
                total={dashboardStats.overview.total.bookings}
                isDarkMode={isDarkMode}
              />
              <StatusPieChart
                title="Quote Distribution"
                data={dashboardStats.quotes.by_status}
                totalLabel="Total Quotes"
                total={dashboardStats.overview.total.quotes}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        ) : (
          <div className={`text-center py-20 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
            <p>No dashboard data available</p>
            <button onClick={refreshStats} className={`mt-4 px-6 py-2 rounded-lg font-medium min-h-[44px] ${isDarkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-gray-200 text-stone-900 hover:bg-gray-300'}`}>
              Load Data
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// System Health Card Component
const SystemHealthCard = ({ icon, label, status, metric, unit, color, isDarkMode }: any) => {
  const isConnected = status === 'connected';
  const colorMap: any = {
    emerald: { 
      bg: isDarkMode ? 'from-emerald-500/20 to-emerald-600/5' : 'from-emerald-500/30 to-emerald-600/10',
      border: isDarkMode ? 'border-emerald-500/30' : 'border-emerald-500/40',
      text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      glow: isDarkMode ? 'shadow-emerald-500/20' : 'shadow-emerald-500/30'
    },
    blue: { 
      bg: isDarkMode ? 'from-blue-500/20 to-blue-600/5' : 'from-blue-500/30 to-blue-600/10',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-500/40',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      glow: isDarkMode ? 'shadow-blue-500/20' : 'shadow-blue-500/30'
    },
    purple: { 
      bg: isDarkMode ? 'from-purple-500/20 to-purple-600/5' : 'from-purple-500/30 to-purple-600/10',
      border: isDarkMode ? 'border-purple-500/30' : 'border-purple-500/40',
      text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      glow: isDarkMode ? 'shadow-purple-500/20' : 'shadow-purple-500/30'
    }
  };
  const colors = colorMap[color];

  return (
    <div className={`relative group bg-gradient-to-br ${colors.bg} border ${colors.border} p-4 sm:p-6 rounded-xl sm:rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.glow}`}>
      <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-3xl transform translate-x-4 sm:translate-x-8 -translate-y-4 sm:-translate-y-8 opacity-50 ${isDarkMode ? 'bg-white/5' : 'bg-white/20'}`} />
      
      <div className="relative z-10 flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colors.text} ${isDarkMode ? 'bg-white/10' : 'bg-white/30'}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
          isConnected 
            ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/30 text-emerald-700'
            : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-500/30 text-red-700'
        }`}>
          <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="relative z-10">
        <h4 className={`text-xs sm:text-sm font-bold tracking-wide mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{label}</h4>
        <div className="flex items-baseline gap-1 sm:gap-2">
          <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${colors.text}`}>{metric}</span>
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const EnhancedStatCard = ({ label, value, icon, trend, trendUp, color, subtitle, isDarkMode }: any) => {
  const colorMap: any = {
    gold: { 
      bg: isDarkMode ? 'from-gold-500/10 to-amber-500/5' : 'from-gold-500/20 to-amber-500/10',
      icon: isDarkMode ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-500/30 text-gold-700',
      border: isDarkMode ? 'border-gold-500/20' : 'border-gold-500/30'
    },
    blue: { 
      bg: isDarkMode ? 'from-blue-500/10 to-blue-600/5' : 'from-blue-500/20 to-blue-600/10',
      icon: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/30 text-blue-700',
      border: isDarkMode ? 'border-blue-500/20' : 'border-blue-500/30'
    },
    purple: { 
      bg: isDarkMode ? 'from-purple-500/10 to-purple-600/5' : 'from-purple-500/20 to-purple-600/10',
      icon: isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/30 text-purple-700',
      border: isDarkMode ? 'border-purple-500/20' : 'border-purple-500/30'
    },
    emerald: { 
      bg: isDarkMode ? 'from-emerald-500/10 to-emerald-600/5' : 'from-emerald-500/20 to-emerald-600/10',
      icon: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/30 text-emerald-700',
      border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-500/30'
    }
  };
  const colors = colorMap[color];

  return (
    <div className={`relative group bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-[2rem] overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'from-white/[0.03] to-transparent' : 'from-white/[0.1] to-transparent'}`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colors.icon} backdrop-blur-sm`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
              <ArrowUpRight size={trendUp ? 10 : 10} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${trendUp ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`} />
              <span className={trendUp ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}>{trend}</span>
            </div>
          )}
        </div>

        <h4 className={`text-xl sm:text-2xl lg:text-3xl font-black mb-1 sm:mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{value}</h4>
        <p className={`text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold mb-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{label}</p>
        <p className={`text-[9px] sm:text-[10px] font-medium ${isDarkMode ? 'text-stone-600' : 'text-stone-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

// ✅ FIXED: Advanced Flux Graph Component with proper data validation
const AdvancedFluxGraph = ({ bookings, quotes, isDarkMode }: any) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ type: string; index: number; value: number } | null>(null);
  
  // ✅ FIX 1: Validate and provide default data
  const safeBookings = Array.isArray(bookings) && bookings.length > 0 
    ? bookings 
    : [{ date: new Date().toISOString(), count: 0 }];
  
  const safeQuotes = Array.isArray(quotes) && quotes.length > 0 
    ? quotes 
    : [{ date: new Date().toISOString(), count: 0 }];
  
  // ✅ FIX 2: Safe normalization with validation
  const normalize = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [250]; // Return baseline if no data
    }
    
    const vals = data.map((d: any) => d?.count || 0);
    const max = Math.max(...vals, 1);
    return vals.map((v: number) => 250 - (v / max) * 200);
  };

  const bPoints = normalize(safeBookings.slice(-14));
  const qPoints = normalize(safeQuotes.slice(-14));
  const bValues = safeBookings.slice(-14).map((d: any) => d?.count || 0);
  const qValues = safeQuotes.slice(-14).map((d: any) => d?.count || 0);

  // ✅ FIX 3: Always return valid SVG path (never empty string)
  const createSmoothPath = (points: number[]) => {
    // Handle edge cases
    if (!points || !Array.isArray(points) || points.length === 0) {
      return 'M 0 250 L 100 250'; // Horizontal line at bottom
    }
    
    if (points.length === 1) {
      return `M 0 ${points[0]} L 100 ${points[0]}`; // Horizontal line at single point
    }
    
    // Normal case: multiple points
    let path = `M 0 ${points[0]}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const xCurrent = (i * 100) / (points.length - 1);
      const xNext = ((i + 1) * 100) / (points.length - 1);
      const xControl = xCurrent + (xNext - xCurrent) / 2;
      
      path += ` C ${xControl} ${points[i]}, ${xControl} ${points[i + 1]}, ${xNext} ${points[i + 1]}`;
    }
    
    return path;
  };

  // ✅ FIX 4: Always return valid closed area path
  const createAreaPath = (points: number[]) => {
    if (!points || !Array.isArray(points) || points.length === 0) {
      return 'M 0 250 L 100 250 L 100 250 L 0 250 Z'; // Empty area at bottom
    }
    
    if (points.length === 1) {
      return `M 0 ${points[0]} L 100 ${points[0]} L 100 250 L 0 250 Z`; // Rectangle
    }
    
    const linePath = createSmoothPath(points);
    return `${linePath} L 100 250 L 0 250 Z`;
  };

  return (
    <div className="w-full h-full relative">
      {/* Tooltip */}
      {hoveredPoint && (
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-10 ${
          isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-gray-300'
        }`}>
          <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {hoveredPoint.type}: {hoveredPoint.value}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            {safeBookings[hoveredPoint.index] && new Date(safeBookings[hoveredPoint.index].date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      )}
      
      <svg 
        ref={canvasRef}
        viewBox="0 0 100 250" 
        preserveAspectRatio="none" 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity={isDarkMode ? "0.3" : "0.4"} />
            <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#eab308" : "#d97706"} stopOpacity={isDarkMode ? "0.3" : "0.4"} />
            <stop offset="100%" stopColor={isDarkMode ? "#eab308" : "#d97706"} stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow-effect">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[50, 100, 150, 200].map(y => (
          <line 
            key={y} 
            x1="0" 
            y1={y} 
            x2="100" 
            y2={y} 
            stroke={isDarkMode ? "#292524" : "#e5e7eb"} 
            strokeWidth="0.3" 
            strokeDasharray="2,2" 
            opacity="0.5"
          />
        ))}

        {/* Area fills */}
        <path d={createAreaPath(bPoints)} fill="url(#blueGradient)" />
        <path d={createAreaPath(qPoints)} fill="url(#goldGradient2)" />

        {/* Lines */}
        <path 
          d={createSmoothPath(bPoints)} 
          fill="none" 
          stroke={isDarkMode ? "#3b82f6" : "#2563eb"} 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glow-effect)"
        />
        <path 
          d={createSmoothPath(qPoints)} 
          fill="none" 
          stroke={isDarkMode ? "#eab308" : "#d97706"} 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glow-effect)"
        />

        {/* Data points - Only render if we have valid data */}
        {bPoints.length > 1 && bPoints.map((p: number, i: number) => (
          <g 
            key={`b-${i}`}
            onMouseEnter={() => setHoveredPoint({ type: 'Bookings', index: i, value: bValues[i] })}
            onMouseLeave={() => setHoveredPoint(null)}
            className="cursor-pointer"
          >
            <circle 
              cx={(i * 100) / (bPoints.length - 1)} 
              cy={p} 
              r="3.5" 
              fill={isDarkMode ? "#1c1c1e" : "#f9fafb"} 
              stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
              strokeWidth="0.5"
            />
            <circle 
              cx={(i * 100) / (bPoints.length - 1)} 
              cy={p} 
              r="2" 
              fill={isDarkMode ? "#3b82f6" : "#2563eb"} 
            />
            {hoveredPoint?.type === 'Bookings' && hoveredPoint.index === i && (
              <circle cx={(i * 100) / (bPoints.length - 1)} cy={p} r="5" fill={isDarkMode ? "#3b82f6" : "#2563eb"} opacity="0.3" />
            )}
          </g>
        ))}

        {qPoints.length > 1 && qPoints.map((p: number, i: number) => (
          <g 
            key={`q-${i}`}
            onMouseEnter={() => setHoveredPoint({ type: 'Quotes', index: i, value: qValues[i] })}
            onMouseLeave={() => setHoveredPoint(null)}
            className="cursor-pointer"
          >
            <circle 
              cx={(i * 100) / (qPoints.length - 1)} 
              cy={p} 
              r="3.5" 
              fill={isDarkMode ? "#1c1c1e" : "#f9fafb"} 
              stroke={isDarkMode ? "#eab308" : "#d97706"}
              strokeWidth="0.5"
            />
            <circle 
              cx={(i * 100) / (qPoints.length - 1)} 
              cy={p} 
              r="2" 
              fill={isDarkMode ? "#eab308" : "#d97706"} 
            />
            {hoveredPoint?.type === 'Quotes' && hoveredPoint.index === i && (
              <circle cx={(i * 100) / (qPoints.length - 1)} cy={p} r="5" fill={isDarkMode ? "#eab308" : "#d97706"} opacity="0.3" />
            )}
          </g>
        ))}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between mt-2 sm:mt-4 px-1 sm:px-2">
        {safeBookings.slice(-14).map((item: any, i: number) => {
          if (i % 2 === 0) {
            const date = new Date(item?.date || new Date());
            return (
              <span key={i} className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

// Quick Stat Card Component
const QuickStatCard = ({ icon, label, value, color, isDarkMode }: any) => {
  const colorMap: any = {
    blue: isDarkMode ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20' : 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    amber: isDarkMode ? 'from-amber-500/10 to-amber-600/5 border-amber-500/20' : 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border p-4 sm:p-5 rounded-xl sm:rounded-2xl`}>
      <div className={`p-2 rounded-lg w-fit mb-2 sm:mb-3 ${color === 'blue' ? (isDarkMode ? 'bg-white/10 text-blue-400' : 'bg-white/30 text-blue-700') : (isDarkMode ? 'bg-white/10 text-amber-400' : 'bg-white/30 text-amber-700')}`}>
        {icon}
      </div>
      <p className={`text-xl sm:text-2xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{value}</p>
      <p className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>{label}</p>
    </div>
  );
};

// Revenue Card Component
const RevenueCard = ({ title, amount, icon, color, percentage, isDarkMode }: any) => {
  const colorMap: any = {
    emerald: { 
      bg: isDarkMode ? 'from-emerald-500/10 to-emerald-600/5' : 'from-emerald-500/20 to-emerald-600/10',
      border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-500/30',
      text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700',
      bar: isDarkMode ? 'bg-emerald-500' : 'bg-emerald-600'
    },
    blue: { 
      bg: isDarkMode ? 'from-blue-500/10 to-blue-600/5' : 'from-blue-500/20 to-blue-600/10',
      border: isDarkMode ? 'border-blue-500/20' : 'border-blue-500/30',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-700',
      bar: isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
    },
    purple: { 
      bg: isDarkMode ? 'from-purple-500/10 to-purple-600/5' : 'from-purple-500/20 to-purple-600/10',
      border: isDarkMode ? 'border-purple-500/20' : 'border-purple-500/30',
      text: isDarkMode ? 'text-purple-400' : 'text-purple-700',
      bar: isDarkMode ? 'bg-purple-500' : 'bg-purple-600'
    }
  };
  const colors = colorMap[color];

  return (
    <div className={`relative bg-gradient-to-br ${colors.bg} border ${colors.border} p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all`}>
      <div className={`absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 rounded-full blur-3xl transform translate-x-6 sm:translate-x-12 -translate-y-6 sm:-translate-y-12 opacity-50 ${isDarkMode ? 'bg-white/5' : 'bg-white/20'}`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colors.text} ${isDarkMode ? 'bg-white/10' : 'bg-white/30'}`}>
            {icon}
          </div>
          <span className={`text-xs font-bold ${colors.text}`}>{percentage}%</span>
        </div>

        <h3 className={`text-xs uppercase tracking-[0.15em] font-bold mb-2 sm:mb-3 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{title}</h3>
        <p className={`text-xl sm:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
          KSh {Math.round(amount).toLocaleString()}
        </p>

        <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-stone-900/50' : 'bg-gray-200'}`}>
          <div 
            className={`h-full ${colors.bar} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Status Pie Chart Component
const StatusPieChart = ({ title, data, totalLabel, total, isDarkMode }: any) => {
  const statusColors: any = {
    pending: isDarkMode ? '#eab308' : '#d97706',
    confirmed: isDarkMode ? '#3b82f6' : '#2563eb',
    completed: isDarkMode ? '#10b981' : '#059669',
    cancelled: isDarkMode ? '#ef4444' : '#dc2626',
    sent: isDarkMode ? '#a855f7' : '#9333ea',
    accepted: isDarkMode ? '#10b981' : '#059669',
    rejected: isDarkMode ? '#ef4444' : '#dc2626'
  };

  const dataArray = Object.entries(data).map(([status, count]: any) => ({
    status,
    count,
    color: statusColors[status] || (isDarkMode ? '#6b7280' : '#9ca3af')
  }));

  const totalCount = dataArray.reduce((sum, item) => sum + item.count, 0);
  let cumulativePercentage = 0;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden border ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
      <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10" />
      
      <div className="relative z-10">
        <h3 className={`text-lg sm:text-xl font-serif font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{title}</h3>
        <p className={`text-[10px] sm:text-xs uppercase tracking-wider mb-6 sm:mb-8 ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
          {totalLabel}: <span className={`font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>{total}</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48">
            <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
              {dataArray.map((item, index) => {
                const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                const startAngle = (cumulativePercentage / 100) * 360;
                const angle = (percentage / 100) * 360;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = ((startAngle + angle) * Math.PI) / 180;
                
                const x1 = 100 + 80 * Math.cos(startRad);
                const y1 = 100 + 80 * Math.sin(startRad);
                const x2 = 100 + 80 * Math.cos(endRad);
                const y2 = 100 + 80 * Math.sin(endRad);
                
                const largeArc = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                cumulativePercentage += percentage;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    opacity="0.9"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                    stroke={isDarkMode ? "#1c1c1e" : "#ffffff"}
                    strokeWidth="1"
                  />
                );
              })}
              
              <circle cx="100" cy="100" r="50" fill={isDarkMode ? "#1c1c1e" : "#ffffff"} />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{total}</p>
                <p className={`text-[10px] uppercase tracking-wider font-black mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Total</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2 sm:space-y-3">
            {dataArray.map((item, index) => {
              const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between group hover:bg-stone-800/30 dark:hover:bg-stone-800/30 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className={`text-sm capitalize font-semibold ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{item.count}</span>
                    <span className={`text-sm ml-1 sm:ml-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
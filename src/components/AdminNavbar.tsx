import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut,
  Home,
  Image,
  Bell,
  ChevronDown,
  DollarSign,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Briefcase,
  Clock,
  CheckCircle,
  CalendarDays,
  User,
  FileText,
  Loader2,
  AlertTriangle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

// ✅ FIXED: Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AdminNavbarProps {
  user: any;
  onCollapsedChange?: (collapsed: boolean) => void;
  bookingStats?: {
    pending: number;
    confirmed: number;
  };
  quoteStats?: {
    pending_count: number;
    time_conflicts_count: number;
    action_required_count: number;
  };
  notificationCount?: number;
  onNotificationClick?: () => void;
}

interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  avatar_public_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  can_login: boolean;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { name: string; path: string; icon?: React.ReactNode; badge?: number }[];
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ 
  user, 
  onCollapsedChange, 
  bookingStats,
  quoteStats,
  notificationCount = 0,
  onNotificationClick
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, getAccessToken } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // ✅ ADD: Ref-based mount tracking
  const isMountedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBookingFetchRef = useRef<number>(0);
  const lastQuoteFetchRef = useRef<number>(0);
  const lastNotificationFetchRef = useRef<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ FIXED: Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = getAccessToken();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, [getAccessToken]);

  // Local state for stats with auto-refresh
  const [localBookingStats, setLocalBookingStats] = useState(bookingStats || { pending: 0, confirmed: 0 });
  const [localQuoteStats, setLocalQuoteStats] = useState(quoteStats || {
    pending_count: 0,
    time_conflicts_count: 0,
    action_required_count: 0
  });
  const [localNotificationCount, setLocalNotificationCount] = useState(notificationCount);

  // ✅ REPLACE: fetchBookingStats with debounced version
  const fetchBookingStats = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastBookingFetchRef.current;
    
    // ✅ Debounce: Don't fetch if called within 5 seconds
    if (timeSinceLastFetch < 5000) {
      console.log(`⏭️ Skipping booking stats fetch (called ${timeSinceLastFetch}ms ago)`);
      return;
    }
    
    lastBookingFetchRef.current = now;
    
    try {
      const response = await fetch(`${API_URL}/admin/bookings/stats`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Booking stats returned ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      setLocalBookingStats({
        pending: data.stats?.pending || 0,
        confirmed: data.stats?.confirmed || 0
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch booking stats:', err);
      }
    }
  }, [getAuthHeaders]);

  // ✅ REPLACE: fetchQuoteStats with debounced version
  const fetchQuoteStats = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastQuoteFetchRef.current;
    
    // ✅ Debounce: Don't fetch if called within 5 seconds
    if (timeSinceLastFetch < 5000) {
      console.log(`⏭️ Skipping quote stats fetch (called ${timeSinceLastFetch}ms ago)`);
      return;
    }
    
    lastQuoteFetchRef.current = now;
    
    try {
      const response = await fetch(`${API_URL}/quotes/summary`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Quote stats returned ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      setLocalQuoteStats({
        pending_count: data.pending_count || 0,
        time_conflicts_count: data.time_conflicts_count || 0,
        action_required_count: data.action_required_count || 0
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch quote stats:', err);
      }
    }
  }, [getAuthHeaders]);

  // ✅ REPLACE: fetchNotificationCount with debounced version
  const fetchNotificationCount = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastNotificationFetchRef.current;
    
    // ✅ Debounce: Don't fetch if called within 5 seconds
    if (timeSinceLastFetch < 5000) {
      console.log(`⏭️ Skipping notification fetch (called ${timeSinceLastFetch}ms ago)`);
      return;
    }
    
    lastNotificationFetchRef.current = now;
    
    try {
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Notification count returned ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      setLocalNotificationCount(data.count || 0);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch notification count:', err);
      }
    }
  }, [getAuthHeaders]);

  // ✅ REPLACE: The entire stats fetching useEffect with this
  useEffect(() => {
    // ✅ CRITICAL: Prevent double execution in React Strict Mode
    if (isMountedRef.current) {
      console.log('⚠️ Already mounted, skipping duplicate initialization');
      return;
    }
    isMountedRef.current = true;

    console.log('✅ Initializing stats polling (2-minute interval)');

    // Initial fetch - with stagger to prevent thundering herd
    const initialFetch = async () => {
      setIsRefreshing(true);
      await fetchBookingStats();
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger 500ms
      await fetchQuoteStats();
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger 500ms
      await fetchNotificationCount();
      setIsRefreshing(false);
    };

    initialFetch();

    // ✅ Set up interval - 2 minutes (120000ms)
    intervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing stats (2-minute interval)');
      initialFetch();
    }, 120000); // 2 minutes

    // ✅ Cleanup function
    return () => {
      console.log('🧹 Cleaning up stats polling interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // ✅ CRITICAL: Empty dependency array

  // ✅ ADD: Manual refresh function
  const handleManualRefresh = useCallback(() => {
    if (!isRefreshing) {
      console.log('🔄 Manual refresh triggered');
      setIsRefreshing(true);
      Promise.all([
        fetchBookingStats(),
        fetchQuoteStats(),
        fetchNotificationCount()
      ]).finally(() => setIsRefreshing(false));
    }
  }, [fetchBookingStats, fetchQuoteStats, fetchNotificationCount, isRefreshing]);

  // ✅ MODIFIED: Fetch profile using token-based authentication
  useEffect(() => {
    const fetchProfileFromMe = async () => {
      setProfileLoading(true);
      setProfileError('');
      
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const profileData: ProfileData = {
          id: data.id || user?.id || 0,
          email: data.email || user?.email || 'admin@lennymedia.co.ke',
          full_name: data.full_name || user?.full_name || 'Admin',
          role: data.role || user?.role || 'ADMIN',
          phone: data.phone || user?.phone || null,
          avatar_url: data.avatar_url || user?.avatar_url || null,
          avatar_public_id: data.avatar_public_id || user?.avatar_public_id || null,
          is_active: data.is_active !== undefined ? data.is_active : (user?.is_active !== undefined ? user.is_active : true),
          created_at: data.created_at || user?.created_at || new Date().toISOString(),
          updated_at: data.updated_at || user?.updated_at || new Date().toISOString(),
          last_login: data.last_login || user?.last_login || null,
          can_login: data.can_login !== undefined ? data.can_login : (user?.can_login !== undefined ? user.can_login : true)
        };
        
        setProfile(profileData);
        
      } catch (error) {
        console.error('Failed to fetch admin profile from /api/auth/me:', error);
        setProfileError('Failed to load profile data');
        
        // Fallback to user prop if available
        if (user) {
          const fallbackProfile: ProfileData = {
            id: user.id || 0,
            email: user.email || 'admin@lennymedia.co.ke',
            full_name: user.full_name || 'Admin',
            role: user.role || 'ADMIN',
            phone: user.phone || null,
            avatar_url: user.avatar_url || null,
            avatar_public_id: user.avatar_public_id || null,
            is_active: user.is_active !== undefined ? user.is_active : true,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || new Date().toISOString(),
            last_login: user.last_login || null,
            can_login: user.can_login !== undefined ? user.can_login : true
          };
          setProfile(fallbackProfile);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchProfileFromMe();
    }
  }, [user, getAuthHeaders]);

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      const timestamp = new Date().getTime();
      return `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}t=${timestamp}`;
    }
    return null;
  };

  useEffect(() => {
    const newExpandedMenus = new Set<string>();
    
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (subItem) => location.pathname === subItem.path || location.pathname.startsWith(subItem.path)
        );
        const isMainPathActive = location.pathname.startsWith(item.path);
        if (hasActiveSubItem || isMainPathActive) {
          newExpandedMenus.add(item.name);
        }
      }
    });
    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  }, [collapsed, onCollapsedChange]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  // Navigation items structure with Booking Cleanup subitem
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <Calendar className="h-5 w-5" />,
      subItems: [
        { 
          name: 'All Bookings', 
          path: '/admin/bookings',
          icon: <Calendar className="h-4 w-4" />
        },
        { 
          name: 'Pending', 
          path: '/admin/bookings/pending',
          icon: <Clock className="h-4 w-4" />,
          badge: localBookingStats.pending || 0
        },
        { 
          name: 'Confirmed', 
          path: '/admin/bookings/confirmed',
          icon: <CheckCircle className="h-4 w-4" />,
          badge: localBookingStats.confirmed || 0
        },
        { 
          name: 'Calendar View', 
          path: '/admin/bookings/calendar',
          icon: <CalendarDays className="h-4 w-4" />
        },
        { 
          name: 'Booking Cleanup', 
          path: '/admin/bookings/cleanup',
          icon: <Trash2 className="h-4 w-4" />,
        },
      ]
    },
    {
      name: 'Quotes',
      path: '/admin/quotes',
      icon: <DollarSign className="h-5 w-5" />,
      subItems: [
        { 
          name: 'All Quotes', 
          path: '/admin/quotes',
          icon: <FileText className="h-4 w-4" />,
          badge: localQuoteStats.pending_count || 0
        },
        { 
          name: 'Calendar View', 
          path: '/admin/quotes/calendar',
          icon: <CalendarDays className="h-4 w-4" />
        },
      ]
    },
    {
      name: 'Portfolio',
      path: '/admin/portfolio',
      icon: <Image className="h-5 w-5" />,
      subItems: [
        { name: 'All Items', path: '/admin/portfolio/items' },
        { name: 'Add New', path: '/admin/portfolio/add' },
        { name: 'Categories', path: '/admin/portfolio/categories' },
      ]
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { 
          name: 'All Users', 
          path: '/admin/users',
          icon: <Users className="h-4 w-4" />
        },
        { 
          name: 'My Profile', 
          path: '/admin/profile',
          icon: <User className="h-4 w-4" />
        },
      ]
    },
  ];

  const isActive = (path: string): boolean => {
    if (location.pathname === path) return true;
    if (path === '/admin/quotes' && location.pathname === '/admin/quotes') return true;
    return false;
  };
  
  const isPathActive = (path: string): boolean => {
    if (path === '/admin/dashboard' || path === '/admin/services' || path === '/admin/portfolio') {
      return location.pathname === path;
    }
    if (path === '/admin/quotes') return location.pathname.startsWith('/admin/quotes');
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      navigate('/admin/bookings?status=PENDING');
    }
  };

  // ✅ FIXED: Added proper type for the image error event
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget as HTMLImageElement;
    target.style.display = 'none';
    const fallbackDiv = target.parentElement?.querySelector('.avatar-fallback') as HTMLDivElement | null;
    if (fallbackDiv) fallbackDiv.style.display = 'flex';
  };

  const renderProfileSection = () => {
    if (profileLoading) {
      return (
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-gray-200'} animate-pulse flex items-center justify-center`}>
            <Loader2 className="h-5 w-5 text-stone-400 animate-spin" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 space-y-2">
              <div className={`h-3 ${isDarkMode ? 'bg-stone-700' : 'bg-gray-200'} rounded animate-pulse w-24`}></div>
              <div className={`h-2 ${isDarkMode ? 'bg-stone-700' : 'bg-gray-200'} rounded animate-pulse w-32`}></div>
            </div>
          )}
        </div>
      );
    }

    const avatarUrl = getAvatarUrl();
    const fullName = profile?.full_name || user?.full_name || 'Admin';
    const email = profile?.email || user?.email || 'admin@lennymedia.co.ke';
    const role = profile?.role || user?.role || 'ADMIN';
    const initials = getInitials(fullName);

    return (
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gold-500"
              onError={handleImageError}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-stone-900 font-bold text-lg border-2 border-gold-500 ${avatarUrl ? 'hidden avatar-fallback' : ''}`}>
            {initials}
          </div>
          {(profile?.is_active || user?.is_active) && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-stone-900"></div>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold truncate text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{fullName}</h3>
              <p className={`text-xs truncate ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{email}</p>
              <p className={`text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full inline-block ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>{role}</p>
            </div>
            {/* ✅ ADD: Manual refresh button */}
            <button 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              } ${isDarkMode ? 'text-stone-400 hover:bg-stone-800 hover:text-white' : 'text-stone-500 hover:bg-gray-100 hover:text-stone-900'}`}
              title="Refresh stats"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleNotificationClick}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 relative ${isDarkMode ? 'text-stone-400 hover:bg-stone-800 hover:text-white' : 'text-stone-500 hover:bg-gray-100 hover:text-stone-900'}`}
              title={localNotificationCount > 0 ? `${localNotificationCount} items need attention` : 'Notifications'}
            >
              <Bell className="h-5 w-5" />
              {localNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold animate-pulse">
                  {localNotificationCount > 99 ? '99+' : localNotificationCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        className={`lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-lg shadow-lg transition-colors ${isDarkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-white text-stone-900 hover:bg-gray-50 shadow-md'}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
        {/* Mobile notification indicator on hamburger menu */}
        {localNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={closeSidebar} />
      )}

      <aside className={`flex flex-col border-r fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} lg:translate-x-0 ${collapsed ? "lg:w-16" : "lg:w-72"} w-72 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
        <div className={`border-b transition-colors duration-300 flex-shrink-0 ${isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'} ${collapsed ? 'p-2' : 'p-4'}`}>
          {renderProfileSection()}
        </div>

        <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 h-16 flex-shrink-0 ${isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'}`}>
          {!collapsed ? (
            <>
              <Link to="/admin/dashboard" className="flex items-center gap-3 group flex-1 min-w-0" onClick={closeSidebar}>
                <div className="p-2 rounded-xl group-hover:bg-gold-500/10 transition-all duration-300 flex-shrink-0">
                  <img 
                    src="/images/lenny-logo.png" 
                    alt="Lenny Media Kenya" 
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-serif text-lg font-bold tracking-tight block truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Lenny<span className="text-gold-500">Media</span></span>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Admin Panel</span>
                </div>
              </Link>
              <button className={`hidden lg:flex p-2 rounded-lg transition-colors flex-shrink-0 ml-auto ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'}`} onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
                <ChevronLeft size={20} />
              </button>
              <button className={`lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 ml-auto ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'}`} onClick={closeSidebar} aria-label="Close sidebar">
                <X size={20} />
              </button>
            </>
          ) : (
            <button className={`hidden lg:flex p-2 rounded-lg transition-colors mx-auto ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'}`} onClick={() => setCollapsed(!collapsed)} aria-label="Expand sidebar">
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto py-4 px-2 space-y-1 ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
          {!collapsed && <h4 className={`text-xs font-semibold uppercase tracking-wider px-3 mb-3 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Navigation</h4>}
          {navItems.map((item) => {
            const active = isActive(item.path) || isPathActive(item.path);
            const isMenuExpanded = expandedMenus.has(item.name);
            
            // Calculate parent notification badge
            let parentNotificationCount = 0;
            if (item.name === 'Quotes') {
              parentNotificationCount = localQuoteStats.pending_count;
            } else if (item.name === 'Bookings') {
              parentNotificationCount = localBookingStats.pending;
            }
            
            return (
              <div key={item.name}>
                <div className="relative">
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (item.subItems && item.subItems.length > 0) {
                        e.preventDefault();
                        toggleMenu(item.name);
                      } else {
                        closeSidebar();
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${collapsed ? 'justify-center' : ''} ${active ? (isDarkMode ? 'bg-stone-800 text-white border-l-4 border-white' : 'bg-gray-100 text-stone-900 border-l-4 border-stone-900') : (isDarkMode ? 'text-stone-400 hover:bg-stone-800 hover:text-white border-l-4 border-transparent' : 'text-stone-600 hover:bg-gray-100 border-l-4 border-transparent')}`}
                    title={collapsed ? item.name : ''}
                  >
                    <div className="h-5 w-5 flex-shrink-0 relative">
                      {item.icon}
                      {collapsed && parentNotificationCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-bold">
                          {parentNotificationCount > 9 ? '9+' : parentNotificationCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {parentNotificationCount > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-bold ${
                            isDarkMode ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {parentNotificationCount > 9 ? '9+' : parentNotificationCount}
                          </span>
                        )}
                        {item.subItems && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(item.name); }} className={`p-1 rounded transition-colors flex-shrink-0 ${isDarkMode ? 'hover:bg-stone-700' : 'hover:bg-gray-200'}`}>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isMenuExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </>
                    )}
                  </Link>
                </div>
                {!collapsed && item.subItems && isMenuExpanded && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = isActive(subItem.path) || isPathActive(subItem.path);
                      return (
                        <Link key={subItem.name} to={subItem.path} onClick={closeSidebar} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group relative ${isSubActive ? (isDarkMode ? 'text-white font-medium bg-stone-800' : 'text-stone-900 font-medium bg-gray-100') : (isDarkMode ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-700 hover:bg-gray-50')}`}>
                          {subItem.icon && <div className={`flex-shrink-0 ${isSubActive ? (isDarkMode ? 'text-white' : 'text-stone-900') : (isDarkMode ? 'text-stone-500' : 'text-stone-400')}`}>{subItem.icon}</div>}
                          <span className="flex-1 truncate">{subItem.name}</span>
                          {subItem.badge !== undefined && subItem.badge > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-bold ${
                              isSubActive 
                                ? (isDarkMode ? 'bg-red-500 text-white' : 'bg-red-500 text-white')
                                : (isDarkMode ? 'bg-red-500/80 text-white' : 'bg-red-500/80 text-white')
                            }`}>
                              {subItem.badge > 99 ? '99+' : subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`border-t transition-colors duration-300 flex-shrink-0 ${isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'} ${collapsed ? 'p-2 space-y-2' : 'p-4 space-y-2'}`}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 rounded-lg transition-colors ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`} title={collapsed ? 'View Website' : ''}>
            <Home className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">View Website</span>}
          </a>
          
          {/* ✅ FIXED: This was the problematic Link - line 780 issue */}
          <Link 
            to="/admin/profile" 
            onClick={closeSidebar} 
            className={`flex items-center gap-3 rounded-lg transition-colors ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${isActive('/admin/profile') ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-gray-100 text-stone-900') : (isDarkMode ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900')}`} 
            title={collapsed ? 'My Profile' : ''}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">My Profile</span>}
          </Link>
          
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 rounded-lg transition-colors ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${isDarkMode ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900'}`} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            {isDarkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 rounded-lg transition-colors ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`} title="Logout">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          {!collapsed && (
            <div className={`mt-6 pt-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-stone-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between px-3">
                <p className="text-xs text-stone-500">Admin Panel v1.0</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-stone-500">Online</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminNavbar;
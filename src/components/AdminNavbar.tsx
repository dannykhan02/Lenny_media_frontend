// components/AdminNavbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Home,
  MessageSquare,
  Image,
  Camera,
  Bell,
  ChevronDown,
  GraduationCap,
  DollarSign,
  Mail,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { name: string; path: string; icon?: React.ReactNode; badge?: number }[];
}

interface AdminNavbarProps {
  user: any;
  onCollapsedChange?: (collapsed: boolean) => void;
  bookingStats?: {
    pending: number;
    confirmed: number;
  };
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onCollapsedChange, bookingStats }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, refreshAuth } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  }, [collapsed, onCollapsedChange]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
          badge: bookingStats?.pending || 0
        },
        { 
          name: 'Confirmed', 
          path: '/admin/bookings/confirmed',
          icon: <CheckCircle className="h-4 w-4" />,
          badge: bookingStats?.confirmed || 0
        },
        { 
          name: 'Calendar View', 
          path: '/admin/bookings/calendar',
          icon: <CalendarDays className="h-4 w-4" />
        },
      ]
    },
    {
      name: 'Quote Requests',
      path: '/admin/quotes',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="h-5 w-5" />,
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
      name: 'Training',
      path: '/admin/training',
      icon: <GraduationCap className="h-5 w-5" />,
      subItems: [
        { name: 'Enrollments', path: '/admin/training/enrollments' },
        { name: 'Cohorts', path: '/admin/training/cohorts' },
      ]
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: 'Users & Staff',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { name: 'All Users', path: '/admin/users' },
        { name: 'Staff Members', path: '/admin/users/staff' },
        { name: 'Clients', path: '/admin/users/clients' },
        { name: 'Add New', path: '/admin/users/add' },
      ]
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: <FileText className="h-5 w-5" />,
      subItems: [
        { name: 'Blog Posts', path: '/admin/content/blog' },
        { name: 'Testimonials', path: '/admin/content/testimonials' },
        { name: 'FAQ', path: '/admin/content/faq' },
      ]
    },
    {
      name: 'Email Logs',
      path: '/admin/emails',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      subItems: [
        { name: 'Business Info', path: '/admin/settings/business' },
        { name: 'General', path: '/admin/settings/general' },
        { name: 'Email Templates', path: '/admin/settings/email-templates' },
        { name: 'Notifications', path: '/admin/settings/notifications' },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isPathActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await logout();
      refreshAuth();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        className={`lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-lg shadow-lg transition-colors ${
          isDarkMode 
            ? 'bg-stone-800 text-white hover:bg-stone-700' 
            : 'bg-white text-stone-900 hover:bg-gray-50 shadow-md'
        }`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop with blur for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex 
          flex-col 
          border-r
          fixed
          top-0
          left-0
          z-50
          h-screen
          transition-all 
          duration-300 
          ease-in-out
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "lg:w-16" : "lg:w-72"}
          w-72
          ${isDarkMode 
            ? 'bg-stone-900 border-stone-800' 
            : 'bg-white border-gray-200'}
        `}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 h-16 flex-shrink-0 ${
          isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'
        }`}>
          {!collapsed ? (
            <>
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-3 group flex-1 min-w-0"
                onClick={closeSidebar}
              >
                <div className={`p-2 rounded-xl group-hover:bg-gold-500 group-hover:text-stone-900 transition-all duration-300 flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-stone-800 text-gold-500' 
                    : 'bg-stone-900 text-gold-500'
                }`}>
                  <Camera className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-serif text-lg font-bold tracking-tight block truncate ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}>
                    Lenny<span className="text-gold-500">Media</span>
                  </span>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    Admin Panel
                  </span>
                </div>
              </Link>

              {/* Collapse button - visible on desktop when expanded */}
              <button
                className={`hidden lg:flex p-2 rounded-lg transition-colors flex-shrink-0 ml-auto ${
                  isDarkMode 
                    ? 'hover:bg-stone-800 text-stone-400' 
                    : 'hover:bg-gray-100 text-stone-600'
                }`}
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Close button - only visible on mobile */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 ml-auto ${
                  isDarkMode 
                    ? 'hover:bg-stone-800 text-stone-400' 
                    : 'hover:bg-gray-100 text-stone-600'
                }`}
                onClick={closeSidebar}
                aria-label="Close sidebar"
                title="Close sidebar"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            /* When collapsed - show only expand button centered */
            <>
              <button
                className={`hidden lg:flex p-2 rounded-lg transition-colors mx-auto ${
                  isDarkMode 
                    ? 'hover:bg-stone-800 text-stone-400' 
                    : 'hover:bg-gray-100 text-stone-600'
                }`}
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Mobile close button when collapsed */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ml-auto ${
                  isDarkMode 
                    ? 'hover:bg-stone-800 text-stone-400' 
                    : 'hover:bg-gray-100 text-stone-600'
                }`}
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>

        {/* User Profile Section */}
        <div className={`border-b transition-colors duration-300 flex-shrink-0 ${
          isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'
        } ${collapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate text-sm ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}>
                    {user?.full_name || 'Admin'}
                  </h3>
                  <p className={`text-xs truncate ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    {user?.email || 'admin@lennymedia.co.ke'}
                  </p>
                </div>
                <button className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  isDarkMode 
                    ? 'text-stone-400 hover:bg-stone-800 hover:text-white' 
                    : 'text-stone-500 hover:bg-gray-100'
                }`}>
                  <Bell className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 px-2 space-y-1 ${
          isDarkMode ? 'bg-stone-900' : 'bg-white'
        }`}>
          {!collapsed && (
            <h4 className={`text-xs font-semibold uppercase tracking-wider px-3 mb-3 ${
              isDarkMode ? 'text-stone-500' : 'text-stone-400'
            }`}>
              Navigation
            </h4>
          )}
          {navItems.map((item) => {
            const active = isActive(item.path) || isPathActive(item.path);
            const isMenuExpanded = expandedMenus.has(item.name);
            
            return (
              <div key={item.name}>
                <div className="relative">
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${collapsed ? 'justify-center' : ''}  ${
                      active
                        ? isDarkMode 
                          ? 'bg-white text-black' 
                          : 'bg-black text-white'
                        : `${
                            isDarkMode 
                              ? 'text-stone-400 hover:bg-stone-800 hover:text-white' 
                              : 'text-stone-600 hover:bg-gray-100'
                          }`
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <div className="h-5 w-5 flex-shrink-0">
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.subItems && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleMenu(item.name);
                            }}
                            className={`p-1 rounded transition-colors flex-shrink-0 ${
                              isDarkMode 
                                ? 'hover:bg-stone-700' 
                                : 'hover:bg-gray-200'
                            }`}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              isMenuExpanded ? 'rotate-180' : ''
                            }`} />
                          </button>
                        )}
                      </>
                    )}
                  </Link>
                </div>
                
                {/* Sub-items */}
                {!collapsed && item.subItems && isMenuExpanded && (
                  <div className="ml-11 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = isActive(subItem.path) || isPathActive(subItem.path);
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={closeSidebar}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group relative ${
                            isSubActive
                              ? isDarkMode
                                ? 'text-gold-400 font-medium bg-gold-500/10'
                                : 'text-gold-600 font-medium bg-gold-50'
                              : `${
                                  isDarkMode 
                                    ? 'text-stone-400 hover:text-white hover:bg-stone-800' 
                                    : 'text-stone-500 hover:text-stone-700 hover:bg-gray-50'
                                }`
                          }`}
                        >
                          {subItem.icon && (
                            <div className={`flex-shrink-0 ${isSubActive ? 'text-gold-500' : isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              {subItem.icon}
                            </div>
                          )}
                          <span className="flex-1 truncate">{subItem.name}</span>
                          {subItem.badge !== undefined && subItem.badge > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                              isDarkMode
                                ? 'bg-gold-500/20 text-gold-400'
                                : 'bg-gold-100 text-gold-700'
                            }`}>
                              {subItem.badge}
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

        {/* Footer Actions */}
        <div className={`border-t transition-colors duration-300 flex-shrink-0 ${
          isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-gray-100 bg-white'
        } ${collapsed ? 'p-2 space-y-2' : 'p-4 space-y-2'}`}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-lg transition-colors ${
              collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
            } ${
              isDarkMode 
                ? 'text-stone-400 hover:bg-stone-800 hover:text-white' 
                : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900'
            }`}
            title={collapsed ? 'View Website' : ''}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">View Website</span>}
          </a>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
              collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
            } ${
              isDarkMode 
                ? 'text-stone-300 hover:bg-stone-800' 
                : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900'
            }`}
            aria-label="Toggle theme"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
              collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
            } ${
              isDarkMode 
                ? 'text-red-400 hover:bg-red-500/10' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>

          {!collapsed && (
            <div className={`mt-6 pt-4 border-t transition-colors duration-300 ${
              isDarkMode ? 'border-stone-800' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between px-3">
                <p className={`text-xs ${
                  isDarkMode ? 'text-stone-500' : 'text-stone-500'
                }`}>
                  Admin Panel v1.0
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-stone-500' : 'text-stone-500'
                  }`}>
                    Online
                  </span>
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
// components/AdminNavbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  BarChart3,
  MessageSquare,
  Image,
  Camera,
  Bell,
  ChevronDown,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { name: string; path: string }[];
}

const AdminNavbar: React.FC<{ user: any }> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, refreshAuth } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update document class and localStorage
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Portfolio',
      path: '/admin/portfolio',
      icon: <Image className="h-5 w-5" />,
      subItems: [
        { name: 'All Projects', path: '/admin/portfolio/projects' },
        { name: 'Add New', path: '/admin/portfolio/add' },
        { name: 'Categories', path: '/admin/portfolio/categories' },
      ]
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: <FileText className="h-5 w-5" />,
      subItems: [
        { name: 'Pages', path: '/admin/content/pages' },
        { name: 'Blog', path: '/admin/content/blog' },
        { name: 'Testimonials', path: '/admin/content/testimonials' },
      ]
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      subItems: [
        { name: 'General', path: '/admin/settings/general' },
        { name: 'Services', path: '/admin/settings/services' },
        { name: 'Brands', path: '/admin/settings/brands' },
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
    <div className="flex h-screen">
      {/* Sidebar - Updated with dark mode support */}
      <div className={`w-72 flex flex-col shadow-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-stone-950 border-stone-800' 
          : 'bg-white border-gray-200'
      } border-r`}>
        {/* Logo Section */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-stone-800' : 'border-gray-100'
        }`}>
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className={`p-3 rounded-xl group-hover:bg-gold-500 group-hover:text-stone-900 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-stone-800 text-gold-500' 
                : 'bg-stone-900 text-gold-500'
            }`}>
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <span className={`font-serif text-2xl font-bold tracking-tight block ${
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
        </div>

        {/* User Profile Section */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-stone-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold truncate ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                {user?.full_name || 'Admin'}
              </h3>
              <p className={`text-sm truncate ${
                isDarkMode ? 'text-stone-400' : 'text-stone-500'
              }`}>
                {user?.email || 'admin@lennymedia.co.ke'}
              </p>
            </div>
            <button className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-stone-400 hover:bg-stone-800 hover:text-white' 
                : 'text-stone-500 hover:bg-gray-100'
            }`}>
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <h4 className={`text-xs font-semibold uppercase tracking-wider px-4 mb-3 ${
            isDarkMode ? 'text-stone-500' : 'text-stone-400'
          }`}>
            Navigation
          </h4>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border-l-4 ${
                    isActive(item.path) || isPathActive(item.path)
                      ? 'bg-gradient-to-r from-gold-50 to-gold-100 border-gold-500 text-gold-700 font-semibold dark:from-gold-500/10 dark:to-gold-500/5 dark:text-gold-400 dark:border-gold-500'
                      : `border-transparent ${
                          isDarkMode 
                            ? 'text-stone-300 hover:bg-stone-800' 
                            : 'text-stone-700 hover:bg-gray-50 hover:text-stone-900'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${
                      isActive(item.path) || isPathActive(item.path)
                        ? 'bg-gold-500 text-white dark:bg-gold-500'
                        : `${
                            isDarkMode 
                              ? 'bg-stone-800 text-stone-400' 
                              : 'bg-gray-100 text-stone-600'
                          }`
                    }`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.subItems && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      isActive(item.path) || isPathActive(item.path) ? 'rotate-180' : ''
                    } ${
                      isDarkMode ? 'text-stone-400' : 'text-stone-500'
                    }`} />
                  )}
                </Link>
                
                {/* Sub-items */}
                {item.subItems && (isActive(item.path) || isPathActive(item.path)) && (
                  <ul className="ml-14 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'text-gold-600 font-medium bg-gold-50 dark:text-gold-400 dark:bg-gold-500/10'
                              : `${
                                  isDarkMode 
                                    ? 'text-stone-400 hover:text-white hover:bg-stone-800' 
                                    : 'text-stone-500 hover:text-stone-700 hover:bg-gray-50'
                                }`
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isActive(subItem.path) 
                              ? 'bg-gold-500' 
                              : isDarkMode 
                                ? 'bg-stone-700' 
                                : 'bg-gray-300'
                          }`}></div>
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className={`p-4 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-stone-800' : 'border-gray-100'
        }`}>
          <div className="space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'text-stone-400 hover:bg-stone-800 hover:text-white' 
                  : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800' 
                  : 'bg-gray-100'
              }`}>
                <Home className="h-4 w-4" />
              </div>
              <span className="font-medium">View Website</span>
            </a>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-colors ${
                isDarkMode 
                  ? 'text-stone-300 hover:bg-stone-800' 
                  : 'text-stone-600 hover:bg-gray-50 hover:text-stone-900'
              }`}
              aria-label="Toggle theme"
            >
              <div className={`p-1.5 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800 text-gold-500' 
                  : 'bg-gray-100 text-stone-600'
              }`}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </div>
              <span className="font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-500/10' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                isDarkMode 
                  ? 'bg-red-500/20' 
                  : 'bg-red-100'
              }`}>
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
          
          <div className={`mt-6 pt-4 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-stone-800' : 'border-gray-100'
          }`}>
            <div className="flex items-center justify-between px-4">
              <p className={`text-xs ${
                isDarkMode ? 'text-stone-500' : 'text-stone-500'
              }`}>
                Admin Panel v1.0
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-xs ${
                  isDarkMode ? 'text-stone-500' : 'text-stone-500'
                }`}>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
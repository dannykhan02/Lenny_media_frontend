// components/AdminAuthLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sun, Moon } from 'lucide-react';

const AdminAuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-stone-950 to-stone-900' 
        : 'bg-gradient-to-br from-stone-50 to-gray-100'
    }`}>
      {/* Header for auth pages */}
      <header className={`shadow-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-stone-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-stone-800 text-gold-500' 
                  : 'bg-stone-900 text-gold-500'
              }`}>
                <Camera className="h-6 w-6" />
              </div>
              <span className={`font-serif text-xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                Lenny<span className="text-gold-500">Media</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className={`text-sm ${
                isDarkMode ? 'text-stone-400' : 'text-stone-600'
              }`}>
                Admin Access
              </div>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-gold-500 hover:bg-stone-800' 
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      
      {/* Optional footer */}
      <footer className={`py-6 text-center transition-colors duration-300 ${
        isDarkMode ? 'text-stone-500' : 'text-stone-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm">
            © {new Date().getFullYear()} Lenny Media Admin Panel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminAuthLayout;
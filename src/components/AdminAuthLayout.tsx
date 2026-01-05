import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminAuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-stone-950 to-stone-900' 
        : 'bg-gradient-to-br from-stone-50 to-gray-100'
    }`}>
      {/* Header for auth pages */}
      <header className={`shadow-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
      } border-b`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              {/* Logo Image - Same as Navbar */}
              <div className="p-2 rounded-lg group-hover:bg-gold-500/10 transition-colors duration-300">
                <img 
                  src="/images/lenny-logo.png" 
                  alt="Lenny Media Kenya" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className={`font-serif text-2xl font-bold tracking-tight ${
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
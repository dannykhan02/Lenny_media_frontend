import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading, adminExists } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Our Work', path: '/portfolio' },
    { name: 'School', path: '/school' },
    { name: 'Brands', path: '/brands' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Only show admin registration links when:
  // 1. We're not loading
  // 2. There's no user logged in
  // 3. We know for sure that no admin exists
  const showAdminRegistration = !isLoading && !user && adminExists === false;

  // Always show admin login button when admin exists (or we're still checking)
  const showAdminLogin = !isLoading && adminExists !== false;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="bg-stone-900 text-gold-500 p-2 rounded-lg group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors duration-300">
              <Camera className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              Lenny<span className="text-gold-500">Media</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-end overflow-x-auto">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path) 
                      ? 'text-stone-900 font-bold bg-stone-50' 
                      : link.path === '/school' 
                        ? 'text-gold-600 font-bold hover:text-gold-700 hover:bg-gold-50'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  } px-2 xl:px-3 py-2.5 rounded-full font-medium transition-all duration-200 text-xs xl:text-sm tracking-wide whitespace-nowrap`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center ml-3 gap-2">
              <Link
                to="/quote"
                className="bg-stone-100 text-stone-900 border border-stone-200 px-4 xl:px-6 py-2.5 rounded-full font-bold text-xs xl:text-sm tracking-wide hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm whitespace-nowrap"
              >
                Get Quote
              </Link>
              
              <Link
                to="/booking"
                className="bg-gold-500 text-stone-900 px-5 xl:px-7 py-2.5 rounded-full font-bold text-xs xl:text-sm tracking-wide shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-105 hover:bg-gold-400 transition-all duration-300 whitespace-nowrap"
              >
                Book Now
              </Link>
              
              {/* Admin Registration Button - only show when no admin exists */}
              {showAdminRegistration && (
                <Link
                  to="/admin/register"
                  className="bg-purple-500 text-white px-4 xl:px-5 py-2.5 rounded-full font-bold text-xs xl:text-sm tracking-wide shadow-lg hover:bg-purple-600 transition-all duration-300 whitespace-nowrap"
                >
                  Register First Admin
                </Link>
              )}
              
              {/* Admin Login Button - ALWAYS show when admin exists */}
              {showAdminLogin && (
                <Link
                  to="/admin/login"
                  className="bg-blue-500 text-white px-4 xl:px-5 py-2.5 rounded-full font-bold text-xs xl:text-sm tracking-wide shadow-lg hover:bg-blue-600 transition-all duration-300 whitespace-nowrap"
                >
                  Admin Login
                </Link>
              )}
              
              {/* Dashboard Button - only show when user is logged in AND is admin */}
              {user && user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="bg-green-600 text-white px-4 xl:px-5 py-2.5 rounded-full font-bold text-xs xl:text-sm tracking-wide shadow-lg hover:bg-green-700 transition-all duration-300 whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-stone-900 focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-stone-100 absolute w-full shadow-2xl h-screen z-50">
          <div className="px-6 pt-8 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-4 rounded-xl text-lg font-medium border-l-4 ${
                  isActive(link.path) 
                    ? 'border-gold-500 bg-stone-50 text-stone-900' 
                    : link.path === '/school'
                      ? 'border-transparent text-gold-600 font-bold bg-gold-50/50'
                      : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 flex flex-col gap-4">
              <Link
                to="/quote"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-stone-100 text-stone-900 border border-stone-200 text-center py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-stone-200"
              >
                Get a Quote
              </Link>
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-gold-500 text-stone-900 text-center py-4 rounded-2xl font-bold text-lg tracking-wide shadow-xl shadow-gold-500/20 hover:bg-gold-400"
              >
                Book Session
              </Link>
              
              {/* Admin Registration Button - only show when no admin exists */}
              {showAdminRegistration && (
                <Link
                  to="/admin/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-purple-500 text-white text-center py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-purple-600"
                >
                  Register First Admin
                </Link>
              )}
              
              {/* Admin Login Button - ALWAYS show when admin exists */}
              {showAdminLogin && (
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-blue-500 text-white text-center py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-blue-600"
                >
                  Admin Login
                </Link>
              )}
              
              {/* Dashboard Button - only show when user is logged in AND is admin */}
              {user && user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-green-600 text-white text-center py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-green-700"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
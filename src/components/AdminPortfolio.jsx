import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Loader2, Clock, Sparkles, Palette, Camera, Video, Edit, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminNavbar from '../../components/AdminNavbar';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminPortfolio = () => {
  const { user, getAccessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // ✅ Get token from auth context
  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // ✅ Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        // Wait a moment for auth context to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If no user in auth context, redirect to login
        if (!user) {
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
  }, [user, getAccessToken, navigate]);

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
  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar onCollapsedChange={setSidebarCollapsed} />
      
      <main className={`flex-1 transition-all duration-500 p-6 md:p-10 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        {/* Animated Background Grid */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, ${isDarkMode ? '#eab308' : '#d97706'} 1px, transparent 1px), linear-gradient(to bottom, ${isDarkMode ? '#eab308' : '#d97706'} 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Header Section */}
        <div className="relative mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`h-1 w-12 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-gold-500 to-amber-500' : 'bg-gradient-to-r from-gold-600 to-amber-600'}`} />
                <p className={`text-[9px] tracking-[0.35em] uppercase font-black ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`}>
                  Creative Studio
                </p>
              </div>
              <h1 className={`text-5xl md:text-6xl font-serif tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Portfolio
              </h1>
              <p className={`text-sm font-light ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>
                Manage your creative work showcase, <span className={`font-medium ${isDarkMode ? 'text-gold-500' : 'text-gold-600'}`}>{user?.full_name?.split(' ')[0]}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <div className={`px-6 py-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-stone-900 border-stone-800 text-stone-300' 
                  : 'bg-white border-gray-200 text-stone-700'
              }`}>
                <Clock className="h-4 w-4" />
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Coming Soon Display */}
        <div className="relative">
          {/* Floating Elements Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${
                  isDarkMode ? 'bg-gold-500/10' : 'bg-gold-500/20'
                } animate-float`}
                style={{
                  width: `${Math.random() * 100 + 20}px`,
                  height: `${Math.random() * 100 + 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              />
            ))}
          </div>

          {/* Coming Soon Card */}
          <div className={`relative rounded-[2.5rem] overflow-hidden border ${
            isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
          }`}>
            <div className="absolute inset-0">
              <div className={`absolute inset-0 opacity-5 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gold-500/20 via-purple-500/10 to-blue-500/10' 
                  : 'bg-gradient-to-br from-gold-500/30 via-purple-500/20 to-blue-500/20'
              }`} />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-amber-500 to-orange-500" />
            </div>

            <div className="relative z-10 p-8 md:p-16">
              <div className="max-w-4xl mx-auto text-center">
                {/* Icon */}
                <div className={`relative inline-flex mb-8`}>
                  <div className={`absolute inset-0 rounded-full blur-3xl ${
                    isDarkMode ? 'bg-gold-500/30' : 'bg-gold-500/40'
                  }`} />
                  <div className={`relative p-6 rounded-3xl ${
                    isDarkMode ? 'bg-stone-800' : 'bg-gray-50'
                  } border ${
                    isDarkMode ? 'border-stone-700' : 'border-gray-200'
                  }`}>
                    <Image className={`h-16 w-16 ${
                      isDarkMode ? 'text-gold-400' : 'text-gold-600'
                    }`} />
                  </div>
                </div>

                {/* Title */}
                <h2 className={`text-4xl md:text-5xl font-serif font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  Portfolio Management
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-500 to-amber-500">
                    Coming Soon
                  </span>
                </h2>

                {/* Description */}
                <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${
                  isDarkMode ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  We're building an advanced portfolio management system to showcase your best work. 
                  This will include media galleries, client testimonials, project categorization, 
                  and integration with your booking system.
                </p>

                {/* Timeline */}
                <div className={`mb-12 p-6 rounded-2xl ${
                  isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'
                } border ${
                  isDarkMode ? 'border-stone-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className={`h-5 w-5 ${
                      isDarkMode ? 'text-gold-400' : 'text-gold-600'
                    }`} />
                    <span className={`text-sm font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Expected Launch: Q2 2024
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gradient-to-r from-transparent via-gold-500/30 to-transparent">
                    <div className="h-full w-1/3 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    {
                      icon: <Camera className="h-8 w-8" />,
                      title: "Media Gallery",
                      description: "Upload and organize photos, videos, and behind-the-scenes content"
                    },
                    {
                      icon: <Video className="h-8 w-8" />,
                      title: "Video Showcase",
                      description: "Display your cinematic work with embedded video players"
                    },
                    {
                      icon: <Palette className="h-8 w-8" />,
                      title: "Custom Themes",
                      description: "Match your portfolio to your brand with custom color schemes"
                    },
                    {
                      icon: <Edit className="h-8 w-8" />,
                      title: "Project Details",
                      description: "Add detailed descriptions, client testimonials, and technical specs"
                    },
                    {
                      icon: <Sparkles className="h-8 w-8" />,
                      title: "AI Categorization",
                      description: "Automatically tag and categorize your work by type and style"
                    },
                    {
                      icon: <Settings className="h-8 w-8" />,
                      title: "Advanced Controls",
                      description: "Set visibility, featured items, and portfolio layouts"
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                        isDarkMode 
                          ? 'bg-stone-800/30 border-stone-700 hover:border-gold-500/30' 
                          : 'bg-white/50 border-gray-200 hover:border-gold-500/50'
                      }`}
                    >
                      <div className={`inline-flex p-3 rounded-xl mb-4 ${
                        isDarkMode 
                          ? 'bg-gold-500/10 text-gold-400' 
                          : 'bg-gold-500/20 text-gold-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <div className={`p-8 rounded-3xl ${
                  isDarkMode ? 'bg-gradient-to-br from-stone-800 to-stone-900' : 'bg-gradient-to-br from-gray-50 to-white'
                } border ${
                  isDarkMode ? 'border-stone-700' : 'border-gray-200'
                } shadow-xl`}>
                  <h3 className={`text-2xl font-serif font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}>
                    Stay Tuned for Updates
                  </h3>
                  <p className={`mb-6 max-w-xl mx-auto ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-600'
                  }`}>
                    We'll notify you when the portfolio management system is ready. 
                    In the meantime, you can continue managing your services and bookings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/admin/dashboard')}
                      className={`px-8 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-black hover:from-gold-600 hover:to-amber-600' 
                          : 'bg-gradient-to-r from-gold-600 to-amber-600 text-white hover:from-gold-700 hover:to-amber-700'
                      }`}
                    >
                      Return to Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/admin/services')}
                      className={`px-8 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border ${
                        isDarkMode 
                          ? 'border-stone-700 text-stone-300 hover:bg-stone-800' 
                          : 'border-gray-300 text-stone-700 hover:bg-gray-50'
                      }`}
                    >
                      Manage Services
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Style for floating animation */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            33% {
              transform: translateY(-20px) rotate(120deg);
            }
            66% {
              transform: translateY(10px) rotate(240deg);
            }
          }
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </main>
    </div>
  );
};

export default AdminPortfolio;
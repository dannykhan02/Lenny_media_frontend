import React, { useState } from 'react';
import { Heart, Award, Users, Camera, Zap, Video, MapPin, Briefcase, Globe, MonitorPlay, Clock, Phone, Mail, Navigation, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const STUDIO_HOURS = {
  'Monday': { open: '08:00', close: '21:00' },
  'Tuesday': { open: '08:00', close: '21:00' },
  'Wednesday': { open: '08:00', close: '21:00' },
  'Thursday': { open: '08:30', close: '21:00' },
  'Friday': { open: '08:00', close: '21:00' },
  'Saturday': { open: '08:00', close: '21:00' },
  'Sunday': { open: '11:00', close: '21:00' },
};

const CONTACT_INFO = {
  phone: '+254 705 459768',
  email: 'dannykhan614@gmail.com',
  address: 'Juja Square Building, 1st Floor, Juja, Kenya',
  // Actual coordinates for Juja Square
  coordinates: {
    lat: -1.1067,
    lng: 37.0149
  }
};

const About: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showAllHours, setShowAllHours] = useState(false);
  
  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = STUDIO_HOURS[currentDay];
  
  // Check if studio is currently open
  const isStudioOpen = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  // Google Maps directions link
  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${CONTACT_INFO.coordinates.lat},${CONTACT_INFO.coordinates.lng}`;
  };

  // Google Maps embed URL
  const getMapEmbedUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.123456789!2d${CONTACT_INFO.coordinates.lng}!3d${CONTACT_INFO.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDYnMjQuMSJTIDM3wrAwMCc1My42IkU!5e0!3m2!1sen!2ske!4v1234567890123!5m2!1sen!2ske`;
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
      {/* Hero Section - Fixed for Theme Responsiveness */}
      <div className={`relative ${isDarkMode ? 'bg-stone-900' : 'bg-white'} py-20 sm:py-24 md:py-32 px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-40' : 'opacity-30'}`}>
          <img 
            src="https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2000&auto=format&fit=crop" 
            alt="Studio Camera" 
            className={`w-full h-full object-cover ${isDarkMode ? 'grayscale' : 'grayscale-0'}`} 
          />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-stone-900' : 'from-white'} to-transparent`}></div>
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <span className="text-gold-500 font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">Visual Storytellers</span>
          <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 sm:mb-6 md:mb-8`}>About Lenny Media</h1>
          <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-700'} max-w-3xl mx-auto leading-relaxed px-3 sm:px-4`}>
            We believe every moment has a story worth telling — and every brand deserves visuals that speak with power, emotion, and authenticity.
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="py-12 sm:py-16 md:py-20 lg:py-24 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gold-100 rounded-full z-0"></div>
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-stone-100 rounded-full z-0"></div>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" alt="Photography Team" className="relative z-10 rounded-2xl sm:rounded-3xl shadow-2xl w-full object-cover h-[300px] sm:h-[400px] md:h-[500px]" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500 flex-shrink-0" />
              <span className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'} font-medium uppercase tracking-wide text-xs sm:text-sm`}>Juja Square, 1st Floor</span>
            </div>
            <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 sm:mb-6`}>Who We Are</h2>
            <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-gold-500 mb-4 sm:mb-6 md:mb-8"></div>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed`}>
              Located at Juja Square Building, we are a creative photography and videography studio proudly serving Juja, Thika Road, Nairobi, and beyond.
            </p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6`}>
              We specialize in professional photography and high-quality videography designed to capture life's most important moments and elevate brands through compelling visual storytelling. From intimate studio portraits to large-scale events, from weddings full of emotion to corporate productions driven by purpose, our work is built on creativity, precision, and passion.
            </p>
          </div>
        </div>
      </div>

      {/* Services Breakdown */}
      <div className={`${isDarkMode ? 'bg-stone-800' : 'bg-stone-50'} py-12 sm:py-16 md:py-20 lg:py-24`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24">
          
          {/* 1. Corporate & Commercial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className={`bg-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shadow-sm mb-4 sm:mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gold-500" />
              </div>
              <h3 className={`font-serif text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Corporate & Commercial</h3>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4`}>
                We empower businesses with professional visual content. Our corporate services cover large-scale <strong>conferences</strong>, <strong>team building events</strong>, and executive <strong>headshots</strong>.
              </p>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed`}>
                Beyond events, we excel in <strong>product photography</strong>, appetizing <strong>food & hotel visuals</strong>, and <strong>real estate</strong> showcases. We also offer end-to-end <strong>documentary production</strong> and high-definition <strong>livestreaming</strong> to help you reach a global audience.
              </p>
            </div>
            <div className="order-1 md:order-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl h-[250px] sm:h-[300px] md:h-[400px]">
              <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop" alt="Corporate Event" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

          {/* 2. Weddings & Celebrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="h-[250px] sm:h-[300px] md:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop" alt="Wedding Celebration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div>
              <div className={`bg-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shadow-sm mb-4 sm:mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gold-500" />
              </div>
              <h3 className={`font-serif text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Weddings & Social Events</h3>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4`}>
                From the intimate exchange of vows to the vibrant energy of a reception, we capture the soul of your celebration. We are experts in <strong>Weddings, Ruracio,</strong> and traditional ceremonies.
              </p>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed`}>
                Our team also covers <strong>birthdays, baby showers,</strong> and <strong>private parties</strong>. With our 4K cinematic video coverage and drone capabilities, we turn your special moments into a timeless film that you can cherish forever.
              </p>
            </div>
          </div>

          {/* 3. Studio & Creative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className={`bg-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shadow-sm mb-4 sm:mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                <Camera className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gold-500" />
              </div>
              <h3 className={`font-serif text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Studio, Portraits & Lifestyle</h3>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4`}>
                Located at Juja Square, our modern, fully equipped studio is the perfect space for <strong>high-end portraits, graduation shoots,</strong> and creative <strong>fashion photography</strong>.
              </p>
              <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg leading-relaxed`}>
                We also specialize in <strong>outdoor and lifestyle photography</strong>, utilizing natural light to create authentic, personality-driven images. Whether you need a family portrait or a creative modeling portfolio, we bring your vision to life.
              </p>
            </div>
            <div className="order-1 md:order-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl h-[250px] sm:h-[300px] md:h-[400px]">
              <img src="https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=1200&auto=format&fit=crop" alt="Studio Portrait" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

        </div>
      </div>

      {/* Studio Location & Hours */}
      <div className={`py-12 sm:py-16 md:py-20 lg:py-24 ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4 md:mb-6`}>Visit Our Studio</h2>
            <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} max-w-3xl mx-auto`}>
              Located at Juja Square, we're easily accessible and ready to bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Map */}
            <div className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
              <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
                <iframe
                  src={getMapEmbedUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lenny Media Studio Location"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className={`p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-50'}`}>
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-gold-500 text-stone-900 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-bold hover:bg-gold-600 transition-all duration-300 w-full text-sm sm:text-base"
                >
                  <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                  Get Directions
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>

            {/* Contact & Hours */}
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Information */}
              <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'} shadow-lg`}>
                <h3 className={`font-bold text-lg sm:text-xl md:text-2xl ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 sm:mb-6`}>Contact Us</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'} flex-shrink-0`}>
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm sm:text-base mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Address</h4>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{CONTACT_INFO.address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} flex-shrink-0`}>
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm sm:text-base mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Phone</h4>
                      <a href={`tel:${CONTACT_INFO.phone}`} className={`text-xs sm:text-sm hover:text-gold-500 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {CONTACT_INFO.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'} flex-shrink-0`}>
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm sm:text-base mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Email</h4>
                      <a href={`mailto:${CONTACT_INFO.email}`} className={`text-xs sm:text-sm hover:text-gold-500 transition-colors break-all ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Hours */}
              <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'} shadow-lg`}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className={`font-bold text-lg sm:text-xl md:text-2xl ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Studio Hours</h3>
                  <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${
                    isStudioOpen()
                      ? isDarkMode
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : 'bg-green-100 text-green-700 border border-green-300'
                      : isDarkMode
                        ? 'bg-red-900/30 text-red-400 border border-red-700'
                        : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {isStudioOpen() ? '● OPEN' : '● CLOSED'}
                  </div>
                </div>

                {/* Today's Hours - Always Visible */}
                <div className={`p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 ${
                  isDarkMode ? 'bg-gold-900/30 border border-gold-700' : 'bg-gold-50 border border-gold-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`} />
                      <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-gold-300' : 'text-gold-700'}`}>Today ({currentDay})</span>
                    </div>
                    <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {todayHours.open} - {todayHours.close}
                    </span>
                  </div>
                </div>

                {/* All Hours - Collapsible */}
                <div>
                  <button
                    onClick={() => setShowAllHours(!showAllHours)}
                    className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      {showAllHours ? 'Hide' : 'Show'} all hours
                    </span>
                    {showAllHours ? (
                      <ChevronUp className={`h-4 w-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                    ) : (
                      <ChevronDown className={`h-4 w-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                    )}
                  </button>

                  {showAllHours && (
                    <div className="mt-2 sm:mt-3 space-y-2">
                      {Object.entries(STUDIO_HOURS).map(([day, hours]) => (
                        <div
                          key={day}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                            day === currentDay
                              ? isDarkMode
                                ? 'bg-stone-700/50'
                                : 'bg-stone-100'
                              : ''
                          }`}
                        >
                          <span className={`text-xs sm:text-sm font-medium ${
                            day === currentDay
                              ? isDarkMode ? 'text-white' : 'text-stone-900'
                              : isDarkMode ? 'text-stone-300' : 'text-stone-600'
                          }`}>
                            {day}
                          </span>
                          <span className={`text-xs sm:text-sm font-semibold ${
                            isDarkMode ? 'text-stone-300' : 'text-stone-700'
                          }`}>
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs ${
                  isDarkMode ? 'bg-blue-900/20 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <p>📅 Walk-ins welcome! For guaranteed availability, please book in advance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className={`py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 sm:mb-6 md:mb-8`}>Our Philosophy</h2>
          <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-8 sm:mb-10 md:mb-12 leading-relaxed`}>
            "At Lenny Media Kenya, we don't just take photos or shoot videos — we create experiences, preserve memories, and build visual identities. Our mission is to deliver premium-quality work that exceeds expectations while remaining accessible to individuals, students, creators, and businesses alike."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-left">
            {[
              { title: "Creativity", desc: "Pushing boundaries to deliver unique, artistic perspectives." },
              { title: "Precision", desc: "Attention to detail in lighting, composition, and editing." },
              { title: "Passion", desc: "Driven by a love for storytelling and capturing genuine emotion." }
            ].map((val, i) => (
              <div key={i} className={`${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-100'} p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border`}>
                <h4 className="font-bold text-base sm:text-lg text-gold-600 mb-1.5 sm:mb-2">{val.title}</h4>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className={`py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4 md:mb-6`}>Why Choose Us?</h2>
            <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} max-w-3xl mx-auto`}>
              Trusted by individuals, businesses, and organizations across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Award-Winning Quality",
                description: "Recognized for excellence in visual storytelling and creative production"
              },
              {
                icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Experienced Team",
                description: "Professional photographers and videographers with years of expertise"
              },
              {
                icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Quick Turnaround",
                description: "Fast delivery without compromising on quality or attention to detail"
              },
              {
                icon: <Camera className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "State-of-the-Art Equipment",
                description: "Latest cameras, lenses, and editing tools for stunning results"
              },
              {
                icon: <Video className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "4K Video Production",
                description: "Cinematic quality video with professional color grading"
              },
              {
                icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
                title: "Nationwide Coverage",
                description: "Serving clients across Kenya with mobile studio capabilities"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-stone-800/50 border-stone-700 hover:bg-stone-800'
                    : 'bg-stone-50 border-stone-200 hover:bg-white hover:shadow-xl'
                }`}
              >
                <div className={`p-2.5 sm:p-3 md:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-3 sm:mb-4 md:mb-6 ${
                  isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                }`}>
                  {item.icon}
                </div>
                <h3 className={`font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  {item.title}
                </h3>
                <p className={`text-xs sm:text-sm md:text-base ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action - Fixed White Line Issue */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'} ${isDarkMode ? 'text-white' : 'text-stone-900'} py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 lg:px-8 text-center relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Camera className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${isDarkMode ? 'text-gold-500' : 'text-gold-600'} mx-auto mb-4 sm:mb-5 md:mb-6`} />
          <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4 md:mb-6`}>
            Tell Your Story Beautifully
          </h2>
          <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-400' : 'text-stone-700'} mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto`}>
            Step into our studio at Juja Square or book a session online. We're ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link 
              to="/quote" 
              className="w-full sm:w-auto bg-gold-500 text-stone-900 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-bold hover:bg-gold-600 hover:shadow-2xl transition-all duration-300 text-sm sm:text-base md:text-lg"
            >
              Get a Quote
            </Link>
            <a 
              href="tel:+254705459768"
              className={`w-full sm:w-auto border ${isDarkMode ? 'border-stone-700 hover:bg-stone-800' : 'border-stone-300 hover:bg-stone-200'} ${isDarkMode ? 'text-white' : 'text-stone-900'} px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-bold transition-all duration-300 text-sm sm:text-base md:text-lg`}
            >
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
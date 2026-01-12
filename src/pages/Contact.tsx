import React, { useState } from 'react';
import { MapPin, Phone, Clock, Mail, Instagram, Facebook, Navigation, ExternalLink, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Custom TikTok SVG Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

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
  address: 'Juja Square, 1st Floor, Gatundu-Juja Road, Juja Kiambu',
  coordinates: {
    lat: -1.1067,
    lng: 37.0149
  }
};

const Contact: React.FC = () => {
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Hero Header */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} py-16 sm:py-20 md:py-24 lg:py-28 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-gold-500 font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">Let's Connect</span>
          <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4 md:mb-6`}>Get in Touch</h1>
          <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} max-w-3xl mx-auto`}>
            We'd love to hear from you. Visit our studio, give us a call, or send us a message.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-8 sm:-mt-10 md:-mt-12 mb-12 sm:mb-16 md:mb-20">
        
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          
          {/* Card 1: Visit Us */}
          <div className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
              <MapPin className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gold-500" />
            </div>
            <h3 className={`font-serif text-lg sm:text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Visit Our Studio</h3>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg mb-1`}>Juja Square, 1st Floor</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg mb-1 sm:mb-2`}>Next to the Highway</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-sm sm:text-base md:text-lg font-semibold`}>Juja, Kenya</p>
            <a 
              href={getDirectionsUrl()}
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 mt-4 sm:mt-5 md:mt-6 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${isDarkMode ? 'bg-gold-500 text-stone-900 hover:bg-gold-400' : 'bg-gold-500 text-white hover:bg-gold-600'}`}
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
              Get Directions
            </a>
          </div>

          {/* Card 2: Contact Info */}
          <div className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
              <Phone className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gold-500" />
            </div>
            <h3 className={`font-serif text-lg sm:text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Call or Email</h3>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6">
              <a 
                href={`tel:${CONTACT_INFO.phone}`}
                className={`block text-sm sm:text-base md:text-lg hover:text-gold-500 transition-colors ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}
              >
                {CONTACT_INFO.phone}
              </a>
              <a 
                href={`mailto:${CONTACT_INFO.email}`}
                className={`block text-sm sm:text-base md:text-lg hover:text-gold-500 transition-colors break-all ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}
              >
                {CONTACT_INFO.email}
              </a>
            </div>
            <div className={`flex justify-center space-x-3 sm:space-x-4 pt-3 sm:pt-4 border-t ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
              <a 
                href="https://www.instagram.com/lenny_media_kenya?igsh=d3NlczlnNDIwc2N2" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 sm:p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1D5x63tXea/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 sm:p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@lenny.media.studios?_r=1&_t=ZM-92SPIGMTOxM" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 sm:p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on TikTok"
              >
                <TikTokIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Card 3: Hours with Live Status */}
          <div className={`p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gold-500" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h3 className={`font-serif text-lg sm:text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Studio Hours</h3>
              <div className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold ${
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

            {/* Today's Hours */}
            <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4 ${
              isDarkMode ? 'bg-gold-900/30 border border-gold-700' : 'bg-gold-50 border border-gold-200'
            }`}>
              <p className={`text-xs sm:text-sm font-semibold mb-1 ${isDarkMode ? 'text-gold-300' : 'text-gold-700'}`}>
                Today ({currentDay})
              </p>
              <p className={`text-base sm:text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {todayHours.open} - {todayHours.close}
              </p>
            </div>

            {/* Show/Hide All Hours */}
            <button
              onClick={() => setShowAllHours(!showAllHours)}
              className={`w-full flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                isDarkMode ? 'hover:bg-stone-700 text-stone-300' : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              <span>{showAllHours ? 'Hide' : 'Show'} all hours</span>
              {showAllHours ? (
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>

            {showAllHours && (
              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                {Object.entries(STUDIO_HOURS).map(([day, hours]) => (
                  <div
                    key={day}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg text-xs sm:text-sm ${
                      day === currentDay
                        ? isDarkMode
                          ? 'bg-stone-700/50'
                          : 'bg-stone-100'
                        : ''
                    }`}
                  >
                    <span className={`font-medium ${
                      day === currentDay
                        ? isDarkMode ? 'text-white' : 'text-stone-900'
                        : isDarkMode ? 'text-stone-300' : 'text-stone-600'
                    }`}>
                      {day}
                    </span>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      {hours.open} - {hours.close}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className={`mb-8 sm:mb-12 md:mb-16 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-200'} p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl`}>
          <div className="mb-4 sm:mb-5 md:mb-6">
            <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2 sm:mb-3`}>Find Us on the Map</h2>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Located at Juja Square, 1st Floor - Easily accessible from Thika Road
            </p>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
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
            <div className={`p-3 sm:p-4 md:p-5 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-50'}`}>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 bg-gold-500 text-stone-900 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-bold hover:bg-gold-600 transition-all duration-300 w-full text-xs sm:text-sm md:text-base"
              >
                <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                Get Directions
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className={`mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 rounded-lg ${
            isDarkMode 
              ? 'bg-blue-900/20 border border-blue-800/50' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>📍 Easy to Find:</strong> We're located on the 1st floor of Juja Square Building, right next to Gatundu-Juja Road. Free parking available for clients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl sm:rounded-2xl shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-stone-900 to-stone-800 border border-stone-700' : 'bg-gradient-to-br from-stone-100 to-white border border-stone-200'}`}>
          <h2 className={`font-serif text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-3 sm:mb-4`}>Ready to Capture Your Moments?</h2>
          <p className={`text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Let's create something beautiful together. Book your session today or visit our studio for a consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a 
              href="/#/quote" 
              className={`inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gold-500 text-stone-900 hover:bg-gold-400' : 'bg-gold-500 text-white hover:bg-gold-600'} shadow-lg`}
            >
              Request a Quote
            </a>
            <a 
              href={`tel:${CONTACT_INFO.phone}`}
              className={`inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 border-2 ${isDarkMode ? 'border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-stone-900' : 'border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white'}`}
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
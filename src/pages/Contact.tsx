import React from 'react';
import { MapPin, Phone, Clock, Mail, Instagram, Facebook } from 'lucide-react';
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

const Contact: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} py-20 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`font-serif text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-4`}>Get in Touch</h1>
          <p className={`text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-300'}`}>We'd love to hear from you. Here's how to reach us.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Card 1: Visit Us */}
          <div className={`p-8 rounded-xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
              <MapPin className="h-10 w-10 text-gold-500" />
            </div>
            <h3 className={`font-serif text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Visit Our Studio</h3>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg mb-1`}>Juja Square, 1st Floor</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg mb-2`}>Next to the Highway</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg font-semibold`}>Juja, Kenya</p>
            <a 
              href="https://maps.app.goo.gl/jujasquare" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-block mt-6 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isDarkMode ? 'bg-gold-500 text-stone-900 hover:bg-gold-400' : 'bg-gold-500 text-white hover:bg-gold-600'}`}
            >
              Get Directions
            </a>
          </div>

          {/* Card 2: Contact Info */}
          <div className={`p-8 rounded-xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
              <Phone className="h-10 w-10 text-gold-500" />
            </div>
            <h3 className={`font-serif text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Call or Email</h3>
            <div className="space-y-3 mb-6">
              <a 
                href="tel:+254705459768" 
                className={`block text-lg hover:text-gold-500 transition-colors ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}
              >
                +254 705 459 768
              </a>
              <a 
                href="mailto:dannykhan614@gmail.com" 
                className={`block text-lg hover:text-gold-500 transition-colors ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}
              >
                dannykhan614@gmail.com
              </a>
            </div>
            <div className="flex justify-center space-x-4 pt-4 border-t ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}">
              <a 
                href="https://www.instagram.com/lenny_media_kenya?igsh=d3NlczlnNDIwc2N2" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1D5x63tXea/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@lenny.media.studios?_r=1&_t=ZM-92SPIGMTOxM" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Card 3: Hours */}
          <div className={`p-8 rounded-xl shadow-xl text-center transform hover:-translate-y-2 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-100'}`}>
              <Clock className="h-10 w-10 text-gold-500" />
            </div>
            <h3 className={`font-serif text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Working Hours</h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Monday - Saturday</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>8:00 AM - 6:00 PM</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Sunday</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>By Appointment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section - Enhanced */}
        <div className={`${isDarkMode ? 'bg-stone-800 border border-stone-700' : 'bg-white border border-stone-100'} p-6 rounded-xl shadow-xl`}>
          <div className="mb-4">
            <h2 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>Find Us on the Map</h2>
            <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Located at Juja Square, easily accessible from the main highway</p>
          </div>
          <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
            {/* Actual Juja Square coordinates: -1.1084, 37.0158 */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0744962458!2d37.01359607496437!3d-1.1084000353420943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f46c6e8c6e6e5%3A0x1234567890abcdef!2sJuja%20Square!5e0!3m2!1sen!2ske!4v1635000000000!5m2!1sen!2ske" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Juja Square Location - Lenny Media Studio"
            ></iframe>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`mt-12 text-center p-12 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-stone-900 to-stone-800 border border-stone-700' : 'bg-gradient-to-br from-stone-100 to-white border border-stone-200'}`}>
          <h2 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Ready to Capture Your Moments?</h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Let's create something beautiful together. Book your session today or visit our studio for a consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/#/quote" 
              className={`inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gold-500 text-stone-900 hover:bg-gold-400' : 'bg-gold-500 text-white hover:bg-gold-600'} shadow-lg`}
            >
              Request a Quote
            </a>
            <a 
              href="tel:+254705459768" 
              className={`inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border-2 ${isDarkMode ? 'border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-stone-900' : 'border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white'}`}
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
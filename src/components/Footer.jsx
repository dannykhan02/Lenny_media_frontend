import React from 'react';
import { Camera, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`pt-20 pb-10 border-t ${isDarkMode ? 'bg-stone-950 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-gold-500" />
              <span className="font-serif text-2xl font-bold">Lenny Media</span>
            </div>
            <p className={`leading-relaxed max-w-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Capturing life's most precious moments with style, elegance, and cinematic flair. Based in Juja Square, serving Nairobi and beyond.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300 ${isDarkMode ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}
                aria-label="Follow on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className={`font-serif text-xl font-semibold mb-8 relative inline-block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Explore
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gold-500"></span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="/#/services" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  Services & Pricing
                </a>
              </li>
              <li>
                <a 
                  href="/#/portfolio" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  Our Work
                </a>
              </li>
              <li>
                <a 
                  href="/#/school" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  School of Photography
                </a>
              </li>
              <li>
                <a 
                  href="/#/brands" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  Our Brands
                </a>
              </li>
              <li>
                <a 
                  href="/#/about" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/#/quote" 
                  className={`hover:text-gold-500 transition-colors flex items-center gap-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}
                >
                  Request a Quote
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`font-serif text-xl font-semibold mb-8 relative inline-block ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gold-500"></span>
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className={`p-2 rounded-lg text-gold-500 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>
                  Juja Square, 1st Floor,<br />Juja, Kenya
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className={`p-2 rounded-lg text-gold-500 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                  <Phone className="h-5 w-5" />
                </div>
                <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>
                  +254 700 123 456
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className={`p-2 rounded-lg text-gold-500 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>
                  info@lennymedia.co.ke
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className={`pt-8 text-center text-sm flex flex-col md:flex-row justify-between items-center border-t ${isDarkMode ? 'border-stone-900 text-stone-600' : 'border-stone-200 text-stone-500'}`}>
          <p>&copy; {new Date().getFullYear()} Lenny Media Kenya. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a 
              href="#" 
              className={`hover:text-gold-500 transition-colors ${isDarkMode ? 'text-stone-600' : 'text-stone-500'}`}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className={`hover:text-gold-500 transition-colors ${isDarkMode ? 'text-stone-600' : 'text-stone-500'}`}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
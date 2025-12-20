import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Contact: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} py-16 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`font-serif text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>Get in Touch</h1>
          <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-400'}`}>We'd love to hear from you. Here's how to reach us.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Visit Us */}
          <div className={`p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
              <MapPin className="h-8 w-8 text-gold-500" />
            </div>
            <h3 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>Visit Our Studio</h3>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-1`}>Juja Square, 1st Floor</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Juja, Kenya</p>
            <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-sm mt-2`}>Next to the Highway</p>
          </div>

          {/* Card 2: Contact Info */}
          <div className={`p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
              <Phone className="h-8 w-8 text-gold-500" />
            </div>
            <h3 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>Call or Email</h3>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-1`}>+254 700 123 456</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>info@lennymedia.co.ke</p>
            <div className="flex justify-center space-x-4 mt-6">
              <a href="#" className={`${isDarkMode ? 'text-stone-400 hover:text-gold-500' : 'text-stone-400 hover:text-gold-500'}`}>📷</a>
              <a href="#" className={`${isDarkMode ? 'text-stone-400 hover:text-gold-500' : 'text-stone-400 hover:text-gold-500'}`}>👥</a>
              <a href="#" className={`${isDarkMode ? 'text-stone-400 hover:text-gold-500' : 'text-stone-400 hover:text-gold-500'}`}>𝕏</a>
            </div>
          </div>

          {/* Card 3: Hours */}
          <div className={`p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
              <Clock className="h-8 w-8 text-gold-500" />
            </div>
            <h3 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>Working Hours</h3>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Mon - Sat: 8:00 AM - 6:00 PM</p>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Sunday: By Appointment</p>
          </div>
        </div>

        {/* Map Section */}
        <div className={`mt-12 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white'} p-4 rounded-xl shadow-lg`}>
          <div className="w-full h-96 bg-stone-200 rounded-lg overflow-hidden relative">
            {/* Embed Google Map placeholder. In real app, use an iframe or API */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.172828604344!2d37.0125!3d-1.1158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMS4xMTU4wrxTLCAzNy4wMTI1wrxF!5e0!3m2!1sen!2ske!4v1600000000000!5m2!1sen!2ske" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Juja Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
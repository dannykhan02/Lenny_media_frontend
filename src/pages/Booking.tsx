import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Tooltip Component
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-2 align-middle">
    <Info className="w-4 h-4 text-stone-400 hover:text-gold-500 cursor-help transition-colors" />
    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-stone-900 text-white text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none transform translate-y-2 group-hover:translate-y-0">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900"></div>
    </div>
  </div>
);

const Booking: React.FC = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: '',
    date: '',
    time: '',
    location: '',
    budget: '',
    notes: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Parse query param for pre-selecting service
    const searchParams = new URLSearchParams(location.search);
    const service = searchParams.get('service');
    if (service) {
      setFormData(prev => ({ ...prev, serviceType: service }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };
  
  const handleReset = () => {
    setFormData({
      name: '', phone: '', email: '', serviceType: '', date: '', time: '', location: '', budget: '', notes: ''
    });
    setIsSubmitted(false);
  };

  const serviceOptions = [
    // Photography
    { label: "Corporate Events Photography", value: "Corporate Events Photography" },
    { label: "Wedding & Engagement Photography", value: "Wedding & Engagement" },
    { label: "Studio Shots & Studio Hire", value: "Studio Shots & Hire" },
    { label: "Portrait Shots Photography", value: "Portrait Shots" },
    { label: "Outdoor & Indoor Photography", value: "Outdoor & Indoor Photography" },
    { label: "Family Photography (Baby, Parties)", value: "Family & Parties" },
    { label: "Wildlife, Tours & Travel", value: "Wildlife, Tours & Travel" },
    { label: "Food & Hotel Photography", value: "Food & Hotel Photography" },
    { label: "Drone & Aerial Photography", value: "Drone & Aerial Photography" },
    // Videography
    { label: "Corporate Events Video", value: "Corporate Events Video" },
    { label: "Wedding Video Coverage", value: "Wedding Video Coverage" },
    { label: "Documentaries Production", value: "Documentaries Production" },
    { label: "Livestreaming Coverage", value: "Livestreaming Coverage" },
    { label: "Drone & Aerial Videography", value: "Drone & Aerial Videography" },
  ];

  if (isSubmitted) {
    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} py-20 px-4 flex items-center justify-center`}>
            <div className={`max-w-2xl w-full ${isDarkMode ? 'bg-stone-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 md:p-12 text-center border ${isDarkMode ? 'border-stone-700' : 'border-stone-100'} relative overflow-hidden animate-[fadeIn_0.5s_ease-out]`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full z-0"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>Booking Request Received!</h2>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'} mb-8`}>Thank you, {formData.name}. We are excited to work with you.</p>
                    
                    <div className={`${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} rounded-2xl p-6 mb-8 text-left border ${isDarkMode ? 'border-stone-600' : 'border-stone-100'} shadow-inner`}>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 border-b ${isDarkMode ? 'border-stone-600' : 'border-stone-200'} pb-2 text-sm uppercase tracking-wide`}>Request Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Service</span>
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.serviceType}</span>
                            </div>
                            <div>
                                <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Date & Time</span>
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.date} at {formData.time || 'TBD'}</span>
                            </div>
                            <div>
                                <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Location</span>
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.location || 'Not specified'}</span>
                            </div>
                             <div>
                                <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Contact</span>
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'} ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} p-5 rounded-xl mb-8 text-sm flex items-start gap-3 border ${isDarkMode ? 'border-blue-800' : 'border-blue-100'}`}>
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-left">
                            <strong>What happens next?</strong> Our team will review your availability and requirements. You will receive a confirmation call or email within <strong>24 hours</strong> to finalize the details and deposit.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleReset} className={`px-8 py-3 ${isDarkMode ? 'bg-stone-700 hover:bg-stone-600 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} font-bold rounded-xl transition-colors`}>
                            Book Another Session
                        </button>
                        <Link to="/" className={`px-8 py-3 ${isDarkMode ? 'bg-stone-800 hover:bg-gold-500 hover:text-stone-900' : 'bg-stone-900 hover:bg-gold-500 hover:text-stone-900'} text-white font-bold rounded-xl transition-colors`}>
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} py-20 px-4`}>
      <div className="max-w-5xl mx-auto">
        <div className={`${isDarkMode ? 'bg-stone-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row`}>
          
          {/* Form Header / Side Info (Desktop) */}
          <div className="bg-stone-900 text-white p-10 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gold-500 rounded-full opacity-10 blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="font-serif text-4xl font-bold mb-6">Book a Session</h1>
              <p className="text-stone-300 mb-8 leading-relaxed">
                Ready to create magic? Fill out the form below to secure your date. We'll review your details and get back to you within 24 hours to confirm.
              </p>
              
              <div className="space-y-6 text-sm text-stone-300 mt-10">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Juja Square, 1st Floor</p>
                    <p>Next to the Highway, Juja, Kenya</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Opening Hours</p>
                    <p>Mon - Sat: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Availability</p>
                    <p>Available for travel countrywide</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 relative z-10 pt-8 border-t border-white/10">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Need immediate assistance?</p>
              <p className="text-xl font-bold text-gold-500">+254 700 123 456</p>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8 lg:p-12 lg:w-3/5 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="name" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Full Name <Tooltip text="Please enter your legal first and last name for our records." />
                  </label>
                  <input required type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 ${isDarkMode ? 'text-white' : ''}`} placeholder="e.g. John Doe" />
                </div>
                <div className="group">
                  <label htmlFor="phone" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Phone Number <Tooltip text="A valid mobile number where we can reach you for immediate confirmation." />
                  </label>
                  <input required type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 ${isDarkMode ? 'text-white' : ''}`} placeholder="e.g. 0712 345 678" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Email Address <Tooltip text="We will send the booking confirmation and invoice to this address." />
                </label>
                <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 ${isDarkMode ? 'text-white' : ''}`} placeholder="e.g. john@example.com" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="serviceType" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Service Type <Tooltip text="Select the primary photography or videography service you need." />
                  </label>
                  <div className="relative">
                    <select required id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'text-white' : ''}`}>
                      <option value="">Select a service...</option>
                      {serviceOptions.map((opt, idx) => (
                        <option key={idx} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="budget" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Budget Range (KES) <Tooltip text="Providing a range helps us recommend the best package for your needs." />
                  </label>
                  <div className="relative">
                    <select id="budget" name="budget" value={formData.budget} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer ${isDarkMode ? 'text-white' : ''}`}>
                      <option value="">Select budget range...</option>
                      <option value="<5k">Below 5,000</option>
                      <option value="5k-15k">5,000 - 15,000</option>
                      <option value="15k-40k">15,000 - 40,000</option>
                      <option value="40k-100k">40,000 - 100,000</option>
                      <option value="100k+">100,000+</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Preferred Date <Tooltip text="The specific date of your event or preferred session day." />
                  </label>
                  <input required type="date" id="date" name="date" value={formData.date} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'text-white' : ''}`} />
                </div>
                <div>
                  <label htmlFor="time" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Preferred Time <Tooltip text="The approximate start time for the shoot." />
                  </label>
                  <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'text-white' : ''}`} />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Shoot Location <Tooltip text="The venue name or physical address where the shoot will take place (e.g., Juja Studio, Arboretum)." />
                </label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 ${isDarkMode ? 'text-white' : ''}`} placeholder="e.g., Juja Studio, Arboretum, or your venue" />
              </div>

              <div>
                <label htmlFor="notes" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Additional Notes / Vision <Tooltip text="Any specific requests, themes, mood boards, number of people involved, or questions." />
                </label>
                <textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 ${isDarkMode ? 'text-white' : ''}`} placeholder="Tell us about the vibe you're going for, number of people, or any specific shots you need..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full bg-gold-500 hover:bg-gold-600 text-stone-900 font-bold text-lg py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/30 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isSubmitting ? (
                    <>Processing Request <Loader2 className="h-5 w-5 animate-spin" /></>
                ) : (
                    <>Submit Booking Request <CheckCircle className="h-5 w-5" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
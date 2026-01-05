import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Info, Loader2, AlertCircle, X, Check, Mail, Phone, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========== CONSTANTS & TYPES ==========
const KENYA_PLACEHOLDERS = {
  name: 'John Mwangi',
  email: 'john.mwangi@company.co.ke',
  phone: '+254 712 345 678',
  location: 'KICC, Nairobi'
} as const;

const STUDIO_HOURS: Record<string, { open: string; close: string }> = {
  'Monday': { open: '08:00', close: '21:00' },
  'Tuesday': { open: '08:00', close: '21:00' },
  'Wednesday': { open: '08:00', close: '21:00' },
  'Thursday': { open: '08:30', close: '21:00' },
  'Friday': { open: '08:00', close: '21:00' },
  'Saturday': { open: '08:00', close: '21:00' },
  'Sunday': { open: '11:00', close: '21:00' },
};

// Helper function to format time from 24h to 12h
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to get studio hours display text
const getStudioHoursDisplay = (): string => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const saturday = 'Saturday';
  const sunday = 'Sunday';
  
  // Check if all weekdays have the same hours
  const weekdayHours = STUDIO_HOURS[weekdays[0]];
  const allWeekdaysSame = weekdays.every(day => 
    STUDIO_HOURS[day].open === weekdayHours.open && 
    STUDIO_HOURS[day].close === weekdayHours.close
  );
  
  if (allWeekdaysSame) {
    const weekdayOpen = formatTime12Hour(weekdayHours.open);
    const weekdayClose = formatTime12Hour(weekdayHours.close);
    const satOpen = formatTime12Hour(STUDIO_HOURS[saturday].open);
    const satClose = formatTime12Hour(STUDIO_HOURS[saturday].close);
    const sunOpen = formatTime12Hour(STUDIO_HOURS[sunday].open);
    const sunClose = formatTime12Hour(STUDIO_HOURS[sunday].close);
    
    return `Mon - Fri: ${weekdayOpen} - ${weekdayClose}, Sat: ${satOpen} - ${satClose}, Sun: ${sunOpen} - ${sunClose}`;
  } else {
    // Group days by hours
    const hoursMap: Record<string, string[]> = {};
    
    Object.entries(STUDIO_HOURS).forEach(([day, hours]) => {
      const key = `${hours.open}-${hours.close}`;
      if (!hoursMap[key]) {
        hoursMap[key] = [];
      }
      hoursMap[key].push(day.substring(0, 3));
    });
    
    const displayParts = Object.entries(hoursMap).map(([key, days]) => {
      const [open, close] = key.split('-');
      const open12 = formatTime12Hour(open);
      const close12 = formatTime12Hour(close);
      return `${days.join(', ')}: ${open12} - ${close12}`;
    });
    
    return displayParts.join(', ');
  }
};

const CONTACT_INFO = {
  phone: '+254 705 459768',
  email: 'dannykhan614@gmail.com'
};

enum SubmissionFlowState {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SUBMITTING = 'SUBMITTING',
  STUDIO_HOURS_ERROR = 'STUDIO_HOURS_ERROR',
  TIME_ADJUSTED_PENDING_REVIEW = 'TIME_ADJUSTED_PENDING_REVIEW',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SUCCESS = 'SUCCESS'
}

interface ErrorContext {
  type: 'studio_hours' | 'validation' | 'network';
  message: string;
  details?: {
    original_time?: string;
    suggested_time?: string;
    studio_hours?: {
      open: string;
      close: string;
      day: string;
    };
  };
}

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

// Adaptive Modal Component
const AdaptiveModal: React.FC<{
  flowState: SubmissionFlowState;
  errorContext: ErrorContext | null;
  onResolve: (action: 'accept_suggestion' | 'manual_adjust' | 'retry') => void;
  onClose: () => void;
  isDarkMode: boolean;
  formData?: any;
}> = ({ flowState, errorContext, onResolve, onClose, isDarkMode, formData }) => {
  if (![
    SubmissionFlowState.STUDIO_HOURS_ERROR,
    SubmissionFlowState.TIME_ADJUSTED_PENDING_REVIEW,
    SubmissionFlowState.NETWORK_ERROR
  ].includes(flowState)) {
    return null;
  }

  const getModalContent = () => {
    switch (flowState) {
      case SubmissionFlowState.STUDIO_HOURS_ERROR:
        return {
          title: "⏰ Studio Operating Hours",
          icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
          iconBgColor: isDarkMode ? 'bg-amber-900/40' : 'bg-amber-100',
          iconColor: isDarkMode ? 'text-amber-400' : 'text-amber-600',
          bgGradient: isDarkMode 
            ? 'from-stone-900 to-stone-950 border-stone-800' 
            : 'from-white to-stone-50 border-stone-200',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base">Your selected time <strong>{errorContext?.details?.original_time}</strong> is outside our studio hours.</p>
              <div className={`rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-stone-800/50 border border-stone-700' : 'bg-stone-50 border border-stone-200'}`}>
                <p className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Studio Hours for {errorContext?.details?.studio_hours?.day}:</p>
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
                  <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{errorContext?.details?.studio_hours?.open} - {errorContext?.details?.studio_hours?.close}</span>
                  <span className="text-xs sm:text-sm text-gold-500">✓ Operating Hours</span>
                </div>
              </div>
              <p className="text-sm sm:text-base">We've automatically updated your time to <strong>{errorContext?.details?.suggested_time}</strong> to match our schedule.</p>
            </div>
          ),
          actions: [
            { label: 'Use Suggested Time', action: 'accept_suggestion', primary: true },
            { label: 'Pick Different Time', action: 'manual_adjust', primary: false }
          ]
        };

      case SubmissionFlowState.TIME_ADJUSTED_PENDING_REVIEW:
        return {
          title: "⏰ Time Updated to Studio Hours",
          icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
          iconBgColor: isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100',
          iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
          bgGradient: isDarkMode 
            ? 'from-stone-900 to-stone-950 border-stone-800' 
            : 'from-white to-stone-50 border-stone-200',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className={`rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-red-900/40 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs uppercase mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Original</p>
                  <p className={`font-bold line-through text-sm sm:text-base ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errorContext?.details?.original_time}</p>
                </div>
                <div className={`rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-green-900/40 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-xs uppercase mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Updated</p>
                  <p className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{errorContext?.details?.suggested_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Info className={`w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span>Studio opens at {errorContext?.details?.studio_hours?.open} on {errorContext?.details?.studio_hours?.day}s</span>
              </div>
            </div>
          ),
          actions: [
            { label: 'Accept & Continue', action: 'accept_suggestion', primary: true },
            { label: 'Adjust Time Manually', action: 'manual_adjust', primary: false }
          ]
        };

      case SubmissionFlowState.NETWORK_ERROR:
        return {
          title: "⚠️ Connection Error",
          icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
          iconBgColor: isDarkMode ? 'bg-red-900/40' : 'bg-red-100',
          iconColor: isDarkMode ? 'text-red-400' : 'text-red-600',
          bgGradient: isDarkMode 
            ? 'from-stone-900 to-stone-950 border-stone-800' 
            : 'from-white to-stone-50 border-stone-200',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base">We're having trouble connecting to our servers. This could be due to:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm sm:text-base">
                <li>Poor internet connection</li>
                <li>Temporary server maintenance</li>
                <li>Network firewall restrictions</li>
              </ul>
              <p className="text-sm sm:text-base">Your booking request has been saved locally. You can try submitting again.</p>
            </div>
          ),
          actions: [
            { label: 'Try Again', action: 'retry', primary: true },
            { label: 'Cancel', action: 'manual_adjust', primary: false }
          ]
        };

      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className={`max-w-md w-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 bg-gradient-to-b ${content.bgGradient}`}>
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-stone-700/30">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${content.iconBgColor} ${content.iconColor}`}>
              {content.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {content.title}
              </h3>
              <div className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                {content.content}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1 sm:p-2 rounded-lg hover:bg-stone-700/30 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          {content.actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onResolve(action.action as any)}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                action.primary
                  ? isDarkMode
                    ? 'bg-gold-600 hover:bg-gold-500 text-white'
                    : 'bg-gold-500 hover:bg-gold-600 text-white'
                  : isDarkMode
                    ? 'border border-stone-600 text-stone-300 hover:bg-stone-800'
                    : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Studio Hours Guide Component
const StudioHoursGuide: React.FC<{
  day: string;
  isVisible: boolean;
  isDarkMode: boolean;
  onSelectTime?: (time: string) => void;
  currentTime?: string;
}> = ({ day, isVisible, isDarkMode, onSelectTime, currentTime }) => {
  if (!isVisible) return null;

  const hours = STUDIO_HOURS[day] || STUDIO_HOURS['Monday'];
  const suggestedTimes = ['11:00', '14:00', '17:00', '19:00'];

  return (
    <div className={`mt-2 p-3 sm:p-4 rounded-lg border bg-gradient-to-br ${
      isDarkMode 
        ? 'from-blue-950/40 to-stone-800/40 border-blue-700/40' 
        : 'from-blue-50 to-stone-50 border-blue-300'
    }`}>
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gold-500" />
          <h4 className={`font-semibold text-xs sm:text-sm ${
            isDarkMode ? 'text-blue-300' : 'text-blue-700'
          }`}>Studio Hours for {day}:</h4>
        </div>
        <span className="text-gold-600 font-medium text-xs sm:text-sm">{hours.open} - {hours.close}</span>
      </div>
      
      {/* Visual Timeline */}
      <div className="mb-3 sm:mb-4">
        <div className="relative h-6 bg-stone-700/30 rounded-full overflow-hidden">
          <div className="absolute left-0 right-0 h-full bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600 opacity-20"></div>
          {/* Operating hours highlight */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500/30"
            style={{ 
              left: '30%',
              right: '25%'
            }}
          ></div>
          {/* Current time indicator if provided */}
          {currentTime && (
            <div 
              className="absolute top-0 bottom-0 w-1 bg-red-500"
              style={{ 
                left: `${((parseInt(currentTime.split(':')[0]) - 8) / 14) * 100}%`
              }}
            >
              <div className="absolute -top-2 -left-1.5 w-4 h-4 rounded-full bg-red-500"></div>
            </div>
          )}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-between px-2">
            <span className="text-xs">08:00</span>
            <span className="text-xs font-semibold text-green-500 hidden xs:inline">Operating Hours</span>
            <span className="text-xs">22:00</span>
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>Opens: {hours.open}</span>
          <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>Closes: {hours.close}</span>
        </div>
      </div>

      <div>
        <p className={`text-xs font-semibold mb-2 ${
          isDarkMode ? 'text-stone-300' : 'text-stone-700'
        }`}>Suggested times for {day}:</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {suggestedTimes.map(time => (
            <button
              key={time}
              type="button"
              onClick={() => onSelectTime && onSelectTime(time)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentTime === time
                  ? 'bg-gold-600 text-white border border-gold-600'
                  : isDarkMode
                    ? 'bg-stone-700 hover:bg-stone-600 text-stone-300 border border-stone-600'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Contact Information Component
const ContactInformation: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  return (
    <div className={`mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border ${
      isDarkMode 
        ? 'bg-stone-800/50 border-stone-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
        <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 inline mr-2 text-gold-500" />
        Contact Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {/* Phone Contact */}
        <div className={`p-3 sm:p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-stone-800/30 border-stone-700' 
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={`p-1.5 sm:p-2 rounded-full ${
              isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Phone Support
            </h4>
          </div>
          <p className={`mb-1 sm:mb-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            Call us directly for immediate assistance:
          </p>
          <a 
            href={`tel:${CONTACT_INFO.phone}`}
            className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold hover:text-gold-500 transition-colors ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            {CONTACT_INFO.phone}
          </a>
          <p className={`text-xs mt-1 sm:mt-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Available during studio hours: Mon-Sun, 8:00 AM - 9:00 PM
          </p>
        </div>

        {/* Email Contact */}
        <div className={`p-3 sm:p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-stone-800/30 border-stone-700' 
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={`p-1.5 sm:p-2 rounded-full ${
              isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}>
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Email Support
            </h4>
          </div>
          <p className={`mb-1 sm:mb-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            Send us an email for detailed inquiries:
          </p>
          <a 
            href={`mailto:${CONTACT_INFO.email}`}
            className={`text-sm sm:text-base md:text-lg font-bold hover:text-gold-500 transition-colors ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}
          >
            {CONTACT_INFO.email}
          </a>
          <p className={`text-xs mt-1 sm:mt-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            We typically respond within 24 hours
          </p>
        </div>
      </div>

      {/* Support Message */}
      <div className={`mt-3 sm:mt-4 p-2 sm:p-3 md:p-4 rounded-lg ${
        isDarkMode 
          ? 'bg-teal-900/20 border border-teal-800/50' 
          : 'bg-teal-50 border border-teal-200'
      }`}>
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 ${
            isDarkMode ? 'text-teal-400' : 'text-teal-600'
          }`} />
          <div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              <strong>Need immediate assistance?</strong> Our team is ready to help you with any questions about your booking or project details. Feel free to contact us through any of the channels above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  
  // Flow state management
  const [flowState, setFlowState] = useState<SubmissionFlowState>(SubmissionFlowState.IDLE);
  const [errorContext, setErrorContext] = useState<ErrorContext | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(false);
  
  // Time adjustment state
  const [timeWasAutoAdjusted, setTimeWasAutoAdjusted] = useState(false);
  const [originalTimeBeforeAdjustment, setOriginalTimeBeforeAdjustment] = useState('');
  const [showStudioHoursGuide, setShowStudioHoursGuide] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [datePickerMin, setDatePickerMin] = useState<string>('');

  // Set minimum date for date picker (today)
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDatePickerMin(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Get studio hours display text
  const studioHoursDisplay = getStudioHoursDisplay();

  // Fetch service details based on service name from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceName = searchParams.get('service');
    
    if (serviceName) {
      const decodedServiceName = decodeURIComponent(serviceName);
      setFormData(prev => ({ 
        ...prev, 
        serviceType: decodedServiceName
      }));
      setIsPreFilled(true);
      
      // Fetch service details from API
      fetchServiceDetails(decodedServiceName);
    }
  }, [location.search]);

  const fetchServiceDetails = async (serviceName: string) => {
    setIsLoadingService(true);
    try {
      const response = await fetch(`${API_URL}/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      
      if (data.services && Array.isArray(data.services)) {
        const service = data.services.find(
          (s: any) => s.title.toLowerCase() === serviceName.toLowerCase()
        );
        
        if (service) {
          let budgetDisplay = 'Contact for quote';
          
          if (service.price_display) {
            budgetDisplay = service.price_display;
          } else if (service.price_min && service.price_max) {
            budgetDisplay = `Ksh ${service.price_min.toLocaleString()} - ${service.price_max.toLocaleString()}`;
          } else if (service.price_min) {
            budgetDisplay = `From Ksh ${service.price_min.toLocaleString()}`;
          } else if (service.price_max) {
            budgetDisplay = `Up to Ksh ${service.price_max.toLocaleString()}`;
          }
          
          setFormData(prev => ({ 
            ...prev, 
            budget: budgetDisplay
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      setFormData(prev => ({ 
        ...prev, 
        budget: 'Contact for quote'
      }));
    } finally {
      setIsLoadingService(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Only allow changes to fields that are NOT pre-filled (serviceType and budget)
    if ((name === 'serviceType' || name === 'budget') && isPreFilled) {
      return;
    }
    
    // Handle date changes
    if (name === 'date') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-show studio hours guide when date is selected
      if (value) {
        setShowStudioHoursGuide(true);
      }
    } 
    // Handle time changes with validation
    else if (name === 'time') {
      const selectedDate = formData.date;
      
      if (selectedDate) {
        const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
        const studioHours = STUDIO_HOURS[dayOfWeek];
        
        // Validate time against studio hours
        if (value < studioHours.open || value > studioHours.close) {
          setFieldErrors(prev => ({
            ...prev,
            time: `Studio operates ${studioHours.open} - ${studioHours.close} on ${dayOfWeek}s`
          }));
          setShowStudioHoursGuide(true);
        } else {
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.time;
            return newErrors;
          });
        }
      }
      
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Reset time adjustment indicator if user manually changes time
      if (timeWasAutoAdjusted) {
        setTimeWasAutoAdjusted(false);
      }
    } 
    // Handle other fields
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name] && name !== 'time') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFlowState(SubmissionFlowState.IDLE);
    setErrorContext(null);
  };

  // Handle time selection from studio hours guide
  const handleSuggestedTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    
    // Clear time error if valid
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.time;
      return newErrors;
    });
    
    // Reset time adjustment indicator if user manually changes time
    if (timeWasAutoAdjusted) {
      setTimeWasAutoAdjusted(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Service type is required';
    
    // Validate event date if provided
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Booking date cannot be in the past';
      }
    }
    
    // Validate time against studio hours
    if (formData.date && formData.time) {
      const dayOfWeek = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
      const studioHours = STUDIO_HOURS[dayOfWeek];
      
      if (formData.time < studioHours.open || formData.time > studioHours.close) {
        errors.time = `Studio operates ${studioHours.open} - ${studioHours.close} on ${dayOfWeek}s`;
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFlowResolution = (action: 'accept_suggestion' | 'manual_adjust' | 'retry') => {
    switch (action) {
      case 'accept_suggestion':
        if (flowState === SubmissionFlowState.STUDIO_HOURS_ERROR || 
            flowState === SubmissionFlowState.TIME_ADJUSTED_PENDING_REVIEW) {
          // Auto-apply suggested time
          if (errorContext?.details?.suggested_time) {
            setFormData(prev => ({ ...prev, time: errorContext.details.suggested_time! }));
            setTimeWasAutoAdjusted(true);
            setOriginalTimeBeforeAdjustment(errorContext.details.original_time || '');
          }
          // Clear time error
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.time;
            return newErrors;
          });
        }
        break;

      case 'manual_adjust':
        if (flowState === SubmissionFlowState.STUDIO_HOURS_ERROR) {
          setShowStudioHoursGuide(true);
        }
        break;

      case 'retry':
        // Retry submission
        handleSubmit(new Event('submit') as any);
        break;
    }
    
    // Close modal
    setFlowState(SubmissionFlowState.IDLE);
    setErrorContext(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stage 1: Pre-submission validation
    setFlowState(SubmissionFlowState.VALIDATING);
    
    if (!validateForm()) {
      setFlowState(SubmissionFlowState.VALIDATION_FAILED);
      return;
    }

    // Stage 2: Check studio hours
    if (formData.date && formData.time) {
      const dayOfWeek = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
      const studioHours = STUDIO_HOURS[dayOfWeek];
      
      if (formData.time < studioHours.open || formData.time > studioHours.close) {
        // Calculate suggested time (next available time within studio hours)
        const suggestedTime = formData.time < studioHours.open ? studioHours.open : studioHours.close;
        
        setErrorContext({
          type: 'studio_hours',
          message: 'Selected time is outside studio operating hours',
          details: {
            original_time: formData.time,
            suggested_time: suggestedTime,
            studio_hours: {
              open: studioHours.open,
              close: studioHours.close,
              day: dayOfWeek
            }
          }
        });
        setFlowState(SubmissionFlowState.STUDIO_HOURS_ERROR);
        return;
      }
    }

    // Stage 3: Submission
    setFlowState(SubmissionFlowState.SUBMITTING);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          serviceType: formData.serviceType,
          date: formData.date,
          time: formData.time || undefined,
          location: formData.location || undefined,
          budget: formData.budget || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit booking');
      }

      // Success
      setBookingId(data.id);
      setFlowState(SubmissionFlowState.SUCCESS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting booking:', err);
      setErrorContext({
        type: 'network',
        message: err.message || 'Failed to submit booking. Please try again.'
      });
      setFlowState(SubmissionFlowState.NETWORK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
    setFlowState(SubmissionFlowState.IDLE);
    setErrorContext(null);
    setBookingId(null);
    setIsPreFilled(false);
    setTimeWasAutoAdjusted(false);
    setOriginalTimeBeforeAdjustment('');
    setShowStudioHoursGuide(false);
    setFieldErrors({});
  };

  if (flowState === SubmissionFlowState.SUCCESS) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} py-20 px-4 flex items-center justify-center`}>
        <div className={`max-w-2xl w-full ${isDarkMode ? 'bg-stone-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 md:p-12 text-center border ${isDarkMode ? 'border-stone-700' : 'border-stone-100'} relative overflow-hidden animate-[fadeIn_0.5s_ease-out]`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full z-0"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-2`}>
              Booking Request Received!
            </h2>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'} mb-8`}>
              Thank you, {formData.name}. We are excited to work with you.
            </p>

            {/* Booking ID */}
            {bookingId && (
              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                <p className={`text-sm text-center ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Your booking reference: <span className="font-mono font-bold">#{bookingId}</span>
                </p>
              </div>
            )}
            
            {/* Time Adjustment Notice */}
            {timeWasAutoAdjusted && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                isDarkMode 
                  ? 'bg-blue-900/40 border-blue-800' 
                  : 'bg-blue-50 border-blue-100'
              }`}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Time Adjustment Applied</h4>
                    <p className="text-xs sm:text-sm">
                      Your requested time was adjusted from <span className="line-through">{originalTimeBeforeAdjustment}</span> to <strong>{formData.time}</strong> to fit our studio hours.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} rounded-2xl p-6 mb-8 text-left border ${isDarkMode ? 'border-stone-600' : 'border-stone-100'} shadow-inner`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4 border-b ${isDarkMode ? 'border-stone-600' : 'border-stone-200'} pb-2 text-sm uppercase tracking-wide`}>
                Request Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Service</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.serviceType}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Budget Range</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.budget || 'Not specified'}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Date & Time</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                    {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Not specified'}
                    {formData.time && ` at ${formData.time.substring(0, 5)}`}
                  </span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Location</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Contact</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.phone}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} text-xs uppercase tracking-wider mb-1`}>Email</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>{formData.email}</span>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} ${isDarkMode ? 'text-stone-300' : 'text-stone-700'} p-5 rounded-xl mb-8 text-sm flex items-start gap-3 border ${isDarkMode ? 'border-stone-600' : 'border-stone-200'}`}>
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                <strong>What happens next?</strong> Our team will review your availability and requirements. You will receive a confirmation call or email within <strong>24 hours</strong> to finalize the details and deposit.
              </p>
            </div>

            {/* Contact Information */}
            <ContactInformation isDarkMode={isDarkMode} />

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
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
      {/* Adaptive Modal */}
      <AdaptiveModal
        flowState={flowState}
        errorContext={errorContext}
        onResolve={handleFlowResolution}
        onClose={() => {
          setFlowState(SubmissionFlowState.IDLE);
          setErrorContext(null);
        }}
        isDarkMode={isDarkMode}
        formData={formData}
      />

      {/* Enhanced Processing Overlay */}
      {flowState === SubmissionFlowState.SUBMITTING && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`max-w-lg w-full rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-b border shadow-2xl ${
            isDarkMode 
              ? 'from-stone-900 to-stone-950 border-stone-800' 
              : 'from-white to-stone-50 border-stone-200'
          }`}>
            <div className="flex flex-col items-center text-center">
              {/* Animated Icon */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 relative ${
                isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
              }`}>
                <Loader2 className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 animate-spin ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`} />
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping"></div>
              </div>

              {/* Main Title */}
              <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                Processing Your Booking
              </h3>

              {/* Status Message */}
              <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${
                isDarkMode ? 'text-stone-300' : 'text-stone-600'
              }`}>
                This may take a moment as we process your booking request...
              </p>

              {/* Processing Steps */}
              <div className={`w-full rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border ${
                isDarkMode 
                  ? 'bg-stone-800/50 border-stone-700' 
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="space-y-3 sm:space-y-4 text-left">
                  {/* Step 1 - Validating */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs sm:text-sm ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        Validating your information
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        Completed ✓
                      </p>
                    </div>
                  </div>

                  {/* Step 2 - Checking Availability */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDarkMode ? 'bg-teal-600' : 'bg-teal-500'
                    }`}>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs sm:text-sm ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        Checking studio availability
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`}>
                        In progress...
                      </p>
                    </div>
                  </div>

                  {/* Step 3 - Sending Confirmation */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 ${
                      isDarkMode 
                        ? 'border-stone-600 bg-stone-800' 
                        : 'border-stone-300 bg-stone-100'
                    }`}>
                      <Mail className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs sm:text-sm ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-600'
                      }`}>
                        Sending confirmation email
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`}>
                        Queued
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`w-full rounded-full h-1.5 sm:h-2 overflow-hidden ${
                isDarkMode ? 'bg-stone-800' : 'bg-stone-200'
              }`}>
                <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 h-full animate-pulse" 
                     style={{ width: '60%', transition: 'width 2s ease-in-out' }}>
                </div>
              </div>

              {/* Helpful Message */}
              <div className={`mt-4 sm:mt-6 p-2 sm:p-3 md:p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-teal-900/40 border-teal-800' 
                  : 'bg-teal-50 border-teal-200'
              }`}>
                <p className={`text-xs flex items-center justify-center gap-1.5 sm:gap-2 ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-700'
                }`}>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    <strong>This may take 10-30 seconds</strong> as we send confirmation emails and check for scheduling conflicts
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <p>{studioHoursDisplay}</p>
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
              <p className="text-xl font-bold text-gold-500">{CONTACT_INFO.phone}</p>
            </div>
          </div>

          {/* Form Area */}
          <div className={`p-8 lg:p-12 lg:w-3/5 ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}>
            {flowState === SubmissionFlowState.VALIDATION_FAILED && Object.keys(fieldErrors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                      {Object.values(fieldErrors).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="name" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Full Name <Tooltip text="Please enter your legal first and last name for our records." />
                  </label>
                  <input 
                    required 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 disabled:opacity-50 ${
                      fieldErrors.name ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                    }`} 
                    placeholder={KENYA_PLACEHOLDERS.name}
                  />
                  {fieldErrors.name && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <span>{fieldErrors.name}</span>
                    </div>
                  )}
                </div>
                <div className="group">
                  <label htmlFor="phone" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Phone Number <Tooltip text="A valid mobile number where we can reach you for immediate confirmation." />
                  </label>
                  <input 
                    required 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 disabled:opacity-50 ${
                      fieldErrors.phone ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                    }`} 
                    placeholder={KENYA_PLACEHOLDERS.phone}
                  />
                  {fieldErrors.phone && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                  Email Address <Tooltip text="We will send the booking confirmation and invoice to this address." />
                </label>
                <input 
                  required 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 disabled:opacity-50 ${
                    fieldErrors.email ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                  }`} 
                  placeholder={KENYA_PLACEHOLDERS.email}
                />
                {fieldErrors.email && (
                  <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-red-950/50 text-red-300 border border-red-800' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Service Type and Budget Range - Display only (not editable when pre-filled) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="serviceType" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Service Type 
                    {isPreFilled && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Selected
                      </span>
                    )}
                    <Tooltip text="The service you selected from our services page." />
                  </label>
                  <div className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700/50 border-stone-600 text-white' : 'bg-stone-100 border-stone-200 text-stone-900'} rounded-xl flex items-center justify-between ${
                    fieldErrors.serviceType ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                  }`}>
                    <span className="font-medium">{formData.serviceType || 'No service selected'}</span>
                    {isPreFilled && !isLoadingService && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {isLoadingService && <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />}
                  </div>
                  {fieldErrors.serviceType && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <span>{fieldErrors.serviceType}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="budget" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Budget Range (KES) 
                    {isPreFilled && formData.budget && formData.budget !== 'Contact for quote' && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Auto-filled
                      </span>
                    )}
                    <Tooltip text="Price range for the selected service." />
                  </label>
                  <div className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700/50 border-stone-600 text-white' : 'bg-stone-100 border-stone-200 text-stone-900'} rounded-xl flex items-center justify-between`}>
                    {isLoadingService ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                        <span className="text-stone-500">Loading price...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{formData.budget || 'Contact for quote'}</span>
                        {isPreFilled && formData.budget && formData.budget !== 'Contact for quote' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Preferred Date <Tooltip text="The specific date of your event or preferred session day." />
                  </label>
                  <input 
                    required 
                    type="date" 
                    id="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    min={datePickerMin}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all disabled:opacity-50 ${
                      fieldErrors.date ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                    }`} 
                  />
                  {fieldErrors.date && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <span>{fieldErrors.date}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="time" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                    Preferred Time <Tooltip text="The approximate start time for the shoot." />
                  </label>
                  <input 
                    type="time" 
                    id="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all disabled:opacity-50 ${
                      fieldErrors.time ? 'border-2 border-red-500 ring-2 ring-red-500/20' : ''
                    }`} 
                  />
                  {fieldErrors.time && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <span>⚠️ {fieldErrors.time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Studio Hours Guide */}
              {showStudioHoursGuide && formData.date && (
                <StudioHoursGuide
                  day={new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  isVisible={showStudioHoursGuide}
                  isDarkMode={isDarkMode}
                  onSelectTime={handleSuggestedTimeSelect}
                  currentTime={formData.time}
                />
              )}

              <div>
                <label htmlFor="location" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                  Shoot Location <Tooltip text="The venue name or physical address where the shoot will take place (e.g., Juja Studio, Arboretum)." />
                </label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 disabled:opacity-50`} 
                  placeholder={KENYA_PLACEHOLDERS.location}
                />
              </div>

              <div>
                <label htmlFor="notes" className={`block text-sm font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'} mb-2`}>
                  Additional Notes / Vision <Tooltip text="Any specific requests, themes, mood boards, number of people involved, or questions." />
                </label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  rows={4} 
                  value={formData.notes} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400 disabled:opacity-50`} 
                  placeholder="Tell us about the vibe you're going for, number of people, or any specific shots you need..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.serviceType || isLoadingService || flowState === SubmissionFlowState.SUBMITTING}
                className={`w-full bg-gold-500 hover:bg-gold-600 text-stone-900 font-bold text-lg py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/30 flex items-center justify-center gap-2 ${
                  isSubmitting || !formData.serviceType || isLoadingService || flowState === SubmissionFlowState.SUBMITTING ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {flowState === SubmissionFlowState.SUBMITTING ? (
                  <>Processing Request <Loader2 className="h-5 w-5 animate-spin" /></>
                ) : (
                  <>Submit Booking Request <CheckCircle className="h-5 w-5" /></>
                )}
              </button>

              {!formData.serviceType && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={`text-sm text-center ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    <Info className="inline w-4 h-4 mr-1" />
                    Please select a service from our <Link to="/services" className="underline font-semibold">services page</Link> to continue booking.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
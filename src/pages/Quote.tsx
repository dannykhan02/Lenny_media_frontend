import React, { useState, useEffect } from 'react';
import { Camera, Video, Check, Sparkles, User, Instagram, Facebook, Globe, Search, Layers, ChevronRight, Loader2, Mail, Clock, AlertCircle, Calendar, X, Info, RefreshCw, Zap, Package as PackageIcon, CheckSquare, MessageSquare, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========== ENUMS & TYPES ==========
enum SubmissionFlowState {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SUBMITTING = 'SUBMITTING',
  STUDIO_HOURS_ERROR = 'STUDIO_HOURS_ERROR',
  DAY_FULL_ERROR = 'DAY_FULL_ERROR',
  TIME_ADJUSTED_PENDING_REVIEW = 'TIME_ADJUSTED_PENDING_REVIEW',
  DATE_ADJUSTED_PENDING_REVIEW = 'DATE_ADJUSTED_PENDING_REVIEW',
  REVIEWING_CHANGES = 'REVIEWING_CHANGES',
  MANUAL_ADJUSTMENT_MODE = 'MANUAL_ADJUSTMENT_MODE',
  CONFLICT_WARNING = 'CONFLICT_WARNING',
  SUCCESS_WITH_CONFLICT = 'SUCCESS_WITH_CONFLICT',
  SUCCESS_NO_CONFLICT = 'SUCCESS_NO_CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

interface Service {
  id: number;
  category: string;
  title: string;
  slug: string;
  description?: string;
  price_display?: string;
  icon_name?: string;
  is_active: boolean;
  is_featured: boolean;
  price_range?: string;
  price_min?: number;
  price_max?: number;
  features?: string[];
}

interface SelectedService {
  id: number;
  title: string;
  category: string;
  price_range?: string;
  price_min?: number;
  price_max?: number;
  features?: string[];
}

interface QuoteResponse {
  message: string;
  processing_info: {
    client_email: string;
    admin_email: string;
    estimated_time: string;
  };
  quote_request: {
    id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    company_name: string | null;
    selected_services: SelectedService[];
    event_date: string;
    event_time: string;
    event_location: string;
    budget_range: string;
    project_description: string;
    referral_source: string | null;
    status: string;
    quoted_amount: number | null;
    quote_details: string | null;
    quote_sent_at: string | null;
    valid_until: string | null;
    has_conflict: boolean;
    conflict_checked_at: string;
    assigned_to: number | null;
    created_at: string;
    updated_at: string;
    conflicting_count: number;
    conflicting_quotes: any[];
    price_estimate?: {
      min_estimate: number;
      max_estimate: number;
      service_count: number;
      formatted: string;
    };
  };
  id: number;
  warning?: {
    message: string;
    conflicting_quotes: number;
  };
  suggested_date?: string;
  suggested_day?: string;
  suggested_start?: string;
  suggested_end?: string;
  rescheduling_required?: boolean;
  studio_hours?: {
    open: string;
    close: string;
    day: string;
  };
}

interface ErrorContext {
  type: 'studio_hours' | 'day_full' | 'conflict' | 'validation' | 'network';
  message: string;
  details?: {
    original_time?: string;
    suggested_time?: string;
    studio_hours?: {
      open: string;
      close: string;
      day: string;
    };
    suggested_date?: string;
    suggested_day?: string;
    conflicting_quotes?: number;
  };
}

interface ServicesByCategory {
  photography: Service[];
  videography: Service[];
}

// ========== CONSTANTS ==========
const KENYA_PLACEHOLDERS = {
  name: 'John Mwangi',
  email: 'john.mwangi@company.co.ke',
  phone: '+254 712 345 678',
  company: 'Acme Productions Ltd',
  location: 'KICC, Nairobi'
} as const;

const REFERRAL_OPTIONS = [
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-3 h-3 sm:w-4 sm:h-4" /> },
  { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-3 h-3 sm:w-4 sm:h-4" /> },
  { id: 'google', label: 'Google Search', icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" /> },
  { id: 'friend', label: 'Referral', icon: <User className="w-3 h-3 sm:w-4 sm:h-4" /> },
  { id: 'website', label: 'Other', icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" /> },
];

const BUDGET_RANGES = ['< 20k', '20k - 50k', '50k - 100k', '100k - 250k', '250k +'];

const STUDIO_HOURS: Record<string, { open: string; close: string }> = {
  'Monday': { open: '08:00', close: '21:00' },
  'Tuesday': { open: '08:00', close: '21:00' },
  'Wednesday': { open: '08:00', close: '21:00' },
  'Thursday': { open: '08:30', close: '21:00' },
  'Friday': { open: '08:00', close: '21:00' },
  'Saturday': { open: '08:00', close: '21:00' },
  'Sunday': { open: '11:00', close: '21:00' },
};

// Contact Information
const CONTACT_INFO = {
  phone: '+254 705 459768',
  email: 'dannykhan614@gmail.com',
  whatsapp: '+254 705 459768'
};

// ========== UTILITY FUNCTIONS ==========
const formatCurrency = (amount: number, showSymbol = true) => {
  if (!amount && amount !== 0) return showSymbol ? 'Ksh 0' : '0';
  
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return showSymbol ? `Ksh ${formatted}` : formatted;
};

// ========== COMPONENTS ==========

// Adaptive Modal Component
const AdaptiveModal: React.FC<{
  flowState: SubmissionFlowState;
  errorContext: ErrorContext | null;
  onResolve: (action: 'accept_suggestion' | 'manual_adjust' | 'change_date' | 'continue_anyway' | 'retry') => void;
  onClose: () => void;
  isDarkMode: boolean;
  formData?: any;
}> = ({ flowState, errorContext, onResolve, onClose, isDarkMode, formData }) => {
  if (![
    SubmissionFlowState.STUDIO_HOURS_ERROR,
    SubmissionFlowState.DAY_FULL_ERROR,
    SubmissionFlowState.TIME_ADJUSTED_PENDING_REVIEW,
    SubmissionFlowState.DATE_ADJUSTED_PENDING_REVIEW,
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
            { label: 'Pick Different Time', action: 'manual_adjust', primary: false },
            { label: 'Change Date Instead', action: 'change_date', primary: false }
          ]
        };

      case SubmissionFlowState.DAY_FULL_ERROR:
        return {
          title: "📅 This Day is Fully Booked",
          icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
          iconBgColor: isDarkMode ? 'bg-red-900/40' : 'bg-red-100',
          iconColor: isDarkMode ? 'text-red-400' : 'text-red-600',
          bgGradient: isDarkMode 
            ? 'from-stone-900 to-stone-950 border-stone-800' 
            : 'from-white to-stone-50 border-stone-200',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base">We've reached our maximum capacity of 5 projects for {formData?.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'this date'}.</p>
              <div className={`rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-amber-900/40 border border-amber-800' : 'bg-amber-100 border border-amber-200'}`}>
                <p className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Next Available Date:</p>
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className="text-sm sm:text-lg font-bold">
                    {errorContext?.details?.suggested_day}, {errorContext?.details?.suggested_date ? new Date(errorContext.details.suggested_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
              <p className="text-sm sm:text-base">Would you like to reschedule or join the waitlist for your original date?</p>
            </div>
          ),
          actions: [
            { label: `Book ${errorContext?.details?.suggested_day} Instead`, action: 'accept_suggestion', primary: true },
            { label: 'Join Waitlist', action: 'continue_anyway', primary: false }
          ]
        };

      case SubmissionFlowState.TIME_ADJUSTED_PENDING_REVIEW:
        return {
          title: "⏰ Time Updated to Studio Hours",
          icon: <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />,
          iconBgColor: isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100',
          iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
          bgGradient: isDarkMode 
            ? 'from-stone-900 to-stone-950 border-stone-800' 
            : 'from-white to-stone-50 border-stone-200',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className={`rounded-lg p-3 sm:p-4 text-center ${isDarkMode ? 'bg-red-900/40 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs uppercase mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Original</p>
                  <p className={`font-bold line-through text-sm sm:text-base ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errorContext?.details?.original_time}</p>
                </div>
                <div className={`rounded-lg p-3 sm:p-4 text-center ${isDarkMode ? 'bg-green-900/40 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
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
              <p className="text-sm sm:text-base">Your quote request has been saved locally. You can try submitting again.</p>
            </div>
          ),
          actions: [
            { label: 'Try Again', action: 'retry', primary: true },
            { label: 'Save & Submit Later', action: 'manual_adjust', primary: false }
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

// Scheduling Status Card Component
const SchedulingStatusCard: React.FC<{
  hasConflict: boolean;
  conflictCount: number;
  eventDate: string;
  eventTime: string;
  isDarkMode: boolean;
}> = ({ hasConflict, conflictCount, eventDate, eventTime, isDarkMode }) => {
  if (!hasConflict) return null;

  return (
    <div className={`mb-6 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 bg-gradient-to-br shadow-xl ${
      isDarkMode 
        ? 'from-teal-900/90 to-cyan-900/80 border-teal-500 shadow-teal-900/50' 
        : 'from-teal-100 to-cyan-100 border-teal-500 shadow-teal-300/30'
    }`}>
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon Container with Ring Effect */}
        <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ring-2 ${
          isDarkMode 
            ? 'bg-teal-500/30 text-teal-300 ring-teal-500' 
            : 'bg-teal-300 text-teal-800 ring-teal-500'
        }`}>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 ${
            isDarkMode ? 'text-teal-200' : 'text-teal-900'
          }`}>
            ⚠️ SCHEDULING NOTICE
          </h3>
          
          {/* Main Message */}
          <p className={`mb-3 sm:mb-4 text-xs sm:text-sm ${isDarkMode ? 'text-teal-100' : 'text-teal-900'}`}>
            We've received your request for <strong>{new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{eventTime.substring(0, 5)}</strong>. This time slot currently has {conflictCount} other pending {conflictCount === 1 ? 'request' : 'requests'}.
          </p>
          
          {/* What Happens Next Box */}
          <div className={`p-3 sm:p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-700' 
              : 'bg-white/80 border-teal-200'
          }`}>
            <h4 className={`font-semibold mb-2 sm:mb-3 text-xs sm:text-sm ${
              isDarkMode ? 'text-teal-300' : 'text-teal-700'
            }`}>What happens next:</h4>
            
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {/* Step 1 */}
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Your request is confirmed and in our queue
                </span>
              </li>
              
              {/* Step 2 */}
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  We'll review all requests for this time slot
                </span>
              </li>
              
              {/* Step 3 */}
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  You'll receive a follow-up email within 24 hours confirming availability
                </span>
              </li>
              
              {/* Step 4 */}
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RefreshCw className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  If needed, we'll suggest alternative times that work for your schedule
                </span>
              </li>
            </ul>
          </div>
          
          {/* Bottom Message Box */}
          <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-center ${
            isDarkMode 
              ? 'bg-slate-800/40 border border-slate-700' 
              : 'bg-slate-100 border border-slate-300'
          }`}>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No action required from you right now - we'll handle the coordination!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Changes Modal Component
const ReviewChangesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onModify: () => void;
  onReset: () => void;
  changes: {
    originalTime?: string;
    newTime?: string;
    originalDate?: string;
    newDate?: string;
    reason: string;
  };
  formData: any;
  selectedServices: any[];
  isDarkMode: boolean;
}> = ({ isOpen, onClose, onConfirm, onModify, onReset, changes, formData, selectedServices, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className={`max-w-2xl w-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl bg-gradient-to-b ${
        isDarkMode 
          ? 'from-stone-900 to-stone-950 border border-stone-800' 
          : 'from-white to-stone-50 border border-stone-200'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-stone-700/30">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                📋 Review Your Updated Request
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Please verify all details before final submission
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1 sm:p-2 rounded-lg hover:bg-stone-700/30 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
          {/* What Changed Section */}
          {changes.originalTime && changes.newTime && (
            <div>
              <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>What Changed:</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className={`rounded-lg p-3 sm:p-4 ${
                  isDarkMode 
                    ? 'bg-red-900/40 border-2 border-red-800' 
                    : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span className={`text-xs sm:text-sm font-semibold ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>Original Time</span>
                  </div>
                  <p className={`font-bold text-base sm:text-lg line-through ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>{changes.originalTime}</p>
                </div>
                <div className={`rounded-lg p-3 sm:p-4 ${
                  isDarkMode 
                    ? 'bg-green-900/40 border-2 border-green-800' 
                    : 'bg-green-50 border-2 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className={`text-xs sm:text-sm font-semibold ${
                      isDarkMode ? 'text-green-300' : 'text-green-700'
                    }`}>Updated Time</span>
                  </div>
                  <p className={`font-bold text-base sm:text-lg ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>{changes.newTime}</p>
                </div>
              </div>
              <div className={`mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800/50 border border-stone-700' 
                  : 'bg-stone-100 border border-stone-200'
              }`}>
                <p className="text-xs sm:text-sm">
                  <strong>Reason:</strong> {changes.reason}
                </p>
              </div>
            </div>
          )}

          {/* Complete Request Summary */}
          <div>
            <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Your Complete Request Summary:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-stone-800/50 border-stone-700' 
                  : 'bg-stone-100 border-stone-200'
              }`}>
                <h5 className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>Services:</h5>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedServices.map((service: any) => (
                    <span key={service.id} className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-stone-700 text-white border border-stone-600' 
                        : 'bg-stone-200 text-stone-800 border border-stone-300'
                    }`}>
                      {service.title}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-stone-800/50 border-stone-700' 
                  : 'bg-stone-100 border-stone-200'
              }`}>
                <h5 className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>Date & Time:</h5>
                <p className="font-semibold text-sm sm:text-base">
                  {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Not specified'}
                  {formData.time && ` at ${formData.time.substring(0, 5)}`}
                </p>
              </div>
              {formData.location && (
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-stone-800/50 border-stone-700' 
                    : 'bg-stone-100 border-stone-200'
                }`}>
                  <h5 className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>Location:</h5>
                  <p className="font-semibold text-sm sm:text-base">{formData.location}</p>
                </div>
              )}
              {formData.budget && (
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-stone-800/50 border-stone-700' 
                    : 'bg-stone-100 border-stone-200'
                }`}>
                  <h5 className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>Budget Range:</h5>
                  <p className="font-semibold text-sm sm:text-base text-gold-600">{formData.budget}</p>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className={`p-3 sm:p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-900/40 border-2 border-blue-800' 
              : 'bg-blue-50 border-2 border-blue-100'
          }`}>
            <h4 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>Next Steps:</h4>
            <p className="text-xs sm:text-sm">
              If everything looks correct, submit your request. We'll send you a confirmation email immediately.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 md:p-6 border-t border-stone-700/30 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onReset}
            className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              isDarkMode
                ? 'border border-stone-600 text-stone-300 hover:bg-stone-800'
                : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Start Over
          </button>
          <button
            onClick={onModify}
            className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              isDarkMode
                ? 'border border-stone-600 text-stone-300 hover:bg-stone-800'
                : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Make More Changes
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 sm:px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-all text-xs sm:text-sm"
          >
            Everything Looks Good - Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Time Adjustment Indicator Component
const TimeAdjustmentIndicator: React.FC<{
  originalTime: string;
  newTime: string;
  onReview: () => void;
  isDarkMode: boolean;
}> = ({ originalTime, newTime, onReview, isDarkMode }) => (
  <div className="absolute -top-8 left-0 right-0 animate-in slide-in-from-top">
    <div className={`rounded-lg p-2 text-xs border-2 bg-gradient-to-r ${
      isDarkMode 
        ? 'from-blue-950/80 to-blue-900/60 border-blue-700' 
        : 'from-blue-50 to-blue-100 border-blue-300'
    }`}>
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
        <div className="flex items-center gap-2">
          <Clock className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`font-medium ${
            isDarkMode ? 'text-blue-200' : 'text-blue-800'
          }`}>Time adjusted from <span className="line-through">{originalTime}</span> → <span className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{newTime}</span></span>
        </div>
        <button
          onClick={onReview}
          className={`font-medium text-xs ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          Review Change
        </button>
      </div>
    </div>
  </div>
);

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
              <strong>Need immediate assistance?</strong> Our team is ready to help you with any questions about your quote or project details. Feel free to contact us through any of the channels above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Services with Price Range Component
const ServicesWithPriceRange: React.FC<{
  services: SelectedService[];
  priceEstimate?: {
    min_estimate: number;
    max_estimate: number;
    service_count: number;
    formatted: string;
  };
  isDarkMode: boolean;
  showContactInfo?: boolean;
}> = ({ services, priceEstimate, isDarkMode, showContactInfo = false }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-3 sm:py-4">
        <PackageIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-stone-400 mx-auto mb-1 sm:mb-2" />
        <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
          No services selected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Services list */}
      <div className="space-y-2 sm:space-y-3">
        {services.map((service, idx) => {
          const serviceTitle = service.title;
          const priceRange = service.price_range;
          const priceMin = service.price_min;
          const priceMax = service.price_max;
          const features = service.features || [];
          const category = service.category;

          // Format price range with Ksh if needed
          const formattedPriceRange = priceRange 
            ? priceRange.replace('$', 'Ksh ') 
            : (priceMin !== undefined && priceMax !== undefined) 
              ? `Ksh ${formatCurrency(priceMin, false)} – ${formatCurrency(priceMax, false)}`
              : null;

          return (
            <div
              key={idx}
              className={`p-2 sm:p-3 md:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 md:gap-4 ${
                isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Service header with title and price */}
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <CheckSquare className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 ${
                  isDarkMode ? 'text-gold-500' : 'text-gold-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-xs sm:text-sm md:text-base truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    {serviceTitle}
                  </h4>
                  {category && (
                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full mt-1 ${
                      isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {category}
                    </span>
                  )}
                  
                  {/* Features list */}
                  {features && features.length > 0 && (
                    <div className={`mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5`}>
                      {features.map((feature, featureIdx) => (
                        <span
                          key={featureIdx}
                          className={`px-1.5 py-0.5 text-xs rounded ${
                            isDarkMode 
                              ? 'bg-stone-700/50 text-stone-300 border border-stone-600' 
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price range display with dark/light mode support */}
              {formattedPriceRange && (
                <div className={`text-left sm:text-right flex-shrink-0 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  <div className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                    {formattedPriceRange}
                  </div>
                  {priceMin !== undefined && priceMax !== undefined && (
                    <div className={`text-xs break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      {formatCurrency(priceMin)} – {formatCurrency(priceMax)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total price estimate */}
      {priceEstimate && (
        <>
          <div className={`mt-3 sm:mt-4 md:mt-6 pt-2 sm:pt-3 md:pt-4 border-t ${
            isDarkMode ? 'border-gold-700' : 'border-gold-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <div className="min-w-0">
                <h4 className={`font-bold text-xs sm:text-sm md:text-base break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Total Price Estimate
                </h4>
                <p className={`text-xs break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Based on selected services
                </p>
              </div>
              <div className={`text-left sm:text-right ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div className="font-bold text-sm sm:text-base md:text-lg">
                  {priceEstimate.formatted 
                    ? priceEstimate.formatted.replace('$', 'Ksh ') 
                    : priceEstimate.min_estimate !== undefined && priceEstimate.max_estimate !== undefined
                      ? `Ksh ${formatCurrency(priceEstimate.min_estimate, false)} – ${formatCurrency(priceEstimate.max_estimate, false)}`
                      : 'Price on request'}
                </div>
                {priceEstimate.min_estimate !== undefined && priceEstimate.max_estimate !== undefined && (
                  <div className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {formatCurrency(priceEstimate.min_estimate)} – {formatCurrency(priceEstimate.max_estimate)}
                  </div>
                )}
              </div>
            </div>
            {priceEstimate.service_count > 0 && (
              <p className={`text-xs mt-1 sm:mt-2 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Includes {priceEstimate.service_count} service{priceEstimate.service_count !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {/* PRICE ESTIMATE DISCLAIMER */}
          <div className={`mt-3 sm:mt-4 p-2 sm:p-3 md:p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-amber-900/20 border-amber-800/50' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`} />
              <div>
                <h5 className={`font-semibold text-xs sm:text-sm mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  💬 Price Estimate Notice
                </h5>
                <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                  <strong>This is just an estimate, not the final price.</strong> Actual pricing may vary based on:
                </p>
                <ul className={`mt-1 text-xs sm:text-sm space-y-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  <li>• Specific project requirements and duration</li>
                  <li>• Travel distance and location logistics</li>
                  <li>• Equipment needs and crew size</li>
                  <li>• Post-production requirements</li>
                </ul>
                <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium break-words ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  All prices are negotiable. Contact us at <strong>{CONTACT_INFO.phone}</strong> or <strong>{CONTACT_INFO.email}</strong> to discuss your specific needs!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const Quote: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [photographyServices, setPhotographyServices] = useState<Service[]>([]);
  const [videographyServices, setVideographyServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [referralSource, setReferralSource] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    date: '', 
    time: '12:00',
    location: '', 
    budget: '', 
    message: ''
  });
  
  // Flow state management
  const [flowState, setFlowState] = useState<SubmissionFlowState>(SubmissionFlowState.IDLE);
  const [errorContext, setErrorContext] = useState<ErrorContext | null>(null);
  
  // UI state
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string>('');
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [datePickerMin, setDatePickerMin] = useState<string>('');
  
  // Time adjustment state
  const [timeWasAutoAdjusted, setTimeWasAutoAdjusted] = useState(false);
  const [originalTimeBeforeAdjustment, setOriginalTimeBeforeAdjustment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStudioHoursGuide, setShowStudioHoursGuide] = useState(false);

  // Set minimum date for date picker (today)
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDatePickerMin(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await fetch(`${API_URL}/services/by-category`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        const servicesByCategory: ServicesByCategory = data.services_by_category;
        
        setPhotographyServices(servicesByCategory.photography || []);
        setVideographyServices(servicesByCategory.videography || []);
        setServicesError('');
      } catch (error) {
        console.error('Error fetching services:', error);
        setServicesError('Unable to load services. Please try again later.');
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Handle flow state resolution
  const handleFlowResolution = (action: 'accept_suggestion' | 'manual_adjust' | 'change_date' | 'continue_anyway' | 'retry') => {
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
          setShowReviewModal(true);
        } else if (flowState === SubmissionFlowState.DAY_FULL_ERROR) {
          // Auto-apply suggested date
          if (errorContext?.details?.suggested_date) {
            setFormData(prev => ({ ...prev, date: errorContext.details.suggested_date! }));
            setShowReviewModal(true);
          }
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

  const toggleService = (id: number) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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
          // Set error but still update value
          setFieldErrors(prev => ({
            ...prev,
            time: `Studio operates ${studioHours.open} - ${studioHours.close} on ${dayOfWeek}s`
          }));
          setShowStudioHoursGuide(true);
        } else {
          // Clear time error if valid
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
    if (!formData.message.trim()) errors.message = 'Project description is required';
    
    // Validate event date if provided
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Event date cannot be in the past';
      }
    }
    
    // Validate selected services
    if (selectedServices.length === 0) {
      errors.services = 'Please select at least one service';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stage 1: Pre-submission validation
    setFlowState(SubmissionFlowState.VALIDATING);
    
    if (!validateForm()) {
      setFlowState(SubmissionFlowState.VALIDATION_FAILED);
      return;
    }

    // Stage 2: Submission
    setFlowState(SubmissionFlowState.SUBMITTING);

    try {
      // Get selected service details
      const allServices = [...photographyServices, ...videographyServices];
      const selectedServiceDetails = allServices
        .filter(s => selectedServices.includes(s.id))
        .map(s => ({ 
          id: s.id, 
          title: s.title, 
          category: s.category 
        }));

      const quoteData = {
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        company_name: formData.company || null,
        selected_services: selectedServiceDetails,
        event_date: formData.date || null,
        event_time: formData.time || null,
        event_location: formData.location || null,
        budget_range: formData.budget || null,
        project_description: formData.message,
        referral_source: referralSource || null,
      };

      const response = await fetch(`${API_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          if (responseData.message.includes('Studio is closed') || responseData.message.includes('operating hours')) {
            // Studio hours error
            setErrorContext({
              type: 'studio_hours',
              message: responseData.message,
              details: {
                original_time: formData.time,
                suggested_time: responseData.suggested_start,
                studio_hours: responseData.studio_hours || {
                  open: '11:00',
                  close: '21:00',
                  day: new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })
                }
              }
            });
            setFlowState(SubmissionFlowState.STUDIO_HOURS_ERROR);
          } else if (responseData.suggested_date) {
            // Day full error
            setErrorContext({
              type: 'day_full',
              message: responseData.message,
              details: {
                suggested_date: responseData.suggested_date,
                suggested_day: responseData.suggested_day
              }
            });
            setFlowState(SubmissionFlowState.DAY_FULL_ERROR);
          } else {
            // General validation error
            setErrorContext({
              type: 'validation',
              message: responseData.message
            });
            setFlowState(SubmissionFlowState.VALIDATION_FAILED);
          }
        } else if (response.status === 409) {
          // Conflict warning - still successful submission
          setQuoteResponse(responseData);
          setFlowState(
            responseData.warning?.conflicting_quotes > 0
              ? SubmissionFlowState.SUCCESS_WITH_CONFLICT
              : SubmissionFlowState.SUCCESS_NO_CONFLICT
          );
        } else {
          // Other errors
          setErrorContext({
            type: 'network',
            message: responseData.message || 'Network error occurred'
          });
          setFlowState(SubmissionFlowState.NETWORK_ERROR);
        }
        return;
      }

      // Successful submission
      const quoteResponseData = responseData as QuoteResponse;
      setQuoteResponse(quoteResponseData);
      
      // Determine success state based on conflicts
      if (quoteResponseData.warning?.conflicting_quotes > 0) {
        setFlowState(SubmissionFlowState.SUCCESS_WITH_CONFLICT);
      } else {
        setFlowState(SubmissionFlowState.SUCCESS_NO_CONFLICT);
      }
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      setErrorContext({
        type: 'network',
        message: 'Failed to connect to server. Please check your internet connection.'
      });
      setFlowState(SubmissionFlowState.NETWORK_ERROR);
    }
  };

  const handleFinalSubmission = async () => {
    setShowReviewModal(false);
    setFlowState(SubmissionFlowState.SUBMITTING);
    
    // Re-submit with adjusted data
    await handleSubmit(new Event('submit') as any);
  };

  const resetForm = () => {
    setFlowState(SubmissionFlowState.IDLE);
    setSelectedServices([]);
    setReferralSource('');
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      company: '', 
      date: '', 
      time: '12:00',
      location: '', 
      budget: '', 
      message: '' 
    });
    setQuoteResponse(null);
    setFieldErrors({});
    setTimeWasAutoAdjusted(false);
    setOriginalTimeBeforeAdjustment('');
    setShowStudioHoursGuide(false);
  };

  // Render success page
  if ([SubmissionFlowState.SUCCESS_NO_CONFLICT, SubmissionFlowState.SUCCESS_WITH_CONFLICT].includes(flowState) && quoteResponse) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative overflow-hidden ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gold-500/10 rounded-full blur-[40px] sm:blur-[60px] md:blur-[80px] lg:blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className={`max-w-4xl w-full rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 shadow-2xl relative z-10 bg-gradient-to-b ${
          isDarkMode 
            ? 'from-stone-900 to-stone-950 border border-stone-800' 
            : 'from-white to-stone-50 border border-stone-200'
        }`}>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 ${
            isDarkMode 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-green-50 text-green-500'
          }`}>
            <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" />
          </div>
          <h2 className={`font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-center ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {flowState === SubmissionFlowState.SUCCESS_WITH_CONFLICT 
              ? 'Request Received - Under Review!' 
              : 'Request Sent Successfully!'}
          </h2>
          
          {/* Scheduling Status Card */}
          {flowState === SubmissionFlowState.SUCCESS_WITH_CONFLICT && quoteResponse.warning && (
            <SchedulingStatusCard
              hasConflict={quoteResponse.warning.conflicting_quotes > 0}
              conflictCount={quoteResponse.warning.conflicting_quotes}
              eventDate={quoteResponse.quote_request.event_date}
              eventTime={quoteResponse.quote_request.event_time}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Time Adjustment Notice */}
          {timeWasAutoAdjusted && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
              isDarkMode 
                ? 'bg-blue-900/40 border-blue-800' 
                : 'bg-blue-50 border-blue-100'
            }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">Time Adjustment Applied</h4>
                  <p className="text-xs sm:text-sm">
                    Your requested time was adjusted from <span className="line-through">{originalTimeBeforeAdjustment}</span> to <strong>{quoteResponse?.quote_request.event_time.substring(0, 5)}</strong> to fit our studio hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className={`mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 ${
            isDarkMode 
              ? 'bg-green-900/30 border-green-800' 
              : 'bg-green-50 border-green-100'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-green-100 text-green-600'
              }`}>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-1 sm:mb-2 ${
                  isDarkMode ? 'text-green-300' : 'text-green-700'
                }`}>
                  Confirmation Emails Sent
                </h3>
                <p className={`mb-1 sm:mb-2 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                  {quoteResponse.processing_info.client_email}
                </p>
                {flowState === SubmissionFlowState.SUCCESS_WITH_CONFLICT && (
                  <p className={`text-xs sm:text-sm mb-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                    <AlertCircle className="inline w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    A follow-up email will be sent within 24 hours regarding availability.
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  <Clock className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {quoteResponse.processing_info.estimated_time}
                </p>
              </div>
            </div>
          </div>

          {/* NEW: Services & Pricing Section */}
          <div className={`mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border ${
            isDarkMode 
              ? 'bg-stone-800/50 border-stone-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 md:mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              <PackageIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 inline mr-2 text-gold-500" />
              Selected Services & Pricing
            </h3>
            
            <ServicesWithPriceRange
              services={quoteResponse.quote_request.selected_services}
              priceEstimate={quoteResponse.quote_request.price_estimate}
              isDarkMode={isDarkMode}
              showContactInfo={true}
            />
          </div>

          {/* NEW: Contact Information Section */}
          <ContactInformation isDarkMode={isDarkMode} />

          {/* Quote Details */}
          <div className={`mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border ${
            isDarkMode 
              ? 'bg-stone-800/50 border-stone-700' 
              : 'bg-stone-50 border-stone-200'
          }`}>
            <h3 className={`font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-3 md:mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Quote Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Client Information */}
              <div>
                <h4 className={`text-xs font-bold uppercase mb-1 sm:mb-2 md:mb-3 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Client Information</h4>
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <div>
                    <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Name</p>
                    <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quoteResponse.quote_request.client_name}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Email</p>
                    <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quoteResponse.quote_request.client_email}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Phone</p>
                    <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quoteResponse.quote_request.client_phone}</p>
                  </div>
                  {quoteResponse.quote_request.company_name && (
                    <div>
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Company</p>
                      <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quoteResponse.quote_request.company_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div>
                <h4 className={`text-xs font-bold uppercase mb-1 sm:mb-2 md:mb-3 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Event Details</h4>
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {quoteResponse.quote_request.event_date && (
                    <div>
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Date & Time</p>
                      <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {new Date(quoteResponse.quote_request.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {quoteResponse.quote_request.event_time && ` at ${quoteResponse.quote_request.event_time.substring(0, 5)}`}
                      </p>
                    </div>
                  )}
                  {quoteResponse.quote_request.event_location && (
                    <div>
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Location</p>
                      <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quoteResponse.quote_request.event_location}</p>
                    </div>
                  )}
                  {quoteResponse.quote_request.budget_range && (
                    <div>
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Budget Range</p>
                      <p className={`font-medium text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                        {quoteResponse.quote_request.budget_range}
                      </p>
                    </div>
                  )}
                </div>

                {/* Conflict Status */}
                <div className="mt-3 sm:mt-4 md:mt-6 pt-2 sm:pt-3 md:pt-4 border-t border-stone-700/30">
                  {!quoteResponse.quote_request.has_conflict ? (
                    <p className={`text-xs sm:text-sm ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <Check className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      No scheduling conflicts detected
                    </p>
                  ) : (
                    <p className={`text-xs sm:text-sm ${
                      isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      <AlertCircle className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Scheduling conflicts detected - we'll contact you
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className={`mb-6 sm:mb-8 md:mb-10 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 ${
            isDarkMode 
              ? 'bg-blue-900/40 border-blue-800' 
              : 'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-1.5 sm:mb-2 md:mb-3 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>What Happens Next?</h3>
                <ul className={`space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1 sm:mt-1.5 md:mt-2 flex-shrink-0"></div>
                    <span>Our team will review your request within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1 sm:mt-1.5 md:mt-2 flex-shrink-0"></div>
                    <span>You'll receive a detailed quote via email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1 sm:mt-1.5 md:mt-2 flex-shrink-0"></div>
                    <span>We may contact you for additional details if needed</span>
                  </li>
                  {flowState === SubmissionFlowState.SUCCESS_WITH_CONFLICT && (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 sm:mt-1.5 md:mt-2 flex-shrink-0"></div>
                      <span>If there are scheduling conflicts, we'll suggest alternative times</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
            <button 
              onClick={resetForm} 
              className={`px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold transition-colors text-xs sm:text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300'
              }`}
            >
              Submit Another Request
            </button>
            <a 
              href="/" 
              className="px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2 sm:py-2.5 md:py-3 bg-gold-500 text-stone-900 rounded-full font-bold hover:bg-gold-600 transition-all text-xs sm:text-sm md:text-base text-center"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Hero Section */}
      <div className={`pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 md:pb-16 lg:pb-20 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-gold-600/20 rounded-full blur-[40px] sm:blur-[60px] md:blur-[80px] lg:blur-[100px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${
            isDarkMode 
              ? 'border-gold-500/30 bg-gold-500/10 text-gold-400' 
              : 'border-gold-300 bg-gold-100 text-gold-700'
          } text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 md:mb-6`}>
            <Sparkles className="w-3 h-3" /> Get Started
          </div>
          <h1 className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            Your Vision. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-600">Our Expertise.</span>
          </h1>
          <p className={`text-sm sm:text-base md:text-lg max-w-xl mb-4 sm:mb-6 md:mb-8 ${
            isDarkMode ? 'text-stone-400' : 'text-stone-600'
          }`}>
            Ready to elevate your brand or capture a milestone? We provide tailored visual and marketing solutions.
          </p>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="bg-gold-500 text-stone-900 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <p className="font-bold flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> Not sure what you need? We offer free 15-minute discovery calls.
          </p>
        </div>
      </div>

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

      {/* Review Changes Modal */}
      <ReviewChangesModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleFinalSubmission}
        onModify={() => {
          setShowReviewModal(false);
          setShowStudioHoursGuide(true);
        }}
        onReset={resetForm}
        changes={{
          originalTime: errorContext?.details?.original_time,
          newTime: errorContext?.details?.suggested_time,
          reason: errorContext?.details?.studio_hours 
            ? `Studio opens at ${errorContext.details.studio_hours.open} on ${errorContext.details.studio_hours.day}s`
            : 'Schedule adjustment required'
        }}
        formData={formData}
        selectedServices={[...photographyServices, ...videographyServices].filter(s => selectedServices.includes(s.id))}
        isDarkMode={isDarkMode}
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
                Processing Your Request
              </h3>

              {/* Status Message */}
              <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${
                isDarkMode ? 'text-stone-300' : 'text-stone-600'
              }`}>
                This may take a moment as we process your quote request...
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

                  {/* Step 3 - Sending Emails */}
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
                        Sending confirmation emails
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`}>
                        Queued
                      </p>
                    </div>
                  </div>

                  {/* Step 4 - Finalizing */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 ${
                      isDarkMode 
                        ? 'border-stone-600 bg-stone-800' 
                        : 'border-stone-300 bg-stone-100'
                    }`}>
                      <Zap className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs sm:text-sm ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-600'
                      }`}>
                        Finalizing your quote request
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-stone-500' : 'text-stone-400'
                      }`}>
                        Pending
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

      {/* Form */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <form onSubmit={handleSubmit} className={`rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl overflow-hidden border ${
          isDarkMode 
            ? 'bg-stone-900 border-stone-800' 
            : 'bg-white border-stone-200'
        }`}>
          
          {/* Step 1: Services */}
          <div className={`p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 2xl:p-16 border-b ${
            isDarkMode ? 'border-stone-800' : 'border-stone-100'
          }`}>
            <span className="text-gold-500 font-bold tracking-widest uppercase text-xs mb-0.5 sm:mb-1 md:mb-2 block">Step 01</span>
            <h3 className={`font-serif text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 md:mb-2 ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>What do you need?</h3>
            <p className={`mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-xs sm:text-sm md:text-base ${
              isDarkMode ? 'text-stone-400' : 'text-stone-500'
            }`}>Select as many services as applicable.</p>

            {isLoadingServices ? (
              <div className="flex items-center justify-center py-4 sm:py-6 md:py-8 lg:py-12">
                <Loader2 className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 animate-spin ${
                  isDarkMode ? 'text-gold-400' : 'text-gold-500'
                }`} />
                <span className={`ml-1.5 sm:ml-2 md:ml-3 text-xs sm:text-sm md:text-base ${
                  isDarkMode ? 'text-stone-400' : 'text-stone-600'
                }`}>Loading services...</span>
              </div>
            ) : servicesError ? (
              <div className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm md:text-base border ${
                isDarkMode 
                  ? 'bg-red-900/40 text-red-400 border-red-800' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {servicesError}
              </div>
            ) : (photographyServices.length === 0 && videographyServices.length === 0) ? (
              <div className={`p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm md:text-base border ${
                isDarkMode 
                  ? 'bg-stone-800 text-stone-400 border-stone-700' 
                  : 'bg-stone-100 text-stone-600 border-stone-300'
              }`}>
                No services available at the moment. Please contact us directly.
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                {/* Photography Services */}
                {photographyServices.length > 0 && (
                  <div>
                    <h4 className={`flex items-center gap-1.5 sm:gap-2 font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gold-500" /> Photography
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                      {photographyServices.map(service => (
                        <div 
                          key={service.id} 
                          onClick={() => toggleService(service.id)}
                          className={`cursor-pointer rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border-2 transition-all ${
                            selectedServices.includes(service.id) 
                              ? 'border-gold-500 bg-gold-900/20' 
                              : isDarkMode 
                                ? 'border-stone-800 hover:border-gold-200' 
                                : 'border-stone-100 hover:border-gold-200'
                          }`}
                        >
                          <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedServices.includes(service.id) 
                                ? 'bg-gold-500 border-gold-500' 
                                : isDarkMode 
                                  ? 'bg-stone-800 border-stone-700' 
                                  : 'bg-white border-stone-300'
                            }`}>
                              {selectedServices.includes(service.id) && (
                                <Check className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-stone-900" strokeWidth={4} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={`font-bold text-xs sm:text-sm mb-0.5 ${
                                isDarkMode ? 'text-stone-200' : 'text-stone-700'
                              }`}>
                                {service.title}
                              </h5>
                              {service.description && (
                                <p className={`text-xs leading-relaxed ${
                                  isDarkMode ? 'text-stone-400' : 'text-stone-500'
                                }`}>
                                  {service.description}
                                </p>
                              )}
                              {service.price_display && (
                                <p className={`text-xs font-semibold mt-0.5 sm:mt-1 md:mt-2 ${
                                  isDarkMode ? 'text-white' : 'text-gold-600'
                                }`}>
                                  {service.price_display}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videography Services */}
                {videographyServices.length > 0 && (
                  <div>
                    <h4 className={`flex items-center gap-1.5 sm:gap-2 font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      <Video className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gold-500" /> Videography
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                      {videographyServices.map(service => (
                        <div 
                          key={service.id} 
                          onClick={() => toggleService(service.id)}
                          className={`cursor-pointer rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border-2 transition-all ${
                            selectedServices.includes(service.id) 
                              ? 'border-gold-500 bg-gold-900/20' 
                              : isDarkMode 
                                ? 'border-stone-800 hover:border-gold-200' 
                                : 'border-stone-100 hover:border-gold-200'
                          }`}
                        >
                          <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selectedServices.includes(service.id) 
                                ? 'bg-gold-500 border-gold-500' 
                                : isDarkMode 
                                  ? 'bg-stone-800 border-stone-700' 
                                  : 'bg-white border-stone-300'
                            }`}>
                              {selectedServices.includes(service.id) && (
                                <Check className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-stone-900" strokeWidth={4} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={`font-bold text-xs sm:text-sm mb-0.5 ${
                                isDarkMode ? 'text-stone-200' : 'text-stone-700'
                              }`}>
                                {service.title}
                              </h5>
                              {service.description && (
                                <p className={`text-xs leading-relaxed ${
                                  isDarkMode ? 'text-stone-400' : 'text-stone-500'
                                }`}>
                                  {service.description}
                                </p>
                              )}
                              {service.price_display && (
                                <p className={`text-xs font-semibold mt-0.5 sm:mt-1 md:mt-2 ${
                                  isDarkMode ? 'text-white' : 'text-gold-600'
                                }`}>
                                  {service.price_display}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedServices.length === 0 && !isLoadingServices && !servicesError && (photographyServices.length > 0 || videographyServices.length > 0) && (
              <div className={`mt-3 sm:mt-4 md:mt-6 lg:mt-8 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-center border ${
                isDarkMode 
                  ? 'bg-amber-900/40 text-amber-400 border-amber-800' 
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                <AlertCircle className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Please select at least one service to continue
              </div>
            )}
          </div>

          {/* Step 2: Details */}
          <div className={`p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 2xl:p-16 ${
            isDarkMode ? 'bg-stone-800/30' : 'bg-stone-50/30'
          }`}>
            <span className="text-gold-500 font-bold tracking-widest uppercase text-xs mb-0.5 sm:mb-1 md:mb-2 block">Step 02</span>
            <h3 className={`font-serif text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>Project Details</h3>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h4 className={`font-bold border-b pb-1 sm:pb-1.5 md:pb-2 text-xs sm:text-sm md:text-base ${
                  isDarkMode ? 'text-white border-stone-700' : 'text-stone-900'
                }`}>Your Information</h4>
                
                {/* Name Field */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } ${
                      fieldErrors.name 
                        ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                        : 'border border-stone-300'
                    }`} 
                    placeholder={KENYA_PLACEHOLDERS.name}
                  />
                  {fieldErrors.name && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <p className="text-xs">{fieldErrors.name}</p>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Email *</label>
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } ${
                      fieldErrors.email 
                        ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                        : 'border border-stone-300'
                    }`} 
                    placeholder={KENYA_PLACEHOLDERS.email}
                  />
                  {fieldErrors.email && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <p className="text-xs">{fieldErrors.email}</p>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Phone *</label>
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } ${
                      fieldErrors.phone 
                        ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                        : 'border border-stone-300'
                    }`} 
                    placeholder={KENYA_PLACEHOLDERS.phone}
                  />
                  {fieldErrors.phone && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <p className="text-xs">{fieldErrors.phone}</p>
                    </div>
                  )}
                </div>

                {/* Company Field */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Organization (Optional)</label>
                  <input 
                    type="text" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleInputChange}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } border border-stone-300`} 
                    placeholder={KENYA_PLACEHOLDERS.company}
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                <h4 className={`font-bold border-b pb-1 sm:pb-1.5 md:pb-2 text-xs sm:text-sm md:text-base ${
                  isDarkMode ? 'text-white border-stone-700' : 'text-stone-900'
                }`}>Event Details</h4>
                
                {/* Date & Time Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className={`text-xs font-bold uppercase mb-1 block ${
                      isDarkMode ? 'text-stone-400' : 'text-stone-500'
                    }`}>Preferred Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange}
                      min={datePickerMin}
                      className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                        isDarkMode 
                          ? 'bg-stone-800 text-white' 
                          : 'bg-white'
                      } ${
                        fieldErrors.date 
                          ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                          : 'border border-stone-300'
                      }`} 
                    />
                    {fieldErrors.date && (
                      <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded ${
                        isDarkMode 
                          ? 'bg-red-950/50 text-red-300 border border-red-800' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                        <p className="text-xs">{fieldErrors.date}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <label className={`text-xs font-bold uppercase mb-1 block ${
                      isDarkMode ? 'text-stone-400' : 'text-stone-500'
                    }`}>Preferred Time</label>
                    <input 
                      type="time" 
                      name="time" 
                      value={formData.time} 
                      onChange={handleInputChange}
                      className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                        isDarkMode 
                          ? 'bg-stone-800 text-white' 
                          : 'bg-white'
                      } ${
                        fieldErrors.time 
                          ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                          : 'border border-stone-300'
                      }`} 
                    />
                    {/* Time error message */}
                    {fieldErrors.time && (
                      <div className={`mt-1 p-1.5 rounded text-xs flex items-start gap-1.5 ${
                        isDarkMode 
                          ? 'bg-red-950/50 text-red-300 border border-red-800' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>⚠️ {fieldErrors.time}</span>
                      </div>
                    )}
                    {/* Time Adjustment Indicator */}
                    {timeWasAutoAdjusted && originalTimeBeforeAdjustment && (
                      <TimeAdjustmentIndicator
                        originalTime={originalTimeBeforeAdjustment}
                        newTime={formData.time}
                        onReview={() => setShowReviewModal(true)}
                        isDarkMode={isDarkMode}
                      />
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
                
                {/* Location Field */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } border border-stone-300`} 
                    placeholder={KENYA_PLACEHOLDERS.location}
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Budget Range</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-1.5 md:gap-2">
                    {BUDGET_RANGES.map(range => (
                      <button 
                        key={range} 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, budget: range}))}
                        className={`px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2 md:py-3 rounded-md sm:rounded-lg text-xs font-medium border transition-all ${
                          formData.budget === range ? 'bg-gold-500 text-stone-900 border-gold-500' : 
                          isDarkMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label className={`text-xs font-bold uppercase mb-1 block ${
                    isDarkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}>Project Description *</label>
                  <textarea 
                    required 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    rows={4}
                    className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl outline-none resize-none text-xs sm:text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 text-white placeholder-stone-500' 
                        : 'bg-white placeholder-stone-400'
                    } ${
                      fieldErrors.message 
                        ? 'border-2 border-red-500 ring-2 ring-red-500/20' 
                        : 'border border-stone-300'
                    }`} 
                    placeholder="Tell us about your project, special requirements, number of guests, duration, etc..."
                  ></textarea>
                  {fieldErrors.message && (
                    <div className={`flex items-center gap-1.5 mt-1 p-1.5 rounded ${
                      isDarkMode 
                        ? 'bg-red-950/50 text-red-300 border border-red-800' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                      <p className="text-xs">{fieldErrors.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Submit */}
          <div className={`p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 2xl:p-16 border-t ${
            isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="w-full lg:w-auto">
                <label className={`text-xs font-bold uppercase mb-1.5 sm:mb-2 md:mb-3 block ${
                  isDarkMode ? 'text-stone-400' : 'text-stone-500'
                }`}>How did you find us?</label>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                  {REFERRAL_OPTIONS.map(opt => (
                    <button 
                      key={opt.id} 
                      type="button" 
                      onClick={() => setReferralSource(opt.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs font-bold uppercase transition-colors ${
                        referralSource === opt.id ? 
                        (isDarkMode ? 'bg-gold-900/30 text-gold-400 border border-gold-700/30' : 'bg-gold-50 text-gold-700 border border-gold-200') : 
                        (isDarkMode ? 'bg-stone-800 text-stone-400 hover:bg-stone-700 border border-stone-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200')
                      }`}
                    >
                      {opt.icon} <span className="hidden xs:inline">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-auto mt-3 sm:mt-4 lg:mt-0">
                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={[
                    SubmissionFlowState.SUBMITTING,
                    SubmissionFlowState.VALIDATING,
                    SubmissionFlowState.REVIEWING_CHANGES
                  ].includes(flowState) || isLoadingServices}
                  className={`w-full lg:w-auto bg-gradient-to-r from-gold-500 to-yellow-600 text-white font-bold text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl`}
                >
                  {flowState === SubmissionFlowState.SUBMITTING ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
                      <span className="text-xs sm:text-sm md:text-base">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm md:text-base">Submit Quote Request</span>
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </>
                  )}
                </button>
                {fieldErrors.services && (
                  <div className={`mt-1.5 p-1.5 rounded text-xs flex items-center justify-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-red-950/50 text-red-300 border border-red-800' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 flex-shrink-0" />
                    <span>{fieldErrors.services}</span>
                  </div>
                )}
                <p className={`text-xs mt-2 text-center lg:text-right ${
                  isDarkMode ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  * Required fields
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Quote;
// pages/Admin/AdminQuoteDetail.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, Edit3, Save, X, Trash2, Send, CheckCircle, XCircle, 
  Calendar, Clock, Mail, Phone, Building, MapPin, DollarSign, 
  FileText, AlertTriangle, Loader2, Package,
  RefreshCw, User, Tag, AlertCircle, Info, CalendarDays,
  Mail as MailIcon, Phone as PhoneIcon, User as UserIcon, 
  Building as BuildingIcon, MapPin as MapPinIcon, Package as PackageIcon,
  MessageSquare, ExternalLink, ChevronDown, ChevronUp, CheckSquare, Square,
  CalendarCheck, Users, Shield, Zap, Calendar as CalendarIcon,
  Filter, ChevronRight, ChevronLeft, Hash, Star, Target,
  Search, Eye, Check, Plus, Grid, List, MoreVertical, Download, BarChart3,
  ChevronsRight, Sparkles, Database, Server, Cpu, GitBranch, ZapOff
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../hooks/useAuth'; // ✅ Import useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Hardcoded studio hours to match backend exactly
const STUDIO_HOURS = {
  'monday': { start: '08:00', end: '21:00' },
  'tuesday': { start: '08:00', end: '21:00' },
  'wednesday': { start: '08:00', end: '21:00' },
  'thursday': { start: '08:30', end: '21:00' },
  'friday': { start: '08:00', end: '21:00' },
  'saturday': { start: '08:00', end: '21:00' },
  'sunday': { start: '11:00', end: '21:00' }
};

const MAX_QUOTES_PER_DAY = 5;
const QUOTE_EXPIRY_DAYS = 30;

const AdminQuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { getAccessToken, logout } = useAuth(); // ✅ Get token functions from auth context

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [quote, setQuote] = useState(null);
  const [originalQuote, setOriginalQuote] = useState(null);
  const [quoteStatuses, setQuoteStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  // Enhanced states for backend capabilities
  const [processingInfo, setProcessingInfo] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [conflictDetails, setConflictDetails] = useState(null);
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [bulkSelectedConflicts, setBulkSelectedConflicts] = useState([]);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [showStudioHours, setShowStudioHours] = useState(false);
  const [activeAlertAction, setActiveAlertAction] = useState(null);
  
  // Backend-powered states
  const [dateAvailability, setDateAvailability] = useState(null);
  const [studioHoursWarning, setStudioHoursWarning] = useState(null);
  const [bulkPreviewData, setBulkPreviewData] = useState(null);
  const [showBulkPreviewModal, setShowBulkPreviewModal] = useState(false);
  const [dailyQuoteCounts, setDailyQuoteCounts] = useState({});
  const [realTimeValidation, setRealTimeValidation] = useState({
    isValid: true,
    messages: []
  });
  
  // Studio hours from hardcoded constant (matches backend)
  const [studioHours, setStudioHours] = useState(STUDIO_HOURS);
  
  // Alternative times diagnostics
  const [alternativeTimesDiagnostics, setAlternativeTimesDiagnostics] = useState(null);
  const [isFetchingAlternatives, setIsFetchingAlternatives] = useState(false);
  
  // Enhanced states for auto-fill and auto-resolve features
  const [selectedAlternativeTime, setSelectedAlternativeTime] = useState(null);
  const [autoResolvedConflict, setAutoResolvedConflict] = useState(false);
  const [enhancedAlerts, setEnhancedAlerts] = useState([]);

  // Assignment functionality states
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // ✅ Helper function to get authentication headers with token
  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Use hardcoded studio hours (matches backend)
  const validateStudioHours = useCallback((eventDate, eventTime) => {
    if (!eventDate || !eventTime || !studioHours) return { valid: true };
    
    let formattedTime = eventTime;
    if (formattedTime.includes(':')) {
      const parts = formattedTime.split(':');
      formattedTime = `${parts[0]}:${parts[1]}`;
    }
    
    const date = new Date(eventDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const hours = studioHours[dayOfWeek];
    if (!hours) return { valid: false, message: 'Invalid day' };
    
    if (formattedTime < hours.start || formattedTime > hours.end) {
      return {
        valid: false,
        message: `⚠️ Studio is closed. ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} hours: ${hours.start}-${hours.end}`,
        suggestedStart: hours.start,
        suggestedEnd: hours.end
      };
    }
    
    return { valid: true };
  }, [studioHours]);

  // Format currency to Kenyan Shilling (Ksh)
  const formatCurrency = useCallback((amount, showSymbol = true) => {
    if (!amount && amount !== 0) return showSymbol ? 'Ksh 0' : '0';
    
    // If amount is a string with Ksh already, return as is
    if (typeof amount === 'string' && amount.includes('Ksh')) {
      return amount;
    }
    
    // If amount is a string with $, convert to Ksh
    if (typeof amount === 'string' && amount.includes('$')) {
      const numericValue = amount.replace(/[^0-9.,-]/g, '');
      return `Ksh ${numericValue}`;
    }
    
    // Format number to Kenyan Shilling
    const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.,-]/g, '')) : amount;
    
    if (isNaN(numericAmount)) {
      return showSymbol ? 'Ksh 0' : '0';
    }
    
    const formatted = new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
    
    return showSymbol ? `Ksh ${formatted}` : formatted;
  }, []);

  // Parse Ksh amount to number
  const parseKshAmount = useCallback((amountStr) => {
    if (!amountStr) return 0;
    
    // Remove Ksh and any other non-numeric characters except decimal point and minus
    const numericStr = amountStr.toString().replace(/[^0-9.,-]/g, '');
    const number = parseFloat(numericStr.replace(/,/g, ''));
    
    return isNaN(number) ? 0 : number;
  }, []);

  // Fetch verified alternative times from backend
  const fetchVerifiedAlternativeTimes = useCallback(async (quoteId, maxSuggestions = 5, silent = false) => {
    if (!quoteId) return [];
    
    setIsFetchingAlternatives(true);
    
    if (!silent) {
      setProcessingInfo(['🔍 Fetching verified alternatives...']);
    }
    
    try {
      const response = await fetch(
        `${API_URL}/quotes/${quoteId}/alternative-times?max_suggestions=${maxSuggestions}`,
        {
          headers: getAuthHeaders(), // ✅ Use token-based headers
          // REMOVED: credentials: 'include'
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          console.log('🔄 Token expired, logging out...');
          await logout();
          navigate('/admin/login');
          return [];
        }
        console.error('Failed to fetch alternative times');
        setTimeSuggestions([]);
        return [];
      }
      
      const data = await response.json();
      
      if (data.success && data.available_times) {
        setTimeSuggestions(data.available_times);
        setAlternativeTimesDiagnostics(data.diagnostics);
        
        if (!silent) {
          setSuccessMessage('✅ Alternative times refreshed successfully!');
        }
        
        return data.available_times;
      } else {
        console.warn('No verified alternatives available:', data.error);
        setTimeSuggestions([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching alternative times:', err);
      setTimeSuggestions([]);
      return [];
    } finally {
      setIsFetchingAlternatives(false);
      setTimeout(() => {
        if (processingInfo[0]?.includes('Fetching verified alternatives')) {
          setProcessingInfo([]);
        }
      }, 2000);
    }
  }, [processingInfo, getAccessToken, logout, navigate]);

  const checkDateAvailability = useCallback(async (selectedDate, excludeQuoteId = id) => {
    if (!selectedDate) return;
    
    setProcessingInfo(['📅 Checking availability for selected date...']);
    
    try {
      const response = await fetch(
        `${API_URL}/quotes?date_from=${selectedDate}&date_to=${selectedDate}&status=PENDING,SENT,ACCEPTED`,
        {
          headers: getAuthHeaders(), // ✅ Use token-based headers
          // REMOVED: credentials: 'include'
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        return;
      }
      
      const data = await response.json();
      const quoteCount = data.quotes?.filter(q => parseInt(q.id) !== parseInt(excludeQuoteId)).length || 0;
      
      const availability = {
        count: quoteCount,
        available: quoteCount < MAX_QUOTES_PER_DAY,
        remaining: MAX_QUOTES_PER_DAY - quoteCount,
        message: quoteCount >= MAX_QUOTES_PER_DAY 
          ? `❌ Day fully booked (${quoteCount}/${MAX_QUOTES_PER_DAY})`
          : `✅ ${MAX_QUOTES_PER_DAY - quoteCount} slot${MAX_QUOTES_PER_DAY - quoteCount === 1 ? '' : 's'} remaining`
      };
      
      setDateAvailability(availability);
      
      setDailyQuoteCounts(prev => ({
        ...prev,
        [selectedDate]: quoteCount
      }));
      
      return availability;
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setTimeout(() => setProcessingInfo([]), 2000);
    }
  }, [id, getAccessToken, logout, navigate]);

  // Enhanced conflict resolution check
  const checkConflictResolved = useCallback((newDate, newTime) => {
    if (!conflictDetails?.has_conflict) return false;
    
    // Check if time changed from original
    const timeChanged = conflictDetails.verified_alternatives?.original_time && 
                       newTime !== conflictDetails.verified_alternatives.original_time;
    
    // Check if date changed
    const dateChanged = conflictDetails.verified_alternatives?.event_date && 
                       newDate !== conflictDetails.verified_alternatives.event_date;
    
    // Check if new time is a verified alternative
    const isVerifiedAlternative = timeSuggestions.some(
      alt => alt.time === newTime && alt.verified
    );
    
    return timeChanged || dateChanged || isVerifiedAlternative;
  }, [conflictDetails, timeSuggestions]);

  // Check if quote limit alert is resolved
  const checkQuoteLimitResolved = useCallback((newDate) => {
    if (!newDate) return false;
    
    // Check if there's a quote limit alert
    const hasQuoteLimitAlert = enhancedAlerts.some(alert => 
      alert.type === 'QUOTE_LIMIT_REACHED'
    );
    
    if (!hasQuoteLimitAlert) return false;
    
    // Check if date changed from the conflicted date
    if (conflictDetails?.verified_alternatives?.event_date) {
      return newDate !== conflictDetails.verified_alternatives.event_date;
    }
    
    // Check if the new date has availability
    if (dateAvailability) {
      return dateAvailability.available;
    }
    
    return false;
  }, [enhancedAlerts, conflictDetails, dateAvailability]);

  // Check if any alert is still relevant
  const checkAlertRelevant = useCallback((alert, currentDate, currentTime) => {
    switch (alert.type) {
      case 'TIME_CONFLICT':
        return !checkConflictResolved(currentDate, currentTime);
      case 'QUOTE_LIMIT_REACHED':
        return !checkQuoteLimitResolved(currentDate);
      default:
        return true; // Keep other alerts as they are
    }
  }, [checkConflictResolved, checkQuoteLimitResolved]);

  const performRealTimeValidation = useCallback((field, value) => {
    const validations = [];
    
    if (field === 'event_time' && quote?.event_date) {
      const hoursValidation = validateStudioHours(quote.event_date, value);
      if (!hoursValidation.valid) {
        validations.push({
          type: 'studio_hours',
          message: hoursValidation.message,
          suggested: hoursValidation.suggestedStart
        });
      }
    }
    
    if (field === 'event_date' && value) {
      checkDateAvailability(value);
    }
    
    setRealTimeValidation({
      isValid: validations.length === 0,
      messages: validations
    });
    
    return validations.length === 0;
  }, [quote?.event_date, validateStudioHours, checkDateAvailability]);

  // ============================================================================
  // DATA FETCHING WITH TOKEN-BASED AUTHENTICATION
  // ============================================================================

  useEffect(() => {
    fetchQuote();
    fetchQuoteStatuses();
    fetchAvailableUsers(); // Fetch users for assignment
  }, [id]);

  // Auto-refresh when date/time changes
  useEffect(() => {
    if (conflictDetails?.has_conflict && quote?.event_date) {
      fetchVerifiedAlternativeTimes(id, 5, true); // silent refresh
    }
  }, [quote?.event_date, quote?.event_time]);

  // Update alerts based on current state
  useEffect(() => {
    if (quote && enhancedAlerts.length > 0) {
      const relevantAlerts = enhancedAlerts.filter(alert => 
        checkAlertRelevant(alert, quote.event_date, quote.event_time)
      );
      
      if (relevantAlerts.length !== enhancedAlerts.length) {
        setEnhancedAlerts(relevantAlerts);
        if (relevantAlerts.length === 0) {
          setSuccessMessage('✅ All alerts resolved!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    }
  }, [quote, enhancedAlerts, checkAlertRelevant]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEditMode) {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode]);

  // Fetch available users for assignment
  const fetchAvailableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Get all media staff (photographers + videographers)
      const response = await fetch(`${API_URL}/api/auth/users/media-staff`, {
        headers: getAuthHeaders(), // ✅ Use token-based headers
        // REMOVED: credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setAvailableUsers(data.media_staff || []);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users for assignment');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle user assignment
  const handleAssignUser = async () => {
    if (!selectedUserId) {
      setError('Please select a user to assign');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    setProcessingInfo([
      '👤 Assigning quote to user...',
      '📧 Preparing notification email...',
      '⏳ Processing assignment...'
    ]);
    
    try {
      const response = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // ✅ Use token-based headers
        body: JSON.stringify({
          assigned_to: selectedUserId
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign quote');
      }
      
      const data = await response.json();
      setQuote(data.quote_request);
      setOriginalQuote(data.quote_request);
      
      // Find assigned user name
      const assignedUser = availableUsers.find(u => u.id === selectedUserId);
      const userName = assignedUser ? assignedUser.full_name : 'User';
      
      setSuccessMessage(`✅ Quote successfully assigned to ${userName}`);
      setShowAssignModal(false);
      setSelectedUserId(null);
      
      setProcessingInfo([
        '✅ Assignment complete!',
        `📧 ${userName} has been notified`,
        '✅ Quote updated successfully'
      ]);
      
      setTimeout(() => {
        setProcessingInfo([]);
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchQuote = async () => {
    setIsLoading(true);
    setError('');
    setProcessingInfo(['📥 Fetching quote details...', '🔍 Analyzing conflicts and availability...']);
    
    try {
      const response = await fetch(`${API_URL}/quotes/${id}`, {
        headers: getAuthHeaders(), // ✅ Use token-based headers
        // REMOVED: credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('Quote not found');
        }
        throw new Error('Failed to fetch quote');
      }
      
      const data = await response.json();
      setQuote(data);
      setOriginalQuote(data);
      
      // Fetch verified alternative times if there's a conflict
      if (data.time_conflict?.has_conflict) {
        setConflictDetails(data.time_conflict);
        
        // Use backend's verified alternatives if available
        if (data.time_conflict.verified_alternatives) {
          setTimeSuggestions(data.time_conflict.verified_alternatives.available_times || []);
          setAlternativeTimesDiagnostics(data.time_conflict.verified_alternatives.diagnostics);
        } else {
          // Fetch alternatives from endpoint
          fetchVerifiedAlternativeTimes(id);
        }
      } else {
        setConflictDetails(null);
      }
      
      // Process backend alerts
      if (data.alerts && data.alerts.length > 0) {
        const processedAlerts = data.alerts.map(alert => ({
          ...alert,
          enhanced: true,
          step_by_step: [
            'Review the conflicting quote details below',
            'Select a verified alternative time from suggestions',
            'Click "Reschedule Quote" to notify the client'
          ]
        }));
        setEnhancedAlerts(processedAlerts);
      } else {
        setEnhancedAlerts([]);
      }
      
      if (data.event_date) {
        await checkDateAvailability(data.event_date);
      }
      
      if (data.event_date && data.event_time) {
        const validation = validateStudioHours(data.event_date, data.event_time);
        if (!validation.valid) {
          setStudioHoursWarning(validation);
        } else {
          setStudioHoursWarning(null);
        }
      }
      
      setProcessingInfo(['✅ Quote loaded successfully', '🔄 Ready for management']);
      setTimeout(() => setProcessingInfo([]), 3000);
      
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuoteStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/quote-statuses`, {
        headers: getAuthHeaders(), // ✅ Use token-based headers
        // REMOVED: credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch statuses');
      }
      
      const data = await response.json();
      setQuoteStatuses(data.statuses || []);
      
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setQuoteStatuses([
        { name: 'PENDING', value: 'PENDING' },
        { name: 'SENT', value: 'SENT' },
        { name: 'ACCEPTED', value: 'ACCEPTED' },
        { name: 'REJECTED', value: 'REJECTED' },
        { name: 'CANCELLED', value: 'CANCELLED' }
      ]);
    }
  };

  // ============================================================================
  // EDIT HANDLERS
  // ============================================================================

  const handleEditToggle = () => {
    if (isEditMode) {
      handleCancelEdit();
    } else {
      setIsEditMode(true);
      // Fetch fresh data and alternatives
      fetchQuote();
      if (quote?.event_date && quote?.event_time) {
        fetchVerifiedAlternativeTimes(id);
      }
    }
  };

  const handleCancelEdit = () => {
    setQuote(originalQuote);
    setIsEditMode(false);
    setIsDirty(false);
    setProcessingInfo([]);
    setRealTimeValidation({ isValid: true, messages: [] });
    setStudioHoursWarning(null);
    setSelectedAlternativeTime(null);
  };

  // Handle alternative time click with auto-fill
  const handleAlternativeTimeClick = (altTime) => {
    const timeValue = altTime.time || altTime;
    setSelectedAlternativeTime(timeValue);
    handleFieldChange('event_time', timeValue);
    setIsDirty(true);
    
    // Clear studio hours warning if any
    if (studioHoursWarning) {
      setStudioHoursWarning(null);
    }
    
    // Show success feedback
    const display = altTime.display || formatTime(altTime);
    setSuccessMessage(`✅ Time updated to ${display}. Click "Save Changes" or open "Reschedule" to confirm.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleFieldChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'event_time' && value) {
      if (value.includes(':')) {
        const parts = value.split(':');
        processedValue = `${parts[0]}:${parts[1]}`;
      }
      
      // Clear selected alternative time if user manually types
      if (value !== selectedAlternativeTime) {
        setSelectedAlternativeTime(null);
      }
    }
    
    // Handle quoted_amount field - ensure Ksh formatting
    if (field === 'quoted_amount') {
      // Remove any existing Ksh or $ symbols
      processedValue = value.toString().replace(/[^0-9.,-]/g, '');
    }
    
    setQuote(prev => ({ ...prev, [field]: processedValue }));
    setIsDirty(true);
    
    // Auto-resolve conflict check
    if ((field === 'event_time' || field === 'event_date') && conflictDetails) {
      const isResolved = checkConflictResolved(
        field === 'event_date' ? processedValue : quote?.event_date,
        field === 'event_time' ? processedValue : quote?.event_time
      );
      
      if (isResolved) {
        setConflictDetails(prev => prev ? { ...prev, has_conflict: false } : null);
        setAutoResolvedConflict(true);
        setSuccessMessage('✅ Conflict resolved! New time is available.');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
          setAutoResolvedConflict(false);
        }, 5000);
      }
    }
    
    // Check if quote limit alert is resolved
    if (field === 'event_date' && enhancedAlerts.some(alert => alert.type === 'QUOTE_LIMIT_REACHED')) {
      const isResolved = checkQuoteLimitResolved(processedValue);
      if (isResolved) {
        setSuccessMessage('✅ Quote limit alert resolved! Date has been changed.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
    
    if (field === 'event_time' || field === 'event_date') {
      performRealTimeValidation(field, processedValue);
      
      // Fetch new alternatives if time changed and we have a conflict
      if (conflictDetails?.has_conflict && (field === 'event_time' || field === 'event_date')) {
        fetchVerifiedAlternativeTimes(id, 5, true);
      }
    }
  };

  const handleSave = async (isReschedule = false) => {
    if (quote.event_date && quote.event_time) {
      let formattedTime = quote.event_time;
      if (formattedTime.includes(':')) {
        const parts = formattedTime.split(':');
        formattedTime = `${parts[0]}:${parts[1]}`;
      }
      
      const hoursValidation = validateStudioHours(quote.event_date, formattedTime);
      if (!hoursValidation.valid) {
        setError(hoursValidation.message);
        setProcessingInfo([
          '❌ Validation failed',
          `⏰ Studio hours: ${hoursValidation.suggestedStart} - ${hoursValidation.suggestedEnd}`,
          'Please adjust the time'
        ]);
        return;
      }
      
      const availability = await checkDateAvailability(quote.event_date);
      if (availability && !availability.available) {
        setError(availability.message);
        setProcessingInfo(['❌ Day is fully booked', '📅 Please select another date']);
        return;
      }
    }
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    setProcessingInfo([
      '📤 Preparing update...',
      '✅ Validating changes...',
      '📧 Email notifications will be sent after update...',
      '⏳ Estimated processing time: 2-3 seconds'
    ]);

    try {
      let formattedEventTime = quote.event_time;
      if (formattedEventTime && formattedEventTime.includes(':')) {
        const parts = formattedEventTime.split(':');
        formattedEventTime = `${parts[0]}:${parts[1]}`;
      }

      const payload = {
        client_name: quote.client_name,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        company_name: quote.company_name,
        event_date: quote.event_date,
        event_time: formattedEventTime,
        event_location: quote.event_location,
        budget_range: quote.budget_range,
        project_description: quote.project_description,
        quoted_amount: quote.quoted_amount ? parseKshAmount(quote.quoted_amount) : null,
        quote_details: quote.quote_details,
        valid_until: quote.valid_until,
        status: quote.status,
        ...(isReschedule && { 
          is_reschedule: true,
          admin_note: rescheduleReason 
        })
      };

      setProcessingInfo([
        '📤 Sending update to server...',
        '🔍 Checking for conflicts...',
        '📧 Preparing email notifications...'
      ]);

      const response = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // ✅ Use token-based headers
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quote');
      }

      const data = await response.json();
      
      // Enhanced conflict resolution tracking
      if (data.quote_request) {
        const updatedQuote = data.quote_request;
        
        // Clear conflict details if time/date changed and conflict is resolved
        if (conflictDetails && conflictDetails.has_conflict) {
          const isConflictResolved = checkConflictResolved(
            updatedQuote.event_date,
            updatedQuote.event_time
          );
          
          if (isConflictResolved) {
            setConflictDetails(null);
            setProcessingInfo(prev => [...prev, '✅ Conflict resolved!']);
            setSuccessMessage('✅ Conflict resolved!');
            setTimeout(() => setSuccessMessage(''), 4000);
          }
        }
      }
      
      // Enhanced email processing feedback
      if (data.processing_info) {
        const messages = [
          '✅ Update successful!',
          data.processing_info.email_sent ? '📧 Email sent to client' : '📧 Email notification pending',
          '⏳ Processing emails...'
        ];
        
        if (data.processing_info.client_email_address) {
          messages.push(`📧 Client: ${data.processing_info.client_email_address}`);
        }
        if (data.processing_info.admin_notified) {
          messages.push('📧 Admin notified');
        }
        
        messages.push(`⏱️ Processing time: ${data.processing_info.estimated_time || '2-3 seconds'}`);
        
        setProcessingInfo(messages);
        
        setTimeout(() => {
          setProcessingInfo([
            '✅ All updates complete!',
            '📧 Email notifications processed',
            '✅ Quote updated successfully'
          ]);
        }, 2000);
        
        setTimeout(() => {
          setProcessingInfo([]);
        }, 5000);
      }
      
      setQuote(data.quote_request);
      setOriginalQuote(data.quote_request);
      setIsEditMode(false);
      setIsDirty(false);
      setRealTimeValidation({ isValid: true, messages: [] });
      setSelectedAlternativeTime(null); // Clear selected time after successful save
      
      if (data.conflict_info && data.conflict_info.has_conflict) {
        setConflictDetails({
          ...data.conflict_info,
          has_conflict: true
        });
        setShowConflictDetails(true);
      } else {
        // Clear conflict details if none exist
        setConflictDetails(null);
      }
      
      setSuccessMessage('✅ Quote updated successfully! Email notifications have been sent.');
      
      setTimeout(() => {
        setSuccessMessage('');
        if (isReschedule) {
          setShowRescheduleModal(false);
          setRescheduleReason('');
        }
      }, 6000);
      
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // STATUS CHANGE HANDLERS
  // ============================================================================

  const handleStatusChange = async (newStatus) => {
    if (newStatus === quote.status) return;
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    const isCancellation = newStatus === 'CANCELLED';
    const cancellationReason = isCancellation 
      ? prompt('Please provide a reason for cancellation (optional):') || ''
      : '';

    setProcessingInfo([
      `🔄 Updating status to ${newStatus}...`,
      isCancellation ? '📧 Preparing cancellation email...' : '📧 Preparing notification...',
      '⏳ Email processing may take 2-3 seconds...'
    ]);

    try {
      const response = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // ✅ Use token-based headers
        body: JSON.stringify({ 
          status: newStatus,
          ...(isCancellation && { cancellation_reason: cancellationReason })
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();
      setQuote(data.quote_request);
      setOriginalQuote(data.quote_request);
      
      // Clear conflict details when status changes to CANCELLED or REJECTED
      if ((newStatus === 'CANCELLED' || newStatus === 'REJECTED') && conflictDetails) {
        setConflictDetails(null);
      }
      
      // Enhanced email processing feedback
      if (data.processing_info) {
        const messages = [
          '✅ Status update complete!',
          data.processing_info.email_sent ? '📧 Email notification sent' : '📧 Email queued',
          data.processing_info.email_type ? `📧 Type: ${data.processing_info.email_type}` : ''
        ];
        
        if (data.processing_info.recipient) {
          messages.push(`📧 Recipient: ${data.processing_info.recipient}`);
        }
        
        messages.push(`⏱️ Processing time: ${data.processing_info.estimated_time || '2-3 seconds'}`);
        
        setProcessingInfo(messages);
        
        setTimeout(() => {
          setProcessingInfo([
            '✅ Status update processed!',
            '📧 All email notifications sent successfully'
          ]);
        }, 3000);
        
        setTimeout(() => {
          setProcessingInfo([]);
        }, 5000);
      }
      
      const statusMessages = {
        'SENT': '✅ Quote sent successfully! Email notification sent to client.',
        'ACCEPTED': '✅ Quote accepted! Confirmation sent to client.',
        'REJECTED': '✅ Quote rejected. Notification sent to client.',
        'CANCELLED': '✅ Quote cancelled. Cancellation email sent to client.'
      };
      
      setSuccessMessage(statusMessages[newStatus] || '✅ Status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 6000);
      
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // DELETE HANDLER
  // ============================================================================

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    setProcessingInfo([
      '🔄 Initiating cancellation...',
      '📧 Preparing cancellation email...',
      '⏳ This may take 2-3 seconds...'
    ]);

    try {
      const response = await fetch(`${API_URL}/quotes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // ✅ Use token-based headers
        body: JSON.stringify({ 
          cancellation_reason: deleteReason || 'Quote cancelled by admin'
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quote');
      }

      const data = await response.json();
      
      if (data.processing_info) {
        const messages = [
          '✅ Cancellation complete!',
          `📧 ${data.processing_info.email_sent ? 'Email sent' : 'Email queued'}`,
          '⏳ Finalizing email delivery...'
        ];
        
        setProcessingInfo(messages);
        
        setTimeout(() => {
          setProcessingInfo([
            '✅ Quote cancelled successfully!',
            '📧 All notifications delivered',
            '🔄 Redirecting to quotes list...'
          ]);
        }, 3000);
      }

      setTimeout(() => {
        navigate('/admin/quotes', { 
          state: { 
            message: '✅ Quote cancelled successfully.',
            processingInfo: data.processing_info 
          }
        });
      }, 4500);
      
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ============================================================================
  // ALERT ACTION HANDLERS
  // ============================================================================

  const handleAlertAction = async (alert) => {
    if (!alert.api_call) {
      console.warn('No API call defined for alert:', alert);
      return;
    }
    
    setActiveAlertAction(alert.type);
    setProcessingInfo([
      '🔄 Processing alert action...',
      alert.api_call.note || 'Executing suggested fix...',
      '📧 Sending email notifications...'
    ]);
    
    try {
      // Execute the backend-provided API call
      const response = await fetch(
        `${API_URL}${alert.api_call.endpoint}`,
        {
          method: alert.api_call.method,
          headers: getAuthHeaders(), // ✅ Use token-based headers
          body: alert.api_call.payload ? JSON.stringify(alert.api_call.payload) : undefined
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute action');
      }
      
      const data = await response.json();
      
      // Enhanced success feedback
      setSuccessMessage(`✅ ${alert.suggested_action || 'Action'} completed successfully!`);
      
      if (data.processing_info) {
        setProcessingInfo([
          '✅ Action completed!',
          data.processing_info.email_sent ? '📧 Email notifications sent' : '📧 Emails queued',
          '🔄 Refreshing data...'
        ]);
      } else {
        setProcessingInfo(['✅ Action completed!', '🔄 Refreshing data...']);
      }
      
      // Refresh the quote data
      fetchQuote();
      
      // Clear conflict if resolved
      if (alert.type === 'TIME_CONFLICT' && conflictDetails) {
        setConflictDetails(null);
      }
      
      setTimeout(() => {
        setSuccessMessage('');
        setProcessingInfo([]);
      }, 5000);
      
    } catch (err) {
      setError(`Failed to process alert: ${err.message}`);
      setProcessingInfo([]);
    } finally {
      setActiveAlertAction(null);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    let formattedTime = timeString;
    if (formattedTime.includes(':')) {
      const parts = formattedTime.split(':');
      formattedTime = `${parts[0]}:${parts[1]}`;
    }
    return new Date(`2000-01-01T${formattedTime}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SENT':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ACCEPTED':
        return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-800 border-red-300';
      case 'CANCELLED':
        return isDarkMode ? 'bg-gray-900/30 text-gray-400 border-gray-800' : 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return isDarkMode ? 'bg-stone-800 text-stone-300 border-stone-700' : 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200';
      case 'MEDIUM':
        return isDarkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
      case 'LOW':
        return isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200';
      default:
        return isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-100 border-gray-200';
    }
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  // Enhanced alert renderer
  const renderEnhancedAlert = (alert) => {
    const isActive = activeAlertAction === alert.type;
    
    return (
      <div className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)} ${isActive ? 'ring-2 ring-gold-500' : ''}`}>
        {/* Header with severity badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {alert.severity === 'HIGH' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : alert.severity === 'MEDIUM' ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Info className="h-5 w-5 text-blue-500" />
            )}
            <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {alert.type?.replace(/_/g, ' ')}
            </h4>
            {alert.action_required && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">
                ACTION REQUIRED
              </span>
            )}
          </div>
        </div>

        {/* Detailed message */}
        <p className={`text-sm mb-3 break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
          {alert.message}
        </p>

        {/* Step-by-step guidance */}
        {alert.step_by_step && alert.step_by_step.length > 0 && (
          <div className={`${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} rounded-lg p-3 mb-3`}>
            <p className="text-xs font-medium text-stone-400 mb-2">
              📋 Recommended Actions:
            </p>
            <ol className="space-y-1 text-xs text-stone-300">
              {alert.step_by_step.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold-500">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Verified alternatives preview */}
        {alert.verified_alternatives?.available_times?.length > 0 && (
          <div className={`${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-100 border-green-200'} border rounded-lg p-3 mb-3`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-400" />
              <p className={`text-xs font-medium break-words ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                ✅ {alert.verified_alternatives.available_times.length} Verified Times Available
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {alert.verified_alternatives.available_times.slice(0, 3).map((alt, idx) => (
                <span key={idx} className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'}`}>
                  {alt.display}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action button - Only show if there's an API call */}
        {alert.api_call && (
          <button
            onClick={() => handleAlertAction(alert)}
            disabled={isActive}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Apply Suggested Fix
          </button>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <AdminNavbar />
        <main className="flex-1 min-h-screen overflow-y-auto pt-20 lg:pt-0 lg:ml-72">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
              {processingInfo.length > 0 && (
                <div className="space-y-1 mb-4">
                  {processingInfo.map((info, idx) => (
                    <p key={idx} className={`text-sm break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      {info}
                    </p>
                  ))}
                </div>
              )}
              <p className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                Loading quote details...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <AdminNavbar />
        <main className="flex-1 min-h-screen overflow-y-auto pt-20 lg:pt-0 lg:ml-72">
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <div className={`rounded-lg border p-6 text-center ${
              isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
            }`}>
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Error Loading Quote
              </h3>
              <p className={`text-sm mb-4 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                {error}
              </p>
              <button
                onClick={() => navigate('/admin/quotes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-stone-800 text-white hover:bg-stone-700'
                    : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                }`}
              >
                Back to Quotes
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!quote) return null;

  // ============================================================================
  // RENDER: PROCESSING INFO
  // ============================================================================

  const renderProcessingInfo = () => {
    if (processingInfo.length === 0) return null;
    
    return (
      <div className={`mb-4 rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {processingInfo.map((info, idx) => (
              <p key={idx} className={`text-xs sm:text-sm mb-1 last:mb-0 break-words ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {info}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderValidationWarnings = () => {
    if (realTimeValidation.isValid && !studioHoursWarning) return null;
    
    return (
      <div className={`mb-4 rounded-lg p-3 sm:p-4 ${
        realTimeValidation.isValid 
          ? isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
          : isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 ${
            realTimeValidation.isValid ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <div className="flex-1">
            {studioHoursWarning && (
              <p className={`text-xs sm:text-sm font-medium break-words ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {studioHoursWarning.message}
                {studioHoursWarning.suggestedStart && (
                  <span className="block mt-1">
                    Suggested time: {studioHoursWarning.suggestedStart}
                  </span>
                )}
              </p>
            )}
            
            {realTimeValidation.messages.map((msg, idx) => (
              <p key={idx} className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                {msg.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDateAvailability = () => {
    if (!dateAvailability || !isEditMode) return null;
    
    return (
      <div className={`mt-2 p-3 rounded-lg ${
        dateAvailability.available
          ? isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
          : isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {dateAvailability.available ? (
            <CalendarCheck className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <div>
            <p className={`text-xs sm:text-sm font-medium break-words ${
              dateAvailability.available
                ? isDarkMode ? 'text-green-300' : 'text-green-800'
                : isDarkMode ? 'text-red-300' : 'text-red-800'
            }`}>
              {dateAvailability.message}
            </p>
            <p className={`text-xs mt-1 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              {dateAvailability.count} quote{dateAvailability.count === 1 ? '' : 's'} booked for this day
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // CONFLICT DETAILS
  // ============================================================================

  const renderConflictDetails = () => {
    if (!conflictDetails || !conflictDetails.has_conflict) return null;
    
    const hasBackendAlternatives = conflictDetails.verified_alternatives?.available_times?.length > 0;
    const suggestions = hasBackendAlternatives 
      ? conflictDetails.verified_alternatives.available_times 
      : timeSuggestions;
    
    return (
      <div className={`mb-6 rounded-lg border p-4 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className={`font-bold text-sm sm:text-base break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  ⚠️ Time Conflict Detected
                </h4>
                {conflictDetails.is_priority && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    ✅ This quote has priority (first submitted)
                  </span>
                )}
                {autoResolvedConflict && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    ✅ Auto-resolved
                  </span>
                )}
              </div>
              
              <p className={`text-xs sm:text-sm mb-3 break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                {conflictDetails.message || `This quote conflicts with ${conflictDetails.conflicting_count || 0} other quote(s).`}
              </p>
              
              {/* Show diagnostics if available */}
              {alternativeTimesDiagnostics && (
                <div className={`mb-3 p-2 rounded ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className={isDarkMode ? 'text-stone-300' : 'text-stone-600'}>
                      Backend verification: Checked {alternativeTimesDiagnostics.checked_slots || 0} slots, 
                      found {alternativeTimesDiagnostics.conflict_free || 0} available
                    </span>
                  </div>
                </div>
              )}
              
              {/* Verified Alternative Times */}
              {suggestions.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gold-500" />
                    <p className={`text-xs sm:text-sm font-medium break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      {hasBackendAlternatives ? '✅ Verified Available Times:' : 'Suggested alternative times:'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((alt, idx) => {
                      const time = alt.time || alt;
                      const display = alt.display || formatTime(alt);
                      const offset = alt.offset_hours ? `(${alt.offset_hours > 0 ? '+' : ''}${alt.offset_hours}h)` : '';
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAlternativeTimeClick(alt)}
                          className={`px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-all ${
                            isDarkMode
                              ? 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
                              : 'bg-white hover:bg-gray-100 text-stone-900 border border-gray-300'
                          } ${selectedAlternativeTime === time ? 'ring-2 ring-gold-500' : ''}`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{display}</span>
                          {offset && <span className="text-xs opacity-70">{offset}</span>}
                          {alt.verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowRescheduleModal(true);
                    if (selectedAlternativeTime) {
                      setQuote(prev => ({ ...prev, event_time: selectedAlternativeTime }));
                      setIsDirty(true);
                    }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Reschedule Quote</span>
                  <span className="xs:hidden">Reschedule</span>
                </button>
                
                {conflictDetails.conflicting_quote_ids && conflictDetails.conflicting_quote_ids.length > 0 && (
                  <button
                    onClick={() => navigate(`/admin/quotes/${conflictDetails.conflicting_quote_ids[0]}`)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 ${
                      isDarkMode
                        ? 'bg-stone-800 text-white hover:bg-stone-700'
                        : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">View Conflicting Quote</span>
                    <span className="xs:hidden">View Conflict</span>
                  </button>
                )}
                
                <button
                  onClick={() => fetchVerifiedAlternativeTimes(id)}
                  disabled={isFetchingAlternatives}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {isFetchingAlternatives ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden xs:inline">Refresh Alternatives</span>
                  <span className="xs:hidden">Refresh</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowConflictDetails(!showConflictDetails)}
            className={`${isDarkMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'} ml-2`}
          >
            {showConflictDetails ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>
        
        {/* Expanded diagnostics view */}
        {showConflictDetails && alternativeTimesDiagnostics && (
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <h5 className={`text-xs sm:text-sm font-medium mb-2 flex items-center gap-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
              <Server className="h-3 w-3 sm:h-4 sm:w-4" />
              Backend Verification Details
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className={`p-2 rounded ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                <div className="font-medium">Slots Checked</div>
                <div className="text-sm sm:text-lg font-bold">{alternativeTimesDiagnostics.checked_slots || 0}</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                <div className="font-medium">Within Hours</div>
                <div className="text-sm sm:text-lg font-bold">{alternativeTimesDiagnostics.within_hours || 0}</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                <div className="font-medium">Conflict-Free</div>
                <div className="text-sm sm:text-lg font-bold">{alternativeTimesDiagnostics.conflict_free || 0}</div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                <div className="font-medium">Available Found</div>
                <div className="text-sm sm:text-lg font-bold">{alternativeTimesDiagnostics.available_found || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // ALERTS
  // ============================================================================

  const renderBackendAlerts = () => {
    if (enhancedAlerts.length === 0) return null;
    
    return (
      <div className="mb-6 space-y-3">
        <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          System Alerts & Recommendations
        </h3>
        
        {enhancedAlerts.map((alert, idx) => (
          <div key={idx}>
            {renderEnhancedAlert(alert)}
          </div>
        ))}
      </div>
    );
  };

  const renderTimeInputWithValidation = () => {
    const dayOfWeek = getDayOfWeek(quote.event_date);
    const hours = dayOfWeek ? studioHours[dayOfWeek] : null;
    
    return (
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
          Event Time {hours && `(${hours.start} - ${hours.end})`}
        </label>
        {isEditMode ? (
          <>
            <input
              type="time"
              value={selectedAlternativeTime || quote.event_time || ''}
              onChange={(e) => {
                handleFieldChange('event_time', e.target.value);
                
                if (quote.event_date) {
                  const validation = validateStudioHours(quote.event_date, e.target.value);
                  if (!validation.valid) {
                    setStudioHoursWarning(validation);
                  } else {
                    setStudioHoursWarning(null);
                  }
                }
              }}
              className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                isDarkMode
                  ? 'bg-stone-800 border-stone-700 text-white'
                  : 'bg-white border-gray-300 text-stone-900'
              } focus:outline-none focus:ring-2 focus:ring-gold-500`}
            />
            {hours && (
              <p className={`text-xs mt-1 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Studio hours: {hours.start} - {hours.end}
              </p>
            )}
          </>
        ) : (
          <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {formatTime(quote.event_time)}
            {hours && (
              <span className={`text-xs block break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                (Studio hours: {hours.start} - {hours.end})
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  const renderDateInputWithAvailability = () => {
    return (
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
          Event Date
        </label>
        {isEditMode ? (
          <>
            <input
              type="date"
              value={quote.event_date || ''}
              onChange={async (e) => {
                handleFieldChange('event_date', e.target.value);
                
                if (e.target.value) {
                  await checkDateAvailability(e.target.value);
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                isDarkMode
                  ? 'bg-stone-800 border-stone-700 text-white'
                  : 'bg-white border-gray-300 text-stone-900'
              } focus:outline-none focus:ring-2 focus:ring-gold-500`}
            />
            {renderDateAvailability()}
          </>
        ) : (
          <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {formatDate(quote.event_date)}
            {dateAvailability && (
              <span className={`text-xs block break-words ${dateAvailability.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {dateAvailability.message}
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  // ============================================================================
  // SERVICES RENDERING
  // ============================================================================

  const renderServicesWithPriceRange = () => {
    if (!quote.selected_services || quote.selected_services.length === 0) {
      return (
        <div className="text-center py-4">
          <PackageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-stone-400 mx-auto mb-2" />
          <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            No services selected
          </p>
        </div>
      );
    }

    // Check if services are enriched with pricing data
    const firstService = quote.selected_services[0];
    const hasPriceRange = firstService && typeof firstService === 'object' && firstService.price_range;

    // Calculate total price estimate if available
    const priceEstimate = quote.price_estimate;

    return (
      <div className="space-y-4">
        {/* Services list */}
        <div className="space-y-3">
          {quote.selected_services.map((service, idx) => {
            const serviceTitle = typeof service === 'object' ? service.title || service.service_name : service;
            const priceRange = typeof service === 'object' ? service.price_range : null;
            const priceMin = typeof service === 'object' ? service.price_min : null;
            const priceMax = typeof service === 'object' ? service.price_max : null;
            const features = typeof service === 'object' ? service.features : [];
            const category = typeof service === 'object' ? service.category : null;

            // Format price range with Ksh
            const formattedPriceRange = priceRange 
              ? priceRange.replace('$', 'Ksh ') 
              : (priceMin !== null && priceMax !== null) 
                ? `Ksh ${formatCurrency(priceMin, false)} – ${formatCurrency(priceMax, false)}`
                : null;

            return (
              <div
                key={idx}
                className={`p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 ${
                  isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* Service header with title and price */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <CheckSquare className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 ${
                    isDarkMode ? 'text-gold-500' : 'text-gold-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {serviceTitle}
                    </h4>
                    {category && (
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                        isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {category}
                      </span>
                    )}
                    
                    {/* Features list */}
                    {features && features.length > 0 && (
                      <div className={`mt-2 flex flex-wrap gap-1.5`}>
                        {features.map((feature, featureIdx) => (
                          <span
                            key={featureIdx}
                            className={`px-2 py-0.5 text-xs rounded ${
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
                    <div className="font-semibold text-sm whitespace-nowrap">
                      {formattedPriceRange}
                    </div>
                    {priceMin !== null && priceMax !== null && (
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
          <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t ${
            isDarkMode ? 'border-gold-700' : 'border-gold-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className={`font-bold text-sm sm:text-base break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Total Price Estimate
                </h4>
                <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Based on selected services
                </p>
              </div>
              <div className={`text-left sm:text-right ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div className="font-bold text-base sm:text-lg">
                  {priceEstimate.formatted 
                    ? priceEstimate.formatted.replace('$', 'Ksh ') 
                    : priceEstimate.min_estimate !== null && priceEstimate.max_estimate !== null
                      ? `Ksh ${formatCurrency(priceEstimate.min_estimate, false)} – ${formatCurrency(priceEstimate.max_estimate, false)}`
                      : 'Price on request'}
                </div>
                {priceEstimate.min_estimate !== null && priceEstimate.max_estimate !== null && (
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
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar />
      
      <main className="flex-1 min-h-screen overflow-y-auto pt-20 lg:pt-0 lg:ml-72">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header - Fully Responsive */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <button
              onClick={() => navigate('/admin/quotes')}
              className={`flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm font-medium transition-colors ${
                isDarkMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Back to Quotes</span>
            </button>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif break-words ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  Quote #{quote.id}
                </h1>
                <p className={`mt-1 sm:mt-2 text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Created {formatDate(quote.created_at)}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap ${getStatusColor(quote.status)}`}>
                  {quote.status}
                </span>
                {conflictDetails?.has_conflict && (
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-red-900/30 text-red-400 border border-red-800 whitespace-nowrap">
                    Conflict
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Processing Info */}
          {renderProcessingInfo()}

          {/* Validation Warnings */}
          {renderValidationWarnings()}

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${
              isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'
            }`}>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${
              isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
              <p className={`text-xs sm:text-sm flex-1 break-words ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                {error}
              </p>
              <button onClick={() => setError('')} className={isDarkMode ? 'text-red-300' : 'text-red-800'}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Conflict Details */}
          {renderConflictDetails()}

          {/* Backend Alerts */}
          {renderBackendAlerts()}

          {/* Action Buttons - Responsive */}
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
            {!isEditMode ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gold-600 text-white hover:bg-gold-700'
                      : 'bg-gold-500 text-white hover:bg-gold-600'
                  }`}
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Edit Quote</span>
                  <span className="xs:hidden">Edit</span>
                </button>
                
                {quote.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange('SENT')}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50`}
                  >
                    {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4" />}
                    <span className="hidden xs:inline">Send Quote</span>
                    <span className="xs:hidden">Send</span>
                  </button>
                )}
                
                {(quote.status === 'PENDING' || quote.status === 'SENT') && (
                  <>
                    <button
                      onClick={() => handleStatusChange('ACCEPTED')}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      } disabled:opacity-50`}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span className="hidden xs:inline">Accept</span>
                      <span className="xs:hidden">Accept</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      } disabled:opacity-50`}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span className="hidden xs:inline">Reject</span>
                      <span className="xs:hidden">Reject</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={fetchQuote}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-stone-800 text-white hover:bg-stone-700'
                      : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                  } disabled:opacity-50`}
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">Refresh</span>
                  <span className="xs:hidden">Refresh</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className={`ml-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Delete</span>
                  <span className="xs:hidden">Delete</span>
                </button>
                
                <button
                  onClick={() => setShowStudioHours(!showStudioHours)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Studio Hours</span>
                  <span className="xs:hidden">Hours</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving || !isDirty || !realTimeValidation.isValid || studioHoursWarning}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gold-600 text-white hover:bg-gold-700'
                      : 'bg-gold-500 text-white hover:bg-gold-600'
                  } disabled:opacity-50`}
                >
                  {isSaving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Save className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="hidden xs:inline">Save Changes</span>
                  <span className="xs:hidden">Save</span>
                </button>
                
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-stone-800 text-white hover:bg-stone-700'
                      : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                  } disabled:opacity-50`}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Cancel</span>
                  <span className="xs:hidden">Cancel</span>
                </button>
                
                {isDirty && (
                  <span className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Unsaved changes</span>
                    <span className="xs:hidden">Unsaved</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Studio Hours Info - Hardcoded to match backend */}
          {showStudioHours && studioHours && (
            <div className={`mb-6 rounded-lg border p-4 sm:p-6 ${
              isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <h3 className={`text-sm sm:text-base font-bold break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Studio Operating Hours (Hardcoded)
                  </h3>
                </div>
                <button
                  onClick={() => setShowStudioHours(false)}
                  className={isDarkMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Object.entries({
                  monday: 'Mon',
                  tuesday: 'Tue',
                  wednesday: 'Wed',
                  thursday: 'Thu',
                  friday: 'Fri',
                  saturday: 'Sat',
                  sunday: 'Sun'
                }).map(([day, label]) => {
                  const hours = studioHours[day];
                  const isCurrentDay = getDayOfWeek(quote.event_date) === day;
                  
                  return (
                    <div key={day} className={`text-center p-1 sm:p-2 rounded ${
                      isCurrentDay 
                        ? isDarkMode ? 'bg-gold-900/30 border border-gold-700' : 'bg-gold-50 border border-gold-200'
                        : isDarkMode ? 'bg-stone-800' : 'bg-white'
                    }`}>
                      <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {label}
                      </p>
                      <p className={`text-xs break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {hours?.start || 'N/A'}-{hours?.end || 'N/A'}
                      </p>
                      {isCurrentDay && (
                        <div className="mt-1">
                          <span className="inline-block h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-gold-500 animate-pulse"></span>
                          <span className="text-xs ml-1 text-gold-500">Current</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className={`text-xs sm:text-sm mt-3 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Hours are hardcoded to match backend settings. Quotes outside these hours will be automatically flagged and validated.
              </p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Client Information */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Client Information
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Client Name
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={quote.client_name}
                        onChange={(e) => handleFieldChange('client_name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white'
                            : 'bg-white border-gray-300 text-stone-900'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {quote.client_name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Company Name
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={quote.company_name || ''}
                        onChange={(e) => handleFieldChange('company_name', e.target.value)}
                        placeholder="Optional"
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                            : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {quote.company_name || 'Not specified'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-stone-300' : 'text-stone-700'
                      }`}>
                        <MailIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                        Email
                      </label>
                      {isEditMode ? (
                        <input
                          type="email"
                          value={quote.client_email}
                          onChange={(e) => handleFieldChange('client_email', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                            isDarkMode
                              ? 'bg-stone-800 border-stone-700 text-white'
                              : 'bg-white border-gray-300 text-stone-900'
                          } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                        />
                      ) : (
                        <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          {quote.client_email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-stone-300' : 'text-stone-700'
                      }`}>
                        <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                        Phone
                      </label>
                      {isEditMode ? (
                        <input
                          type="tel"
                          value={quote.client_phone}
                          onChange={(e) => handleFieldChange('client_phone', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                            isDarkMode
                              ? 'bg-stone-800 border-stone-700 text-white'
                              : 'bg-white border-gray-300 text-stone-900'
                          } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                        />
                      ) : (
                        <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          {quote.client_phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Event Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Date Input with Availability */}
                  {renderDateInputWithAvailability()}
                  
                  {/* Time Input with Studio Hours Validation */}
                  {renderTimeInputWithValidation()}
                  
                  <div className="md:col-span-2">
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                      Location
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={quote.event_location || ''}
                        onChange={(e) => handleFieldChange('event_location', e.target.value)}
                        placeholder="Event location"
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                            : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {quote.event_location || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <PackageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Selected Services & Pricing
                </h2>
                
                {renderServicesWithPriceRange()}
              </div>

              {/* Project Description */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Project Description
                </h2>
                
                {isEditMode ? (
                  <textarea
                    value={quote.project_description || ''}
                    onChange={(e) => handleFieldChange('project_description', e.target.value)}
                    rows={4}
                    placeholder="Project description..."
                    className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                      isDarkMode
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                        : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                    } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                  />
                ) : (
                  <p className={`whitespace-pre-wrap break-words ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}>
                    {quote.project_description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Quote Response */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Quote Response
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Quoted Amount
                    </label>
                    {isEditMode ? (
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDarkMode ? 'text-stone-400' : 'text-stone-500'
                        }`}>
                          Ksh
                        </span>
                        <input
                          type="text"
                          value={quote.quoted_amount || ''}
                          onChange={(e) => handleFieldChange('quoted_amount', e.target.value)}
                          placeholder="0"
                          className={`w-full pl-12 pr-3 py-2 rounded-lg border text-xs sm:text-sm ${
                            isDarkMode
                              ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                              : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                          } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                        />
                      </div>
                    ) : (
                      <p className={`font-semibold break-words ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        {quote.quoted_amount ? formatCurrency(quote.quoted_amount) : 'Not quoted yet'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Quote Details
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={quote.quote_details || ''}
                        onChange={(e) => handleFieldChange('quote_details', e.target.value)}
                        rows={4}
                        placeholder="Detailed quote breakdown..."
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                            : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`whitespace-pre-wrap break-words ${
                        isDarkMode ? 'text-white' : 'text-stone-900'
                      }`}>
                        {quote.quote_details || 'No details provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      Valid Until
                    </label>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={quote.valid_until || ''}
                        onChange={(e) => handleFieldChange('valid_until', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white'
                            : 'bg-white border-gray-300 text-stone-900'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {quote.valid_until ? formatDate(quote.valid_until) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Status Management */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Status Management
                </h2>
                
                {isEditMode ? (
                  <select
                    value={quote.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                      isDarkMode
                        ? 'bg-stone-800 border-stone-700 text-white'
                        : 'bg-white border-gray-300 text-stone-900'
                    } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                  >
                    {quoteStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-3">
                    <div className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg border ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </div>
                    
                    {quote.quote_sent_at && (
                      <div>
                        <p className={`text-xs font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          Quote Sent
                        </p>
                        <p className={`text-sm break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          {formatDate(quote.quote_sent_at)}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-stone-800 dark:border-stone-700">
                      <p className={`text-xs font-medium mb-2 break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Quick Actions:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {quote.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange('SENT')}
                            disabled={isSaving}
                            className={`px-2 sm:px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                              isDarkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            } disabled:opacity-50`}
                          >
                            <Send className="h-3 w-3" />
                            Send
                          </button>
                        )}
                        {(quote.status === 'PENDING' || quote.status === 'SENT') && (
                          <>
                            <button
                              onClick={() => handleStatusChange('ACCEPTED')}
                              disabled={isSaving}
                              className={`px-2 sm:px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                                isDarkMode
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              } disabled:opacity-50`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange('REJECTED')}
                              disabled={isSaving}
                              className={`px-2 sm:px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                                isDarkMode
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              } disabled:opacity-50`}
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {quote.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusChange('CANCELLED')}
                            disabled={isSaving}
                            className={`px-2 sm:px-3 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                              isDarkMode
                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                            } disabled:opacity-50`}
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Management */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gold-500" />
                  Assignment
                </h2>
                
                {quote.assigned_to ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-stone-800' : 'bg-gray-100'
                    }`}>
                      <p className={`text-xs font-medium mb-1 break-words ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-600'
                      }`}>
                        Assigned To:
                      </p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                          if (assignedUser?.avatar_url) {
                            return (
                              <img
                                src={assignedUser.avatar_url}
                                alt={assignedUser.full_name}
                                className="w-8 h-8 rounded-full object-cover border border-gold-500/30"
                              />
                            );
                          }
                          return (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                            }`}>
                              {assignedUser?.full_name?.charAt(0) || '?'}
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            {(() => {
                              const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                              return assignedUser?.full_name || `User #${quote.assigned_to}`;
                            })()}
                          </p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {(() => {
                              const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                              return assignedUser?.role || 'Staff';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                      }`}
                    >
                      Reassign Quote
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className={`text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      This quote has not been assigned yet.
                    </p>
                    
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-gold-600 text-white hover:bg-gold-700'
                          : 'bg-gold-500 text-white hover:bg-gold-600'
                      }`}
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      Assign Quote
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  Additional Info
                </h2>
                
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Budget Range
                    </p>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={quote.budget_range || ''}
                        onChange={(e) => handleFieldChange('budget_range', e.target.value)}
                        placeholder="e.g., Ksh 5,000 - 10,000"
                        className={`w-full mt-1 px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                            : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                        } focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      />
                    ) : (
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {quote.budget_range ? quote.budget_range.replace('$', 'Ksh ') : 'Not specified'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Referral Source
                    </p>
                    <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {quote.referral_source || 'Not specified'}
                    </p>
                  </div>
                  
                  <div className={`pt-3 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Created
                    </p>
                    <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {formatDate(quote.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Last Updated
                    </p>
                    <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {formatDate(quote.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className={`rounded-xl border p-4 sm:p-6 ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 text-gold-500" />
                  System Info
                </h2>
                
                <div className="space-y-3 text-xs sm:text-sm">
                  {quote.conflict_checked_at && (
                    <div>
                      <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Last Conflict Check
                      </p>
                      <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {formatDate(quote.conflict_checked_at)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Quote ID
                    </p>
                    <p className={`font-bold break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      #{quote.id}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Daily Quote Limit
                    </p>
                    <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {MAX_QUOTES_PER_DAY} per day
                    </p>
                  </div>
                  
                  <div>
                    <p className={`font-medium break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Quote Expiry
                    </p>
                    <p className={`break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {QUOTE_EXPIRY_DAYS} days
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-stone-800 dark:border-stone-700">
                    <button
                      onClick={fetchQuote}
                      disabled={isLoading}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        isDarkMode
                          ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                      } disabled:opacity-50`}
                    >
                      <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================================
      MODALS
      ============================================================================ */}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4`}>
          <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} flex-shrink-0`}>
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base sm:text-lg font-semibold break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Cancel Quote
                  </h3>
                  <p className={`mt-2 text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Are you sure you want to cancel quote for <span className={`font-semibold break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>"{quote.client_name}"</span>?
                    A cancellation email will be sent to the client.
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`px-4 sm:px-6 pt-3 sm:pt-4`}>
              <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className={`text-xs break-words ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    <strong>Note:</strong> This will mark the quote as CANCELLED and send a cancellation email to the client. The quote will be retained in the system for records.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 flex flex-col xs:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 border ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50`}
              >
                Keep Quote
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Cancel Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className={`rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 text-gold-500" />
              Reschedule Quote
            </h3>
            
            <p className={`mb-3 sm:mb-4 text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
              Rescheduling will send an email notification to the client about the schedule change.
            </p>
            
            <div className="mb-3 sm:mb-4">
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-700'
              }`}>
                Reason for reschedule (optional)
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={3}
                placeholder="Explain why the quote is being rescheduled..."
                className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                    : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'
                } focus:outline-none focus:ring-2 focus:ring-gold-500`}
              />
            </div>
            
            <div className="mb-3 sm:mb-4">
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-700'
              }`}>
                New Event Date
              </label>
              <input
                type="date"
                value={quote.event_date || ''}
                onChange={async (e) => {
                  handleFieldChange('event_date', e.target.value);
                  if (e.target.value) {
                    await checkDateAvailability(e.target.value);
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? 'bg-stone-800 border-stone-700 text-white'
                    : 'bg-white border-gray-300 text-stone-900'
                } focus:outline-none focus:ring-2 focus:ring-gold-500`}
              />
              {renderDateAvailability()}
            </div>
            
            <div className="mb-3 sm:mb-4">
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-700'
              }`}>
                New Event Time
              </label>
              <input
                type="time"
                value={selectedAlternativeTime || quote.event_time || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFieldChange('event_time', value);
                  if (quote.event_date) {
                    const validation = validateStudioHours(quote.event_date, value);
                    if (!validation.valid) {
                      setStudioHoursWarning(validation);
                    } else {
                      setStudioHoursWarning(null);
                    }
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? 'bg-stone-800 border-stone-700 text-white'
                    : 'bg-white border-gray-300 text-stone-900'
                } focus:outline-none focus:ring-2 focus:ring-gold-500`}
              />
              {studioHoursWarning && (
                <p className={`text-xs mt-1 break-words ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  {studioHoursWarning.message}
                </p>
              )}
            </div>
            
            {/* Enhanced Email Notification Box */}
            <div className={`mb-3 sm:mb-4 rounded-lg p-3 border ${
              isDarkMode 
                ? 'bg-blue-900/30 border-blue-700/50'
                : 'bg-blue-100 border-blue-300'
            }`}>
              <div className="flex items-start gap-3">
                <Mail className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <p className={`text-xs sm:text-sm font-medium break-words ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  📧 A reschedule email will be sent to the client automatically.
                  The email will include the new date/time and your reason.
                </p>
              </div>
            </div>
            
            {/* Improved Button Sizing */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving || !realTimeValidation.isValid || studioHoursWarning || !quote.event_date || !quote.event_time}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gold-600 text-white hover:bg-gold-700'
                    : 'bg-gold-500 text-white hover:bg-gold-600'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>Rescheduling...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Confirm Reschedule</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleReason('');
                  setSelectedAlternativeTime(null);
                }}
                disabled={isSaving}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-stone-800 text-white hover:bg-stone-700 border border-stone-700'
                    : 'bg-white text-stone-900 hover:bg-stone-50 border border-gray-300'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className={`rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 break-words ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 text-gold-500" />
              Assign Quote
            </h3>
            
            <p className={`mb-3 sm:mb-4 text-xs sm:text-sm break-words ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
              Select a user to assign this quote to. They will be notified via email.
            </p>
            
            {/* User Selection */}
            <div className="mb-3 sm:mb-4">
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                isDarkMode ? 'text-stone-300' : 'text-stone-700'
              }`}>
                Select User
              </label>
              
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className={`p-4 rounded-lg text-center ${
                  isDarkMode ? 'bg-stone-800' : 'bg-gray-100'
                }`}>
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className={`text-sm break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    No users available for assignment
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedUserId === user.id
                          ? isDarkMode
                            ? 'border-gold-500 bg-gold-900/20'
                            : 'border-gold-500 bg-gold-50'
                          : isDarkMode
                            ? 'border-stone-700 bg-stone-800 hover:border-stone-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-gold-500/30"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            selectedUserId === user.id
                              ? 'bg-gold-500 text-white'
                              : isDarkMode
                                ? 'bg-stone-700 text-stone-300'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${
                            isDarkMode ? 'text-white' : 'text-stone-900'
                          }`}>
                            {user.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                            {user.email && (
                              <span className={`text-xs truncate break-words ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        {selectedUserId === user.id && (
                          <CheckCircle className="h-5 w-5 text-gold-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleAssignUser}
                disabled={isSaving || !selectedUserId || isLoadingUsers}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gold-600 text-white hover:bg-gold-700'
                    : 'bg-gold-500 text-white hover:bg-gold-600'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Confirm Assignment</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUserId(null);
                }}
                disabled={isSaving}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-stone-800 text-white hover:bg-stone-700 border border-stone-700'
                    : 'bg-white text-stone-900 hover:bg-stone-50 border border-gray-300'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuoteDetail;
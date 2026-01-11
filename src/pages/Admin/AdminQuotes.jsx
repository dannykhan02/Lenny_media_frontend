import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, X, AlertCircle, Loader2, Eye, Calendar as CalendarIcon, 
  Clock, Mail, Phone, FileText, Filter, RefreshCw, 
  CheckSquare, Square, Trash2, Edit3, List, Calendar as CalendarView,
  AlertTriangle, TrendingUp, Users, DollarSign, CheckCircle,
  Send, Check, XCircle, Tag, ChevronLeft, ChevronRight, Calendar,
  Mail as MailIcon, Phone as PhoneIcon, User, Building, MapPin, Package,
  ChevronDown, ChevronUp, Plus, Grid, EyeOff, BarChart3, Download,
  MoreVertical, MessageSquare, Archive, CalendarDays, ExternalLink,
  Check as CheckIcon, CalendarCheck, Shield, Zap, Target, Info,
  ArrowLeft, ArrowRight, Eye as EyeIcon, Users as UsersIcon, 
  Hash, Star, Filter as FilterIcon, Menu, Grid as GridIcon,
  List as ListIcon, Send as SendIcon, CheckSquare as CheckSquareIcon,
  Square as SquareIcon, Clock as ClockIcon, Maximize2, Minimize2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // ✅ Import useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminQuotes = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, getAccessToken, logout } = useAuth(); // ✅ Use auth context
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingInfo, setProcessingInfo] = useState([]);
  
  const [quoteStatuses, setQuoteStatuses] = useState([]);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Enhanced Filters with assignment filter
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    has_conflicts: '',
    assigned_to: '',  // NEW: Assignment filter
    page: 1,
    per_page: 20
  });

  const [searchInput, setSearchInput] = useState('');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [dateTimeout, setDateTimeout] = useState(null);

  // Assignment Filter State
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkNewStatus, setBulkNewStatus] = useState('');
  const [bulkCancellationReason, setBulkCancellationReason] = useState('');

  const [showAlertActionModal, setShowAlertActionModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertActionProgress, setAlertActionProgress] = useState('');

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [mobileSheet, setMobileSheet] = useState({
    isOpen: false,
    quote: null
  });

  // Simplified Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarQuotes, setCalendarQuotes] = useState({});
  const [calendarView, setCalendarView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [draggingQuote, setDraggingQuote] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [calendarStatusFilter, setCalendarStatusFilter] = useState('all');
  const [calendarUserFilter, setCalendarUserFilter] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);
  const [showWeekends, setShowWeekends] = useState(true);

  // ✅ Get token from auth context
  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // ✅ Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      try {
        // Wait a moment for auth context to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If no user in auth context after initialization, redirect to login
        if (!authUser) {
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
  }, [authUser, getAccessToken, navigate]);

  useEffect(() => {
    if (authUser) {
      fetchQuoteStatuses();
      fetchAvailableUsers();
    }
  }, [authUser]);

  const fetchQuoteStatuses = async () => {
    setIsStatusLoading(true);
    try {
      const response = await fetch(`${API_URL}/quote-statuses`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch quote statuses');
      }
      
      const data = await response.json();
      setQuoteStatuses(data.statuses || []);
    } catch (err) {
      console.error('Error fetching quote statuses:', err);
      setQuoteStatuses([
        { name: 'PENDING', value: 'PENDING' },
        { name: 'SENT', value: 'SENT' },
        { name: 'ACCEPTED', value: 'ACCEPTED' },
        { name: 'REJECTED', value: 'REJECTED' },
        { name: 'CANCELLED', value: 'CANCELLED' }
      ]);
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Fetch available users for assignment filter
  const fetchAvailableUsers = async () => {
    if (!authUser) return;
    
    setIsLoadingUsers(true);
    try {
      // Try media staff endpoint first
      const response = await fetch(`${API_URL}/api/auth/users/media-staff`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.media_staff || []);
      } else {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        
        // Fallback: Get all non-admin users
        const fallbackResponse = await fetch(`${API_URL}/api/auth/users/non-admins`, {
          headers: getAuthHeaders(),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setAvailableUsers(fallbackData.users || []);
        } else if (fallbackResponse.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    const fetchQuotesWithDebounce = setTimeout(() => {
      if (authUser) {
        fetchQuotes();
      }
    }, 300);

    return () => clearTimeout(fetchQuotesWithDebounce);
  }, [filters.status, filters.has_conflicts, filters.date_from, filters.date_to, filters.assigned_to, filters.page, authUser]);

  useEffect(() => {
    setSearchInput(filters.search);
    setDateFromInput(filters.date_from);
    setDateToInput(filters.date_to);
  }, []);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value.trim(),
        page: 1
      }));
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleDateFilterChange = (type, value) => {
    if (type === 'date_from') {
      setDateFromInput(value);
    } else {
      setDateToInput(value);
    }
    
    if (dateTimeout) {
      clearTimeout(dateTimeout);
    }
    
    const timeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [type]: value,
        page: 1
      }));
    }, 500);
    
    setDateTimeout(timeout);
  };

  const prepareCalendarData = useCallback((quotesData) => {
    const quotesByDate = {};
    
    let filteredQuotes = quotesData;
    
    // Apply calendar status filter
    if (calendarStatusFilter !== 'all') {
      filteredQuotes = filteredQuotes.filter(quote => quote.status === calendarStatusFilter);
    }
    
    // Apply calendar user filter
    if (calendarUserFilter !== 'all') {
      if (calendarUserFilter === 'unassigned') {
        filteredQuotes = filteredQuotes.filter(quote => !quote.assigned_to);
      } else {
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.assigned_to === parseInt(calendarUserFilter)
        );
      }
    }
    
    filteredQuotes.forEach(quote => {
      if (quote.event_date) {
        const date = quote.event_date;
        if (!quotesByDate[date]) {
          quotesByDate[date] = [];
        }
        quotesByDate[date].push(quote);
      }
    });
    
    // Sort quotes by time within each date
    Object.keys(quotesByDate).forEach(date => {
      quotesByDate[date].sort((a, b) => {
        const timeA = a.event_time || '00:00';
        const timeB = b.event_time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });
    
    setCalendarQuotes(quotesByDate);
  }, [calendarStatusFilter, calendarUserFilter]);

  useEffect(() => {
    if (activeTab === 'calendar' && quotes.length > 0) {
      prepareCalendarData(quotes);
    }
  }, [quotes, activeTab, calendarStatusFilter, calendarUserFilter, prepareCalendarData]);

  const fetchQuotes = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    setError('');
    setProcessingInfo([]);
    
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.has_conflicts) params.append('has_conflicts', filters.has_conflicts);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to); // NEW
      params.append('page', filters.page);
      params.append('per_page', filters.per_page);

      const response = await fetch(`${API_URL}/quotes?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      
      setQuotes(data.quotes || []);
      setFilteredQuotes(data.quotes || []);
      setSummary(data.summary || null);
      setAlerts(data.alerts || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.current_page || 1);
      setTotalQuotes(data.total || 0);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS FOR ASSIGNMENT
  // ============================================================================

  const getAssignedUserName = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.full_name : `User #${userId}`;
  };

  const getAssignedUserInitial = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.full_name?.charAt(0) || '?';
  };

  // ============================================================================
  // ENHANCED CALENDAR FUNCTIONS
  // ============================================================================

  const handleDragStart = (e, quote) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(quote));
    setDraggingQuote(quote);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggingQuote(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = (e) => {
    setDragOverDate(null);
  };

  const handleDrop = async (e, targetDate) => {
    if (!authUser) return;
    
    e.preventDefault();
    if (!draggingQuote) return;
    
    // Prevent dropping on the same date
    if (draggingQuote.event_date === targetDate) {
      setDraggingQuote(null);
      setDragOverDate(null);
      return;
    }
    
    setProcessingInfo(['📅 Rescheduling quote...', '✉️ Notifying client...']);
    
    try {
      const response = await fetch(`${API_URL}/quotes/${draggingQuote.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          event_date: targetDate,
          event_time: draggingQuote.event_time,
          is_reschedule: true,
          admin_note: `Rescheduled from ${formatDate(draggingQuote.event_date)} to ${formatDate(targetDate)}`
        })
      });

      if (response.ok) {
        setSuccessMessage(`✅ Quote #${draggingQuote.id} rescheduled to ${formatDate(targetDate)}`);
        fetchQuotes();
        setTimeout(() => {
          setSuccessMessage('');
          setProcessingInfo([]);
        }, 3000);
      } else {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to reschedule');
      }
    } catch (err) {
      setError('Failed to reschedule quote');
      setProcessingInfo([]);
    } finally {
      setDraggingQuote(null);
      setDragOverDate(null);
    }
  };

  const handleTimeSlotClick = (date, hour) => {
    navigate('/admin/quotes/new', { 
      state: { 
        prefillDate: date,
        prefillTime: `${hour.toString().padStart(2, '0')}:00`
      }
    });
  };

  // ============================================================================
  // CALENDAR VIEW RENDERERS
  // ============================================================================

  const renderMonthView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      if (showWeekends || (date.getDay() !== 0 && date.getDay() !== 6)) {
        days.push({
          date: date.toISOString().split('T')[0],
          isCurrentMonth: false,
          isToday: false,
          quotes: []
        });
      }
    }
    
    // Current month days
    const today = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const quotesForDay = calendarQuotes[dateStr] || [];
      
      if (showWeekends || (date.getDay() !== 0 && date.getDay() !== 6)) {
        days.push({
          date: dateStr,
          isCurrentMonth: true,
          isToday: dateStr === today,
          quotes: quotesForDay,
          hasConflicts: quotesForDay.some(q => q.has_conflict),
          isOvercrowded: quotesForDay.length > 3,
          dayOfWeek: date.getDay()
        });
      }
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      if (showWeekends || (date.getDay() !== 0 && date.getDay() !== 6)) {
        days.push({
          date: date.toISOString().split('T')[0],
          isCurrentMonth: false,
          isToday: false,
          quotes: []
        });
      }
    }
    
    return (
      <div className="overflow-x-auto -mx-3 sm:mx-0 pb-2 sm:pb-0">
        <div className="min-w-[700px] sm:min-w-0 px-3 sm:px-0">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, index) => renderDayCell(day, index))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayCell = (day, index) => {
    const isExpanded = expandedDay === day.date;
    const isDragOver = dragOverDate === day.date;
    const isSelected = selectedDate === day.date;
    
    return (
      <div
        key={index}
        onDrop={(e) => handleDrop(e, day.date)}
        onDragOver={(e) => handleDragOver(e, day.date)}
        onDragLeave={handleDragLeave}
        onClick={() => setSelectedDate(day.date)}
        className={`
          min-h-24 sm:min-h-32 rounded-lg border p-1 sm:p-2 
          overflow-hidden transition-all cursor-pointer group
          ${day.isCurrentMonth
            ? day.isToday
              ? isDarkMode 
                ? 'bg-gold-900/20 border-gold-500 ring-2 ring-gold-500' 
                : 'bg-gold-50 border-gold-300 ring-2 ring-gold-300'
              : isDarkMode 
                ? 'bg-stone-800/50 border-stone-700 hover:border-stone-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            : isDarkMode 
              ? 'bg-stone-900/30 border-stone-800 text-stone-600' 
              : 'bg-gray-50 border-gray-100 text-gray-400'
          }
          ${day.hasConflicts ? 'border-l-4 border-l-red-500' : ''}
          ${day.isOvercrowded ? 'border-r-4 border-r-orange-500' : ''}
          ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
          ${isSelected ? 'ring-2 ring-gold-400' : ''}
          ${isExpanded ? 'col-span-2 row-span-2 z-10' : ''}
        `}
      >
        {/* Day Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <span className={`text-xs sm:text-sm font-medium ${
              day.isToday 
                ? 'text-gold-500 font-bold' 
                : day.isCurrentMonth 
                  ? isDarkMode ? 'text-white' : 'text-stone-900' 
                  : isDarkMode ? 'text-stone-600' : 'text-gray-400'
            }`}>
              {new Date(day.date).getDate()}
            </span>
            {day.isToday && (
              <span className="text-[8px] sm:text-xs px-1 py-0.5 bg-gold-500 text-white rounded">
                Today
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Quote Count Badge */}
            {day.quotes.length > 0 && (
              <span className={`text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                isDarkMode 
                  ? 'bg-gold-500/20 text-gold-400' 
                  : 'bg-gold-100 text-gold-700'
              }`}>
                {day.quotes.length}
              </span>
            )}
            
            {/* Conflict Indicator */}
            {day.hasConflicts && (
              <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 text-red-500" />
            )}
            
            {/* Expand/Collapse Button */}
            {day.quotes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedDay(isExpanded ? null : day.date);
                }}
                className={`p-0.5 rounded hover:bg-stone-700 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                {isExpanded ? (
                  <Minimize2 className="w-2 h-2 sm:w-3 sm:h-3" />
                ) : (
                  <Maximize2 className="w-2 h-2 sm:w-3 sm:h-3" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Quote List */}
        <div className="space-y-1 overflow-y-auto max-h-20 sm:max-h-24">
          {(isExpanded ? day.quotes : day.quotes.slice(0, 3)).map((quote) => (
            <div
              key={quote.id}
              draggable
              onDragStart={(e) => handleDragStart(e, quote)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/quotes/${quote.id}`);
              }}
              className={`
                text-[8px] sm:text-xs p-1 sm:p-1.5 rounded cursor-move group
                transition-all hover:scale-105 hover:shadow-md
                ${quote.status === 'PENDING'
                  ? isDarkMode 
                    ? 'bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : quote.status === 'SENT'
                    ? isDarkMode 
                      ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : quote.status === 'ACCEPTED'
                      ? isDarkMode 
                        ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isDarkMode 
                        ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }
                ${quote.has_conflict ? 'border-l-2 border-l-red-500' : ''}
              `}
            >
              <div className="flex justify-between items-start gap-1">
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    {quote.client_name}
                  </div>
                  <div className="text-[7px] sm:text-[10px] opacity-75 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {quote.event_time ? formatTime(quote.event_time) : 'No time'}
                  </div>
                  {quote.assigned_to && (
                    <div className="text-[7px] sm:text-[10px] opacity-75 flex items-center gap-1 mt-0.5">
                      {/* Avatar in calendar */}
                      {(() => {
                        const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                        if (assignedUser?.avatar_url) {
                          return (
                            <img
                              src={assignedUser.avatar_url}
                              alt={assignedUser.full_name}
                              className="w-3 h-3 rounded-full object-cover border border-gold-500/30"
                            />
                          );
                        }
                        return (
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                            isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                          }`}>
                            {assignedUser?.full_name?.charAt(0) || '?'}
                          </div>
                        );
                      })()}
                      <span className="truncate">{getAssignedUserName(quote.assigned_to)}</span>
                    </div>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(quote.id, 'ACCEPTED');
                    }}
                    className={`p-0.5 rounded ${
                      isDarkMode ? 'hover:bg-green-900/50' : 'hover:bg-green-100'
                    }`}
                    title="Accept"
                  >
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(quote.id, 'REJECTED');
                    }}
                    className={`p-0.5 rounded ${
                      isDarkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
                    }`}
                    title="Reject"
                  >
                    <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {!isExpanded && day.quotes.length > 3 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedDay(day.date);
              }}
              className={`text-[8px] sm:text-xs text-center w-full py-1 rounded ${
                isDarkMode 
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800' 
                  : 'text-gray-500 hover:text-stone-900 hover:bg-gray-100'
              }`}
            >
              +{day.quotes.length - 3} more
            </button>
          )}
        </div>
        
        {/* Add Quote Button (on hover) */}
        {day.isCurrentMonth && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/admin/quotes/new', {
                state: { prefillDate: day.date }
              });
            }}
            className={`
              absolute bottom-1 right-1 p-1 rounded-full
              opacity-0 group-hover:opacity-100 transition-opacity
              ${isDarkMode 
                ? 'bg-gold-600 hover:bg-gold-700 text-white' 
                : 'bg-gold-500 hover:bg-gold-600 text-white'
              }
            `}
            title="Add quote for this date"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // ============================================================================
  // SIMPLIFIED CALENDAR CONTROLS
  // ============================================================================

  const renderCalendarControls = () => (
    <div className={`rounded-xl ${isDarkMode ? 'bg-stone-900' : 'bg-white'} p-4 sm:p-6 overflow-hidden border ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
      {/* Header with Title and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <h2 className={`text-xl sm:text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-stone-900'
          }`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${
            isDarkMode ? 'text-stone-300' : 'text-stone-600'
          }`}>
            {Object.keys(calendarQuotes).length} days with bookings • {Object.values(calendarQuotes).flat().length} total quotes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={calendarStatusFilter}
            onChange={(e) => setCalendarStatusFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-white' 
                : 'bg-white border-gray-300 text-stone-900'
            }`}
          >
            <option value="all">All Status</option>
            {quoteStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.name}
              </option>
            ))}
          </select>
          
          {/* User Filter */}
          <select
            value={calendarUserFilter}
            onChange={(e) => setCalendarUserFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-white' 
                : 'bg-white border-gray-300 text-stone-900'
            }`}
            disabled={isLoadingUsers}
          >
            <option value="all">All Users</option>
            <option value="unassigned">Unassigned</option>
            {isLoadingUsers ? (
              <option disabled>Loading users...</option>
            ) : (
              availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))
            )}
          </select>
          
          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800 hover:bg-stone-700' 
                  : 'bg-stone-100 hover:bg-stone-200'
              }`}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm ${
                isDarkMode 
                  ? 'bg-stone-800 hover:bg-stone-700' 
                  : 'bg-stone-100 hover:bg-stone-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800 hover:bg-stone-700' 
                  : 'bg-stone-100 hover:bg-stone-200'
              }`}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className={`flex flex-wrap gap-4 mb-4 p-3 rounded-lg ${
        isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
            Accepted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
            Pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
            Sent
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-4 border-l-red-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
            Conflict
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
            Overcrowded
          </span>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          .filter((_, index) => showWeekends || (index !== 0 && index !== 6))
          .map((day) => (
            <div 
              key={day} 
              className={`text-center font-semibold py-2 text-xs sm:text-sm ${
                isDarkMode ? 'text-stone-300' : 'text-stone-600'
              }`}
            >
              {day}
            </div>
          ))}
      </div>
      
      {/* Calendar View */}
      {renderMonthView()}
      
      {/* Quick Stats */}
      <div className={`mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${
        isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'
      }`}>
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Total Bookings
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {Object.values(calendarQuotes).flat().length}
          </div>
        </div>
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Conflicts
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {Object.values(calendarQuotes).flat().filter(q => q.has_conflict).length}
          </div>
        </div>
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Overcrowded Days
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {Object.keys(calendarQuotes).filter(date => calendarQuotes[date].length > 3).length}
          </div>
        </div>
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Acceptance Rate
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            {(() => {
              const allQuotes = Object.values(calendarQuotes).flat();
              const accepted = allQuotes.filter(q => q.status === 'ACCEPTED').length;
              return allQuotes.length > 0 
                ? `${Math.round((accepted / allQuotes.length) * 100)}%`
                : '0%';
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // QUICK STATUS UPDATE HANDLERS WITH EMAIL PROCESSING FEEDBACK
  // ============================================================================

  const handleQuickStatusUpdate = async (quoteId, newStatus) => {
    if (!authUser) return;
    
    setIsLoading(true);
    setProcessingInfo([
      '🔄 Updating quote status...',
      '📧 Preparing email notification...',
      '⏳ This may take 2-3 seconds...'
    ]);
    
    try {
      const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: newStatus,
          ...(newStatus === 'CANCELLED' && { 
            cancellation_reason: 'Status updated by admin' 
          })
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.processing_info) {
          const messages = [
            '✅ Status update complete!',
            data.processing_info.email_status || 'Email notifications being sent'
          ];
          
          if (data.processing_info.client_email) {
            messages.push(`📧 Client: ${data.processing_info.client_email}`);
          }
          if (data.processing_info.admin_email) {
            messages.push(`📧 Admin: ${data.processing_info.admin_email}`);
          }
          
          messages.push(`⏱️ Processing time: ${data.processing_info.estimated_time || '2-3 seconds'}`);
          
          setProcessingInfo(messages);
          
          setTimeout(() => {
            setProcessingInfo([
              '✅ All updates processed!',
              '📧 Email notifications sent successfully',
              '🔄 Refreshing quotes list...'
            ]);
          }, 3000);
        }
        
        setSuccessMessage(`✅ Quote status updated to ${newStatus}`);
        fetchQuotes();
        
        setTimeout(() => {
          setSuccessMessage('');
          setProcessingInfo([]);
        }, 5000);
      } else {
        if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update status');
        setProcessingInfo([]);
      }
    } catch (err) {
      setError('Failed to update quote status');
      setProcessingInfo([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // BULK ACTIONS HANDLERS WITH EMAIL PROCESSING FEEDBACK
  // ============================================================================

  const handleBulkAction = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    setProcessingInfo(['🔄 Preparing bulk action...', '📧 Gathering email recipients...']);
    
    try {
      setProcessingInfo(['📋 Getting preview of affected quotes...']);
      
      const previewResponse = await fetch(`${API_URL}/quotes/bulk-action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: bulkAction,
          quote_ids: selectedQuotes,
          confirmed: false
        })
      });
      
      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        
        setProcessingInfo([
          `📋 Preview: ${previewData.affected_quotes_count} quotes will be affected`,
          '📧 Email notifications will be sent to all clients',
          '⏳ Processing may take several seconds...'
        ]);
        
        setProcessingInfo(['🔄 Executing bulk action...', '📧 Sending email notifications...']);
        
        const executePayload = {
          action: bulkAction,
          quote_ids: selectedQuotes,
          confirmed: true
        };
        
        if (bulkAction === 'DELETE') {
          executePayload.cancellation_reason = bulkCancellationReason || 'Bulk cancellation by admin';
        } else if (bulkAction === 'UPDATE_STATUS') {
          executePayload.new_status = bulkNewStatus;
          if (bulkNewStatus === 'CANCELLED') {
            executePayload.cancellation_reason = bulkCancellationReason || 'Bulk status update by admin';
          }
        }

        const executeResponse = await fetch(`${API_URL}/quotes/bulk-action`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(executePayload)
        });
        
        if (executeResponse.ok) {
          const data = await executeResponse.json();
          setSuccessMessage(data.message || `✅ Successfully performed bulk ${bulkAction.toLowerCase()}`);
          
          setProcessingInfo([
            `✅ Bulk ${bulkAction.toLowerCase()} complete!`,
            `📧 Sent ${data.emails_sent || 0} email notifications`,
            `⏱️ Processing time: ${data.processing_info?.estimated_time || '2-3 seconds'}`,
            '🔄 Refreshing quotes list...'
          ]);
          
          setSelectedQuotes([]);
          setShowBulkModal(false);
          setBulkAction('');
          setBulkCancellationReason('');
          setBulkNewStatus('');
          setIsAllSelected(false);
          
          fetchQuotes();
          
          setTimeout(() => {
            setSuccessMessage('');
            setProcessingInfo([]);
          }, 5000);
        } else if (executeResponse.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
      } else if (previewResponse.status === 401) {
        await logout();
        navigate('/admin/login');
        return;
      }
    } catch (err) {
      setError(err.message);
      setProcessingInfo([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // ALERT HANDLERS WITH EMAIL PROCESSING FEEDBACK
  // ============================================================================

  const handleAlertActionClick = (alert) => {
    setSelectedAlert(alert);
    setShowAlertActionModal(true);
  };

  const handleAlertActionConfirm = async () => {
    if (!authUser) return;
    
    setAlertActionProgress('🔄 Processing cleanup action...');
    
    try {
      if (selectedAlert.type === 'OVERCROWDED_DAY') {
        setAlertActionProgress([
          '🔄 Processing overcrowded day cleanup...',
          '📧 Preparing cancellation emails...',
          '⏳ This may take a few seconds...'
        ]);
        
        const response = await fetch(
          `${API_URL}/quotes/cleanup?type=overcrowded_day&date=${selectedAlert.date}`, 
          { 
            method: 'DELETE',
            headers: getAuthHeaders()
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuccessMessage(`✅ Cleaned up ${data.deleted_count} excess quotes from ${selectedAlert.date}`);
          setShowAlertActionModal(false);
          setSelectedAlert(null);
          
          setProcessingInfo([
            '✅ Cleanup complete!',
            `📧 Sent ${data.deleted_count} cancellation emails`,
            `⏱️ Processing time: ${data.deleted_count * 1}s`,
            '🔄 Refreshing quotes list...'
          ]);
          
          fetchQuotes();
          
          setTimeout(() => {
            setProcessingInfo([]);
          }, 5000);
        } else if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        
      } else if (selectedAlert.type === 'OLD_QUOTES') {
        setAlertActionProgress([
          '🔄 Processing old quotes cleanup...',
          '📧 Preparing cancellation emails...',
          '⏳ This may take a few seconds...'
        ]);
        
        const response = await fetch(`${API_URL}/quotes/cleanup?type=old_quotes`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSuccessMessage(`✅ Cleaned up ${data.deleted_count} old quotes`);
          setShowAlertActionModal(false);
          setSelectedAlert(null);
          
          setProcessingInfo([
            '✅ Cleanup complete!',
            `📧 Sent ${data.deleted_count} cancellation emails`,
            `⏱️ Processing time: ${data.deleted_count * 1}s`,
            '🔄 Refreshing quotes list...'
          ]);
          
          fetchQuotes();
          
          setTimeout(() => {
            setProcessingInfo([]);
          }, 5000);
        } else if (response.status === 401) {
          await logout();
          navigate('/admin/login');
          return;
        }
        
      } else if (selectedAlert.type === 'TIME_CONFLICT' && selectedAlert.quote_id) {
        navigate(`/admin/quotes/${selectedAlert.quote_id}`);
        setShowAlertActionModal(false);
        setSelectedAlert(null);
      }
      
    } catch (err) {
      setError('Failed to perform cleanup action: ' + err.message);
      setAlertActionProgress('');
    }
  };

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
    setSelectedQuotes([]);
    setIsAllSelected(false);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: '',
      has_conflicts: '',
      assigned_to: '',  // Clear assignment filter too
      page: 1,
      per_page: 20
    });
    setSearchInput('');
    setDateFromInput('');
    setDateToInput('');
    setSelectedQuotes([]);
    setIsAllSelected(false);
    setShowFilters(false);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    if (dateTimeout) {
      clearTimeout(dateTimeout);
      setDateTimeout(null);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    setSelectedQuotes([]);
    setIsAllSelected(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // BULK SELECTION HANDLERS
  // ============================================================================

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedQuotes([]);
      setIsAllSelected(false);
    } else {
      setSelectedQuotes(filteredQuotes.map((q) => q.id));
      setIsAllSelected(true);
    }
  };

  const toggleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => {
      if (prev.includes(quoteId)) {
        const newSelection = prev.filter(id => id !== quoteId);
        setIsAllSelected(false);
        return newSelection;
      } else {
        const newSelection = [...prev, quoteId];
        setIsAllSelected(newSelection.length === filteredQuotes.length);
        return newSelection;
      }
    });
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    return timeString;
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

  const getStatusDisplayName = (statusValue) => {
    const status = quoteStatuses.find((s) => s.value === statusValue);
    return status ? status.name : statusValue;
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading && quotes.length === 0 && !isStatusLoading) {
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
  if (!authUser) {
    return null; // Will redirect via useEffect
  }

  // ============================================================================
  // RENDER MODALS
  // ============================================================================

  const renderBulkActionModal = () => {
    if (!showBulkModal) return null;
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} max-h-[90vh] overflow-y-auto`}>
          <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-base sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Bulk Actions ({selectedQuotes.length} quotes)
              </h2>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                  setBulkCancellationReason('');
                  setBulkNewStatus('');
                }}
                className={`p-2 ${isDarkMode ? 'text-stone-300 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                  Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                >
                  <option value="">Select Action</option>
                  <option value="UPDATE_STATUS">Update Status</option>
                  <option value="DELETE">Delete Quotes</option>
                </select>
              </div>
              
              {bulkAction === 'UPDATE_STATUS' && (
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                    New Status
                  </label>
                  <select
                    value={bulkNewStatus}
                    onChange={(e) => setBulkNewStatus(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="">Select Status</option>
                    {quoteStatuses
                      .filter((status) => status.value !== 'PENDING')
                      .map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              {(bulkAction === 'DELETE' || bulkNewStatus === 'CANCELLED') && (
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                    Cancellation Reason (optional)
                  </label>
                  <textarea
                    value={bulkCancellationReason}
                    onChange={(e) => setBulkCancellationReason(e.target.value)}
                    rows={3}
                    placeholder="This will be included in the cancellation email to clients..."
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>
              )}
              
              {bulkAction === 'DELETE' && (
                <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                      <strong>Warning:</strong> This will permanently delete {selectedQuotes.length} quote(s) and send cancellation emails. This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col xs:flex-row justify-end gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                  setBulkCancellationReason('');
                  setBulkNewStatus('');
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 border text-xs sm:text-sm ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg font-medium transition-all flex-1 xs:flex-none`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction === 'UPDATE_STATUS' && !bulkNewStatus) || isLoading}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gold-500 hover:bg-gold-600 text-stone-900 text-xs sm:text-sm rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-1 xs:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply Action
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlertActionModal = () => {
    if (!showAlertActionModal || !selectedAlert) return null;
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} max-h-[90vh] overflow-y-auto`}>
          <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} flex-shrink-0`}>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Confirm Alert Action
                </h3>
                <p className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} break-words`}>
                  {selectedAlert.type === 'OVERCROWDED_DAY' 
                    ? `Clean up ${selectedAlert.excess_count} excess quotes from ${selectedAlert.date}?`
                    : selectedAlert.type === 'OLD_QUOTES'
                    ? `Delete ${selectedAlert.quote_count} old quotes (30+ days pending/rejected)?`
                    : `View conflicting quote #${selectedAlert.quote_id}?`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {alertActionProgress && (
            <div className={`px-4 sm:px-6 pt-4`}>
              <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-900/30' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  {Array.isArray(alertActionProgress) 
                    ? alertActionProgress.map((msg, idx) => <div key={idx}>{msg}</div>)
                    : alertActionProgress
                  }
                </p>
              </div>
            </div>
          )}
          
          {(selectedAlert.type === 'OVERCROWDED_DAY' || selectedAlert.type === 'OLD_QUOTES') && (
            <div className={`px-4 sm:px-6 pt-4`}>
              <div className={`${isDarkMode ? 'bg-yellow-900/10 border-yellow-900/30' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3`}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    <strong>Note:</strong> Cancellation emails will be sent to affected clients. The quotes will be marked as cancelled and retained in the system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6 flex flex-col xs:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={() => {
                setShowAlertActionModal(false);
                setSelectedAlert(null);
                setAlertActionProgress('');
              }}
              disabled={!!alertActionProgress}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 border text-xs sm:text-sm ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg font-medium transition-all disabled:opacity-50 flex-1 xs:flex-none`}
            >
              Cancel
            </button>
            <button
              onClick={handleAlertActionConfirm}
              disabled={!!alertActionProgress}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 xs:flex-none"
            >
              {alertActionProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>{selectedAlert.type === 'TIME_CONFLICT' ? 'View Quote' : 'Confirm Action'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar 
        user={authUser} // ✅ Use authUser from context
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <main className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 pt-20 lg:pt-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Quote Management
                </h1>
                <p className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                  Manage all client quote requests, schedules, and conflicts
                </p>
              </div>
              
              {activeTab === 'list' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                    title="Grid View"
                  >
                    <GridIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Processing Info */}
          {processingInfo.length > 0 && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {processingInfo.map((info, idx) => (
                    <p key={idx} className={`text-xs sm:text-sm mb-1 last:mb-0 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      {info}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${
              isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'
            }`}>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <p className={`text-xs sm:text-sm flex-1 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                {successMessage}
              </p>
              <button onClick={() => setSuccessMessage('')} className={isDarkMode ? 'text-green-300' : 'text-green-800'}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
              <p className={`text-xs sm:text-sm flex-1 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
              <button 
                onClick={() => setError('')}
                className={`ml-auto ${isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-800 hover:text-red-900'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Summary Statistics - Fixed Responsive Grid */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gold-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Total
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.total_quotes || 0}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Pending
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.pending_count || 0}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Sent
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.sent_count || 0}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Accepted
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.accepted_count || 0}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Conflicts
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.time_conflicts_count || 0}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                    Actions
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {summary.action_required_count || 0}
                </p>
              </div>
            </div>
          )}

          {/* Tabs Navigation - Updated with better responsive labels */}
          <div className={`flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 ${
                activeTab === 'list'
                  ? isDarkMode
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-gold-600 border-b-2 border-gold-600'
                  : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ListIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">List View</span>
              <span className="sm:hidden">List</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 ${
                activeTab === 'calendar'
                  ? isDarkMode
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-gold-600 border-b-2 border-gold-600'
                  : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarView className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </button>
            
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2 relative ${
                activeTab === 'alerts'
                  ? isDarkMode
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-gold-600 border-b-2 border-gold-600'
                  : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="sm:hidden">Alerts</span>
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>

          {/* ================================================================ */}
          {/* CONTENT BASED ON ACTIVE TAB */}
          {/* ================================================================ */}
          
          {/* LIST VIEW */}
          {activeTab === 'list' && (
            <>
              {/* Improved Responsive Filters Bar */}
              <div className={`rounded-xl shadow-sm border p-4 md:p-6 mb-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                {/* Top Row: Search + Filter Toggle */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between mb-4">
                  {/* Search Input - Full width on mobile, flex on desktop */}
                  <div className="w-full md:flex-1 md:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className={`w-full pl-10 pr-3 md:pl-12 md:pr-4 py-3 rounded-lg border text-sm ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900 placeholder-stone-400'} focus:ring-2 focus:ring-gold-500`}
                      />
                    </div>
                  </div>

                  {/* Right Side: Filter Toggle + Bulk Actions */}
                  <div className="w-full md:w-auto flex flex-col xs:flex-row gap-3">
                    {/* Filter Toggle Button for Mobile */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`md:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700' 
                          : 'bg-white border-gray-300 text-stone-700 hover:bg-gray-50'
                      }`}
                    >
                      <FilterIcon className="h-4 w-4" />
                      Filters
                      {(filters.status || filters.date_from || filters.date_to || filters.has_conflicts || filters.assigned_to) && (
                        <span className="ml-1 px-2 py-0.5 text-xs bg-gold-500 text-stone-900 rounded-full">
                          {[
                            filters.status,
                            filters.date_from,
                            filters.date_to,
                            filters.has_conflicts,
                            filters.assigned_to
                          ].filter(Boolean).length}
                        </span>
                      )}
                    </button>

                    {/* Bulk Actions Button */}
                    {selectedQuotes.length > 0 && (
                      <button
                        onClick={() => {
                          setBulkAction('UPDATE_STATUS');
                          setShowBulkModal(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors text-sm w-full xs:w-auto"
                      >
                        <SendIcon className="h-4 w-4 md:h-5 md:w-5" />
                        <span>Bulk Actions ({selectedQuotes.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters Section - Collapsible on mobile */}
                <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                  <div className="flex flex-col xs:flex-row flex-wrap gap-3">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className={`px-4 py-3 rounded-lg border text-sm flex-1 min-w-[180px] ${
                        isDarkMode 
                          ? 'bg-stone-800 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                      } focus:ring-2 focus:ring-gold-500`}
                      disabled={isStatusLoading}
                    >
                      <option value="">All Status</option>
                      {quoteStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-col xs:flex-row gap-3 flex-1 min-w-[180px]">
                      <input
                        type="date"
                        value={dateFromInput}
                        onChange={(e) => handleDateFilterChange('date_from', e.target.value)}
                        placeholder="From date"
                        className={`px-4 py-3 rounded-lg border text-sm flex-1 ${
                          isDarkMode 
                            ? 'bg-stone-800 border-stone-700 text-white' 
                            : 'bg-white border-gray-300 text-stone-900'
                        } focus:ring-2 focus:ring-gold-500`}
                      />
                      <input
                        type="date"
                        value={dateToInput}
                        onChange={(e) => handleDateFilterChange('date_to', e.target.value)}
                        placeholder="To date"
                        className={`px-4 py-3 rounded-lg border text-sm flex-1 ${
                          isDarkMode 
                            ? 'bg-stone-800 border-stone-700 text-white' 
                            : 'bg-white border-gray-300 text-stone-900'
                        } focus:ring-2 focus:ring-gold-500`}
                      />
                    </div>

                    {/* Assignment Filter */}
                    <select
                      value={filters.assigned_to}
                      onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                      className={`px-4 py-3 rounded-lg border text-sm flex-1 min-w-[180px] ${
                        isDarkMode 
                          ? 'bg-stone-800 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                      } focus:ring-2 focus:ring-gold-500`}
                      disabled={isLoadingUsers}
                    >
                      <option value="">All Users</option>
                      <option value="unassigned">Unassigned</option>
                      {isLoadingUsers ? (
                        <option disabled>Loading users...</option>
                      ) : (
                        availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))
                      )}
                    </select>

                    {/* Conflicts Only Checkbox */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700' 
                        : 'bg-white border-gray-300'
                    } min-w-[180px]`}>
                      <input
                        type="checkbox"
                        id="conflicts-filter"
                        checked={filters.has_conflicts === 'true'}
                        onChange={(e) => handleFilterChange('has_conflicts', e.target.checked ? 'true' : '')}
                        className={`rounded text-gold-500 focus:ring-gold-500 h-4 w-4 ${
                          isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'
                        }`}
                      />
                      <label 
                        htmlFor="conflicts-filter"
                        className={`text-sm font-medium cursor-pointer flex-1 ${
                          isDarkMode ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        Conflicts Only
                      </label>
                    </div>

                    {/* Clear Filters Button when filters are active */}
                    {(filters.status || filters.date_from || filters.date_to || filters.has_conflicts || filters.assigned_to || filters.search) && (
                      <button
                        onClick={clearFilters}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium ${
                          isDarkMode 
                            ? 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700' 
                            : 'bg-white border-gray-300 text-stone-900 hover:bg-gray-50'
                        } min-w-[120px]`}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filters Display */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.assigned_to && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                      isDarkMode ? 'bg-stone-800 text-white' : 'bg-gray-200 text-stone-900'
                    }`}>
                      <Users className="w-3 h-3" />
                      {filters.assigned_to === 'unassigned' ? (
                        'Unassigned Quotes'
                      ) : (
                        `Assigned to: ${getAssignedUserName(parseInt(filters.assigned_to))}`
                      )}
                      <button
                        onClick={() => handleFilterChange('assigned_to', '')}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {/* Results Count & Pagination */}
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'} flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4`}>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Showing {filteredQuotes.length} of {totalQuotes} quotes
                    </p>
                    
                    {filteredQuotes.length > 0 && (
                      <button
                        onClick={toggleSelectAll}
                        className={`text-sm px-3 py-1.5 rounded border ${
                          isAllSelected 
                            ? (isDarkMode ? 'bg-gold-500 border-gold-500 text-stone-900' : 'bg-gold-500 border-gold-500 text-white') 
                            : (isDarkMode ? 'border-stone-700 text-white hover:bg-stone-800' : 'border-gray-300 text-stone-900 hover:bg-gray-50')
                        }`}
                      >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 text-white disabled:opacity-30' : 'bg-stone-100 text-stone-900 disabled:opacity-30'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 text-white disabled:opacity-30' : 'bg-stone-100 text-stone-900 disabled:opacity-30'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {filteredQuotes.length === 0 ? (
                <div className={`rounded-xl shadow-sm border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                  <FileText className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    No quotes found
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {filters.status || filters.search || filters.date_from || filters.has_conflicts || filters.assigned_to
                      ? 'Try adjusting your filters or search terms'
                      : 'No quotes have been created yet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View (show on screens < md) */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {filteredQuotes.map((quote) => (
                      <div 
                        key={quote.id}
                        className={`rounded-xl border p-3 sm:p-4 ${
                          isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input 
                              type="checkbox"
                              checked={selectedQuotes.includes(quote.id)}
                              onChange={() => toggleSelectQuote(quote.id)}
                              className={`flex-shrink-0 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                {quote.client_name}
                              </h3>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                Quote #{quote.id}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(quote.status)}`}>
                            {getStatusDisplayName(quote.status)}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>Date</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{formatDate(quote.event_date)}</p>
                          </div>
                          <div>
                            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>Time</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quote.event_time ? formatTime(quote.event_time) : 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>Amount</p>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{quote.quoted_amount ? `$${parseFloat(quote.quoted_amount).toFixed(2)}` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>Assigned</p>
                            <div className="flex items-center gap-1">
                              {quote.assigned_to ? (
                                <>
                                  {/* Avatar */}
                                  {(() => {
                                    const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                                    if (assignedUser?.avatar_url) {
                                      return (
                                        <img
                                          src={assignedUser.avatar_url}
                                          alt={assignedUser.full_name}
                                          className="w-5 h-5 rounded-full object-cover border border-gold-500/30"
                                        />
                                      );
                                    }
                                    return (
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                                      }`}>
                                        {assignedUser?.full_name?.charAt(0) || '?'}
                                      </div>
                                    );
                                  })()}
                                  <p className={`font-medium text-xs truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {getAssignedUserName(quote.assigned_to)}
                                  </p>
                                </>
                              ) : (
                                <p className={`font-medium text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                  Unassigned
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                          <button 
                            onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                            className={`flex-1 px-3 py-2 text-xs rounded-lg ${isDarkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-gray-100 text-stone-900 hover:bg-gray-200'}`}
                          >
                            View
                          </button>
                          {quote.status === 'PENDING' && (
                            <button 
                              onClick={() => handleQuickStatusUpdate(quote.id, 'SENT')}
                              disabled={isLoading}
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                              Send
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop/Tablet Table View (show on screens >= md) */}
                  {viewMode === 'list' ? (
                    <div className="hidden md:block overflow-x-auto">
                      <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'} border ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                        <thead className={`${isDarkMode ? 'bg-stone-800 text-white' : 'bg-gray-50 text-stone-700'}`}>
                          <tr>
                            <th className="w-12 px-3 lg:px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                              />
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Assigned To
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Services
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                          {filteredQuotes.map((quote) => (
                            <tr key={quote.id} className={`${isDarkMode ? 'hover:bg-stone-800/50' : 'hover:bg-gray-50'} ${selectedQuotes.includes(quote.id) ? (isDarkMode ? 'bg-stone-800' : 'bg-blue-50') : ''}`}>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedQuotes.includes(quote.id)}
                                  onChange={() => toggleSelectQuote(quote.id)}
                                  className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                                />
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className="text-xs sm:text-sm">
                                  <div className={`font-medium truncate max-w-[150px] lg:max-w-none ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {quote.client_name}
                                  </div>
                                  <div className={`truncate max-w-[150px] lg:max-w-none ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                    {quote.client_email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                  {quote.event_date ? formatDate(quote.event_date) : 'Not set'}
                                </div>
                                {quote.event_time && (
                                  <div className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                    <Clock className="inline w-3 h-3 mr-1" />
                                    {quote.event_time}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                                  {getStatusDisplayName(quote.status)}
                                </span>
                                {quote.has_conflict && quote.status !== 'CANCELLED' && (
                                  <span className={`inline-block ml-2 px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                                    Conflict
                                  </span>
                                )}
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className="text-xs sm:text-sm">
                                  {quote.assigned_to ? (
                                    <div className="flex items-center gap-2">
                                      {/* Avatar Display */}
                                      {(() => {
                                        const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                                        if (assignedUser?.avatar_url) {
                                          return (
                                            <img
                                              src={assignedUser.avatar_url}
                                              alt={assignedUser.full_name}
                                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gold-500/30"
                                            />
                                          );
                                        }
                                        return (
                                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                            isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                                          }`}>
                                            {assignedUser?.full_name?.charAt(0) || '?'}
                                          </div>
                                        );
                                      })()}
                                      <span className={`truncate max-w-[100px] sm:max-w-[150px] ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                        {getAssignedUserName(quote.assigned_to)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                      Unassigned
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                  {quote.selected_services?.slice(0, 2).map((s, idx) => (
                                    <span key={idx} className="block">
                                      {typeof s === 'object' ? s.title : s}
                                    </span>
                                  ))}
                                  {quote.selected_services?.length > 2 && (
                                    <span className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                      +{quote.selected_services.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  {quote.quoted_amount ? `$${parseFloat(quote.quoted_amount).toFixed(2)}` : 'Not quoted'}
                                </div>
                              </td>
                              <td className="px-3 lg:px-4 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-300 hover:text-white hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  
                                  {quote.status === 'PENDING' && (
                                    <button
                                      onClick={() => handleQuickStatusUpdate(quote.id, 'SENT')}
                                      disabled={isLoading}
                                      className={`p-2 rounded-lg ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {(quote.status === 'PENDING' || quote.status === 'SENT') && (
                                    <>
                                      <button
                                        onClick={() => handleQuickStatusUpdate(quote.id, 'ACCEPTED')}
                                        disabled={isLoading}
                                        className={`p-2 rounded-lg ${isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      
                                      <button
                                        onClick={() => handleQuickStatusUpdate(quote.id, 'REJECTED')}
                                        disabled={isLoading}
                                        className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Grid View */
                    <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {filteredQuotes.map((quote) => (
                        <div key={quote.id} className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedQuotes.includes(quote.id)}
                                onChange={() => toggleSelectQuote(quote.id)}
                                className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                              />
                              <div>
                                <div className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  Quote #{quote.id}
                                </div>
                                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                  {quote.client_name}
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                              {getStatusDisplayName(quote.status)}
                            </span>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-stone-500" />
                              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                {quote.client_email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-stone-500" />
                              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                {quote.client_phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-stone-500" />
                              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                {quote.event_date ? formatDate(quote.event_date) : 'Not scheduled'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-stone-500" />
                              {quote.assigned_to ? (
                                <div className="flex items-center gap-2">
                                  {/* Avatar */}
                                  {(() => {
                                    const assignedUser = availableUsers.find(u => u.id === quote.assigned_to);
                                    if (assignedUser?.avatar_url) {
                                      return (
                                        <img
                                          src={assignedUser.avatar_url}
                                          alt={assignedUser.full_name}
                                          className="w-5 h-5 rounded-full object-cover border border-gold-500/30"
                                        />
                                      );
                                    }
                                    return (
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                                      }`}>
                                        {assignedUser?.full_name?.charAt(0) || '?'}
                                      </div>
                                    );
                                  })()}
                                  <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {getAssignedUserName(quote.assigned_to)}
                                  </span>
                                </div>
                              ) : (
                                <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-200 dark:border-stone-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                  {quote.selected_services?.length || 0} services
                                </span>
                                {quote.has_conflict && quote.status !== 'CANCELLED' && (
                                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                                    Conflict
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                                  className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-300 hover:text-white hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {quote.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleQuickStatusUpdate(quote.id, 'SENT')}
                                    disabled={isLoading}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            renderCalendarControls()
          )}

          {/* ALERTS VIEW - Enhanced with Email Processing Feedback */}
          {activeTab === 'alerts' && (
            <div>
              {alerts.length === 0 ? (
                <div className={`rounded-xl p-6 sm:p-8 text-center ${isDarkMode ? 'bg-stone-900 border border-stone-800' : 'bg-white border border-gray-200'}`}>
                  <AlertCircle className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    No Alerts
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    Everything looks good! No conflicts or issues detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {alerts.map((alert, idx) => {
                    const severityColors = {
                      HIGH: isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200',
                      MEDIUM: isDarkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
                      LOW: isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'
                    };
                    
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 sm:p-4 ${severityColors[alert.severity] || severityColors.LOW}`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-red-500" />
                          <div className="flex-1">
                            <p className={`font-medium mb-1 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                              {alert.message}
                            </p>
                            {alert.suggested_action && (
                              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                Suggested: {alert.suggested_action}
                              </p>
                            )}
                            
                            {alert.excess_count > 0 && (
                              <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                <strong>{alert.excess_count}</strong> excess quotes will be deleted
                              </p>
                            )}
                            {alert.old_quote_ids && (
                              <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                <strong>{alert.quote_count}</strong> old quotes will be cleaned up
                              </p>
                            )}
                            {alert.conflicting_quote_ids && alert.conflicting_quote_ids.length > 0 && (
                              <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? 'text-white' : 'text-stone-600'}`}>
                                Conflicts with <strong>{alert.conflicting_quote_ids.length}</strong> other quotes
                              </p>
                            )}
                            
                            <div className="flex flex-col xs:flex-row gap-2 mt-3">
                              {alert.type === 'OVERCROWDED_DAY' && (
                                <button
                                  onClick={() => handleAlertActionClick(alert)}
                                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                                    isDarkMode
                                      ? 'bg-red-600 text-white hover:bg-red-700'
                                      : 'bg-red-500 text-white hover:bg-red-600'
                                  }`}
                                >
                                  Clean Up {alert.excess_count} Quotes
                                </button>
                              )}
                              {alert.type === 'OLD_QUOTES' && (
                                <button
                                  onClick={() => handleAlertActionClick(alert)}
                                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                                    isDarkMode
                                      ? 'bg-red-600 text-white hover:bg-red-700'
                                      : 'bg-red-500 text-white hover:bg-red-600'
                                  }`}
                                >
                                  Delete {alert.quote_count} Old Quotes
                                </button>
                              )}
                              {alert.type === 'TIME_CONFLICT' && alert.quote_id && (
                                <button
                                  onClick={() => navigate(`/admin/quotes/${alert.quote_id}`)}
                                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                                    isDarkMode
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                >
                                  View Quote #{alert.quote_id}
                                </button>
                              )}
                            </div>
                          </div>
                          {alert.action_required && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white whitespace-nowrap">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bulk Action Modal */}
      {renderBulkActionModal()}
      
      {/* Alert Action Modal */}
      {renderAlertActionModal()}
    </div>
  );
};

export default AdminQuotes;
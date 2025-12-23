// pages/Admin/AdminBookings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, User, Mail, Phone, MapPin, 
  DollarSign, FileText, Edit2, Trash2, CheckCircle, XCircle, 
  AlertCircle, Loader2, Eye, Check, X, Send, Users, BarChart3,
  ChevronLeft, ChevronRight, Download, RefreshCw, MoreVertical,
  MessageSquare, Archive, CalendarDays, EyeOff, Grid, List, Plus
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Booking {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string | null;
  location: string | null;
  budget_range: string | null;
  additional_notes: string | null;
  status: string;
  assigned_to: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  recent: number;
  upcoming: number;
}

interface BookingStatus {
  name: string;
  value: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const AdminBookings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Get current view from URL
  const currentView = location.pathname.split('/').pop() || 'all';
  const isPendingView = currentView === 'pending';
  const isConfirmedView = currentView === 'confirmed';
  const isCalendarView = currentView === 'calendar';
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(isPendingView ? 'PENDING' : isConfirmedView ? 'CONFIRMED' : 'all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [perPage, setPerPage] = useState(20);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mobile states
  const [showFilters, setShowFilters] = useState(false);
  const [mobileSheet, setMobileSheet] = useState({
    isOpen: false,
    booking: null as Booking | null
  });
  
  // Bulk selection
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssign, setBulkAssign] = useState('');
  
  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bookingId: null as number | null,
    bookingName: ''
  });

  // Service types (extracted from bookings)
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  // Calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarBookings, setCalendarBookings] = useState<{ [date: string]: Booking[] }>({});

  useEffect(() => {
    fetchCurrentUser();
    fetchStatuses();
    fetchStaffUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchBookings();
    if (isCalendarView) {
      prepareCalendarData();
    }
  }, [currentPage, perPage, currentView]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, serviceTypeFilter, assignedFilter, dateFrom, dateTo, currentView]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();
      setCurrentUser(data);
    } catch (err: any) {
      setError(err.message);
      navigate('/admin/login');
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/booking-statuses`);
      if (!response.ok) throw new Error('Failed to fetch statuses');
      const data = await response.json();
      setStatuses(data.statuses || []);
    } catch (err: any) {
      console.error('Failed to fetch statuses:', err);
      // Fallback statuses
      setStatuses([
        { name: 'PENDING', value: 'Pending' },
        { name: 'CONFIRMED', value: 'Confirmed' },
        { name: 'CANCELLED', value: 'Cancelled' },
        { name: 'COMPLETED', value: 'Completed' }
      ]);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch staff users');
      const data = await response.json();
      setStaffUsers(data.users || []);
    } catch (err: any) {
      console.error('Failed to fetch staff users:', err);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(serviceTypeFilter !== 'all' && { service_type: serviceTypeFilter }),
        ...(assignedFilter !== 'all' && { assigned_to: assignedFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      });

      // Override status filter based on current view
      if (isPendingView) {
        params.append('status', 'PENDING');
      } else if (isConfirmedView) {
        params.append('status', 'CONFIRMED');
      } else if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_URL}/admin/bookings?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only admins can access bookings');
        }
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
      setTotalPages(data.pages || 1);
      setTotalBookings(data.total || 0);
      
      // Extract unique service types
      const types = [...new Set((data.bookings || []).map((b: Booking) => b.service_type))];
      setServiceTypes(types as string[]);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/bookings/stats`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.client_phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter.toUpperCase());
    }

    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.service_type === serviceTypeFilter);
    }

    if (assignedFilter !== 'all') {
      filtered = filtered.filter(booking => 
        assignedFilter === 'unassigned' 
          ? !booking.assigned_to 
          : booking.assigned_to?.toString() === assignedFilter
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(booking => booking.preferred_date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(booking => booking.preferred_date <= dateTo);
    }

    setFilteredBookings(filtered);
  };

  const prepareCalendarData = () => {
    const bookingsByDate: { [date: string]: Booking[] } = {};
    
    bookings.forEach(booking => {
      const date = booking.preferred_date;
      if (!bookingsByDate[date]) {
        bookingsByDate[date] = [];
      }
      bookingsByDate[date].push(booking);
    });
    
    setCalendarBookings(bookingsByDate);
  };

  const renderCalendarView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
    }
    
    // Current month days
    const today = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        bookings: calendarBookings[dateStr] || []
      });
    }
    
    // Next month days
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 weeks
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
    }
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className={`rounded-xl ${isDarkMode ? 'bg-stone-900' : 'bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className={`text-center font-semibold py-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 rounded-lg border p-2 ${
                day.isCurrentMonth
                  ? day.isToday
                    ? isDarkMode ? 'bg-gold-900/20 border-gold-500' : 'bg-gold-50 border-gold-200'
                    : isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-gray-200'
                  : isDarkMode ? 'bg-stone-900/30 border-stone-800 text-stone-600' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${
                  day.isToday 
                    ? 'text-gold-500' 
                    : day.isCurrentMonth 
                      ? isDarkMode ? 'text-stone-300' : 'text-stone-700' 
                      : isDarkMode ? 'text-stone-500' : 'text-gray-400'
                }`}>
                  {new Date(day.date).getDate()}
                </span>
                {day.bookings.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-100 text-gold-700'
                  }`}>
                    {day.bookings.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {day.bookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => handleEditClick(booking)}
                    className={`text-xs p-1.5 rounded cursor-pointer truncate ${
                      booking.status === 'PENDING'
                        ? isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'CONFIRMED'
                          ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                          : isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-gray-100 text-gray-800'
                    }`}
                    title={`${booking.client_name} - ${booking.service_type}`}
                  >
                    <div className="font-medium truncate">{booking.client_name}</div>
                    <div className="truncate">{booking.service_type}</div>
                    {booking.preferred_time && (
                      <div className="truncate">{booking.preferred_time}</div>
                    )}
                  </div>
                ))}
                {day.bookings.length > 3 && (
                  <div className={`text-xs text-center ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                    +{day.bookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleEditClick = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowEditModal(true);
  };

  const handleDeleteClick = (bookingId: number, bookingName: string) => {
    setDeleteModal({
      isOpen: true,
      bookingId,
      bookingName
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.bookingId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/bookings/${deleteModal.bookingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      setSuccessMessage('Booking deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setDeleteModal({ isOpen: false, bookingId: null, bookingName: '' });
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!selectedBookings.length || !bulkAction) {
      setError('Please select bookings and an action');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        booking_ids: selectedBookings,
        action: bulkAction
      };

      if (bulkAction === 'update_status' && bulkStatus) {
        payload.status = bulkStatus;
      } else if (bulkAction === 'assign' && bulkAssign) {
        payload.assigned_to = bulkAssign === 'unassign' ? null : bulkAssign;
      }

      const response = await fetch(`${API_URL}/admin/bookings/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bulk action failed');
      }

      setSuccessMessage('Bulk action completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowBulkModal(false);
      setSelectedBookings([]);
      setBulkAction('');
      setBulkStatus('');
      setBulkAssign('');
      
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBooking = async (updatedData: any) => {
    if (!currentBooking) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/bookings/${currentBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      setSuccessMessage('Booking updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowEditModal(false);
      setCurrentBooking(null);
      
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBookingSelection = (bookingId: number) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const selectAllBookings = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      case 'COMPLETED': return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      default: return isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <Check className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string | null) => {
    const date = new Date(dateString);
    let formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (timeString) {
      formatted += ` at ${timeString}`;
    }
    
    return formatted;
  };

  // Mobile sheet handlers
  const openMobileSheet = (booking: Booking) => {
    setMobileSheet({ isOpen: true, booking });
    document.body.style.overflow = 'hidden';
  };

  const closeMobileSheet = () => {
    setMobileSheet({ isOpen: false, booking: null });
    document.body.style.overflow = '';
  };

  const renderDeleteConfirmationModal = () => {
    if (!deleteModal.isOpen) return null;
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-[70] p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} flex-shrink-0`}>
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Delete Booking
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Are you sure you want to delete booking for <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>"{deleteModal.bookingName}"</span>?
                  This action cannot be undone and will remove all associated data.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`px-4 sm:px-6 pt-4`}>
            <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  <strong>Warning:</strong> Deleting this booking will also remove any associated notes, assignment information, and status history.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setDeleteModal({ isOpen: false, bookingId: null, bookingName: '' })}
              disabled={isLoading}
              className={`w-full sm:w-auto px-4 py-2.5 border ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
            >
              Keep Booking
            </button>
            <button
              onClick={confirmDelete}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal || !currentBooking) return null;
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-2xl border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Edit Booking - {currentBooking.client_name}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentBooking(null);
                }}
                className={`p-2 ${isDarkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());
              handleUpdateBooking(data);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={currentBooking.status}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    {statuses.map(status => (
                      <option key={status.name} value={status.name}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Assigned To
                  </label>
                  <select
                    name="assigned_to"
                    defaultValue={currentBooking.assigned_to || ''}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="">Unassigned</option>
                    {staffUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Info */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    defaultValue={currentBooking.client_name}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Client Email
                  </label>
                  <input
                    type="email"
                    name="client_email"
                    defaultValue={currentBooking.client_email}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    defaultValue={currentBooking.preferred_date}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    name="preferred_time"
                    defaultValue={currentBooking.preferred_time || ''}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>

                {/* Internal Notes */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Internal Notes
                  </label>
                  <textarea
                    name="internal_notes"
                    defaultValue={currentBooking.internal_notes || ''}
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentBooking(null);
                  }}
                  className={`px-4 py-2.5 border ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg text-sm font-medium transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-stone-900 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Update Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderBulkActionModal = () => {
    if (!showBulkModal) return null;
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Bulk Actions ({selectedBookings.length} bookings)
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className={`p-2 ${isDarkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                >
                  <option value="">Select Action</option>
                  <option value="update_status">Update Status</option>
                  <option value="assign">Assign to Staff</option>
                  <option value="delete">Delete Bookings</option>
                </select>
              </div>
              
              {bulkAction === 'update_status' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    New Status
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="">Select Status</option>
                    {statuses.map(status => (
                      <option key={status.name} value={status.name}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {bulkAction === 'assign' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Assign To
                  </label>
                  <select
                    value={bulkAssign}
                    onChange={(e) => setBulkAssign(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="">Select Staff</option>
                    <option value="unassign">Unassign All</option>
                    {staffUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {bulkAction === 'delete' && (
                <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                      <strong>Warning:</strong> This will permanently delete {selectedBookings.length} booking(s). This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className={`px-4 py-2.5 border ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg text-sm font-medium transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isSubmitting}
                className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-stone-900 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
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

  const renderMobileBottomSheet = () => {
    if (!mobileSheet.isOpen || !mobileSheet.booking) return null;
    const booking = mobileSheet.booking;
    
    return (
      <>
        <div
          className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300`}
          onClick={closeMobileSheet}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl shadow-2xl md:hidden transition-transform duration-300 ease-out"
          style={{ maxHeight: '85vh' }}
        >
          <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-t-3xl`}>
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} rounded-full`} />
            </div>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                    {booking.client_name}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                    {booking.service_type}
                  </p>
                </div>
                <button
                  onClick={closeMobileSheet}
                  className={`p-2 -mr-2 ${isDarkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'} active:scale-95 transition-all`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className={`overflow-y-auto px-6 py-4 space-y-4 ${isDarkMode ? 'bg-stone-900/50' : 'bg-white'}`} style={{ maxHeight: 'calc(85vh - 280px)' }}>
              {/* Booking Details */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {booking.client_name}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)} flex items-center gap-1`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {booking.client_email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {booking.client_phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-stone-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {formatDateTime(booking.preferred_date, booking.preferred_time)}
                      </span>
                    </div>
                    {booking.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-500" />
                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                          {booking.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Service Type */}
                <div className="mt-4">
                  <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-1`}>Service Type</p>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                    {booking.service_type}
                  </span>
                </div>

                {/* Budget */}
                {booking.budget_range && (
                  <div className="mt-4">
                    <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-1`}>Budget Range</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                        {booking.budget_range}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.additional_notes && (
                  <div className="mt-4">
                    <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-1`}>Client Notes</p>
                    <p className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      {booking.additional_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className={`border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} p-4 space-y-2 ${isDarkMode ? 'bg-stone-900/50' : 'bg-white'}`}>
              <button
                onClick={() => {
                  closeMobileSheet();
                  handleEditClick(booking);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-stone-300 bg-stone-700 hover:bg-stone-600' : 'text-stone-700 bg-gray-100 hover:bg-gray-200'} rounded-xl active:scale-[0.98] transition-all`}
              >
                <Edit2 className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => handleDeleteClick(booking.id, booking.client_name)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (isLoading && !currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-gray-50'}`}>
      <AdminNavbar 
        user={currentUser} 
        onCollapsedChange={setSidebarCollapsed}
        bookingStats={stats}
      />
      
      <main className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 pt-20 lg:pt-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {isPendingView ? 'Pending Bookings' : 
                   isConfirmedView ? 'Confirmed Bookings' : 
                   isCalendarView ? 'Calendar View' : 
                   'Booking Management'}
                </h1>
                <p className={`mt-2 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {isPendingView ? `Manage pending booking requests (${stats?.pending || 0} pending)` :
                   isConfirmedView ? `View confirmed appointments (${stats?.confirmed || 0} confirmed)` :
                   isCalendarView ? 'Visualize bookings on calendar' :
                   'Manage and track all customer bookings'}
                </p>
              </div>
              
              {/* View Toggle Buttons */}
              {!isCalendarView && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
              <Check className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* Calendar View */}
          {isCalendarView ? (
            renderCalendarView()
          ) : (
            <>
              {/* Actions Bar */}
              <div className={`rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                    {/* Mobile Filters Toggle */}
                    <div className="block md:hidden">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Filters</span>
                        </div>
                        {showFilters ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:block relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                      />
                    </div>

                    {/* Mobile Search (when filters are shown) */}
                    {showFilters && (
                      <div className="md:hidden w-full">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Desktop Filters */}
                    {!isPendingView && !isConfirmedView && (
                      <div className="hidden md:flex gap-3 flex-wrap">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Status</option>
                          {statuses.map(status => (
                            <option key={status.name} value={status.name}>{status.value}</option>
                          ))}
                        </select>

                        <select
                          value={serviceTypeFilter}
                          onChange={(e) => setServiceTypeFilter(e.target.value)}
                          className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Service Types</option>
                          {serviceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>

                        <select
                          value={assignedFilter}
                          onChange={(e) => setAssignedFilter(e.target.value)}
                          className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Assignments</option>
                          <option value="unassigned">Unassigned</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>

                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          placeholder="From date"
                          className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        />

                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          placeholder="To date"
                          className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        />
                      </div>
                    )}

                    {/* Mobile Filters (when shown) */}
                    {showFilters && !isPendingView && !isConfirmedView && (
                      <div className="md:hidden grid grid-cols-2 gap-3">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Status</option>
                          {statuses.map(status => (
                            <option key={status.name} value={status.name}>{status.value}</option>
                          ))}
                        </select>

                        <select
                          value={serviceTypeFilter}
                          onChange={(e) => setServiceTypeFilter(e.target.value)}
                          className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Services</option>
                          {serviceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>

                        <select
                          value={assignedFilter}
                          onChange={(e) => setAssignedFilter(e.target.value)}
                          className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        >
                          <option value="all">All Assignments</option>
                          <option value="unassigned">Unassigned</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>

                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          placeholder="From"
                          className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        />

                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          placeholder="To"
                          className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 col-span-2`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bulk Actions Button */}
                  {selectedBookings.length > 0 && (
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors w-full sm:w-auto justify-center"
                    >
                      <Send className="h-4 sm:h-5 w-4 sm:w-5" />
                      <span className="text-sm sm:text-base">Bulk Actions ({selectedBookings.length})</span>
                    </button>
                  )}
                </div>

                {/* Results Count & Pagination */}
                <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                  <div className="flex items-center gap-4">
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Showing {filteredBookings.length} of {totalBookings} bookings (Page {currentPage} of {totalPages})
                    </p>
                    
                    {/* Bulk Select All */}
                    {filteredBookings.length > 0 && (
                      <button
                        onClick={selectAllBookings}
                        className={`text-xs px-3 py-1.5 rounded border ${selectedBookings.length === filteredBookings.length ? (isDarkMode ? 'bg-gold-500 border-gold-500 text-stone-900' : 'bg-gold-500 border-gold-500 text-white') : (isDarkMode ? 'border-stone-700 text-stone-400 hover:bg-stone-800' : 'border-gray-300 text-stone-600 hover:bg-gray-50')}`}
                      >
                        {selectedBookings.length === filteredBookings.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 text-stone-300 disabled:opacity-30' : 'bg-stone-100 text-stone-700 disabled:opacity-30'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 text-stone-300 disabled:opacity-30' : 'bg-stone-100 text-stone-700 disabled:opacity-30'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookings Grid/List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12 md:py-16">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-gold-500 animate-spin" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className={`rounded-lg sm:rounded-xl shadow-sm border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                  <Calendar className={`h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    {isPendingView ? 'No pending bookings' : 
                     isConfirmedView ? 'No confirmed bookings' : 
                     'No bookings found'}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {isPendingView ? 'All booking requests have been processed' :
                     isConfirmedView ? 'No confirmed appointments scheduled' :
                     searchTerm || statusFilter !== 'all' || serviceTypeFilter !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'No bookings have been made yet'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop/Tablet Table View */}
                  {viewMode === 'list' ? (
                    <div className="hidden md:block overflow-x-auto">
                      <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'} border ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                        <thead className={`${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                          <tr>
                            <th className="w-12 px-4 py-3 text-left">
                              <input
                                type="checkbox"
                                checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                                onChange={selectAllBookings}
                                className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Assigned To
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                          {filteredBookings.map((booking) => (
                            <tr key={booking.id} className={`${isDarkMode ? 'hover:bg-stone-800/50' : 'hover:bg-gray-50'} ${selectedBookings.includes(booking.id) ? (isDarkMode ? 'bg-stone-800' : 'bg-blue-50') : ''}`}>
                              <td className="px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedBookings.includes(booking.id)}
                                  onChange={() => toggleBookingSelection(booking.id)}
                                  className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div>
                                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                    {booking.client_name}
                                  </div>
                                  <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                    {booking.client_email}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    {booking.client_phone}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                  {booking.service_type}
                                </div>
                                {booking.location && (
                                  <div className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} flex items-center gap-1`}>
                                    <MapPin className="w-3 h-3" />
                                    {booking.location}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                  {formatDate(booking.preferred_date)}
                                </div>
                                {booking.preferred_time && (
                                  <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                    <Clock className="inline w-3 h-3 mr-1" />
                                    {booking.preferred_time}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {booking.assigned_to ? (
                                  <div className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                    {staffUsers.find(u => u.id === booking.assigned_to)?.name || 'Unknown'}
                                  </div>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-gray-100 text-gray-600'}`}>
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                  {formatDate(booking.created_at)}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditClick(booking)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-400 hover:text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(booking.id, booking.client_name)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
                      {filteredBookings.map((booking) => (
                        <div key={booking.id} className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedBookings.includes(booking.id)}
                                onChange={() => toggleBookingSelection(booking.id)}
                                className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                              />
                              <div>
                                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                  {booking.client_name}
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-stone-500" />
                              <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                {booking.client_email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-stone-500" />
                              <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                {booking.client_phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-stone-500" />
                              <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                {formatDateTime(booking.preferred_date, booking.preferred_time)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                {booking.service_type}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(booking)}
                                  className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-400 hover:text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(booking.id, booking.client_name)}
                                  className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {filteredBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => openMobileSheet(booking)}
                        className={`w-full ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'} rounded-lg border p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left min-h-[120px] flex flex-col justify-between`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={selectedBookings.includes(booking.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleBookingSelection(booking.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className={`rounded ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-gray-300'}`}
                              />
                              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                                {booking.client_name}
                              </h3>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                              {booking.service_type}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Date</span>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                              {formatDateTime(booking.preferred_date, booking.preferred_time)}
                            </span>
                          </div>
                          {booking.assigned_to && (
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Assigned</span>
                              <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'} rounded`}>
                                {staffUsers.find(u => u.id === booking.assigned_to)?.name || 'Staff'}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {renderEditModal()}
      
      {/* Bulk Action Modal */}
      {renderBulkActionModal()}
      
      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmationModal()}
      
      {/* Mobile Bottom Sheet */}
      {renderMobileBottomSheet()}
    </div>
  );
};

export default AdminBookings;
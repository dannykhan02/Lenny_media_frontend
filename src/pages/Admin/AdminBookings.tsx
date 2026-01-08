// pages/Admin/AdminBookings.tsx - With Enhanced Filtering and Search
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Filter, Calendar, Clock, User, Mail, Phone, MapPin, 
  DollarSign, FileText, Edit2, Trash2, CheckCircle, XCircle, 
  AlertCircle, Loader2, Check, X, Users,
  ChevronLeft, ChevronRight, Grid, List,
  UserX, Camera, Video
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileBottomSheet from '../../components/MobileBottomSheet';
import ResponsiveTable from '../../components/ResponsiveTable';
import EditBookingModal from '../../components/EditBookingModal';
import BulkActionsModal from '../../components/BulkActionsModal';
import DeleteBookingModal from '../../components/DeleteBookingModal'; // NEW: Import DeleteBookingModal

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

// UPDATED: Enhanced User interface to match API response
interface StaffUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  avatar_public_id: string | null;
  phone: string;
  is_active: boolean;
  can_login: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

// Custom debounce hook
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const AdminBookings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
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
  const [searchInput, setSearchInput] = useState(''); // For instant UI feedback
  const [searchTerm, setSearchTerm] = useState(''); // Debounced search term for API
  const [statusFilter, setStatusFilter] = useState(isPendingView ? 'PENDING' : isConfirmedView ? 'CONFIRMED' : 'all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [perPage] = useState(20);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // NEW: Delete modal state
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mobile states
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk selection
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  
  // Mobile sheet state
  const [mobileSheet, setMobileSheet] = useState({
    isOpen: false,
    booking: null as Booking | null
  });

  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isFilteringLoading, setIsFilteringLoading] = useState(false);

  // Calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarBookings, setCalendarBookings] = useState<{ [date: string]: Booking[] }>({});

  // Debounced search function
  const debouncedSearch = useDebounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  }, 500); // 500ms delay

  // Search change handler
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (assignedFilter !== 'all') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (searchTerm) count++;
    return count;
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchStatuses();
    fetchStaffUsers();
    fetchStats();
  }, []);

  // Fetch bookings when filters change (server-side filtering)
  useEffect(() => {
    fetchBookings();
    if (isCalendarView) {
      prepareCalendarData();
    }
  }, [
    currentPage, 
    perPage, 
    currentView, 
    searchTerm,      // Debounced search
    statusFilter, 
    assignedFilter, 
    dateFrom, 
    dateTo
  ]);

  // Update filtered bookings for instant UI feedback
  useEffect(() => {
    filterBookings();
  }, [bookings, searchInput]); // searchInput for instant feedback

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
      setStatuses([
        { name: 'PENDING', value: 'Pending' },
        { name: 'CONFIRMED', value: 'Confirmed' },
        { name: 'CANCELLED', value: 'Cancelled' },
        { name: 'COMPLETED', value: 'Completed' }
      ]);
    }
  };

  // UPDATED: Enhanced user fetching to match API response structure
  const fetchStaffUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Try media staff endpoint first
      const response = await fetch(`${API_URL}/api/auth/users/media-staff`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Process users from API response to match StaffUser interface
        const processedUsers: StaffUser[] = data.media_staff?.map((user: any) => ({
          id: user.id,
          full_name: user.full_name || '',
          email: user.email || '',
          role: user.role || '',
          avatar_url: user.avatar_url || null,
          avatar_public_id: user.avatar_public_id || null,
          phone: user.phone || '',
          is_active: user.is_active || false,
          can_login: user.can_login || false,
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
          last_login: user.last_login || null
        })) || [];
        setStaffUsers(processedUsers);
      } else {
        // Fallback: Get all users
        const fallbackResponse = await fetch(`${API_URL}/api/auth/users`, {
          credentials: 'include'
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const processedUsers: StaffUser[] = fallbackData.users?.map((user: any) => ({
            id: user.id,
            full_name: user.full_name || user.name || '',
            email: user.email || '',
            role: user.role || '',
            avatar_url: user.avatar_url || null,
            avatar_public_id: user.avatar_public_id || null,
            phone: user.phone || '',
            is_active: user.is_active || false,
            can_login: user.can_login || false,
            created_at: user.created_at || '',
            updated_at: user.updated_at || '',
            last_login: user.last_login || null
          })) || [];
          setStaffUsers(processedUsers);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch staff users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setIsFilteringLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });

      // Add search parameter
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Add status filter
      if (isPendingView) {
        params.append('status', 'PENDING');
      } else if (isConfirmedView) {
        params.append('status', 'CONFIRMED');
      } else if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Add assignment filter
      if (assignedFilter !== 'all') {
        if (assignedFilter === 'unassigned') {
          params.append('assigned_to', 'null');
        } else {
          params.append('assigned_to', assignedFilter);
        }
      }

      // Add date range filters
      if (dateFrom) {
        params.append('date_from', dateFrom);
      }
      if (dateTo) {
        params.append('date_to', dateTo);
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
      setFilteredBookings(data.bookings || []); // Set both to avoid double filtering
      setTotalPages(data.pages || 1);
      setTotalBookings(data.total || 0);
      
    } catch (err: any) {
      setError(err.message);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setIsLoading(false);
      setIsFilteringLoading(false);
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
    // If we're doing server-side filtering, just use the bookings as-is
    // This provides immediate feedback while typing
    let filtered = [...bookings];

    // Only apply client-side search if user is typing (for instant feedback)
    if (searchInput && searchInput !== searchTerm) {
      const term = searchInput.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.client_name.toLowerCase().includes(term) ||
        booking.client_email.toLowerCase().includes(term) ||
        booking.client_phone.includes(term) ||
        booking.service_type.toLowerCase().includes(term)
      );
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

  // UPDATED: Enhanced function to get assigned user info
  const getAssignedUser = (booking: Booking): StaffUser | null => {
    if (!booking.assigned_to) return null;
    return staffUsers.find(user => user.id === booking.assigned_to) || null;
  };

  // UPDATED: Enhanced function to get user avatar or initial - matching EditBookingModal
  const getUserAvatar = (user: StaffUser | null) => {
    if (!user) return null;
    
    if (user.avatar_url) {
      // Check if it's a base64 data URL
      if (user.avatar_url.startsWith('data:image')) {
        return (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-8 h-8 rounded-full object-cover border border-gold-500/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=1e293b&color=fbbf24&size=128`;
            }}
          />
        );
      } else {
        // It's a Cloudinary URL
        return (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-8 h-8 rounded-full object-cover border border-gold-500/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=1e293b&color=fbbf24&size=128`;
            }}
          />
        );
      }
    }
    
    // Fallback to avatar initials
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-gold-500/30 ${
        isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
      }`}>
        <span className="font-bold text-xs">
          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
    );
  };

  // Function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'photographer':
        return <Camera className="w-3 h-3" />;
      case 'videography':
        return <Video className="w-3 h-3" />;
      case 'editor':
        return <FileText className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Function to get role color
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'photographer':
        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
      case 'videography':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'editor':
        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      default:
        return isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditClick = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowEditModal(true);
  };

  // NEW: Handle delete click with DeleteBookingModal
  const handleDeleteClick = (booking: Booking) => {
    setCurrentBooking(booking);
    setShowDeleteModal(true);
  };

  // NEW: Confirm delete with reason
  const confirmDelete = async (reason: string) => {
    if (!currentBooking) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/bookings/${currentBooking.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ deletion_reason: reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete booking');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Booking deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowDeleteModal(false);
      setCurrentBooking(null);
      
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = async (action: string, data: any) => {
    if (!selectedBookings.length) {
      setError('Please select bookings first');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const payload: any = {
        booking_ids: selectedBookings,
        action: action,
        ...data
      };

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

      const result = await response.json();
      setSuccessMessage(result.message || 'Bulk action completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowBulkModal(false);
      setSelectedBookings([]);
      
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
    setError('');
    
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

      const data = await response.json();
      setSuccessMessage(data.message || 'Booking updated successfully!');
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

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setAssignedFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setSearchInput('');
    setCurrentPage(1);
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

  const renderCalendarView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDay = firstDay.getDay();
    
    const days = [];
    
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
    
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
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
      <div className={`rounded-xl ${isDarkMode ? 'bg-stone-900' : 'bg-white'} p-3 sm:p-4 md:p-6 overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className={`px-3 sm:px-4 py-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-3 sm:mx-0 pb-2 sm:pb-0">
          <div className="min-w-[700px] sm:min-w-0 px-3 sm:px-0">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
              {dayNames.map(day => (
                <div key={day} className={`text-center font-semibold py-1 sm:py-2 text-xs sm:text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] sm:min-h-24 md:min-h-32 rounded-lg border p-1 sm:p-2 overflow-hidden ${
                    day.isCurrentMonth
                      ? day.isToday
                        ? isDarkMode ? 'bg-gold-900/20 border-gold-500' : 'bg-gold-50 border-gold-200'
                        : isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-gray-200'
                      : isDarkMode ? 'bg-stone-900/30 border-stone-800 text-stone-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className={`text-xs sm:text-sm font-medium ${
                      day.isToday 
                        ? 'text-gold-500' 
                        : day.isCurrentMonth 
                          ? isDarkMode ? 'text-stone-300' : 'text-stone-700' 
                          : isDarkMode ? 'text-stone-500' : 'text-gray-400'
                    }`}>
                      {new Date(day.date).getDate()}
                    </span>
                    {day.bookings.length > 0 && (
                      <span className={`text-[10px] sm:text-xs px-1 py-0.5 rounded-full ${
                        isDarkMode ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-100 text-gold-700'
                      }`}>
                        {day.bookings.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-0.5 sm:space-y-1 max-h-[60px] sm:max-h-20 md:max-h-24 overflow-y-auto">
                    {day.bookings.slice(0, 3).map(booking => {
                      const assignedUser = getAssignedUser(booking);
                      return (
                        <div
                          key={booking.id}
                          onClick={() => handleEditClick(booking)}
                          className={`text-[10px] sm:text-xs p-1 rounded cursor-pointer truncate ${
                            booking.status === 'PENDING'
                              ? isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'CONFIRMED'
                                ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                                : isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-gray-100 text-gray-800'
                          }`}
                          title={`${booking.client_name} - ${booking.service_type}`}
                        >
                          <div className="font-medium truncate">{booking.client_name}</div>
                          <div className="truncate opacity-90">{booking.service_type}</div>
                          {assignedUser && (
                            <div className="truncate opacity-75 flex items-center gap-1">
                              {getUserAvatar(assignedUser)}
                              <span>{assignedUser.full_name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {day.bookings.length > 3 && (
                      <div className={`text-[10px] sm:text-xs text-center ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                        +{day.bookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // UPDATED: Filters with assignment filter and clear button
  const renderFilters = () => (
    <div className="flex flex-wrap gap-3">
      {!isPendingView && !isConfirmedView && (
        <>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-lg border ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-white' 
                : 'bg-white border-gray-300 text-stone-900'
            } focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status.name} value={status.name}>
                {status.value}
              </option>
            ))}
          </select>

          {/* Assignment Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              setCurrentPage(1);
            }}
            disabled={isLoadingUsers}
            className={`px-4 py-2.5 rounded-lg border ${
              isDarkMode 
                ? 'bg-stone-800 border-stone-700 text-white' 
                : 'bg-white border-gray-300 text-stone-900'
            } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
          >
            <option value="all">All Assignments</option>
            <option value="unassigned">Unassigned</option>
            {isLoadingUsers ? (
              <option disabled>Loading users...</option>
            ) : (
              staffUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))
            )}
          </select>

          {/* Date Range Filters */}
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="From date"
              className={`px-4 py-2.5 rounded-lg border ${
                isDarkMode 
                  ? 'bg-stone-800 border-stone-700 text-white' 
                  : 'bg-white border-gray-300 text-stone-900'
              } focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
            />
            <span className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="To date"
              min={dateFrom}
              className={`px-4 py-2.5 rounded-lg border ${
                isDarkMode 
                  ? 'bg-stone-800 border-stone-700 text-white' 
                  : 'bg-white border-gray-300 text-stone-900'
              } focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
            />
          </div>

          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || assignedFilter !== 'all' || dateFrom || dateTo || searchTerm) && (
            <button
              onClick={clearFilters}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-700 hover:bg-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </>
      )}
    </div>
  );

  // UPDATED: Desktop table view with enhanced assignment display - matching design
  const renderDesktopView = () => (
    <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'} border ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
      <thead className={`${isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-gray-50 text-stone-700'}`}>
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
        {filteredBookings.map((booking) => {
          const assignedUser = getAssignedUser(booking);
          return (
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
                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
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
                <div className={`font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  {booking.service_type}
                </div>
                {booking.location && (
                  <div className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} flex items-center gap-1 mt-1`}>
                    <MapPin className="w-3 h-3" />
                    {booking.location}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <div className={`font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  {formatDate(booking.preferred_date)}
                </div>
                {booking.preferred_time && (
                  <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'} flex items-center gap-1 mt-1`}>
                    <Clock className="w-3 h-3" />
                    {booking.preferred_time}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </span>
              </td>
              {/* UPDATED: Enhanced Assignment cell - matching design */}
              <td className="px-4 py-4">
                {assignedUser ? (
                  <div className="flex items-center gap-3">
                    {getUserAvatar(assignedUser)}
                    <div className="min-w-0">
                      <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {assignedUser.full_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getRoleColor(assignedUser.role)}`}>
                          {getRoleIcon(assignedUser.role)}
                          {assignedUser.role}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          {assignedUser.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-gray-100 text-gray-600'}`}>
                    <UserX className="w-3 h-3" />
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
                    title="Edit Booking"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(booking)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                    title="Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  // UPDATED: Grid view with enhanced assignment display
  const renderGridView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {filteredBookings.map((booking) => {
        const assignedUser = getAssignedUser(booking);
        return (
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
                  <div className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Booking #{booking.id}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
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
              
              {/* UPDATED: Enhanced Assignment display in grid */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-500" />
                {assignedUser ? (
                  <div className="flex items-center gap-2">
                    {getUserAvatar(assignedUser)}
                    <div>
                      <div className={`text-sm font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {assignedUser.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          {assignedUser.role}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                          {assignedUser.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className={`text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    Unassigned
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  {booking.service_type}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(booking)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-400 hover:text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                    title="Edit Booking"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(booking)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                    title="Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // UPDATED: Mobile view with enhanced assignment display
  const renderMobileView = () => (
    <div className="space-y-3">
      {filteredBookings.map((booking) => {
        const assignedUser = getAssignedUser(booking);
        return (
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
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
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
              
              {/* UPDATED: Enhanced Assignment display in mobile */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Assigned</span>
                {assignedUser ? (
                  <div className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDarkMode ? 'bg-gold-900/30 text-gold-400' : 'bg-gold-100 text-gold-600'
                    }`}>
                      {assignedUser.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        {assignedUser.full_name}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                        {assignedUser.role}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-700'} rounded`}>
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const getEmptyMessage = () => {
    const hasActiveFilters = statusFilter !== 'all' || 
                           assignedFilter !== 'all' || 
                           dateFrom || 
                           dateTo || 
                           searchTerm;

    if (isPendingView) {
      return hasActiveFilters 
        ? 'No pending bookings match your filters' 
        : 'All booking requests have been processed';
    }
    
    if (isConfirmedView) {
      return hasActiveFilters 
        ? 'No confirmed bookings match your filters' 
        : 'No confirmed appointments scheduled';
    }
    
    if (hasActiveFilters) {
      return 'No bookings match your current filters. Try adjusting your search criteria.';
    }
    
    return 'No bookings have been made yet';
  };

  const activeFilters = getActiveFilterCount();

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
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {isPendingView ? 'Pending Bookings' : 
                   isConfirmedView ? 'Confirmed Bookings' : 
                   isCalendarView ? 'Calendar View' : 
                   'Booking Management'}
                </h1>
                {activeFilters > 0 && (
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                    isDarkMode ? 'bg-gold-900 text-gold-400' : 'bg-gold-100 text-gold-700'
                  }`}>
                    {activeFilters}
                  </span>
                )}
              </div>
              <p className={`mt-2 md:mt-0 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                {isPendingView ? `Manage pending booking requests (${stats?.pending || 0} pending)` :
                 isConfirmedView ? `View confirmed appointments (${stats?.confirmed || 0} confirmed)` :
                 isCalendarView ? 'Visualize bookings on calendar' :
                 `Total: ${totalBookings} bookings`}
              </p>
              
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

          {/* Loading indicator for filters */}
          {isFilteringLoading && (
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Applying filters...</span>
            </div>
          )}

          {/* Calendar View */}
          {isCalendarView ? (
            renderCalendarView()
          ) : (
            <ResponsiveTable
              isDarkMode={isDarkMode}
              searchTerm={searchInput}  // Use searchInput for instant feedback
              onSearchChange={handleSearchChange}  // Use debounced handler
              searchPlaceholder="Search by name, email, phone, or service..."
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filters={renderFilters()}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalBookings}
              onPageChange={setCurrentPage}
              itemsPerPage={perPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedCount={selectedBookings.length}
              onBulkActionClick={() => setShowBulkModal(true)}
              bulkActionText="Bulk Actions"
              desktopView={viewMode === 'list' ? renderDesktopView() : renderGridView()}
              mobileView={renderMobileView()}
              gridView={renderGridView()}
              isLoading={isLoading}
              isEmpty={filteredBookings.length === 0}
              emptyMessage={getEmptyMessage()}
              headerActions={
                !isPendingView && !isConfirmedView ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100'}`}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    {selectedBookings.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          {selectedBookings.length} selected
                        </span>
                      </div>
                    )}
                  </div>
                ) : undefined
              }
            />
          )}
        </div>
      </main>

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={showEditModal}
        isDarkMode={isDarkMode}
        booking={currentBooking}
        statuses={statuses}
        staffUsers={staffUsers}
        isSubmitting={isSubmitting}
        onClose={() => {
          setShowEditModal(false);
          setCurrentBooking(null);
        }}
        onSubmit={handleUpdateBooking}
      />
      
      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={showBulkModal}
        isDarkMode={isDarkMode}
        selectedCount={selectedBookings.length}
        statuses={statuses}
        staffUsers={staffUsers}
        isSubmitting={isSubmitting}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkAction}
      />
      
      {/* NEW: Delete Booking Modal */}
      <DeleteBookingModal
        isOpen={showDeleteModal}
        isDarkMode={isDarkMode}
        isLoading={isSubmitting}
        bookingName={currentBooking?.client_name || ''}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setCurrentBooking(null);
        }}
      />
      
      {/* Mobile Bottom Sheet - UPDATED with button spacing fix */}
      <MobileBottomSheet
        isOpen={mobileSheet.isOpen}
        isDarkMode={isDarkMode}
        title={mobileSheet.booking?.client_name || ''}
        subtitle={mobileSheet.booking?.service_type}
        onClose={closeMobileSheet}
        actions={
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                closeMobileSheet();
                if (mobileSheet.booking) handleEditClick(mobileSheet.booking);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-stone-300 bg-stone-700 hover:bg-stone-600' : 'text-stone-700 bg-gray-100 hover:bg-gray-200'} rounded-xl active:scale-[0.98] transition-all`}
            >
              <Edit2 className="w-4 h-4" />
              Edit Booking
            </button>
            <button
              onClick={() => {
                closeMobileSheet();
                if (mobileSheet.booking) handleDeleteClick(mobileSheet.booking);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Booking
            </button>
          </div>
        }
      >
        {mobileSheet.booking && (
          <div className="space-y-4">
            {/* Booking Details */}
            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {mobileSheet.booking.client_email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {mobileSheet.booking.client_phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {formatDateTime(mobileSheet.booking.preferred_date, mobileSheet.booking.preferred_time)}
                  </span>
                </div>
                {mobileSheet.booking.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      {mobileSheet.booking.location}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Service Type - UPDATED with better contrast */}
              <div className="mt-4">
                <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Service Type</p>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {mobileSheet.booking.service_type}
                </span>
              </div>

              {/* Assignment Display */}
              <div className="mt-4">
                <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Assigned To</p>
                {mobileSheet.booking.assigned_to ? (
                  (() => {
                    const assignedUser = getAssignedUser(mobileSheet.booking);
                    return assignedUser ? (
                      <div className="flex items-center gap-2">
                        {getUserAvatar(assignedUser)}
                        <div>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            {assignedUser.full_name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${getRoleColor(assignedUser.role)} px-1 py-0.5 rounded`}>
                              {assignedUser.role}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                              {assignedUser.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-gray-100 text-gray-600'} rounded`}>
                        User #{mobileSheet.booking.assigned_to}
                      </span>
                    );
                  })()
                ) : (
                  <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-gray-100 text-gray-600'} rounded`}>
                    Unassigned
                  </span>
                )}
              </div>

              {/* Budget - UPDATED with better contrast */}
              {mobileSheet.booking.budget_range && (
                <div className="mt-4">
                  <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Budget Range</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-4 h-4 ${isDarkMode ? 'text-gold-400' : 'text-gold-500'}`} />
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {mobileSheet.booking.budget_range}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {mobileSheet.booking.additional_notes && (
                <div className="mt-4">
                  <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-1`}>Client Notes</p>
                  <p className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {mobileSheet.booking.additional_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
};

export default AdminBookings;
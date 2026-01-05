// Complete EditBookingModal.tsx - With Enhanced Assignment Functionality
import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, AlertCircle, Calendar, User, 
  Users, CheckCircle, UserPlus, UserX,
  Camera, Video, FileText, Search
} from 'lucide-react';

interface EditBookingModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  booking: any;
  statuses: any[];
  staffUsers: any[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// User interface matching API response
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

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  isDarkMode,
  booking,
  statuses,
  staffUsers = [], // Default to empty array
  isSubmitting,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    location: '',
    budget_range: '',
    additional_notes: '',
    status: '',
    assigned_to: '',
    internal_notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<StaffUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<StaffUser[]>([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (booking) {
      setFormData({
        client_name: booking.client_name || '',
        client_email: booking.client_email || '',
        client_phone: booking.client_phone || '',
        service_type: booking.service_type || '',
        preferred_date: booking.preferred_date || '',
        preferred_time: booking.preferred_time || '',
        location: booking.location || '',
        budget_range: booking.budget_range || '',
        additional_notes: booking.additional_notes || '',
        status: booking.status || 'PENDING',
        assigned_to: booking.assigned_to?.toString() || '',
        internal_notes: booking.internal_notes || ''
      });
      
      // Set selected user ID from booking
      setSelectedUserId(booking.assigned_to?.toString() || '');
    }
  }, [booking]);

  useEffect(() => {
    // Process staff users from API response
    const processUsers = () => {
      if (!staffUsers || staffUsers.length === 0) return [];
      
      return staffUsers.map((user: any) => ({
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
      }));
    };

    const processedUsers = processUsers();
    setAvailableUsers(processedUsers);
    setFilteredUsers(processedUsers);
  }, [staffUsers]);

  useEffect(() => {
    // Filter users based on search
    if (userSearch.trim() === '') {
      setFilteredUsers(availableUsers);
    } else {
      const searchLower = userSearch.toLowerCase();
      const filtered = availableUsers.filter(user => 
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
      setFilteredUsers(filtered);
    }
  }, [userSearch, availableUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update selectedUserId if assigned_to changes
    if (name === 'assigned_to') {
      setSelectedUserId(value);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Name is required';
    }

    if (!formData.client_email.trim()) {
      newErrors.client_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.client_email)) {
      newErrors.client_email = 'Invalid email format';
    }

    if (!formData.client_phone.trim()) {
      newErrors.client_phone = 'Phone is required';
    }

    if (!formData.service_type.trim()) {
      newErrors.service_type = 'Service type is required';
    }

    if (!formData.preferred_date) {
      newErrors.preferred_date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for backend
      const submitData: any = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        service_type: formData.service_type,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time || null,
        location: formData.location || null,
        budget_range: formData.budget_range || null,
        additional_notes: formData.additional_notes || null,
        status: formData.status,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        internal_notes: formData.internal_notes || null
      };

      onSubmit(submitData);
    }
  };

  const handleAssignUser = (userId: string) => {
    setFormData(prev => ({ ...prev, assigned_to: userId }));
    setSelectedUserId(userId);
    setShowAssignModal(false);
    setUserSearch('');
  };

  const handleRemoveAssignment = () => {
    setFormData(prev => ({ ...prev, assigned_to: '' }));
    setSelectedUserId('');
  };

  const getAssignedUser = () => {
    if (!selectedUserId) return null;
    return availableUsers.find(user => user.id.toString() === selectedUserId);
  };

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

  const getUserAvatar = (user: StaffUser) => {
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

  const getUserDisplayName = (user: StaffUser) => {
    return user.full_name || `User #${user.id}`;
  };

  if (!isOpen) return null;

  const assignedUser = getAssignedUser();

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full my-8`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Edit Booking
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Booking ID: #{booking?.id} • Created: {new Date(booking?.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            
            {/* Client Information Section */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                <User className="w-5 h-5" />
                Client Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.client_name 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : isDarkMode 
                          ? 'bg-stone-900 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {errors.client_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.client_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.client_phone 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : isDarkMode 
                          ? 'bg-stone-900 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {errors.client_phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.client_phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.client_email 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : isDarkMode 
                          ? 'bg-stone-900 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {errors.client_email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.client_email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                <Calendar className="w-5 h-5" />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.service_type 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : isDarkMode 
                          ? 'bg-stone-900 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {errors.service_type && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.service_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.preferred_date 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : isDarkMode 
                          ? 'bg-stone-900 border-stone-700 text-white' 
                          : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {errors.preferred_date && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.preferred_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    name="preferred_time"
                    value={formData.preferred_time}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Venue or address"
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Budget Range (KES)
                  </label>
                  <input
                    type="text"
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="e.g., 50,000 - 100,000"
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Client Notes
                  </label>
                  <textarea
                    name="additional_notes"
                    value={formData.additional_notes}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Client's preferences and requirements..."
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                </div>
              </div>
            </div>

            {/* Admin Management Section */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                <Users className="w-5 h-5" />
                Admin Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  >
                    {statuses.map(status => (
                      <option key={status.name} value={status.name}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                    ⚠️ Changing status will send an email notification to the client
                  </p>
                </div>

                {/* Assignment Section - Enhanced with seamless user display */}
                <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                      Assignment
                    </label>
                    {assignedUser && (
                      <button
                        type="button"
                        onClick={handleRemoveAssignment}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        <UserX className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {assignedUser ? (
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      {getUserAvatar(assignedUser)}
                      
                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            {getUserDisplayName(assignedUser)}
                          </p>
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleColor(assignedUser.role)}`}>
                            {getRoleIcon(assignedUser.role)}
                            {assignedUser.role || 'Staff'}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {assignedUser.phone}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          {assignedUser.email}
                        </p>
                      </div>
                      
                      {/* Status Indicator */}
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        isDarkMode ? 'bg-stone-700 text-stone-400' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <UserX className="w-6 h-6" />
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        This booking has not been assigned yet.
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    disabled={isSubmitting}
                    className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gold-600 text-white hover:bg-gold-700 disabled:bg-gold-600/50'
                        : 'bg-gold-500 text-white hover:bg-gold-600 disabled:bg-gold-500/50'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {assignedUser ? 'Reassign Booking' : 'Assign Booking'}
                  </button>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    Internal Notes (Admin Only)
                  </label>
                  <textarea
                    name="internal_notes"
                    value={formData.internal_notes}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Private notes for staff (not visible to client)..."
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                    📝 These notes are only visible to admin users
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className={`flex items-center justify-between p-6 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
              Last updated: {booking?.updated_at ? new Date(booking.updated_at).toLocaleString() : 'Never'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-6 py-2.5 border rounded-lg font-medium ${
                  isDarkMode 
                    ? 'border-stone-600 text-stone-300 hover:bg-stone-800' 
                    : 'border-gray-300 text-stone-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gold-500 text-stone-900 rounded-lg font-medium hover:bg-gold-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Assign User Modal - Updated to match design image */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
          <div className={`rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-stone-900 border border-stone-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-stone-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Assign Booking
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setUserSearch('');
                  }}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className={`mb-4 text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                Select a staff member to assign this booking. They will receive notifications about this booking.
              </p>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`w-4 h-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                </div>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, role, or phone..."
                  className={`w-full px-4 py-2.5 pl-10 rounded-lg ${
                    isDarkMode 
                      ? 'bg-stone-800 text-white placeholder-stone-400 border border-stone-700' 
                      : 'bg-white text-stone-900 placeholder-gray-500 border border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                />
              </div>
            </div>
            
            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className={`p-8 text-center ${
                  isDarkMode ? 'bg-stone-900' : 'bg-white'
                }`}>
                  <AlertCircle className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {availableUsers.length === 0 
                      ? 'No staff members available for assignment'
                      : 'No users match your search'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-700">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssignUser(user.id.toString())}
                      className={`w-full p-4 text-left transition-all ${
                        selectedUserId === user.id.toString()
                          ? isDarkMode
                            ? 'bg-stone-800'
                            : 'bg-gray-50'
                          : isDarkMode
                            ? 'bg-stone-900 hover:bg-stone-800'
                            : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {getUserAvatar(user)}
                        
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                              {getUserDisplayName(user)}
                            </p>
                            {user.is_active && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Active
                              </span>
                            )}
                          </div>
                          
                          {/* Role and Phone */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role || 'Staff'}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                              {user.phone}
                            </span>
                          </div>
                          
                          {/* Email */}
                          <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {user.email}
                          </p>
                        </div>
                        
                        {/* Selection Indicator */}
                        {selectedUserId === user.id.toString() && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer - Removed the white section, just show cancel/assign buttons */}
            <div className="p-4 border-t border-stone-700">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setUserSearch('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-stone-800 text-white hover:bg-stone-700 border border-stone-700'
                      : 'bg-white text-stone-900 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    if (selectedUserId) {
                      handleAssignUser(selectedUserId);
                    }
                  }}
                  disabled={!selectedUserId}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? selectedUserId
                        ? 'bg-gold-600 text-white hover:bg-gold-700'
                        : 'bg-gold-600/50 text-white/50 cursor-not-allowed'
                      : selectedUserId
                        ? 'bg-gold-500 text-white hover:bg-gold-600'
                        : 'bg-gold-500/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {selectedUserId ? 'Assign' : 'Select User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditBookingModal;
// Updated AdminUsers.tsx with VIDEOGRAPHY role support and Cloudinary profile picture upload
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Loader2, Eye, EyeOff, User, Mail, Phone, Shield, Calendar, Clock, Filter, Users, Video, Camera, Briefcase, Upload, ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UserData {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  avatar_public_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  can_login: boolean;
}

interface CloudinaryConfig {
  cloud_name: string;
  upload_folder: string;
  allowed_formats: string[];
  max_file_size_mb: number;
  secure: boolean;
  configured: boolean;
}

const AdminUsers: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // View mode: 'list', 'nonAdmins', 'byRole', 'photographers', 'videographers', 'mediaStaff'
  const [viewMode, setViewMode] = useState<'list' | 'nonAdmins' | 'byRole' | 'photographers' | 'videographers' | 'mediaStaff'>('list');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: '',
    isSelf: false
  });

  // Activation modal state
  const [activationModal, setActivationModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: '',
    action: 'activate' as 'activate' | 'deactivate'
  });

  // Cloudinary upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete avatar modal state
  const [deleteAvatarModal, setDeleteAvatarModal] = useState({
    isOpen: false
  });

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'PHOTOGRAPHER',
    phone: '',
    avatar_url: '',
    avatar_public_id: '',
    is_active: true,
    password: '',
    confirmPassword: ''
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return searchTerm.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';
  };

  useEffect(() => {
    fetchCurrentAdmin();
    fetchCloudinaryConfig();
    
    // Check for mobile viewport
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentAdmin) {
      switch (viewMode) {
        case 'list':
          fetchAllUsers();
          break;
        case 'nonAdmins':
          fetchNonAdminUsers();
          break;
        case 'byRole':
          if (selectedRole !== 'all') {
            fetchUsersByRole(selectedRole);
          } else {
            fetchAllUsers();
          }
          break;
        case 'photographers':
          fetchPhotographers();
          break;
        case 'videographers':
          fetchVideographers();
          break;
        case 'mediaStaff':
          fetchMediaStaff();
          break;
      }
    }
  }, [viewMode, selectedRole, currentAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchCurrentAdmin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();
      setCurrentAdmin(data);
    } catch (err: any) {
      setError(err.message);
      navigate('/admin/login');
    }
  };

  const fetchCloudinaryConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/cloudinary/config`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCloudinaryConfig(data.config);
        }
      }
    } catch (err) {
      console.log('Cloudinary config not available:', err);
    }
  };

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNonAdminUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/non-admins`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch non-admin users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersByRole = async (role: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/by-role/${role}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to fetch ${role} users`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhotographers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/photographers`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch photographers');
      const data = await response.json();
      setUsers(data.photographers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideographers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/videographers`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch videographers');
      const data = await response.json();
      setUsers(data.videographers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/media-staff`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch media staff');
      const data = await response.json();
      setUsers(data.media_staff || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenModal = (mode: 'create' | 'edit', user?: UserData) => {
    setModalMode(mode);
    setSelectedFile(null);
    setUploadError('');
    
    if (mode === 'edit' && user) {
      setCurrentUser(user);
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
        avatar_public_id: user.avatar_public_id || '',
        is_active: user.is_active,
        password: '',
        confirmPassword: ''
      });
    } else {
      setCurrentUser(null);
      setFormData({
        email: '',
        full_name: '',
        role: 'PHOTOGRAPHER',
        phone: '',
        avatar_url: '',
        avatar_public_id: '',
        is_active: true,
        password: '',
        confirmPassword: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setSelectedFile(null);
    setUploadError('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cloudinary Avatar Upload Functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WEBP, SVG)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = cloudinaryConfig?.max_file_size_mb || 10;
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Image size should be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        avatar_url: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploadingAvatar(true);
    setUploadProgress(0);
    setUploadError('');

    const formDataToSend = new FormData();
    formDataToSend.append('avatar', selectedFile);

    try {
      const url = modalMode === 'edit' && currentUser
        ? `${API_URL}/api/auth/users/${currentUser.id}/avatar`
        : `${API_URL}/api/auth/users/upload-avatar`;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        avatar_url: result.avatar_url,
        avatar_public_id: result.avatar_public_id || ''
      }));
      
      setSuccessMessage('Profile picture uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset upload state
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  // Handle delete avatar click
  const handleDeleteAvatarClick = () => {
    if (!formData.avatar_public_id && !formData.avatar_url) {
      setError('No profile picture to delete');
      return;
    }
    setDeleteAvatarModal({ isOpen: true });
  };

  // Confirm delete avatar (called from modal)
  const confirmDeleteAvatar = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/users/${currentUser.id}/avatar`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Delete failed');
      }

      const result = await response.json();
      
      setSuccessMessage(result.msg || 'Profile picture deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Clear form data
      setFormData(prev => ({
        ...prev,
        avatar_url: '',
        avatar_public_id: ''
      }));
      
      // Close the modal
      setDeleteAvatarModal({ isOpen: false });
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.email || !formData.full_name) {
      setError('Email and full name are required');
      setIsSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // For new admin users or admin role changes, password is required
    if (modalMode === 'create' && formData.role === 'ADMIN') {
      if (!formData.password) {
        setError('Password is required for admin users');
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
    }

    // For editing: if changing TO admin role, password is required
    if (modalMode === 'edit' && currentUser && formData.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      if (!formData.password) {
        setError('Password is required when promoting user to admin');
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload: any = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone || null,
        avatar_url: formData.avatar_url || null,
        avatar_public_id: formData.avatar_public_id || null,
        is_active: formData.is_active
      };

      // Only include password if provided (for new admin users or role change to admin)
      if (formData.password) {
        payload.password = formData.password;
      }

      const url = modalMode === 'create' 
        ? `${API_URL}/api/auth/users`
        : `${API_URL}/api/auth/users/${currentUser?.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.error || 'Operation failed');
      }

      const result = await response.json();
      
      setSuccessMessage(result.msg || `User ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      handleCloseModal();
      // Refresh based on current view mode
      switch (viewMode) {
        case 'list':
          fetchAllUsers();
          break;
        case 'nonAdmins':
          fetchNonAdminUsers();
          break;
        case 'byRole':
          if (selectedRole !== 'all') {
            fetchUsersByRole(selectedRole);
          } else {
            fetchAllUsers();
          }
          break;
        case 'photographers':
          fetchPhotographers();
          break;
        case 'videographers':
          fetchVideographers();
          break;
        case 'mediaStaff':
          fetchMediaStaff();
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    const isSelf = currentAdmin?.id === userId;
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      isSelf
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/users/${deleteModal.userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setSuccessMessage('User deactivated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setDeleteModal({ isOpen: false, userId: null, userName: '', isSelf: false });
      
      // Refresh based on current view mode
      switch (viewMode) {
        case 'list':
          fetchAllUsers();
          break;
        case 'nonAdmins':
          fetchNonAdminUsers();
          break;
        case 'byRole':
          if (selectedRole !== 'all') {
            fetchUsersByRole(selectedRole);
          } else {
            fetchAllUsers();
          }
          break;
        case 'photographers':
          fetchPhotographers();
          break;
        case 'videographers':
          fetchVideographers();
          break;
        case 'mediaStaff':
          fetchMediaStaff();
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivationClick = (user: UserData, action: 'activate' | 'deactivate') => {
    const isSelf = currentAdmin?.id === user.id;
    if (isSelf && action === 'deactivate') {
      setError('Cannot deactivate your own account');
      return;
    }

    setActivationModal({
      isOpen: true,
      userId: user.id,
      userName: user.full_name,
      action
    });
  };

  const confirmActivation = async () => {
    if (!activationModal.userId) return;

    setIsLoading(true);
    try {
      const url = `${API_URL}/api/auth/users/${activationModal.userId}/activate`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Failed to ${activationModal.action} user`);

      setSuccessMessage(`User ${activationModal.action === 'activate' ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setActivationModal({ isOpen: false, userId: null, userName: '', action: 'activate' });
      
      // Refresh based on current view mode
      switch (viewMode) {
        case 'list':
          fetchAllUsers();
          break;
        case 'nonAdmins':
          fetchNonAdminUsers();
          break;
        case 'byRole':
          if (selectedRole !== 'all') {
            fetchUsersByRole(selectedRole);
          } else {
            fetchAllUsers();
          }
          break;
        case 'photographers':
          fetchPhotographers();
          break;
        case 'videographers':
          fetchVideographers();
          break;
        case 'mediaStaff':
          fetchMediaStaff();
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display (responsive)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    
    // Mobile: "Dec 25, 2025"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role color - updated with VIDEOGRAPHY role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800';
      case 'PHOTOGRAPHER':
        return isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'VIDEOGRAPHY':
        return isDarkMode ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100 text-cyan-800';
      case 'STAFF':
        return isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      default:
        return isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-3.5 w-3.5" />;
      case 'PHOTOGRAPHER':
        return <Camera className="h-3.5 w-3.5" />;
      case 'VIDEOGRAPHY':
        return <Video className="h-3.5 w-3.5" />;
      case 'STAFF':
        return <Briefcase className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  // Render Delete Avatar Modal
  const renderDeleteAvatarModal = () => {
    if (!deleteAvatarModal.isOpen) return null;

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
                  Delete Profile Picture
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Are you sure you want to delete the profile picture for {formData.full_name || 'this user'}?
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 pt-4">
            <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  <strong>Warning:</strong> This will permanently delete the profile picture from our servers.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setDeleteAvatarModal({ isOpen: false })}
              className={`w-full sm:w-auto px-4 py-2.5 border ${
                isDarkMode 
                  ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                  : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
              } rounded-lg text-sm font-medium transition-all`}
            >
              Keep Picture
            </button>
            <button
              onClick={confirmDeleteAvatar}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Picture</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewTabs = () => {
    return (
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedRole('all');
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'list' 
                ? 'bg-gold-500 text-stone-900' 
                : isDarkMode 
                  ? 'bg-stone-800 text-white hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">All Users</span>
            </button>
            <button
              onClick={() => setViewMode('nonAdmins')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'nonAdmins' 
                ? 'bg-gold-500 text-stone-900' 
                : isDarkMode 
                  ? 'bg-stone-800 text-white hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Non-Admins</span>
            </button>
            <button
              onClick={() => setViewMode('photographers')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'photographers' 
                ? 'bg-gold-500 text-stone-900' 
                : isDarkMode 
                  ? 'bg-stone-800 text-white hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Photographers</span>
            </button>
            <button
              onClick={() => setViewMode('videographers')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'videographers' 
                ? 'bg-gold-500 text-stone-900' 
                : isDarkMode 
                  ? 'bg-stone-800 text-white hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
              }`}
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Videographers</span>
            </button>
            <button
              onClick={() => setViewMode('mediaStaff')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${viewMode === 'mediaStaff' 
                ? 'bg-gold-500 text-stone-900' 
                : isDarkMode 
                  ? 'bg-stone-800 text-white hover:bg-stone-700' 
                  : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Media Staff</span>
            </button>
          </div>
          
          {viewMode === 'byRole' && (
            <div className="flex-1">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-sm sm:text-base ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              >
                <option value="all">Select Role...</option>
                <option value="ADMIN">Admin</option>
                <option value="PHOTOGRAPHER">Photographer</option>
                <option value="VIDEOGRAPHY">Videographer</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
          )}
        </div>
        
        {viewMode === 'byRole' && selectedRole !== 'all' && (
          <div className="mt-4 pt-4 border-t border-stone-700">
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Showing users with role: <span className="font-bold">{selectedRole}</span>
            </p>
          </div>
        )}
      </div>
    );
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
                  {deleteModal.isSelf ? 'Cannot Delete Own Account' : 'Deactivate User'}
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {deleteModal.isSelf 
                    ? 'You cannot deactivate your own account. Please ask another admin to do this.'
                    : `Are you sure you want to deactivate ${deleteModal.userName}? This will prevent them from accessing the system.`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {!deleteModal.isSelf && (
            <div className="px-4 sm:px-6 pt-4">
              <div className={`${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    <strong>Note:</strong> This is a soft delete. The user data will be preserved but marked as inactive. They can be reactivated later.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '', isSelf: false })}
              disabled={isLoading}
              className={`w-full sm:w-auto px-4 py-3 border ${
                isDarkMode 
                  ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                  : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
              } rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
            >
              {deleteModal.isSelf ? 'Close' : 'Cancel'}
            </button>
            
            {!deleteModal.isSelf && (
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deactivating...</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Deactivate User</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActivationConfirmationModal = () => {
    if (!activationModal.isOpen) return null;
    
    const isActivating = activationModal.action === 'activate';
    
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-[70] p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-full ${isActivating ? (isDarkMode ? 'bg-green-900/20' : 'bg-green-50') : (isDarkMode ? 'bg-red-900/20' : 'bg-red-50')} flex-shrink-0`}>
                {isActivating ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  {isActivating ? 'Activate User' : 'Deactivate User'}
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {isActivating 
                    ? `Are you sure you want to activate ${activationModal.userName}?`
                    : `Are you sure you want to deactivate ${activationModal.userName}? This will prevent them from accessing the system.`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setActivationModal({ isOpen: false, userId: null, userName: '', action: 'activate' })}
              disabled={isLoading}
              className={`w-full sm:w-auto px-4 py-3 border ${
                isDarkMode 
                  ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                  : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
              } rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
            >
              Cancel
            </button>
            
            <button
              onClick={confirmActivation}
              disabled={isLoading}
              className={`w-full sm:w-auto px-4 py-3 ${isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isActivating ? 'Activating...' : 'Deactivating...'}</span>
                </>
              ) : (
                <>
                  {isActivating ? <Check className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{isActivating ? 'Activate User' : 'Deactivate User'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !currentAdmin) {
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
      <AdminNavbar user={currentAdmin} onCollapsedChange={setSidebarCollapsed} />
      
      <main className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 pt-20 lg:pt-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              User Management
            </h1>
            <p className={`mt-2 text-sm sm:text-base md:text-lg ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Manage admin users, photographers, videographers, and staff members
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
              <Check className="h-5 w-5 text-green-500" />
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 rounded-lg p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* View Tabs */}
          {renderViewTabs()}

          {/* Main Content Area */}
          <>
            {/* Actions Bar */}
            <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col gap-4">
                {/* Search and Create button row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm sm:text-base ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                    />
                  </div>
                  <button
                    onClick={() => handleOpenModal('create')}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gold-500 text-stone-900 rounded-lg font-bold hover:bg-gold-400 transition-colors text-sm sm:text-base"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create User</span>
                  </button>
                </div>
                
                {/* Filters row */}
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`px-4 py-3 rounded-lg border text-sm sm:text-base ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PHOTOGRAPHER">Photographer</option>
                    <option value="VIDEOGRAPHY">Videographer</option>
                    <option value="STAFF">Staff</option>
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-3 rounded-lg border text-sm sm:text-base ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {/* Clear Filters Button - Only shown when filters are active */}
                {isAnyFilterActive() && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg ${
                        isDarkMode 
                          ? 'text-white hover:text-stone-300 hover:bg-stone-800' 
                          : 'text-stone-600 hover:text-stone-800 hover:bg-gray-100'
                      }`}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
                
                {/* Results Count */}
                <div className={`pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Showing {filteredUsers.length} of {users.length} users
                    {viewMode === 'nonAdmins' && ' (Non-admins only)'}
                    {viewMode === 'photographers' && ' (Photographers only)'}
                    {viewMode === 'videographers' && ' (Videographers only)'}
                    {viewMode === 'mediaStaff' && ' (Media staff only)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Users Grid/List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12 md:py-16">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-gold-500 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={`rounded-xl shadow-sm border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                <User className={`h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>No users found</h3>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first user'}
                </p>
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-gold-500 hover:text-gold-400 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop/Tablet Grid View */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = currentAdmin?.id === user.id;
                    
                    return (
                      <div key={user.id} className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-gold-500" />
                              )}
                            </div>
                            <div>
                              <span className={`text-xs font-bold uppercase tracking-wider ${getRoleColor(user.role)} px-2 py-1 rounded flex items-center gap-1`}>
                                {getRoleIcon(user.role)}
                                {user.role}
                              </span>
                            </div>
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex gap-2">
                            {user.role === 'ADMIN' && (
                              <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                                <Shield className="h-4 w-4 text-purple-500" />
                              </div>
                            )}
                            <button
                              onClick={() => handleActivationClick(user, user.is_active ? 'deactivate' : 'activate')}
                              disabled={isCurrentUser && !user.is_active}
                              className={`p-1.5 rounded-lg transition-colors ${user.is_active ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') : (isDarkMode ? 'bg-red-900/30' : 'bg-red-100')} ${isCurrentUser ? 'cursor-not-allowed' : ''}`}
                            >
                              {user.is_active ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="mb-4">
                          <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            {user.full_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gold-500">(You)</span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-3 w-3 text-stone-400" />
                            <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                              {user.email}
                            </p>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-stone-400" />
                              <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                {user.phone}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Account Info */}
                        <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className={`mb-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Created</p>
                              <p className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                {formatDate(user.created_at)}
                              </p>
                            </div>
                            <div>
                              <p className={`mb-1 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Last Login</p>
                              <p className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                {formatDateTime(user.last_login)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Login Access Info */}
                        <div className="mb-4">
                          <div className={`text-xs ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-100'} rounded-lg p-3`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="h-3 w-3 text-stone-400" />
                              <span className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                Login Access
                              </span>
                            </div>
                            <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                              {user.role === 'ADMIN' 
                                ? 'Can log in to admin panel'
                                : 'Cannot log in (internal tracking only)'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                          <button
                            onClick={() => handleOpenModal('edit', user)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                              isDarkMode 
                                ? 'bg-stone-800 text-white hover:bg-stone-700' 
                                : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
                            }`}
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id, user.full_name)}
                            disabled={isCurrentUser}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isCurrentUser 
                              ? 'cursor-not-allowed opacity-50' 
                              : isDarkMode 
                                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Card View - Improved Responsive Design */}
                <div className="md:hidden space-y-4">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = currentAdmin?.id === user.id;
                    
                    return (
                      <div
                        key={user.id}
                        className={`w-full ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'} rounded-xl border shadow-sm transition-all hover:shadow-md`}
                      >
                        <div className="p-4">
                          {/* User Header with Avatar and Role */}
                          <div className="flex items-start gap-3 mb-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-gold-500"
                                />
                              ) : (
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-gold-500 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-200'}`}>
                                  <User className="w-7 h-7 text-gold-500" />
                                </div>
                              )}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                                    {user.full_name}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs text-gold-500 font-normal">(You)</span>
                                    )}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  {/* Status Indicator */}
                                  <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                  
                                  {/* Admin Badge */}
                                  {user.role === 'ADMIN' && (
                                    <div className={`p-1 rounded ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                                      <Shield className="h-3 w-3 text-purple-500" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Role Badge */}
                              <div className="mb-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getRoleColor(user.role)}`}>
                                  {getRoleIcon(user.role)}
                                  {user.role}
                                </span>
                              </div>
                              
                              {/* Email */}
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Mail className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                                <p className={`text-sm truncate ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                  {user.email}
                                </p>
                              </div>
                              
                              {/* Phone - Only show if exists */}
                              {user.phone && (
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Phone className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                                  <p className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                    {user.phone}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Date Info and Actions */}
                          <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                <div>
                                  <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>Created</p>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                    {formatDate(user.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenModal('edit', user)}
                                className={`p-2.5 rounded-lg ${
                                  isDarkMode 
                                    ? 'bg-stone-800 text-white hover:bg-stone-700' 
                                    : 'bg-gray-100 text-stone-700 hover:bg-gray-200'
                                }`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user.id, user.full_name)}
                                disabled={isCurrentUser}
                                className={`p-2.5 rounded-lg ${isCurrentUser 
                                  ? 'cursor-not-allowed opacity-50' 
                                  : isDarkMode 
                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        </div>
      </main>

      {/* User Form Modal with Avatar Upload */}
      {showModal && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-[60] p-4`}>
          <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                  </h2>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {modalMode === 'create' 
                      ? 'Add a new user to the system' 
                      : `Editing ${currentUser?.full_name}`
                    }
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Profile Picture
                  </h3>
                  
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative mb-4">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500">
                        <img
                          src={
                            formData.avatar_url || 
                            `https://ui-avatars.com/api/?name=${formData.full_name || 'User'}&background=333&color=fff&size=128`
                          }
                          alt={formData.full_name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay for upload/delete actions */}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            disabled={isUploadingAvatar}
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </button>
                          {formData.avatar_url && (
                            <button
                              type="button"
                              onClick={handleDeleteAvatarClick}
                              className="p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload Status Badge */}
                      {isUploadingAvatar && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* File Upload Input (Hidden) */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    
                    {/* Upload Controls */}
                    {selectedFile && (
                      <div className="w-full mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-stone-500" />
                            <span className="text-sm truncate">{selectedFile.name}</span>
                          </div>
                          <span className="text-xs text-stone-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleUploadAvatar}
                            disabled={isUploadingAvatar}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                          >
                            {isUploadingAvatar ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFormData(prev => ({
                                ...prev,
                                avatar_url: currentUser?.avatar_url || ''
                              }));
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className={`px-3 py-2 border ${
                              isDarkMode 
                                ? 'border-stone-600 text-white hover:bg-stone-800' 
                                : 'border-gray-300 text-stone-700 hover:bg-gray-100'
                            } rounded-lg text-sm transition-colors`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Error */}
                    {uploadError && (
                      <div className={`w-full mt-2 rounded-lg p-2 flex items-center gap-2 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
                      </div>
                    )}
                    
                    {/* Cloudinary Info */}
                    {cloudinaryConfig?.configured && (
                      <div className={`w-full mt-3 text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        <p>Max size: {cloudinaryConfig.max_file_size_mb}MB</p>
                        <p>Formats: {cloudinaryConfig.allowed_formats.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        placeholder="+254 712 345 678"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                        Or upload a file above
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Account Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                        required
                      >
                        <option value="PHOTOGRAPHER">Photographer (Internal Tracking)</option>
                        <option value="VIDEOGRAPHY">Videographer (Internal Tracking)</option>
                        <option value="STAFF">Staff (Internal Tracking)</option>
                        <option value="ADMIN">Admin (Can Login)</option>
                      </select>
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Only ADMIN role users can log in to the admin panel. Others are for internal tracking only.
                      </p>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-stone-700'}`} />
                          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''}`} />
                        </div>
                        <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                          Active Account
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Password Section (Only for new admin users or admin role changes) */}
                {((modalMode === 'create' && formData.role === 'ADMIN') || 
                 (modalMode === 'edit' && currentUser && formData.role === 'ADMIN' && currentUser.role !== 'ADMIN')) && (
                  <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-stone-800/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {modalMode === 'create' ? 'Set Password' : 'Set Admin Password'}
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Password is required for admin users to log in
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <p className={`mt-3 text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      Password must be at least 6 characters long.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className={`rounded-lg p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-stone-800 text-white hover:bg-stone-700' 
                      : 'bg-gray-100 text-stone-900 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{modalMode === 'create' ? 'Create User' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmationModal()}
      
      {/* Activation Confirmation Modal */}
      {renderActivationConfirmationModal()}
      
      {/* Delete Avatar Modal */}
      {renderDeleteAvatarModal()}
    </div>
  );
};

export default AdminUsers;
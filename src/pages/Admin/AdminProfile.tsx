import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Clock, Shield, Camera, Save, Edit2, X, AlertCircle, Loader2, Key, Check, Upload, Image as ImageIcon, Trash2, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProfileData {
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

const AdminProfile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });

  const [deleteAvatarModal, setDeleteAvatarModal] = useState({
    isOpen: false
  });

  useEffect(() => {
    fetchCurrentAdmin();
    fetchProfile();
    fetchCloudinaryConfig();
  }, []);

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

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordError) setPasswordError('');
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update profile');
      }

      const result = await response.json();
      setProfile(result.user);
      setSuccessMessage(result.msg || 'Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to change password');
      }

      const result = await response.json();
      
      setSuccessMessage(result.msg || 'Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      fetchProfile();
      
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WEBP, SVG)');
      return;
    }

    const maxSize = cloudinaryConfig?.max_file_size_mb || 10;
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Image size should be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    
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

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      setSuccessMessage(result.msg || 'Profile picture uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchProfile();
      
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAvatarClick = () => {
    if (!profile?.avatar_public_id) {
      setError('No profile picture to delete');
      return;
    }
    setDeleteAvatarModal({ isOpen: true });
  };

  const confirmDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/profile/avatar`, {
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
      
      fetchProfile();
      
      setFormData(prev => ({
        ...prev,
        avatar_url: ''
      }));
      
      setDeleteAvatarModal({ isOpen: false });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

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
                  Are you sure you want to delete your profile picture?
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
                  <strong>Warning:</strong> This will permanently delete your profile picture from our servers.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setDeleteAvatarModal({ isOpen: false })}
              disabled={isDeletingAvatar}
              className={`w-full sm:w-auto px-4 py-2.5 border ${
                isDarkMode 
                  ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                  : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
              } rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
            >
              Keep Picture
            </button>
            <button
              onClick={confirmDeleteAvatar}
              disabled={isDeletingAvatar}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeletingAvatar ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Picture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordModal = () => {
    if (!showPasswordModal) return null;

    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-[70] p-4`}>
        <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <Key className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Change Password
                  </h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    Update your account password
                  </p>
                </div>
              </div>
              <button
                onClick={closePasswordModal}
                disabled={isSubmitting}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-gray-100'} transition-colors disabled:opacity-50`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Current Password Field with Toggle */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 pr-12 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  placeholder="Enter your current password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password Field with Toggle */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 pr-12 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password Field with Toggle */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 pr-12 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className={`rounded-lg p-3 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{passwordError}</p>
              </div>
            )}

            <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-blue-900/10 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>Note:</strong> After changing your password, you'll need to use the new password for future logins.
              </p>
            </div>
          </div>

          <div className={`p-4 sm:p-6 border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                onClick={closePasswordModal}
                disabled={isSubmitting}
                className={`px-4 py-2.5 border ${
                  isDarkMode 
                    ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                    : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
                } rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Changing...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  My Profile
                </h1>
                <p className={`mt-2 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Manage your account information and preferences
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-4 py-2.5 border ${
                        isDarkMode 
                          ? 'border-stone-600 text-white bg-stone-700 hover:bg-stone-600' 
                          : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
                      } rounded-lg text-sm font-medium transition-all`}
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2.5 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {successMessage && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
              <Check className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
            </div>
          )}

          {error && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <div className={`rounded-xl shadow-sm border p-4 sm:p-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500">
                      <img
                        src={
                          formData.avatar_url || 
                          profile?.avatar_url || 
                          `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=333&color=fff&size=128`
                        }
                        alt={profile?.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={triggerFileInput}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            disabled={isUploadingAvatar}
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </button>
                          {profile?.avatar_public_id && (
                            <button
                              onClick={handleDeleteAvatarClick}
                              className="p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-colors"
                              disabled={isDeletingAvatar}
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingAvatar || isDeletingAvatar}
                  />
                  
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
                          onClick={handleUploadAvatar}
                          disabled={isUploadingAvatar}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
                        >
                          {isUploadingAvatar ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Upload</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setFormData(prev => ({
                              ...prev,
                              avatar_url: profile?.avatar_url || ''
                            }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className={`px-3 py-2 border ${isDarkMode ? 'border-stone-600 text-white hover:bg-stone-800' : 'border-gray-300 text-stone-700 hover:bg-gray-100'} rounded-lg text-sm transition-colors`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className={`w-full mt-2 rounded-lg p-2 flex items-center gap-2 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <input
                      type="text"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL"
                      className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                    />
                  ) : (
                    <div className="text-center">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        {profile?.full_name}
                      </h2>
                      <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'} mt-1`}>
                        {profile?.role}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                        {profile?.role === 'ADMIN' ? 'Admin' : 'User'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Role</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${profile?.is_active ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                        {profile?.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Status</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.98] transition-all"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-gold-500" />
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Account Information
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          Email Address
                        </label>
                      </div>
                      <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-stone-800' : 'bg-gray-100'}`}>
                        <span className={`${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                          {profile?.email}
                        </span>
                        {isEditing && <p className="text-xs mt-1 text-stone-500">Email cannot be changed</p>}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                          placeholder="Enter your full name"
                          required
                        />
                      ) : (
                        <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-stone-800' : 'bg-gray-100'}`}>
                          <span className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>{profile?.full_name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-stone-800' : 'bg-gray-100'}`}>
                          <span className={profile?.phone ? (isDarkMode ? 'text-stone-300' : 'text-stone-700') : 'text-stone-500'}>
                            {profile?.phone || 'Not provided'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-gold-500" />
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      Account Details
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-400">Account Created</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{formatDate(profile?.created_at)}</p>
                    </div>

                    <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-400">Last Updated</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{formatDate(profile?.updated_at)}</p>
                    </div>

                    <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-400">Last Login</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{formatDateTime(profile?.last_login)}</p>
                    </div>

                    <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-400">Account Status</span>
                      </div>
                      <p className={`font-medium ${profile?.is_active ? 'text-green-500' : 'text-red-500'}`}>
                        {profile?.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {renderPasswordModal()}
      {renderDeleteAvatarModal()}
    </div>
  );
};

export default AdminProfile;
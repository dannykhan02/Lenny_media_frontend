// src/components/BulkActionsModal.tsx - UPDATED WITH BULK DELETION REASON
import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, AlertCircle, CheckCircle, Trash2, Users, 
  RefreshCw, UserPlus, UserX, Camera, Video, FileText, Search, Check
} from 'lucide-react';

interface BulkActionsModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  selectedCount: number;
  statuses: any[];
  staffUsers: any[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (action: string, data: any) => void;
}

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

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  isDarkMode,
  selectedCount,
  statuses,
  staffUsers = [],
  isSubmitting,
  onClose,
  onSubmit
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssign, setBulkAssign] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<StaffUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<StaffUser[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // NEW: Bulk deletion reason state
  const [bulkDeletionReason, setBulkDeletionReason] = useState('');
  const [deletionError, setDeletionError] = useState('');

  useEffect(() => {
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
    
    if (bulkAssign === 'unassign') {
      setSelectedUser(null);
    } else if (bulkAssign) {
      const user = processedUsers.find(u => u.id.toString() === bulkAssign);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [staffUsers, bulkAssign]);

  useEffect(() => {
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

  const handleSubmit = () => {
    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    if (bulkAction === 'update_status' && !bulkStatus) {
      alert('Please select a status');
      return;
    }

    if (bulkAction === 'assign' && !bulkAssign) {
      alert('Please select a staff member or choose "Unassign"');
      return;
    }

    if (bulkAction === 'delete') {
      setShowConfirmation(true);
      return;
    }

    const data: any = { action: bulkAction };
    
    if (bulkAction === 'update_status') {
      data.status = bulkStatus;
    } else if (bulkAction === 'assign') {
      data.assigned_to = bulkAssign === 'unassign' ? null : parseInt(bulkAssign);
    }

    onSubmit(bulkAction, data);
  };

  // UPDATED: Confirm delete with reason validation
  const confirmDelete = () => {
    if (!bulkDeletionReason.trim()) {
      setDeletionError('Please provide a reason for deletion');
      return;
    }
    
    onSubmit('delete', { deletion_reason: bulkDeletionReason });
    setShowConfirmation(false);
    setBulkDeletionReason('');
    setDeletionError('');
  };

  const getActionDescription = () => {
    if (!bulkAction) return '';

    switch (bulkAction) {
      case 'update_status':
        return `Update the status of ${selectedCount} booking(s) to ${bulkStatus ? statuses.find(s => s.name === bulkStatus)?.value : '[Select Status]'}. Clients will receive email notifications about this change.`;
      case 'assign':
        const staffName = bulkAssign === 'unassign' 
          ? 'Unassigned' 
          : selectedUser?.full_name || '[Select Staff]';
        return `Assign ${selectedCount} booking(s) to ${staffName}. This will help organize workload and track responsibilities.`;
      case 'delete':
        return `⚠️ DANGER: Permanently delete ${selectedCount} booking(s). This action cannot be undone and will remove all associated data including notes, assignments, and history.`;
      default:
        return '';
    }
  };

  const getActionIcon = () => {
    switch (bulkAction) {
      case 'update_status': return <RefreshCw className="w-5 h-5" />;
      case 'assign': return <Users className="w-5 h-5" />;
      case 'delete': return <Trash2 className="w-5 h-5" />;
      default: return null;
    }
  };

  const handleAssignUser = (user: StaffUser | null) => {
    if (user === null) {
      setBulkAssign('unassign');
      setSelectedUser(null);
    } else {
      setBulkAssign(user.id.toString());
      setSelectedUser(user);
    }
    setShowAssignModal(false);
    setUserSearch('');
  };

  const handleRemoveAssignment = () => {
    setBulkAssign('unassign');
    setSelectedUser(null);
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
        return <Users className="w-3 h-3" />;
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

  return (
    <>
      {/* Main Bulk Actions Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Bulk Actions
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                {selectedCount} booking{selectedCount !== 1 ? 's' : ''} selected
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

          {/* UPDATED: Confirmation Dialog for Delete with reason */}
          {showConfirmation && (
            <div className={`p-6 border-b ${isDarkMode ? 'border-stone-800 bg-red-900/20' : 'border-gray-200 bg-red-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Confirm Bulk Deletion
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'} mb-4`}>
                    You are about to delete {selectedCount} booking{selectedCount !== 1 ? 's' : ''}. 
                    All affected clients will receive cancellation emails with your reason.
                  </p>
                  
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Reason for Deletion *
                  </label>
                  <textarea
                    value={bulkDeletionReason}
                    onChange={(e) => {
                      setBulkDeletionReason(e.target.value);
                      setDeletionError('');
                    }}
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Explain why these bookings are being deleted..."
                    className={`w-full px-4 py-2.5 rounded-lg border mb-2 ${
                      deletionError
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : isDarkMode 
                          ? 'bg-stone-900 border-red-700 text-white' 
                          : 'bg-white border-red-300 text-stone-900'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50`}
                  />
                  {deletionError && (
                    <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {deletionError}
                    </p>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmation(false);
                        setBulkDeletionReason('');
                        setDeletionError('');
                      }}
                      disabled={isSubmitting}
                      className={`px-4 py-2 border rounded-lg font-medium ${
                        isDarkMode 
                          ? 'border-stone-600 text-stone-300 hover:bg-stone-800' 
                          : 'border-gray-300 text-stone-700 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete {selectedCount} Booking{selectedCount !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!showConfirmation && (
            <div className="p-6 space-y-6">
              
              {/* Action Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Select Action *
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    setBulkStatus('');
                    setBulkAssign('');
                    setSelectedUser(null);
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                >
                  <option value="">Choose an action...</option>
                  <option value="update_status">Update Status</option>
                  <option value="assign">Assign to Staff Member</option>
                  <option value="delete">Delete Bookings</option>
                </select>
              </div>

              {/* Status Selection */}
              {bulkAction === 'update_status' && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Update Booking Status
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Change the status for {selectedCount} selected booking{selectedCount !== 1 ? 's' : ''}.
                        Clients will receive automatic email notifications about the status change.
                      </p>
                    </div>
                  </div>
                  
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    New Status *
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
                  >
                    <option value="">Select status...</option>
                    {statuses.map(status => (
                      <option key={status.name} value={status.name}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                  
                  <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className={`text-xs flex items-center gap-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        <strong>Email Notifications:</strong> All {selectedCount} client{selectedCount !== 1 ? 's' : ''} will receive an automated email notification about this status change.
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Staff Assignment */}
              {bulkAction === 'assign' && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <Users className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Assign to Staff Member
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Assign {selectedCount} booking{selectedCount !== 1 ? 's' : ''} to a specific staff member or leave unassigned.
                        This helps organize workload and track responsibilities.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-stone-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        Assignment
                      </label>
                      {selectedUser && (
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
                    
                    {selectedUser ? (
                      <div className="flex items-center gap-3">
                        {getUserAvatar(selectedUser)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                              {getUserDisplayName(selectedUser)}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Active
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleColor(selectedUser.role)}`}>
                              {getRoleIcon(selectedUser.role)}
                              {selectedUser.role || 'Staff'}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                              {selectedUser.phone}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {selectedUser.email}
                          </p>
                        </div>
                        
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </div>
                    ) : bulkAssign === 'unassign' ? (
                      <div className="text-center py-3">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                          isDarkMode ? 'bg-stone-700 text-stone-400' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <UserX className="w-6 h-6" />
                        </div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                          ⚠️ All selected bookings will be unassigned
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          No staff member will be assigned to these bookings
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                          isDarkMode ? 'bg-stone-700 text-stone-400' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <UserX className="w-6 h-6" />
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                          No staff member selected
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gold-600 text-white hover:bg-gold-700 disabled:bg-gold-600/50'
                        : 'bg-gold-500 text-white hover:bg-gold-600 disabled:bg-gold-500/50'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {selectedUser ? 'Change Assignment' : 'Select Staff Member'}
                  </button>
                </div>
              )}

              {/* Delete Warning */}
              {bulkAction === 'delete' && (
                <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <h4 className={`font-bold mb-2 text-red-600 dark:text-red-400`}>
                        ⚠️ DANGER: Permanent Deletion
                      </h4>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        You are about to permanently delete {selectedCount} booking{selectedCount !== 1 ? 's' : ''}. 
                        This action is <strong>irreversible</strong> and will remove:
                      </p>
                      <ul className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'} list-disc list-inside space-y-1 ml-2`}>
                        <li>All client contact information</li>
                        <li>Booking dates, times, and location details</li>
                        <li>Budget ranges and service types</li>
                        <li>Client notes and preferences</li>
                        <li>Internal admin notes and assignments</li>
                        <li>Complete booking history and timestamps</li>
                      </ul>
                      <div className={`mt-4 p-3 rounded ${isDarkMode ? 'bg-red-950/50' : 'bg-red-100'}`}>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                          ⚠️ Clients will receive cancellation emails with your deletion reason.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Description */}
              {bulkAction && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-stone-800/30 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    {getActionIcon()}
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Summary
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {getActionDescription()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!showConfirmation && (
            <div className={`flex items-center justify-between p-6 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                {selectedCount} booking{selectedCount !== 1 ? 's' : ''} will be affected
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
                  onClick={handleSubmit}
                  disabled={isSubmitting || !bulkAction || 
                    (bulkAction === 'update_status' && !bulkStatus) ||
                    (bulkAction === 'assign' && !bulkAssign)}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 ${
                    bulkAction === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {getActionIcon()}
                      Apply Action
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
          <div className={`rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-stone-900 border border-stone-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-stone-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Assign Bookings
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
                Select a staff member to assign {selectedCount} booking{selectedCount !== 1 ? 's' : ''}.
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
              {/* Unassign Option */}
              <button
                onClick={() => handleAssignUser(null)}
                className={`w-full p-4 text-left transition-all border-b ${
                  bulkAssign === 'unassign'
                    ? isDarkMode
                      ? 'bg-stone-800'
                      : 'bg-gray-50'
                    : isDarkMode
                      ? 'bg-stone-900 hover:bg-stone-800'
                      : 'bg-white hover:bg-gray-50'
                } border-stone-700`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    <UserX className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Unassign All
                      </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      Remove assignment from all selected bookings
                    </p>
                  </div>
                  {bulkAssign === 'unassign' && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </button>

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
                      onClick={() => handleAssignUser(user)}
                      className={`w-full p-4 text-left transition-all ${
                        selectedUser?.id === user.id
                          ? isDarkMode
                            ? 'bg-stone-800'
                            : 'bg-gray-50'
                          : isDarkMode
                            ? 'bg-stone-900 hover:bg-stone-800'
                            : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getUserAvatar(user)}
                        
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
                          
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role || 'Staff'}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                              {user.phone}
                            </span>
                          </div>
                          
                          <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {user.email}
                          </p>
                        </div>
                        
                        {selectedUser?.id === user.id && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
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
                    if (selectedUser) {
                      handleAssignUser(selectedUser);
                    }
                  }}
                  disabled={!selectedUser && bulkAssign !== 'unassign'}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? selectedUser || bulkAssign === 'unassign'
                        ? 'bg-gold-600 text-white hover:bg-gold-700'
                        : 'bg-gold-600/50 text-white/50 cursor-not-allowed'
                      : selectedUser || bulkAssign === 'unassign'
                        ? 'bg-gold-500 text-white hover:bg-gold-600'
                        : 'bg-gold-500/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {bulkAssign === 'unassign' ? 'Unassign All' : 
                   selectedUser ? `Assign to ${selectedUser.full_name.split(' ')[0]}` : 
                   'Select User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsModal;
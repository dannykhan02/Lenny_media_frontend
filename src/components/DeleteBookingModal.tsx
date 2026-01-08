// src/components/DeleteBookingModal.tsx - COMPREHENSIVE RESPONSIVE UPDATE
import React, { useState } from 'react';
import { X, Loader2, AlertCircle, Trash2 } from 'lucide-react';

interface DeleteBookingModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  bookingName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const DeleteBookingModal: React.FC<DeleteBookingModalProps> = ({
  isOpen,
  isDarkMode,
  isLoading,
  bookingName,
  onConfirm,
  onCancel
}) => {
  const [deletionReason, setDeletionReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!deletionReason.trim()) {
      setError('Deletion reason is required');
      return;
    }
    onConfirm(deletionReason);
  };

  const handleClose = () => {
    setDeletionReason('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4">
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto`}>
        {/* Header - Responsive padding and sizing */}
        <div className={`flex items-start sm:items-center justify-between p-4 xs:p-5 sm:p-6 border-b ${
          isDarkMode ? 'border-stone-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2 xs:gap-3">
            <div className={`p-2 xs:p-2.5 sm:p-3 rounded-full flex-shrink-0 ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <Trash2 className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-lg xs:text-xl sm:text-2xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Delete Booking
              </h2>
              <p className={`text-xs xs:text-sm sm:text-base mt-0.5 xs:mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-1.5 xs:p-2 sm:p-2 rounded-lg flex-shrink-0 ml-2 ${
              isDarkMode ? 'hover:bg-stone-800 text-stone-400 active:bg-stone-700' : 'hover:bg-gray-100 text-stone-600 active:bg-gray-200'
            } transition-colors`}
            aria-label="Close"
          >
            <X className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content - Responsive spacing */}
        <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4 sm:space-y-6">
          {/* Warning Box */}
          <div className={`p-3 xs:p-4 sm:p-5 rounded-lg border-2 ${
            isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-2 xs:gap-3">
              <AlertCircle className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className={`font-bold text-base xs:text-lg sm:text-xl mb-1 xs:mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  ⚠️ Warning: Permanent Deletion
                </h4>
                <p className={`text-xs xs:text-sm sm:text-base mb-2 xs:mb-3 ${isDarkMode ? 'text-red-300/90' : 'text-red-700'}`}>
                  You are about to permanently delete the booking for <strong>{bookingName}</strong>.
                </p>
                <p className={`text-xs xs:text-sm sm:text-base mb-2 ${isDarkMode ? 'text-red-300/90' : 'text-red-700'}`}>
                  This will remove:
                </p>
                <ul className={`text-xs xs:text-sm sm:text-base ${isDarkMode ? 'text-red-300/90' : 'text-red-700'} list-disc list-inside space-y-1 xs:space-y-2 ml-2 xs:ml-4`}>
                  <li>All client information</li>
                  <li>Booking details and timestamps</li>
                  <li>Internal notes and assignments</li>
                  <li>Complete booking history</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1 xs:space-y-2 sm:space-y-3">
            <label className={`block text-sm xs:text-base sm:text-lg font-medium ${
              isDarkMode ? 'text-stone-300' : 'text-stone-700'
            }`}>
              Reason for Deletion * 
              <span className={`text-xs xs:text-sm ml-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                (will be sent to client)
              </span>
            </label>
            <textarea
              value={deletionReason}
              onChange={(e) => {
                setDeletionReason(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              rows={3}
              placeholder="Explain why this booking is being deleted (e.g., duplicate entry, client request, booking error)..."
              className={`w-full px-3 xs:px-4 py-2.5 xs:py-3 sm:py-3.5 rounded-lg border text-sm xs:text-base sm:text-lg resize-y min-h-[80px] xs:min-h-[100px] ${
                error 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : isDarkMode 
                    ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-400' 
                    : 'bg-white border-gray-300 text-stone-900 placeholder-gray-400'
              } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 transition-colors`}
            />
            {error && (
              <p className="text-red-500 text-xs xs:text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
            <p className={`text-xs xs:text-sm mt-1 xs:mt-2 flex items-center gap-1.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
              <span className="text-base">📧</span>
              <span>The client will receive an email with this deletion reason</span>
            </p>
          </div>
        </div>

        {/* COMPREHENSIVE RESPONSIVE FOOTER - Works on all mobile types */}
        <div className={`p-3 xs:p-4 sm:p-6 border-t ${
          isDarkMode ? 'border-stone-800 bg-stone-900/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          {/* Small screens (320px and below) - Stacked with large touch targets */}
          <div className="sm:hidden space-y-2.5">
            {/* Cancel Button - Full width on mobile */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 border rounded-xl font-medium text-base transition-all ${
                isDarkMode 
                  ? 'border-stone-600 text-stone-300 hover:bg-stone-800 active:bg-stone-700 active:scale-[0.98]' 
                  : 'border-gray-300 text-stone-700 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]'
              } disabled:opacity-50 disabled:active:scale-100`}
            >
              Cancel
            </button>
            
            {/* Delete Button - Full width with danger styling */}
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 active:bg-red-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-base transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Booking</span>
                </>
              )}
            </button>
          </div>

          {/* Medium to large screens (sm and above) - Side by side */}
          <div className="hidden sm:flex items-center justify-end gap-3">
            {/* Cancel Button - Compact on desktop */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`px-5 py-2.5 border rounded-lg font-medium text-sm transition-colors ${
                isDarkMode 
                  ? 'border-stone-600 text-stone-300 hover:bg-stone-800 active:bg-stone-700' 
                  : 'border-gray-300 text-stone-700 hover:bg-gray-50 active:bg-gray-100'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            
            {/* Delete Button - Compact on desktop */}
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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

          {/* EXTRA SMALL DEVICES (Below 320px) - Special handling */}
          <div className="xs:hidden mt-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <p className={`text-xs text-center ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mb-2`}>
              Confirm deletion of "{bookingName}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookingModal;
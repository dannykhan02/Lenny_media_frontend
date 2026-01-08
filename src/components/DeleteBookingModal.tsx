// src/components/DeleteBookingModal.tsx
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-lg w-full`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-stone-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Delete Booking
              </h2>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-gray-100 text-stone-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  ⚠️ Warning: Permanent Deletion
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                  You are about to permanently delete the booking for <strong>{bookingName}</strong>.
                </p>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                  This will remove:
                </p>
                <ul className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'} list-disc list-inside space-y-1 ml-2`}>
                  <li>All client information</li>
                  <li>Booking details and timestamps</li>
                  <li>Internal notes and assignments</li>
                  <li>Complete booking history</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-stone-300' : 'text-stone-700'
            }`}>
              Reason for Deletion * (will be sent to client)
            </label>
            <textarea
              value={deletionReason}
              onChange={(e) => {
                setDeletionReason(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              rows={4}
              placeholder="Explain why this booking is being deleted (e.g., duplicate entry, client request, booking error)..."
              className={`w-full px-4 py-2.5 rounded-lg border ${
                error 
                  ? 'border-red-500 ring-2 ring-red-500/20' 
                  : isDarkMode 
                    ? 'bg-stone-800 border-stone-700 text-white' 
                    : 'bg-white border-gray-300 text-stone-900'
              } focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50`}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
              📧 The client will receive an email with this deletion reason
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${
          isDarkMode ? 'border-stone-800' : 'border-gray-200'
        }`}>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`px-6 py-2.5 border rounded-lg font-medium ${
              isDarkMode 
                ? 'border-stone-600 text-stone-300 hover:bg-stone-800' 
                : 'border-gray-300 text-stone-700 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookingModal;
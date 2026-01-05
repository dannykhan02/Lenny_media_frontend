// components/DeleteConfirmationModal.tsx
import React from 'react';
import { AlertCircle, Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
  warningMessage?: string;
  additionalWarnings?: string[];
  customConfirmText?: string;
  customCancelText?: string;
  variant?: 'danger' | 'warning';
  icon?: React.ReactNode;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  isDarkMode,
  isLoading,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  warningMessage,
  additionalWarnings = [],
  customConfirmText,
  customCancelText,
  variant = 'danger',
  icon
}) => {
  if (!isOpen) return null;

  // Default warning messages based on item type
  const defaultWarnings: { [key: string]: string } = {
    booking: 'Deleting this booking will also remove any associated notes, assignment information, and status history.',
    quote: 'This will permanently delete all data associated with this quote including features and pricing information.',
    service: 'This will permanently delete all data associated with this service including features and pricing information.',
    user: 'This will permanently delete the user account and all associated data.',
    product: 'This will permanently delete the product and all associated data.',
    category: 'This will permanently delete the category and all associated data.',
    default: 'This action cannot be undone and will permanently remove all associated data.'
  };

  const mainWarning = warningMessage || defaultWarnings[itemType] || defaultWarnings.default;

  // Styling based on variant
  const variantStyles = {
    danger: {
      bg: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
      border: isDarkMode ? 'border-red-900/30' : 'border-red-200',
      text: isDarkMode ? 'text-red-300' : 'text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      bg: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
      border: isDarkMode ? 'border-yellow-900/30' : 'border-yellow-200',
      text: isDarkMode ? 'text-yellow-300' : 'text-yellow-800',
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm flex items-center justify-center z-[70] p-4`}>
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md border ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${styles.bg} flex-shrink-0`}>
              {icon || (
                variant === 'danger' ? 
                  <AlertCircle className="w-6 h-6 text-red-500" /> : 
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </h3>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Are you sure you want to delete{' '}
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  "{itemName}"
                </span>
                ?
              </p>
            </div>
          </div>
        </div>
        
        {/* Warning Section */}
        <div className="px-6 pt-4">
          <div className={`${styles.bg} ${styles.border} border rounded-lg p-3`}>
            <div className="flex gap-2">
              <AlertCircle className={`w-4 h-4 ${styles.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className={`text-xs ${styles.text}`}>
                  <strong>Warning:</strong> {mainWarning}
                </p>
                
                {/* Additional Warnings */}
                {additionalWarnings.length > 0 && (
                  <ul className={`mt-2 space-y-1 text-xs ${styles.text}`}>
                    {additionalWarnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 py-2.5 border ${
              isDarkMode 
                ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' 
                : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'
            } rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {customCancelText || `Keep ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.button} px-4 py-2.5 text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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
                <span>{customConfirmText || `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
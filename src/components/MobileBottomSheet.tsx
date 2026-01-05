// components/MobileBottomSheet.tsx
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  isDarkMode: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  maxHeight?: string;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  isDarkMode,
  title,
  subtitle,
  onClose,
  children,
  actions,
  maxHeight = '85vh'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl shadow-2xl md:hidden transition-transform duration-300 ease-out"
        style={{ maxHeight }}
      >
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} rounded-t-3xl h-full`}>
          
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} rounded-full`} />
          </div>
          
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-2 -mr-2 ${isDarkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'} active:scale-95 transition-all`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div 
            className={`overflow-y-auto px-6 py-4 ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}
            style={{ 
              maxHeight: actions 
                ? `calc(${maxHeight} - 280px)` 
                : `calc(${maxHeight} - 200px)` 
            }}
          >
            {children}
          </div>
          
          {/* Footer Actions (if provided) */}
          {actions && (
            <div className={`border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} p-4 ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileBottomSheet;
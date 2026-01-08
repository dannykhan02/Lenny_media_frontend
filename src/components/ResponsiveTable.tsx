// components/ResponsiveTable.tsx
import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, Plus, X } from 'lucide-react';

interface ResponsiveTableProps {
  isDarkMode: boolean;
  
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: ReactNode;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange?: (value: number) => void;
  
  // View Mode
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  
  // Bulk Actions
  selectedCount: number;
  onBulkActionClick?: () => void;
  bulkActionText?: string;
  
  // Table Content
  desktopView: ReactNode;
  mobileView: ReactNode;
  gridView?: ReactNode;
  
  // Loading and Empty States
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  emptyIcon?: ReactNode;
  
  // Custom elements
  headerActions?: ReactNode;
  footerContent?: ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  isDarkMode,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  showFilters,
  onToggleFilters,
  filters,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  viewMode = 'list',
  onViewModeChange,
  selectedCount,
  onBulkActionClick,
  bulkActionText = "Bulk Actions",
  desktopView,
  mobileView,
  gridView,
  isLoading,
  isEmpty,
  emptyMessage,
  emptyIcon,
  headerActions,
  footerContent,
  className = ''
}) => {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Search and Filters Bar */}
      <div className={`rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
            {/* Mobile Filters Toggle */}
            <div className="block md:hidden">
              <button
                onClick={onToggleFilters}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-stone-800 border-stone-700 text-white' 
                    : 'bg-white border-gray-300 text-stone-900'
                }`}
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
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-base ${
                  isDarkMode 
                    ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                    : 'bg-white border-gray-300 text-stone-900'
                } focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
              />
            </div>

            {/* Mobile Search (when filters are shown) */}
            {showFilters && (
              <div className="md:hidden w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-base ${
                      isDarkMode 
                        ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' 
                        : 'bg-white border-gray-300 text-stone-900'
                    } focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                  />
                </div>
              </div>
            )}

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-3 flex-wrap">
              {filters}
            </div>

            {/* Filters Section - MOBILE OPTIMIZED */}
            {showFilters && filters && (
              <div className={`md:hidden mt-4 pt-4 border-t ${
                isDarkMode ? 'border-stone-800' : 'border-gray-200'
              }`}>
                {filters}
              </div>
            )}
          </div>

          {/* Bulk Actions Button */}
          {selectedCount > 0 && onBulkActionClick && (
            <button
              onClick={onBulkActionClick}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors w-full sm:w-auto justify-center"
            >
              <span className="text-sm sm:text-base">{bulkActionText} ({selectedCount})</span>
            </button>
          )}

          {/* Header Actions */}
          {headerActions}
        </div>

        {/* Results Count & Pagination */}
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
          <div className="flex items-center gap-4">
            <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </p>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-700' 
                  : 'bg-stone-100 text-stone-700 disabled:opacity-30 hover:bg-stone-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-700' 
                  : 'bg-stone-100 text-stone-700 disabled:opacity-30 hover:bg-stone-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 md:py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && isEmpty && (
        <div className={`rounded-lg sm:rounded-xl shadow-sm border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
          {emptyIcon || (
            <div className={`h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`}>
              🔍
            </div>
          )}
          <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            No items found
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
            {emptyMessage}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isEmpty && (
        <>
          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block">
            {viewMode === 'grid' && gridView ? gridView : desktopView}
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden">
            {mobileView}
          </div>

          {/* Footer Content */}
          {footerContent}
        </>
      )}
    </div>
  );
};

export default ResponsiveTable;
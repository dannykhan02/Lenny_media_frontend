import React from 'react';
import { X, Plus, Loader2, Sparkles } from 'lucide-react';

interface Service {
  id: number;
  category: string;
  title: string;
  slug: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  price_display: string | null;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ServiceFormProps {
  isDarkMode: boolean;
  modalMode: 'create' | 'edit';
  currentService: Service | null;
  formData: {
    category: string;
    title: string;
    slug: string;
    description: string;
    price_min: string;
    price_max: string;
    price_display: string;
    features: string[];
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
    icon_name: string;
  };
  categories: Array<{ name: string; value: string }>;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFeatureChange: (index: number, value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  isDarkMode,
  modalMode,
  currentService,
  formData,
  categories,
  isSubmitting,
  onInputChange,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
        
        {/* Modal Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            {modalMode === 'create' ? 'Create New Service' : 'Edit Service'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-gray-100'}`}
          >
            <X className={`h-6 w-6 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          
          {/* Category & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                required
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={onInputChange}
                  className="w-5 h-5 text-gold-500 rounded focus:ring-2 focus:ring-gold-500"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Active
                </span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={onInputChange}
                  className="w-5 h-5 text-gold-500 rounded focus:ring-2 focus:ring-gold-500"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  Featured
                </span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              Service Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              placeholder="e.g., Wedding Photography"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              placeholder="wedding-photography"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              placeholder="Describe the service..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Min Price (KSh)
              </label>
              <input
                type="number"
                name="price_min"
                value={formData.price_min}
                onChange={onInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                placeholder="5000"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Max Price (KSh)
              </label>
              <input
                type="number"
                name="price_max"
                value={formData.price_max}
                onChange={onInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                placeholder="15000"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={onInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Price Display */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              Price Display Text
            </label>
            <input
              type="text"
              name="price_display"
              value={formData.price_display}
              onChange={onInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              placeholder="Ksh 5,000 - 15,000"
            />
          </div>

          {/* Icon Name */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
              Icon Name (optional)
            </label>
            <input
              type="text"
              name="icon_name"
              value={formData.icon_name}
              onChange={onInputChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              placeholder="camera, video, etc."
            />
          </div>

          {/* Features - Enhanced Section */}
          <div className={`rounded-xl border-2 p-5 ${isDarkMode ? 'bg-stone-800/50 border-gold-500/30' : 'bg-gold-50/50 border-gold-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`} />
                <label className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Service Features
                </label>
              </div>
              <button
                type="button"
                onClick={onAddFeature}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${isDarkMode ? 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 border border-gold-500/40' : 'bg-gold-500 text-stone-900 hover:bg-gold-400 shadow-sm'}`}
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </button>
            </div>
            
            {formData.features.length === 0 ? (
              <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-stone-700 text-stone-500' : 'border-gray-300 text-gray-500'}`}>
                <Sparkles className={`h-8 w-8 mx-auto mb-2 opacity-50 ${isDarkMode ? 'text-stone-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium">No features added yet</p>
                <p className="text-xs mt-1">Click "Add Feature" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-3 items-start p-3 rounded-lg transition-all ${isDarkMode ? 'bg-stone-900/50 hover:bg-stone-900' : 'bg-white hover:shadow-md'}`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${isDarkMode ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-500 text-stone-900'}`}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => onFeatureChange(index, e.target.value)}
                      className={`flex-1 px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900 placeholder-gray-400'} focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
                      placeholder={`Feature ${index + 1}: e.g., High-resolution photos, Professional editing...`}
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveFeature(index)}
                        className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                        title="Remove feature"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {formData.features.length > 0 && (
              <div className={`mt-3 text-xs ${isDarkMode ? 'text-stone-500' : 'text-gray-600'}`}>
                <span className="font-medium">{formData.features.length}</span> feature{formData.features.length !== 1 ? 's' : ''} added
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className={`flex gap-3 pt-6 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-colors ${isDarkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-gray-100 text-stone-900 hover:bg-gray-200'} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gold-500 text-stone-900 rounded-lg font-bold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{modalMode === 'create' ? 'Create Service' : 'Update Service'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
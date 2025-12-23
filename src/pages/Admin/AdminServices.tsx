import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Loader2, Eye, EyeOff, Camera, Video, FileText, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import ServiceForm from '../../components/ServiceForm';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

const AdminServices: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{name: string; value: string}[]>([]);
  
  // New state for delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null as number | null,
    serviceName: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    slug: '',
    description: '',
    price_min: '',
    price_max: '',
    price_display: '',
    features: [''],
    is_active: true,
    is_featured: false,
    display_order: 0,
    icon_name: ''
  });

  // Responsive state
  const [showFilters, setShowFilters] = useState(false);
  const [mobileSheet, setMobileSheet] = useState({
    isOpen: false,
    service: null as Service | null
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Not authenticated');
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
      navigate('/admin/login');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/service-categories`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
      
      // Set default category if available
      if (data.categories && data.categories.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: data.categories[0].name
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      // Fallback categories in case of error
      setCategories([
        { name: 'PHOTOGRAPHY', value: 'photography' },
        { name: 'VIDEOGRAPHY', value: 'videography' }
      ]);
      setFormData(prev => ({ ...prev, category: 'PHOTOGRAPHY' }));
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/services`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(service => service.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(service => !service.is_active);
    }

    setFilteredServices(filtered);
  };

  const handleOpenModal = (mode: 'create' | 'edit', service?: Service) => {
    setModalMode(mode);
    if (mode === 'edit' && service) {
      setCurrentService(service);
      setFormData({
        category: service.category,
        title: service.title,
        slug: service.slug,
        description: service.description || '',
        price_min: service.price_min?.toString() || '',
        price_max: service.price_max?.toString() || '',
        price_display: service.price_display || '',
        features: service.features.length > 0 ? service.features : [''],
        is_active: service.is_active,
        is_featured: service.is_featured,
        display_order: service.display_order,
        icon_name: service.icon_name || ''
      });
    } else {
      setCurrentService(null);
      setFormData({
        category: categories.length > 0 ? categories[0].name : '',
        title: '',
        slug: '',
        description: '',
        price_min: '',
        price_max: '',
        price_display: '',
        features: [''],
        is_active: true,
        is_featured: false,
        display_order: 0,
        icon_name: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentService(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !currentService) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        display_order: parseInt(formData.display_order.toString())
      };

      const url = modalMode === 'create' 
        ? `${API_URL}/services`
        : `${API_URL}/services/${currentService?.id}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Operation failed');
      }

      setSuccessMessage(`Service ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      handleCloseModal();
      fetchServices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (serviceId: number, serviceName: string) => {
    setDeleteModal({
      isOpen: true,
      serviceId,
      serviceName
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.serviceId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/services/${deleteModal.serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete service');

      setSuccessMessage('Service deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close any open mobile sheet
      if (mobileSheet.isOpen) {
        closeMobileSheet();
      }
      
      setDeleteModal({ isOpen: false, serviceId: null, serviceName: '' });
      fetchServices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`${API_URL}/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !service.is_active })
      });

      if (!response.ok) throw new Error('Failed to update service status');

      setSuccessMessage('Service status updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Mobile sheet handlers
  const openMobileSheet = (service: Service) => {
    setMobileSheet({ isOpen: true, service });
    document.body.style.overflow = 'hidden';
  };

  const closeMobileSheet = () => {
    setMobileSheet({ isOpen: false, service: null });
    document.body.style.overflow = '';
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
                Delete Service
              </h3>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Are you sure you want to delete <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>"{deleteModal.serviceName}"</span>?
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
                <strong>Warning:</strong> This will permanently delete all data associated with this service including features and pricing information.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={() => setDeleteModal({ isOpen: false, serviceId: null, serviceName: '' })}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2.5 border ${isDarkMode ? 'border-stone-600 text-stone-300 bg-stone-700 hover:bg-stone-600' : 'border-gray-300 text-stone-700 bg-white hover:bg-gray-50'} rounded-lg text-sm font-medium transition-all disabled:opacity-50`}
          >
            Keep Service
          </button>
          <button
            onClick={confirmDelete}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span>Delete Service</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
  // Render Mobile Bottom Sheet
  const renderMobileBottomSheet = () => {
    if (!mobileSheet.isOpen || !mobileSheet.service) return null;
    const service = mobileSheet.service;
    
    return (
      <>
        <div
          className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300`}
          onClick={closeMobileSheet}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl shadow-2xl md:hidden transition-transform duration-300 ease-out"
          style={{ maxHeight: '85vh' }}
        >
          <div className={`${isDarkMode ? 'bg-stone-900/50' : 'bg-white'} rounded-t-3xl`}>
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-12 h-1.5 ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} rounded-full`} />
            </div>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                    {service.title}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                    {service.category}
                  </p>
                </div>
                <button
                  onClick={closeMobileSheet}
                  className={`p-2 -mr-2 ${isDarkMode ? 'text-stone-400 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'} active:scale-95 transition-all`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className={`overflow-y-auto px-6 py-4 space-y-4 ${isDarkMode ? 'bg-stone-900/50' : 'bg-white'}`} style={{ maxHeight: 'calc(85vh - 280px)' }}>
              {/* Service Details */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {service.category.includes('PHOTO') ? (
                    <Camera className="w-5 h-5 text-gold-500" />
                  ) : (
                    <Video className="w-5 h-5 text-gold-500" />
                  )}
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Service Information
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {service.title}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-700'}`}>
                      {service.category}
                    </span>
                  </div>
                  {service.description && (
                    <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      {service.description}
                    </p>
                  )}
                </div>
                
                {/* Price Display */}
                {service.price_display && (
                  <div className="mt-4">
                    <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-1`}>Price</p>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                      {service.price_display}
                    </span>
                  </div>
                )}

                {/* Status */}
                <div className="mt-4">
                  <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-1`}>Status</p>
                  <div className="flex items-center gap-2">
                    {service.is_active ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${service.is_active ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'} p-4 space-y-2 ${isDarkMode ? 'bg-stone-900/50' : 'bg-white'}`}>
              <button
                onClick={() => {
                  closeMobileSheet();
                  handleOpenModal('edit', service);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-stone-300 bg-stone-700 hover:bg-stone-600' : 'text-stone-700 bg-gray-100 hover:bg-gray-200'} rounded-xl active:scale-[0.98] transition-all`}
              >
                <Edit2 className="w-4 h-4" />
                Edit Service
              </button>
              <button
                onClick={() => handleDeleteClick(service.id, service.title)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Service
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (isLoading && !user) {
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
      <AdminNavbar user={user} onCollapsedChange={setSidebarCollapsed} />
      
      <main className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 pt-20 lg:pt-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Services Management
            </h1>
            <p className={`mt-2 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              Manage all photography and videography services
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
              <Check className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className={`rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                {/* Mobile Filters Toggle */}
                <div className="block md:hidden">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
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
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  />
                </div>

                {/* Mobile Search (when filters are shown) */}
                {showFilters && (
                  <div className="md:hidden w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                      />
                    </div>
                  </div>
                )}

                {/* Desktop Filters */}
                <div className="hidden md:flex gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Mobile Filters (when shown) */}
                {showFilters && (
                  <div className="md:hidden grid grid-cols-2 gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Create Button */}
              <button
                onClick={() => handleOpenModal('create')}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gold-500 text-stone-900 rounded-lg font-bold hover:bg-gold-400 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="text-sm sm:text-base">Create Service</span>
              </button>
            </div>

            {/* Results Count */}
            <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Showing {filteredServices.length} of {services.length} services
              </p>
            </div>
          </div>

          {/* Services Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 md:py-16">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-gold-500 animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className={`rounded-lg sm:rounded-xl shadow-sm border p-8 sm:p-12 text-center ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
              <FileText className={`h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>No services found</h3>
              <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first service'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop/Tablet Grid View */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredServices.map((service) => (
                  <div key={service.id} className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'}`}>
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}>
                          {service.category.includes('PHOTO') ? (
                            <Camera className="h-5 w-5 text-gold-500" />
                          ) : (
                            <Video className="h-5 w-5 text-gold-500" />
                          )}
                        </div>
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {service.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex gap-2">
                        {service.is_featured && (
                          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-gold-900/30' : 'bg-gold-100'}`}>
                            <Star className="h-4 w-4 text-gold-500" fill="currentColor" />
                          </div>
                        )}
                        <button
                          onClick={() => toggleServiceStatus(service)}
                          className={`p-1.5 rounded-lg transition-colors ${service.is_active ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') : (isDarkMode ? 'bg-red-900/30' : 'bg-red-100')}`}
                        >
                          {service.is_active ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {service.title}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {service.description}
                      </p>
                    )}

                    {/* Price */}
                    {service.price_display && (
                      <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                          {service.price_display}
                        </p>
                      </div>
                    )}

                    {/* Features */}
                    {service.features.length > 0 && (
                      <div className="mb-4">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          Features
                        </p>
                        <div className="space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-gold-500 flex-shrink-0" />
                              <span className={`text-xs ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                {feature}
                              </span>
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              +{service.features.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
                      <button
                        onClick={() => handleOpenModal('edit', service)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-100 text-stone-900 hover:bg-stone-200'}`}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service.id, service.title)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => openMobileSheet(service)}
                    className={`w-full ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-gray-200'} rounded-lg border p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left min-h-[120px] flex flex-col justify-between`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} truncate`}>
                          {service.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                          {service.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {service.is_featured && (
                          <div className={`p-1 rounded ${isDarkMode ? 'bg-gold-900/30' : 'bg-gold-100'}`}>
                            <Star className="h-3.5 w-3.5 text-gold-500" fill="currentColor" />
                          </div>
                        )}
                        {service.is_active ? (
                          <Eye className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {service.price_display && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Price</span>
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                            {service.price_display}
                          </span>
                        </div>
                      )}
                      {service.features.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Features</span>
                          <span className="text-xs px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded">
                            {service.features.length} features
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Service Form Modal */}
      {showModal && (
        <ServiceForm
          isDarkMode={isDarkMode}
          modalMode={modalMode}
          currentService={currentService}
          formData={formData}
          categories={categories}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onFeatureChange={handleFeatureChange}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmationModal()}
      
      {/* Mobile Bottom Sheet */}
      {renderMobileBottomSheet()}
    </div>
  );
};

export default AdminServices;
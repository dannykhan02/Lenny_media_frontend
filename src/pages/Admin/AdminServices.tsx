// pages/Admin/AdminServices.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Loader2, Eye, EyeOff, Camera, Video, FileText, Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminNavbar from '../../components/AdminNavbar';
import ServiceForm from '../../components/ServiceForm';
import { useNavigate } from 'react-router-dom';
import MobileBottomSheet from '../../components/MobileBottomSheet';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import ResponsiveTable from '../../components/ResponsiveTable';

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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [perPage, setPerPage] = useState(20);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null as number | null,
    serviceName: ''
  });

  // Mobile sheet state
  const [mobileSheet, setMobileSheet] = useState({
    isOpen: false,
    service: null as Service | null
  });

  // Filters state
  const [showFilters, setShowFilters] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    fetchCurrentUser();
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [currentPage, perPage]);

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
      
      if (data.categories && data.categories.length > 0) {
        setCategoryFilter('all');
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setCategories([
        { name: 'PHOTOGRAPHY', value: 'photography' },
        { name: 'VIDEOGRAPHY', value: 'videography' }
      ]);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`${API_URL}/admin/services?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only admins can access services');
        }
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      setServices(data.services || []);
      setTotalPages(data.pages || 1);
      setTotalServices(data.total || 0);
      
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
      // Populate form data when editing
      setFormData({
        category: service.category,
        title: service.title,
        slug: service.slug,
        description: service.description || '',
        price_min: service.price_min?.toString() || '',
        price_max: service.price_max?.toString() || '',
        price_display: service.price_display || '',
        features: service.features,
        is_active: service.is_active,
        is_featured: service.is_featured,
        display_order: service.display_order,
        icon_name: service.icon_name || ''
      });
    } else {
      setCurrentService(null);
      // Reset form data for create mode
      setFormData({
        category: categories.length > 0 ? categories[0].name.toUpperCase() : '', // Set default category
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
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => {
      const newFeatures = prev.features.filter((_, i) => i !== index);
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields before sending
      if (!formData.category || !formData.title) {
        setError('Category and title are required');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        category: formData.category.toUpperCase(), // Ensure category is uppercase
        features: formData.features.filter((f: string) => f.trim() !== ''),
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
        console.error('Server error details:', errorData);
        const errorMessage = errorData.message || errorData.error || JSON.stringify(errorData) || 'Operation failed';
        throw new Error(errorMessage);
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

  const formatPriceDisplay = (price: string | null) => {
    if (!price) return '';
    
    if (price.toLowerCase().includes('ksh')) {
      return price;
    }
    
    const dollarMatch = price.match(/\$?(\d+[,\d]*(\.\d+)?)/);
    if (dollarMatch) {
      const amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        return `Ksh ${amount.toLocaleString()}`;
      }
    }
    
    return price;
  };

  const formatPriceRange = (priceMin: number | null, priceMax: number | null) => {
    if (priceMin === null && priceMax === null) return '';
    
    const min = priceMin !== null ? priceMin.toLocaleString() : '';
    const max = priceMax !== null ? priceMax.toLocaleString() : '';
    
    if (min && max) {
      return `Ksh ${min} - ${max}`;
    } else if (min) {
      return `Ksh ${min}+`;
    } else if (max) {
      return `Up to Ksh ${max}`;
    }
    
    return '';
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

  const renderFilters = () => (
    <>
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
      >
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat.name} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={`px-4 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-gray-300 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent`}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'} border ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
        <thead className={`${isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-gray-50 text-stone-700'}`}>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Service
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Features
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
          {filteredServices.map((service) => {
            const hasPriceRange = service.price_min !== null || service.price_max !== null;
            
            return (
              <tr key={service.id} className={`${isDarkMode ? 'hover:bg-stone-800/50' : 'hover:bg-gray-50'}`}>
                <td className="px-4 py-4">
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                      {service.title}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                      {service.slug}
                    </div>
                    {service.description && (
                      <div className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mt-1 line-clamp-1`}>
                        {service.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={`font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                    {service.category}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {service.price_display && (
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                      {formatPriceDisplay(service.price_display)}
                    </div>
                  )}
                  {hasPriceRange && (
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                      {formatPriceRange(service.price_min, service.price_max)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {service.is_featured && (
                      <Star className="w-4 h-4 text-gold-500" fill="currentColor" />
                    )}
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className={`p-1 rounded transition-colors ${service.is_active ? (isDarkMode ? 'text-green-500 hover:text-green-400' : 'text-green-600 hover:text-green-700') : (isDarkMode ? 'text-red-500 hover:text-red-400' : 'text-red-600 hover:text-red-700')}`}
                    >
                      {service.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {service.features.length} features
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal('edit', service)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-stone-400 hover:text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-gray-100'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(service.id, service.title)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {filteredServices.map((service) => {
        const hasPriceRange = service.price_min || service.price_max;
        
        return (
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
                    <Eye className="h-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 h-4 text-red-500" />
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

            {/* Price Information */}
            <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-stone-800' : 'border-gray-200'}`}>
              {/* Price Display */}
              {service.price_display && (
                <div className="mb-2">
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-600'} mb-1.5`}>Price Display</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                    {formatPriceDisplay(service.price_display)}
                  </p>
                </div>
              )}
              
              {/* Price Range */}
              {hasPriceRange && (
                <div className={service.price_display ? 'mt-4 pt-4 border-t dark:border-stone-800 border-gray-200' : ''}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-600'} mb-1.5`}>Price Range</p>
                  <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                    {formatPriceRange(service.price_min, service.price_max)}
                  </p>
                </div>
              )}
            </div>

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
        );
      })}
    </div>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
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
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {service.category}
                </p>
                {service.is_featured && (
                  <>
                    <span className="text-stone-400">•</span>
                    <Star className="h-3.5 w-3.5 text-gold-500" fill="currentColor" />
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={`p-1 rounded ${service.is_active ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') : (isDarkMode ? 'bg-red-900/30' : 'bg-red-100')}`}>
                {service.is_active ? (
                  <Eye className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {service.price_display && (
              <div className={`flex items-center justify-between ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-100'} px-3 py-2.5 rounded-lg`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Price</span>
                <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                  {formatPriceDisplay(service.price_display)}
                </span>
              </div>
            )}
            {(service.price_min || service.price_max) && (
              <div className={`flex items-center justify-between ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-100'} px-3 py-2.5 rounded-lg`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Price Range</span>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                  {formatPriceRange(service.price_min, service.price_max)}
                </span>
              </div>
            )}
            {service.features.length > 0 && (
              <div className={`flex items-center justify-between ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-100'} px-3 py-2.5 rounded-lg`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Features</span>
                <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-white text-stone-600'} rounded border ${isDarkMode ? 'border-stone-600' : 'border-gray-300'}`}>
                  {service.features.length} features
                </span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const getEmptyMessage = () => {
    if (searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') {
      return 'Try adjusting your filters or search terms';
    }
    return 'No services have been created yet';
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('PHOTO')) {
      return <Camera className="w-4 h-4 text-gold-500" />;
    } else if (category.includes('VIDEO')) {
      return <Video className="w-4 h-4 text-gold-500" />;
    }
    return null;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Services Management
                </h1>
                <p className={`mt-2 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                  Manage all photography and videography services
                </p>
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                  title="List View"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? (isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-900') : (isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-gray-100')}`}
                  title="Grid View"
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className={`w-2 h-2 ${viewMode === 'grid' ? (isDarkMode ? 'bg-white' : 'bg-stone-900') : (isDarkMode ? 'bg-stone-400' : 'bg-stone-600')}`} />
                    <div className={`w-2 h-2 ${viewMode === 'grid' ? (isDarkMode ? 'bg-white' : 'bg-stone-900') : (isDarkMode ? 'bg-stone-400' : 'bg-stone-600')}`} />
                    <div className={`w-2 h-2 ${viewMode === 'grid' ? (isDarkMode ? 'bg-white' : 'bg-stone-900') : (isDarkMode ? 'bg-stone-400' : 'bg-stone-600')}`} />
                    <div className={`w-2 h-2 ${viewMode === 'grid' ? (isDarkMode ? 'bg-white' : 'bg-stone-900') : (isDarkMode ? 'bg-stone-400' : 'bg-stone-600')}`} />
                  </div>
                </button>
              </div>
            </div>
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

          {/* Responsive Table Component */}
          <ResponsiveTable
            isDarkMode={isDarkMode}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search services..."
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            filters={renderFilters()}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalServices}
            onPageChange={setCurrentPage}
            itemsPerPage={perPage}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedCount={0}
            desktopView={viewMode === 'list' ? renderDesktopView() : renderGridView()}
            mobileView={renderMobileView()}
            gridView={renderGridView()}
            isLoading={isLoading}
            isEmpty={filteredServices.length === 0}
            emptyMessage={getEmptyMessage()}
            headerActions={
              <button
                onClick={() => handleOpenModal('create')}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gold-500 text-stone-900 rounded-lg font-bold hover:bg-gold-400 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="text-sm sm:text-base">Create Service</span>
              </button>
            }
          />
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
          onAddFeature={handleAddFeature}
          onRemoveFeature={handleRemoveFeature}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        isDarkMode={isDarkMode}
        isLoading={isLoading}
        itemName={deleteModal.serviceName}
        itemType="service"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, serviceId: null, serviceName: '' })}
        warningMessage="This will permanently delete all data associated with this service including features and pricing information."
      />
      
      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        isOpen={mobileSheet.isOpen}
        isDarkMode={isDarkMode}
        title={mobileSheet.service?.title || ''}
        subtitle={mobileSheet.service?.category}
        onClose={closeMobileSheet}
        actions={
          <div className="space-y-3">
            <button
              onClick={() => {
                closeMobileSheet();
                if (mobileSheet.service) handleOpenModal('edit', mobileSheet.service);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold ${isDarkMode ? 'text-stone-300 bg-stone-800 hover:bg-stone-700' : 'text-stone-700 bg-gray-100 hover:bg-gray-200'} rounded-xl active:scale-[0.98] transition-all`}
            >
              <Edit2 className="w-4 h-4" />
              Edit Service
            </button>
            <button
              onClick={() => {
                closeMobileSheet();
                if (mobileSheet.service) handleDeleteClick(mobileSheet.service.id, mobileSheet.service.title);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Service
            </button>
          </div>
        }
      >
        {mobileSheet.service && (
          <div className="space-y-4">
            {/* Service Details */}
            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(mobileSheet.service.category)}
                  <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    {mobileSheet.service.category}
                  </span>
                </div>
                {mobileSheet.service.description && (
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                    {mobileSheet.service.description}
                  </p>
                )}
              </div>
              
              {/* Status */}
              <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Status</p>
                  <div className="flex items-center gap-2">
                    {mobileSheet.service.is_active ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${mobileSheet.service.is_active ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                      {mobileSheet.service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured */}
              {mobileSheet.service.is_featured && (
                <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Featured</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" fill="currentColor" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gold-400' : 'text-gold-600'}`}>
                        Yes
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Section */}
            {(mobileSheet.service.price_display || mobileSheet.service.price_min || mobileSheet.service.price_max) && (
              <div className={`rounded-xl p-5 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Pricing
                  </h3>
                </div>
                
                {/* Price Display */}
                {mobileSheet.service.price_display && (
                  <div className="mb-4">
                    <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-2`}>
                      Price Display
                    </p>
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                      {formatPriceDisplay(mobileSheet.service.price_display)}
                    </span>
                  </div>
                )}
                
                {/* Price Range */}
                {(mobileSheet.service.price_min || mobileSheet.service.price_max) && (
                  <div className={`${mobileSheet.service.price_display ? 'pt-4 border-t' : ''} ${isDarkMode ? 'border-stone-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-500'} mb-2`}>
                      Price Range
                    </p>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gold-600'}`}>
                      {formatPriceRange(mobileSheet.service.price_min, mobileSheet.service.price_max)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features Section */}
            {mobileSheet.service.features.length > 0 && (
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                    Features
                  </h3>
                  <span className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-600'} rounded`}>
                    {mobileSheet.service.features.length} features
                  </span>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {mobileSheet.service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
};

export default AdminServices;
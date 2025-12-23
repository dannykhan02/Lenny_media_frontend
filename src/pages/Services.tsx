import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Check, 
  ArrowRight, 
  Star, 
  AlertCircle, 
  Loader2, 
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Define the service interface
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

interface Category {
  name: string;
  value: string;
}

interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  isFeatured: boolean;
  sortBy: 'display_order' | 'title' | 'price_min' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Services: React.FC = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: number]: boolean }>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    isFeatured: false,
    sortBy: 'display_order',
    sortOrder: 'asc'
  });
  
  // Initialize filters from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') as FilterState['sortBy'] || 'display_order';
    const sortOrder = searchParams.get('sortOrder') as FilterState['sortOrder'] || 'asc';
    
    setFilters({
      search,
      category,
      minPrice: '',
      maxPrice: '',
      isFeatured: featured,
      sortBy,
      sortOrder
    });
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch services on initial load
  useEffect(() => {
    fetchServices();
  }, []);

  // Apply filters whenever services or filter state changes
  useEffect(() => {
    applyFilters();
  }, [services, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/service-categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      // Fallback to default categories
      setCategories([
        { name: 'PHOTOGRAPHY', value: 'photography' },
        { name: 'VIDEOGRAPHY', value: 'videography' }
      ]);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = `${API_URL}/services`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      const servicesData = data.services || [];
      
      setServices(servicesData);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching services');
      console.error('Error fetching services:', err);
      
      // Fallback to empty arrays
      setServices([]);
      setFilteredServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Search filter - improved to search in title, description, and features
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter(service => {
        const titleMatch = service.title.toLowerCase().includes(searchLower);
        const descriptionMatch = service.description?.toLowerCase().includes(searchLower) || false;
        const featuresMatch = service.features.some(feature => 
          feature.toLowerCase().includes(searchLower)
        );
        const categoryMatch = service.category.toLowerCase().includes(searchLower);
        
        return titleMatch || descriptionMatch || featuresMatch || categoryMatch;
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Featured filter
    if (filters.isFeatured) {
      filtered = filtered.filter(service => service.is_featured);
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      
      filtered = filtered.filter(service => {
        const serviceMin = service.price_min || 0;
        return serviceMin >= min && serviceMin <= max;
      });
    }

    // Sorting
    filtered.sort((a: Service, b: Service) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price_min':
          aValue = a.price_min || 0;
          bValue = b.price_min || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'display_order':
        default:
          aValue = a.display_order;
          bValue = b.display_order;
          break;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredServices(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL without page reload
    const searchParams = new URLSearchParams();
    if (newFilters.search) searchParams.set('search', newFilters.search);
    if (newFilters.category !== 'all') searchParams.set('category', newFilters.category);
    if (newFilters.isFeatured) searchParams.set('featured', 'true');
    if (newFilters.sortBy !== 'display_order') searchParams.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder !== 'asc') searchParams.set('sortOrder', newFilters.sortOrder);
    
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      isFeatured: false,
      sortBy: 'display_order',
      sortOrder: 'asc'
    });
    navigate({ search: '' }, { replace: true });
  };

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const toggleFeatures = (serviceId: number) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Format price display
  const formatPriceDisplay = (service: Service) => {
    if (service.price_display) {
      return service.price_display;
    }
    
    if (service.price_min && service.price_max) {
      return `Ksh ${service.price_min.toLocaleString()} – ${service.price_max.toLocaleString()}`;
    }
    
    if (service.price_min) {
      return `From Ksh ${service.price_min.toLocaleString()}`;
    }
    
    return 'Custom Quote';
  };

  const renderServiceCard = (service: Service) => {
    const hasFeatures = service.features && service.features.length > 0;
    const displayedFeatures = expandedFeatures[service.id] 
      ? service.features 
      : (service.features || []).slice(0, 4);
    const hasMoreFeatures = hasFeatures && service.features.length > 4;
    const isExpanded = expandedFeatures[service.id];

    return (
      <div key={service.id} className={`rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border ${isDarkMode ? 'bg-stone-800 border-stone-700 hover:border-gold-500/30' : 'bg-white border-stone-100 hover:border-gold-500/30'} flex flex-col group relative overflow-hidden`}>
        {service.is_featured && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-gold-500 to-gold-600 text-stone-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3" fill="currentColor" /> FEATURED
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-300 to-gold-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        
        <h3 className={`font-serif font-bold text-2xl mb-2 group-hover:text-gold-600 transition-colors ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
          {service.title}
        </h3>
        
        {service.description && (
          <p className={`mb-6 text-sm leading-relaxed ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
            {service.description}
          </p>
        )}
        
        {/* Features List */}
        <div className="mb-6 flex-grow">
          {hasFeatures ? (
            <>
              <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
                <Check className="w-4 h-4 text-gold-600" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  What's Included
                </span>
              </div>
              <div className="space-y-2.5">
                {displayedFeatures.map((feature, i) => (
                  <div key={i} className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                      <Check className="w-3 h-3 text-gold-600" strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              
              {hasMoreFeatures && (
                <button
                  onClick={() => toggleFeatures(service.id)}
                  className={`flex items-center gap-2 mt-4 text-sm font-semibold transition-colors ${isDarkMode ? 'text-gold-400 hover:text-gold-300' : 'text-gold-600 hover:text-gold-700'}`}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {service.features.length - 4} More Features
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-stone-700/50' : 'bg-stone-50'}`}>
              <p className={`text-sm italic ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Contact us for detailed package information
              </p>
            </div>
          )}
        </div>

        <div className={`pt-6 border-t ${isDarkMode ? 'border-stone-700' : 'border-stone-100'} mt-auto`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-400'}`}>Starting from</p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {formatPriceDisplay(service)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to={`/booking?service=${encodeURIComponent(service.title)}&category=${encodeURIComponent(service.category)}&id=${service.id}&slug=${service.slug}`}
              className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all duration-300 shadow-lg ${isDarkMode ? 'bg-stone-700 text-white hover:bg-stone-600' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
            >
              Book Now
            </Link>
            <Link 
              to={`/quote?service=${encodeURIComponent(service.title)}&category=${encodeURIComponent(service.category)}&id=${service.id}&slug=${service.slug}`}
              className={`flex items-center justify-center gap-2 border-2 font-bold py-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'border-stone-600 bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white' : 'border-gold-500 bg-white text-stone-900 hover:bg-gold-50 hover:shadow-md'}`}
            >
              Get Quote
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className={`mb-8 rounded-2xl p-6 shadow-sm border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gold-500" />
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Filter Services
          </h3>
          {filteredServices.length !== services.length && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-gold-500/20 text-gold-300' : 'bg-gold-100 text-gold-700'}`}>
              {filteredServices.length} of {services.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-stone-700' : 'hover:bg-stone-100'}`}
        >
          {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Search Bar - Always visible */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search services by name, description, or features..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white placeholder-stone-500' : 'bg-white border-stone-200 text-stone-900'} focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-stone-600' : 'hover:bg-stone-100'}`}
            >
              <X className="h-4 w-4 text-stone-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Collapsible filters */}
      {showFilters && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-stone-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Min Price (Ksh)
              </label>
              <input
                type="number"
                placeholder="Minimum"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-stone-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Max Price (Ksh)
              </label>
              <input
                type="number"
                placeholder="Maximum"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-stone-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
              />
            </div>
            
            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
                  className={`flex-1 px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-stone-300 text-stone-900'} focus:ring-2 focus:ring-gold-500`}
                >
                  <option value="display_order">Default Order</option>
                  <option value="title">Name</option>
                  <option value="price_min">Price</option>
                  <option value="created_at">Date Added</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className={`px-3 py-2.5 rounded-lg border ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white hover:bg-stone-600' : 'bg-white border-stone-300 text-stone-900 hover:bg-stone-50'}`}
                  title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Checkbox filters */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isFeatured}
                onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                className="w-4 h-4 text-gold-500 rounded focus:ring-gold-500 focus:ring-offset-0"
              />
              <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Show Featured Only
              </span>
            </label>
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'text-stone-300 hover:text-white hover:bg-stone-700' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading && !services.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
          <p className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} pt-36 px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-stone-900' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Unable to Load Services
              </h2>
              <p className={`mb-6 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                {error}
              </p>
              <button
                onClick={fetchServices}
                className="px-6 py-3 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Hero Header */}
      <div className={`pt-36 pb-24 px-4 overflow-hidden relative ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
        <div className="absolute inset-0">
          <div className={`absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 ${isDarkMode ? 'bg-gradient-to-r from-gold-600/10 to-transparent' : 'bg-gradient-to-r from-gold-400/20 to-transparent'}`}></div>
          <div className={`absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-100/50'}`}></div>
          <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-stone-900 mb-8 shadow-lg shadow-gold-500/30 animate-[fadeIn_1s] border border-gold-300 transform hover:scale-105 transition-transform duration-300">
            <Star className="w-5 h-5 fill-stone-900" strokeWidth={2.5} />
            <span className="font-bold tracking-widest uppercase text-xs">Premium Quality Services</span>
          </div>

          <h1 className={`font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Services & Investment
          </h1>
          <p className={`max-w-2xl mx-auto text-xl leading-relaxed font-light ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            Transparent pricing for world-class artistry. Choose the package that fits your vision.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Filters */}
        {renderFilters()}
        
        {/* Services Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className={`rounded-3xl p-12 text-center ${isDarkMode ? 'bg-stone-900' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-stone-700' : 'border-stone-200'}`}>
            <Search className={`h-16 w-16 mx-auto mb-6 ${isDarkMode ? 'text-stone-700' : 'text-stone-300'}`} />
            <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              No Services Found
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
              {filters.search || filters.category !== 'all' || filters.isFeatured 
                ? 'Try adjusting your filters or search term'
                : 'No services are currently available'}
            </p>
            {(filters.search || filters.category !== 'all' || filters.isFeatured || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-3 px-8 py-3 bg-gold-500 text-stone-900 font-bold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-24">
            {/* Photography Section */}
            {filteredServices.filter(s => s.category.toUpperCase() === 'PHOTOGRAPHY').length > 0 && (
              <div>
                <div className="flex items-center gap-6 mb-12">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <Camera className="h-8 w-8 text-gold-500" />
                  </div>
                  <div>
                    <h2 className={`font-serif text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Photography</h2>
                    <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-500'} text-lg`}>
                      {filteredServices.filter(s => s.category.toUpperCase() === 'PHOTOGRAPHY').length} services available
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredServices
                    .filter(s => s.category.toUpperCase() === 'PHOTOGRAPHY')
                    .map(renderServiceCard)}
                </div>
              </div>
            )}
            
            {/* Videography Section */}
            {filteredServices.filter(s => s.category.toUpperCase() === 'VIDEOGRAPHY').length > 0 && (
              <div>
                <div className="flex items-center gap-6 mb-12">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-900 border-stone-800'}`}>
                    <Video className="h-8 w-8 text-gold-500" />
                  </div>
                  <div>
                    <h2 className={`font-serif text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Videography</h2>
                    <p className={`${isDarkMode ? 'text-stone-400' : 'text-stone-500'} text-lg`}>
                      {filteredServices.filter(s => s.category.toUpperCase() === 'VIDEOGRAPHY').length} services available
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredServices
                    .filter(s => s.category.toUpperCase() === 'VIDEOGRAPHY')
                    .map(renderServiceCard)}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Featured Services Section */}
        {!filters.isFeatured && filteredServices.filter(s => s.is_featured).length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-white mb-6 shadow-lg shadow-gold-500/30">
                <Star className="w-5 h-5 fill-white" strokeWidth={2.5} />
                <span className="font-bold tracking-widest uppercase text-xs">Featured Services</span>
              </div>
              <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Most Popular Services
              </h2>
              <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                Check out our most requested and highly rated services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices
                .filter(s => s.is_featured)
                .slice(0, 3)
                .map(renderServiceCard)}
            </div>
            <div className="text-center mt-8">
              <Link 
                to="/services?featured=true"
                className="inline-flex items-center gap-2 px-6 py-3 text-gold-500 hover:text-gold-400 font-bold transition-colors"
              >
                View All Featured Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CTA Bottom */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} py-24 px-4 text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Have a unique project?</h2>
          <p className={`mb-10 max-w-lg mx-auto text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            We create custom packages tailored to your specific creative requirements. Let's discuss your vision.
          </p>
          <Link to="/contact" className={`inline-flex items-center gap-3 px-10 py-4 border-2 rounded-full transition-all duration-300 font-bold uppercase tracking-wider text-sm ${isDarkMode ? 'bg-transparent border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-stone-900 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]' : 'bg-gold-500 border-gold-500 text-stone-900 hover:bg-gold-600 hover:border-gold-600 shadow-lg hover:shadow-xl'}`}>
            Get a Custom Quote <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioItem } from '../types';
import { X, ChevronLeft, ChevronRight, ZoomIn, Filter, Loader2 } from 'lucide-react';

// Helper for Unsplash optimization to ensure correct sizing and format
const getOptimizedUrl = (url: string, width: number, quality = 80) => {
  if (!url) return '';
  // Remove existing query params if any
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?q=${quality}&w=${width}&auto=format&fit=crop`;
};

// Component for individual grid item to handle lazy loading and fade-in
const GridItem: React.FC<{ item: PortfolioItem; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer h-full w-full bg-stone-200 shadow-md hover:shadow-2xl transition-all duration-500"
    >
      {/* Placeholder / Loader Background */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
          <Loader2 className="w-6 h-6 text-stone-300 animate-spin" />
        </div>
      )}

      <img 
        src={getOptimizedUrl(item.image, 600)} // Optimized thumbnail size
        alt={item.title} 
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transform transition-all duration-700 ease-out group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-stone-950/75 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-center items-center text-center p-6 backdrop-blur-[2px]">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <span className="text-gold-500 text-xs font-bold uppercase tracking-wider mb-2 block">{item.category}</span>
            <h3 className="text-white text-2xl font-serif font-bold mb-4">{item.title}</h3>
            <div className="inline-flex items-center gap-2 text-white/90 text-sm border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-stone-900 transition-colors">
                <ZoomIn className="w-4 h-4" /> View Project
            </div>
        </div>
      </div>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Data cleaned of hardcoded params
  const categories = ['All', 'Weddings', 'Portraits', 'Events', 'Commercial'];
  
  const allPortfolioItems: PortfolioItem[] = [
    { id: '1', category: 'Weddings', title: 'Grace & John', image: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821' },
    { id: '2', category: 'Portraits', title: 'Studio Session', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
    { id: '3', category: 'Events', title: 'Tech Summit Nairobi', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4' },
    { id: '4', category: 'Commercial', title: 'Fashion Campaign', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
    { id: '5', category: 'Weddings', title: 'Traditional Ceremony', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
    { id: '6', category: 'Portraits', title: 'Graduation 2024', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1' },
    { id: '7', category: 'Events', title: 'Music Festival', image: 'https://images.unsplash.com/photo-1459749411177-287ce3276916' },
    { id: '8', category: 'Commercial', title: 'Urban Streetwear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b' },
    { id: '9', category: 'Weddings', title: 'Reception Party', image: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44' },
  ];

  const filteredItems = filter === 'All' 
    ? allPortfolioItems 
    : allPortfolioItems.filter(item => item.category === filter);

  // Preload Images
  const preloadImage = (src: string) => {
    const img = new Image();
    img.src = src;
  };

  // Handlers
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setLightboxImageLoaded(false);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
    setLightboxImageLoaded(false);
  };

  const nextImage = useCallback(() => {
    setIsAnimating(true);
    setLightboxImageLoaded(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
      setIsAnimating(false);
    }, 200);
  }, [filteredItems.length]);

  const prevImage = useCallback(() => {
    setIsAnimating(true);
    setLightboxImageLoaded(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      setIsAnimating(false);
    }, 200);
  }, [filteredItems.length]);

  // Preload next/prev images when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      const nextIndex = (currentIndex + 1) % filteredItems.length;
      const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      preloadImage(getOptimizedUrl(filteredItems[nextIndex].image, 1600));
      preloadImage(getOptimizedUrl(filteredItems[prevIndex].image, 1600));
    }
  }, [currentIndex, lightboxOpen, filteredItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-stone-900 py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block">Selected Projects</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">Our Work</h1>
          <p className="text-stone-400 max-w-2xl mx-auto text-xl font-light">
            Explore our curated gallery of moments, emotions, and stories told through the lens.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-16">
            <div className="flex items-center gap-2 text-stone-400 md:hidden mb-2">
                <Filter className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Filter By</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                    filter === cat 
                    ? 'bg-stone-900 text-gold-500 border-stone-900 shadow-lg transform scale-105' 
                    : 'bg-white text-stone-500 border-stone-200 hover:border-gold-500 hover:text-stone-900'
                }`}
                >
                {cat}
                </button>
            ))}
            </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {filteredItems.map((item, index) => (
             <GridItem 
                key={item.id} 
                item={item} 
                index={index} 
                onClick={() => openLightbox(index)} 
             />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-[fadeIn_0.3s_ease-out]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
          
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors z-50 p-2 bg-white/10 rounded-full hover:bg-white/20"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation - Left (Desktop) */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="hidden md:block absolute left-4 md:left-8 text-white hover:text-gold-500 transition-colors z-50 p-3 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-sm group"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Main Image Container */}
          <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col justify-center items-center p-4 md:p-12">
            <div className={`relative transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Loading Spinner for Lightbox */}
                {!lightboxImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                    </div>
                )}
                
                <img 
                    src={getOptimizedUrl(filteredItems[currentIndex].image, 1600, 90)} 
                    alt={filteredItems[currentIndex].title}
                    onLoad={() => setLightboxImageLoaded(true)}
                    className={`max-h-[80vh] w-auto max-w-full object-contain rounded-md shadow-2xl transition-opacity duration-300 ${lightboxImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
            
            {/* Caption */}
            <div className="absolute bottom-8 left-0 w-full text-center px-4 pointer-events-none">
                <div className={`transition-all duration-300 delay-100 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{filteredItems[currentIndex].title}</h3>
                    <span className="text-gold-500 uppercase tracking-widest text-sm font-medium">{filteredItems[currentIndex].category}</span>
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
                {filteredItems.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-gold-500' : 'w-2 bg-stone-700'}`}
                    />
                ))}
            </div>
          </div>

          {/* Navigation - Right (Desktop) */}
          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="hidden md:block absolute right-4 md:right-8 text-white hover:text-gold-500 transition-colors z-50 p-3 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-sm group"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Mobile Swipe Hint (Optional, fades out) */}
          <div className="md:hidden absolute bottom-24 text-stone-500 text-xs animate-pulse pointer-events-none">
            Swipe to navigate
          </div>

        </div>
      )}
    </div>
  );
};

export default Portfolio;
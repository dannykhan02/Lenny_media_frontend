import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Twitter, Phone, MapPin, Mail, Camera, Video, MessageCircle, Loader2 } from 'lucide-react';

// Lazy Load Pages to optimize initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Booking = lazy(() => import('./pages/Booking'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const School = lazy(() => import('./pages/School'));
const Quote = lazy(() => import('./pages/Quote'));
const Enrollment = lazy(() => import('./pages/Enrollment'));
const Brands = lazy(() => import('./pages/Brands'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50">
    <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
    <p className="text-stone-400 font-serif tracking-wider animate-pulse">Loading...</p>
  </div>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Our Work', path: '/portfolio' },
    { name: 'School', path: '/school' },
    { name: 'Brands', path: '/brands' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="bg-stone-900 text-gold-500 p-2 rounded-lg group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors duration-300">
                <Camera className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              Lenny<span className="text-gold-500">Media</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path) 
                        ? 'text-stone-900 font-bold bg-stone-50' 
                        : link.path === '/school' 
                            ? 'text-gold-600 font-bold hover:text-gold-700 hover:bg-gold-50'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  } px-3 lg:px-4 py-2.5 rounded-full font-medium transition-all duration-200 text-sm tracking-wide`}
                >
                  {link.name}
                </Link>
            ))}
            
            <Link
                to="/quote"
                className="hidden lg:block ml-5 bg-stone-100 text-stone-900 border border-stone-200 px-7 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 transform shadow-sm"
            >
                Get Quote
            </Link>
             <Link
                to="/booking"
                className="ml-3 bg-gold-500 text-stone-900 px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-105 hover:bg-gold-400 transition-all duration-300 transform"
            >
                Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-stone-900 focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 absolute w-full shadow-2xl h-screen z-50">
          <div className="px-6 pt-8 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-4 rounded-xl text-lg font-medium border-l-4 ${
                    isActive(link.path) 
                      ? 'border-gold-500 bg-stone-50 text-stone-900' 
                      : link.path === '/school'
                          ? 'border-transparent text-gold-600 font-bold bg-gold-50/50'
                          : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
             <div className="pt-6 flex flex-col gap-4">
                 <Link
                    to="/quote"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-stone-100 text-stone-900 border border-stone-200 text-center py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-stone-200"
                >
                    Get a Quote
                </Link>
                 <Link
                    to="/booking"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-gold-500 text-stone-900 text-center py-4 rounded-2xl font-bold text-lg tracking-wide shadow-xl shadow-gold-500/20 hover:bg-gold-400"
                >
                    Book Session
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-white pt-20 pb-10 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-gold-500" />
              <span className="font-serif text-2xl font-bold">Lenny Media</span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-sm">
              Capturing life's most precious moments with style, elegance, and cinematic flair. Based in Juja Square, serving Nairobi and beyond.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="bg-stone-900 p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-stone-900 p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-stone-900 p-3 rounded-full hover:bg-gold-500 hover:text-stone-900 transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-semibold mb-8 text-white relative inline-block">
                Explore
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gold-500"></span>
            </h3>
            <ul className="space-y-4 text-stone-400">
              <li><Link to="/services" className="hover:text-gold-500 transition-colors flex items-center gap-2">Services & Pricing</Link></li>
              <li><Link to="/portfolio" className="hover:text-gold-500 transition-colors flex items-center gap-2">Our Work</Link></li>
              <li><Link to="/school" className="hover:text-gold-500 transition-colors flex items-center gap-2">School of Photography</Link></li>
              <li><Link to="/brands" className="hover:text-gold-500 transition-colors flex items-center gap-2">Our Brands</Link></li>
              <li><Link to="/about" className="hover:text-gold-500 transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link to="/quote" className="hover:text-gold-500 transition-colors flex items-center gap-2">Request a Quote</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl font-semibold mb-8 text-white relative inline-block">
                Contact
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gold-500"></span>
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-stone-900 p-2 rounded-lg text-gold-500">
                    <MapPin className="h-5 w-5" />
                </div>
                <span className="text-stone-400">Juja Square, 1st Floor,<br />Juja, Kenya</span>
              </li>
              <li className="flex items-center gap-4">
                 <div className="bg-stone-900 p-2 rounded-lg text-gold-500">
                    <Phone className="h-5 w-5" />
                </div>
                <span className="text-stone-400">+254 700 123 456</span>
              </li>
              <li className="flex items-center gap-4">
                 <div className="bg-stone-900 p-2 rounded-lg text-gold-500">
                    <Mail className="h-5 w-5" />
                </div>
                <span className="text-stone-400">info@lennymedia.co.ke</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-900 pt-8 text-center text-stone-600 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Lenny Media Kenya. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-gold-500">Privacy Policy</Link>
            <Link to="#" className="hover:text-gold-500">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// WhatsApp Floating Button
const WhatsAppButton: React.FC = () => {
  return (
    <a 
      href="https://wa.me/254700123456" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-all duration-300 z-50 hover:scale-110 flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/school" element={<School />} />
              <Route path="/enrollment" element={<Enrollment />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quote" element={<Quote />} />
              <Route path="/brands" element={<Brands />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </HashRouter>
  );
};

export default App;
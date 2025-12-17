import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Camera, MessageCircle, Loader2, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { AuthProvider, ProtectedRoute, ScrollToTop, PageLoader } from './context/AuthProvider';
import Navbar from './components/Navbar';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const Booking = React.lazy(() => import('./pages/Booking'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const School = React.lazy(() => import('./pages/School'));
const Quote = React.lazy(() => import('./pages/Quote'));
const Enrollment = React.lazy(() => import('./pages/Enrollment'));
const Brands = React.lazy(() => import('./pages/Brands'));

// Admin Pages
const AdminLogin = React.lazy(() => import('./pages/Admin/AdminLogin'));
const RegisterFirstAdmin = React.lazy(() => import('./pages/Admin/RegisterFirstAdmin'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-white pt-20 pb-10 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
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

          <div>
            <h3 className="font-serif text-xl font-semibold mb-8 text-white relative inline-block">
              Explore
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gold-500"></span>
            </h3>
            <ul className="space-y-4 text-stone-400">
              <li><a href="/#/services" className="hover:text-gold-500 transition-colors flex items-center gap-2">Services & Pricing</a></li>
              <li><a href="/#/portfolio" className="hover:text-gold-500 transition-colors flex items-center gap-2">Our Work</a></li>
              <li><a href="/#/school" className="hover:text-gold-500 transition-colors flex items-center gap-2">School of Photography</a></li>
              <li><a href="/#/brands" className="hover:text-gold-500 transition-colors flex items-center gap-2">Our Brands</a></li>
              <li><a href="/#/about" className="hover:text-gold-500 transition-colors flex items-center gap-2">About Us</a></li>
              <li><a href="/#/quote" className="hover:text-gold-500 transition-colors flex items-center gap-2">Request a Quote</a></li>
            </ul>
          </div>

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
            <a href="#" className="hover:text-gold-500">Privacy Policy</a>
            <a href="#" className="hover:text-gold-500">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

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
      <AuthProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
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
                
                {/* Auth Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<RegisterFirstAdmin />} />
                
                {/* Protected Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
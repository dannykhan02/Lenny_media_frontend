// App.tsx or App.jsx
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { AuthProvider, ProtectedRoute, ScrollToTop, PageLoader } from './context/AuthProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

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
const AdminServices = React.lazy(() => import('./pages/Admin/AdminServices'));
const AdminBookings = React.lazy(() => import('./pages/Admin/AdminBookings'));

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

const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show regular navbar if NOT on admin routes */}
      {!isAdminRoute && <Navbar />}
      
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
            
            <Route 
              path="/admin/services" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminServices />
                </ProtectedRoute>
              } 
            />
            
            {/* COMPLETE BOOKING ROUTES */}
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings/pending" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings/confirmed" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings/calendar" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            
            {/* You can add more admin routes as needed */}
            {/* 
            <Route 
              path="/admin/portfolio" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/quotes" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQuotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/messages" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminMessages />
                </ProtectedRoute>
              } 
            />
            */}
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Only show footer if NOT on admin routes */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <ScrollToTop />
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
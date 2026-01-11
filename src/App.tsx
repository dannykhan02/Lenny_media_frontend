import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, ScrollToTop, PageLoader } from './context/AuthContext';
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
const Team = React.lazy(() => import('./pages/Team'));
const Quote = React.lazy(() => import('./pages/Quote'));
const Brands = React.lazy(() => import('./pages/Brands'));

// Admin Pages
const AdminLogin = React.lazy(() => import('./pages/Admin/AdminLogin'));
const RegisterFirstAdmin = React.lazy(() => import('./pages/Admin/RegisterFirstAdmin'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminServices = React.lazy(() => import('./pages/Admin/AdminServices'));
const AdminBookings = React.lazy(() => import('./pages/Admin/AdminBookings'));
const AdminUsers = React.lazy(() => import('./pages/Admin/AdminUsers'));
const AdminProfile = React.lazy(() => import('./pages/Admin/AdminProfile'));
const AdminQuotes = React.lazy(() => import('./pages/Admin/AdminQuotes'));
const AdminQuoteDetail = React.lazy(() => import('./pages/Admin/AdminQuoteDetail'));
const AdminPortfolio = React.lazy(() => import('./pages/Admin/AdminPortfolio'));
const BookingCleanup = React.lazy(() => import('./pages/Admin/BookingCleanup'));

// ✅ FIXED: Enhanced Page Loader Component (removed ErrorBoundary import)
const EnhancedPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-950 to-black">
    <div className="relative">
      <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full animate-pulse" />
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 animate-ping"></div>
        </div>
      </div>
      <p className="mt-6 text-center text-stone-400 text-sm font-light tracking-wider animate-pulse">
        Loading Experience...
      </p>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  
  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show regular navbar if NOT on admin routes */}
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        {/* ✅ FIXED: Removed ErrorBoundary wrapper since component doesn't exist */}
        <Suspense fallback={<EnhancedPageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
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
            
            {/* Portfolio Routes */}
            <Route 
              path="/admin/portfolio" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/portfolio/items" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/portfolio/add" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/portfolio/categories" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortfolio />
                </ProtectedRoute>
              } 
            />
            
            {/* User Management Route */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile Management Route */}
            <Route 
              path="/admin/profile" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Booking Routes */}
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
            
            {/* NEW: Booking Cleanup Route */}
            <Route 
              path="/admin/bookings/cleanup" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BookingCleanup />
                </ProtectedRoute>
              } 
            />
            
            {/* Quote Routes */}
            <Route 
              path="/admin/quotes" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQuotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/quotes/calendar" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQuotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/quotes/kanban" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQuotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/quotes/:id" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQuoteDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Only show footer if NOT on admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
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
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AdminLayout } from './components/admin/AdminLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/profile/Profile';
import Categories from './pages/admin/kategori/Categories';
import PropertyCategories from './pages/admin/kategori/PropertyCategories';
import Projects from './pages/admin/projects/Projects';
import ProjectDetail from './pages/admin/projects/ProjectDetail';
import ProjectForm from './pages/admin/projects/ProjectForm';
import Properties from './pages/admin/property/Properties';
import PropertyDetail from './pages/admin/property/PropertyDetail';
import PropertyForm from './pages/admin/property/PropertyForm';
import Bookings from './pages/admin/bookings/Bookings';
import CreateBookingLink from './pages/admin/bookings/CreateBookingLink';
import BookingEdit from './pages/admin/bookings/BookingEdit';
import BookingDetail from './pages/admin/bookings/BookingDetail';
import CustomerBookingForm from './pages/customer/CustomerBookingForm';

// ← Invoice pages
import Invoices from './pages/admin/invoices/Invoices';
import InvoiceDetail from './pages/admin/invoices/InvoiceDetail';
import InvoiceForm from './pages/admin/invoices/InvoiceForm';

// ← Review pages
import Reviews from './pages/admin/reviews/Review';
import ReviewDetail from './pages/admin/reviews/ReviewDetail';
import ReviewForm from './pages/customer/ReviewForm';

import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route path="/booking/:token" element={<CustomerBookingForm />} />

          {/* Public — Form review customer (tidak perlu auth) */}
          <Route path="/review/:token" element={<ReviewForm />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />

          {/* Projects */}
          <Route path="/projects"          element={<ProtectedRoute><AdminLayout><Projects /></AdminLayout></ProtectedRoute>} />
          <Route path="/projects/new"      element={<ProtectedRoute><AdminLayout><ProjectForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/projects/edit/:id" element={<ProtectedRoute><AdminLayout><ProjectForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/projects/:id"      element={<ProtectedRoute><AdminLayout><ProjectDetail /></AdminLayout></ProtectedRoute>} />

          {/* Properties */}
          <Route path="/properties"          element={<ProtectedRoute><AdminLayout><Properties /></AdminLayout></ProtectedRoute>} />
          <Route path="/properties/new"      element={<ProtectedRoute><AdminLayout><PropertyForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/properties/edit/:id" element={<ProtectedRoute><AdminLayout><PropertyForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/properties/:id"      element={<ProtectedRoute><AdminLayout><PropertyDetail /></AdminLayout></ProtectedRoute>} />

          {/* Categories */}
          <Route path="/categories"          element={<ProtectedRoute><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
          <Route path="/property-categories" element={<ProtectedRoute><AdminLayout><PropertyCategories /></AdminLayout></ProtectedRoute>} />

          {/* Bookings */}
          <Route path="/bookings"          element={<ProtectedRoute><AdminLayout><Bookings /></AdminLayout></ProtectedRoute>} />
          <Route path="/bookings/:id"      element={<ProtectedRoute><AdminLayout><BookingDetail /></AdminLayout></ProtectedRoute>} />
          <Route path="/bookings/edit/:id" element={<ProtectedRoute><AdminLayout><BookingEdit /></AdminLayout></ProtectedRoute>} />
          <Route path="/booking-links/new" element={<ProtectedRoute><AdminLayout><CreateBookingLink /></AdminLayout></ProtectedRoute>} />

          {/* Invoices */}
          <Route path="/invoices"          element={<ProtectedRoute><AdminLayout><Invoices /></AdminLayout></ProtectedRoute>} />
          <Route path="/invoices/new"      element={<ProtectedRoute><AdminLayout><InvoiceForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/invoices/:id"      element={<ProtectedRoute><AdminLayout><InvoiceDetail /></AdminLayout></ProtectedRoute>} />
          <Route path="/invoices/:id/edit" element={<ProtectedRoute><AdminLayout><InvoiceForm /></AdminLayout></ProtectedRoute>} />

          {/* Reviews */}
          <Route path="/reviews"     element={<ProtectedRoute><AdminLayout><Reviews /></AdminLayout></ProtectedRoute>} />
          <Route path="/reviews/:id" element={<ProtectedRoute><AdminLayout><ReviewDetail /></AdminLayout></ProtectedRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><AdminLayout><Profile /></AdminLayout></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
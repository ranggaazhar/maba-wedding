// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AdminLayout } from './components/admin/AdminLayout';
import { PublicLayout } from './components/public/PublicLayout';

import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

// ── Public pages ───────────────────────────────────────────────
import { Home } from './pages/public/Home';
import { OurProjects } from './pages/public/OurProjects';
import { Properties as PublicProperties } from './pages/public/Properties';

// ── Admin pages ────────────────────────────────────────────────
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/profile/Profile';
import Categories from './pages/admin/kategori/Categories';
import PropertyCategories from './pages/admin/kategori/PropertyCategories';
import Projects from './pages/admin/projects/Projects';
import ProjectDetail from './pages/admin/projects/ProjectDetail';
import ProjectForm from './pages/admin/projects/ProjectForm';
import AdminProperties from './pages/admin/property/Properties';
import PropertyDetail from './pages/admin/property/PropertyDetail';
import PropertyForm from './pages/admin/property/PropertyForm';
import Bookings from './pages/admin/bookings/Bookings';
import CreateBookingLink from './pages/admin/bookings/CreateBookingLink';
import BookingEdit from './pages/admin/bookings/BookingEdit';
import BookingDetail from './pages/admin/bookings/BookingDetail';
import Invoices from './pages/admin/invoices/Invoices';
import InvoiceDetail from './pages/admin/invoices/InvoiceDetail';
import InvoiceForm from './pages/admin/invoices/InvoiceForm';
import Reviews from './pages/admin/reviews/Review';
import ReviewDetail from './pages/admin/reviews/ReviewDetail';

// ── Customer forms ─────────────────────────────────────────────
import CustomerBookingForm from './pages/customer/CustomerBookingForm';
import ReviewForm from './pages/customer/ReviewForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Helper agar tidak repetitif wrapping ProtectedRoute + AdminLayout
const Admin = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ── Public Website (Navbar + Footer) ──────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"           element={<Home />} />
            <Route path="/projects"   element={<OurProjects />} />
            <Route path="/properties" element={<PublicProperties />} />
          </Route>

          {/* ── Auth ──────────────────────────────────────────── */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />}
          />

          {/* ── Customer Forms (standalone, no layout) ─────────── */}
          <Route path="/booking/:token" element={<CustomerBookingForm />} />
          <Route path="/review/:token"  element={<ReviewForm />} />

          {/* ── Admin ─────────────────────────────────────────── */}

          {/* Dashboard */}
          <Route path="/admin/dashboard" element={<Admin><Dashboard /></Admin>} />

          {/* Profile */}
          <Route path="/admin/profile" element={<Admin><Profile /></Admin>} />

          {/* Categories */}
          <Route path="/admin/categories"          element={<Admin><Categories /></Admin>} />
          <Route path="/admin/property-categories" element={<Admin><PropertyCategories /></Admin>} />

          {/* Projects */}
          <Route path="/admin/projects"          element={<Admin><Projects /></Admin>} />
          <Route path="/admin/projects/new"      element={<Admin><ProjectForm /></Admin>} />
          <Route path="/admin/projects/edit/:id" element={<Admin><ProjectForm /></Admin>} />
          <Route path="/admin/projects/:id"      element={<Admin><ProjectDetail /></Admin>} />

          {/* Properties */}
          <Route path="/admin/properties"          element={<Admin><AdminProperties /></Admin>} />
          <Route path="/admin/properties/new"      element={<Admin><PropertyForm /></Admin>} />
          <Route path="/admin/properties/edit/:id" element={<Admin><PropertyForm /></Admin>} />
          <Route path="/admin/properties/:id"      element={<Admin><PropertyDetail /></Admin>} />

          {/* Bookings */}
          <Route path="/admin/bookings"          element={<Admin><Bookings /></Admin>} />
          <Route path="/admin/bookings/:id"      element={<Admin><BookingDetail /></Admin>} />
          <Route path="/admin/bookings/edit/:id" element={<Admin><BookingEdit /></Admin>} />
          <Route path="/admin/booking-links/new" element={<Admin><CreateBookingLink /></Admin>} />

          {/* Invoices */}
          <Route path="/admin/invoices"          element={<Admin><Invoices /></Admin>} />
          <Route path="/admin/invoices/new"      element={<Admin><InvoiceForm /></Admin>} />
          <Route path="/admin/invoices/:id"      element={<Admin><InvoiceDetail /></Admin>} />
          <Route path="/admin/invoices/:id/edit" element={<Admin><InvoiceForm /></Admin>} />

          {/* Reviews */}
          <Route path="/admin/reviews"     element={<Admin><Reviews /></Admin>} />
          <Route path="/admin/reviews/:id" element={<Admin><ReviewDetail /></Admin>} />

          {/* ── Redirects ─────────────────────────────────────── */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin"     element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*"          element={<Navigate to="/" replace />} />

        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AdminLayout } from './components/admin/AdminLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/admin/profile/Profile';
import Categories from './pages/admin/kategori/Categories';
import PropertyCategories from './pages/admin/kategori/PropertyCategories';
import Projects from './pages/admin/projects/Projects';
import ProjectDetail from './pages/admin/projects/ProjectDetail';
import ProjectForm from './pages/admin/projects/ProjectForm';

// ✅ IMPORT PROPERTIES PAGES
import Properties from './pages/admin/property/Properties';
import PropertyDetail from './pages/admin/property/PropertyDetail';
import PropertyForm from './pages/admin/property/PropertyForm';

// ✅ IMPORT BOOKING PAGES (ADMIN)
import Bookings from './pages/admin/bookings/Bookings';
import CreateBookingLink from './pages/admin/bookings/CreateBookingLink';

// ✅ IMPORT CUSTOMER PAGE
import CustomerBookingForm from './pages/customer/CustomerBookingForm';

// Components
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
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
          />

          {/* ✅ CUSTOMER FORM (PUBLIC) - FIXED PATH */}
          <Route path="/booking/:token" element={<CustomerBookingForm />} />

          {/* Protected Routes with AdminLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* --- PROJECT ROUTES --- */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Projects />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ PROPERTY ROUTES (SAME PATTERN AS PROJECTS) */}
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Properties />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/new"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PropertyForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PropertyForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PropertyDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* --- CATEGORY ROUTES --- */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/property-categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PropertyCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* --- BOOKING ROUTES (ADMIN) --- */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Bookings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-links/new"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CreateBookingLink />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* --- PROFILE ROUTE --- */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
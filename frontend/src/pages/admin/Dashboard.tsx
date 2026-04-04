// src/pages/admin/Dashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Star, TrendingUp, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/Authapi';
import { useDashboard } from '@/hooks/Admin/dashboard/useDashboard';
import { StatCard } from '@/components/admin/StatCard';
import { RecentBookingsTable } from '@/components/admin/RecentBookingsTable';
import { RecentReviews } from '@/components/admin/RecentReviews';

export default function Dashboard() {
  const navigate = useNavigate();
  const { admin, clearAuth } = useAuthStore();

  const {
    stats,
    recentBookings,
    recentReviews,
    isLoadingStats,
    isLoadingBookings,
    isLoadingReviews,
    error,
    refresh,
    formatCurrency,
    formatDate,
    paymentStatusLabel,
  } = useDashboard();

  // Auth guard
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await authApi.verifyToken();
      } catch {
        clearAuth();
        navigate('/login');
      }
    };
    verifyAuth();
  }, [clearAuth, navigate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Selamat datang kembali, {admin?.name}! Berikut ringkasan bisnis Anda.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats Grid — Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Booking"
          value={isLoadingStats ? '—' : stats?.bookings.thisMonth ?? 0}
          subtitle="Bulan ini"
          icon={Calendar}
          variant="primary"
          trend={
            stats
              ? { value: Math.abs(stats.bookings.trend), isPositive: stats.bookings.trend >= 0 }
              : undefined
          }
        />
        <StatCard
          title="Projects"
          value={isLoadingStats ? '—' : stats?.projects.total ?? 0}
          subtitle={isLoadingStats ? '' : `${stats?.projects.published ?? 0} dipublish`}
          icon={Package}
          variant="secondary"
        />
        <StatCard
          title="Properties"
          value={isLoadingStats ? '—' : stats?.properties.total ?? 0}
          subtitle={isLoadingStats ? '' : `${stats?.properties.available ?? 0} tersedia`}
          icon={Package}
          variant="success"
        />
        <StatCard
          title="Rating"
          value={isLoadingStats ? '—' : stats?.reviews.avgRating ?? '0'}
          subtitle={isLoadingStats ? '' : `Dari ${stats?.reviews.total ?? 0} review`}
          icon={Star}
          variant="warning"
        />
      </div>

      {/* Quick Stats — Revenue & Booking Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-ocean-light text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue Bulan Ini</p>
              {isLoadingStats ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.revenue.thisMonth ?? 0)}
                  </p>
                  {stats && stats.revenue.trend !== 0 && (
                    <p className={`text-xs mt-0.5 ${stats.revenue.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stats.revenue.trend >= 0 ? '▲' : '▼'} {Math.abs(stats.revenue.trend)}% vs bulan lalu
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-success/10 text-success">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking Dikonfirmasi</p>
              {isLoadingStats ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {stats?.bookings.byStatus.confirmed ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Waiting Confirmation */}
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-warning/10 text-warning">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Menunggu Konfirmasi</p>
              {isLoadingStats ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {stats?.bookings.byStatus.waitingConfirmation ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookingsTable
            bookings={recentBookings}
            isLoading={isLoadingBookings}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            paymentStatusLabel={paymentStatusLabel}
          />
        </div>
        <div>
          <RecentReviews
            reviews={recentReviews}
            isLoading={isLoadingReviews}
            formatDate={formatDate}
          />
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-ocean-light rounded-lg">
            <p className="text-sm font-medium text-primary mb-1">Account Status</p>
            <p className="text-xs text-primary/80">
              {admin?.is_active ? '✓ Active' : '✗ Inactive'}
            </p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg">
            <p className="text-sm font-medium text-secondary-foreground mb-1">Member Since</p>
            <p className="text-xs text-muted-foreground">
              {admin?.created_at ? new Date(admin.created_at).toLocaleDateString('id-ID') : '—'}
            </p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg">
            <p className="text-sm font-medium text-success mb-1">Email</p>
            <p className="text-xs text-success/80">{admin?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
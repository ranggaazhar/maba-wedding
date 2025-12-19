// src/pages/Dashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/Authapi';
import { Calendar, Package, Star, TrendingUp, Users } from 'lucide-react';
import { StatCard } from '../components/admin/StatCard';
import { RecentBookingsTable } from '../components/admin/RecentBookingsTable';
import { RecentReviews } from '../components/admin/RecentReviews';

export default function Dashboard() {
  const navigate = useNavigate();
  const { admin, clearAuth } = useAuthStore();

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
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Selamat datang kembali, {admin?.name}! Berikut ringkasan bisnis Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Booking"
          value={48}
          subtitle="Bulan ini"
          icon={Calendar}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Projects"
          value={156}
          subtitle="Portfolio aktif"
          icon={Package}
          variant="secondary"
        />
        <StatCard
          title="Properties"
          value={89}
          subtitle="Item tersedia"
          icon={Package}
          variant="success"
        />
        <StatCard
          title="Rating"
          value="4.9"
          subtitle="Dari 234 review"
          icon={Star}
          variant="warning"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-ocean-light text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue Bulan Ini</p>
              <p className="text-2xl font-bold text-foreground">Rp 125.5 Jt</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-success/10 text-success">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking Dikonfirmasi</p>
              <p className="text-2xl font-bold text-foreground">32</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="stat-icon bg-warning/10 text-warning">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Menunggu Konfirmasi</p>
              <p className="text-2xl font-bold text-foreground">16</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>
        <div>
          <RecentReviews />
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
              {admin?.created_at ? new Date(admin.created_at).toLocaleDateString() : '-'}
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
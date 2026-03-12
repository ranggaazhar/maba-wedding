// src/hooks/admin/dashboard/useDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi } from '@/api/dashboardApi';
import type {
  DashboardStats,
  DashboardRecentBooking,
  DashboardRecentReview,
} from '@/types/dashboard.types';

interface DashboardState {
  stats: DashboardStats | null;
  recentBookings: DashboardRecentBooking[];
  recentReviews: DashboardRecentReview[];
  isLoadingStats: boolean;
  isLoadingBookings: boolean;
  isLoadingReviews: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    stats: null,
    recentBookings: [],
    recentReviews: [],
    isLoadingStats: true,
    isLoadingBookings: true,
    isLoadingReviews: true,
    error: null,
  });

  // refreshCount dipakai sebagai trigger untuk re-fetch tanpa setState di dalam effect
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount(c => c + 1), []);

  // Gunakan ref untuk abort controller agar bisa di-cancel kalau component unmount
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    let cancelled = false;

    async function loadAll() {
      // Reset loading state sekali di awal, bukan lewat setState berulang
      setState(prev => ({
        ...prev,
        isLoadingStats: true,
        isLoadingBookings: true,
        isLoadingReviews: true,
        error: null,
      }));

      // Jalankan semua fetch secara paralel
      const [statsResult, bookingsResult, reviewsResult] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getRecentBookings(5),
        dashboardApi.getRecentReviews(5),
      ]);

      if (cancelled) return;

      setState(prev => ({
        ...prev,
        stats:
          statsResult.status === 'fulfilled' && statsResult.value.success
            ? statsResult.value.data
            : prev.stats,
        recentBookings:
          bookingsResult.status === 'fulfilled' && bookingsResult.value.success
            ? bookingsResult.value.data
            : prev.recentBookings,
        recentReviews:
          reviewsResult.status === 'fulfilled' && reviewsResult.value.success
            ? reviewsResult.value.data
            : prev.recentReviews,
        isLoadingStats: false,
        isLoadingBookings: false,
        isLoadingReviews: false,
        error:
          statsResult.status === 'rejected'
            ? 'Gagal memuat statistik dashboard'
            : null,
      }));
    }

    loadAll();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCount]);

  // ── Helpers ────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(0)} Jt`;
    if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const paymentStatusLabel: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Menunggu Bayar', className: 'bg-gray-100 text-gray-600' },
    WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', className: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
  };

  return {
    ...state,
    refresh,
    formatCurrency,
    formatDate,
    paymentStatusLabel,
  };
}
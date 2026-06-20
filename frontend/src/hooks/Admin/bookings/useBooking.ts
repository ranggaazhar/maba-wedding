// src/hooks/admin/bookings/useBooking.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, bookingLinkApi } from '@/api/bookingApi';
import type { Booking, BookingLink, BookingStats } from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

type BookingTypeFilter = 'all' | 'catalog' | 'custom' | 'combination';
type PaymentFilter = 'all' | 'with_payment' | 'without_payment';

export function useBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLinks, setBookingLinks] = useState<BookingLink[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingTypeFilter>('all');

  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [debouncedLinkSearch, setDebouncedLinkSearch] = useState('');

  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0, withPayment: 0, withoutPayment: 0, thisMonth: 0,
  });

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLinkSearch(linkSearchQuery), 500);
    return () => clearTimeout(timer);
  }, [linkSearchQuery]);

  // ── Fetch bookings ────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoadingBookings(true);

      const filters: Parameters<typeof bookingApi.getAllBookings>[0] = {
        include_models: true,
      };
      if (debouncedSearch.trim()) filters.search = debouncedSearch;
      if (paymentFilter !== 'all') filters.has_payment = paymentFilter === 'with_payment';

      // Kirim filter dasar ke backend
      if (bookingTypeFilter === 'custom' || bookingTypeFilter === 'combination') {
        filters.has_custom_request = true;
      } else if (bookingTypeFilter === 'catalog') {
        filters.has_custom_request = false;
      }

      const response = await bookingApi.getAllBookings(filters);

      if (response.success) {
        let data = response.data;

        // Filter tipe booking secara akurat di client-side (karena data models sudah di-include)
        if (bookingTypeFilter === 'custom') {
          // Pure Custom = punya custom request, tapi tidak punya models
          data = data.filter(b => b.has_custom_request && (!b.models || b.models.length === 0));
        } else if (bookingTypeFilter === 'combination') {
          // Kombinasi = punya custom request DAN punya models
          data = data.filter(b => b.has_custom_request && b.models && b.models.length > 0);
        } else if (bookingTypeFilter === 'catalog') {
          // Katalog = tidak ada custom request
          data = data.filter(b => !b.has_custom_request);
        }

        setBookings(data);
      }
    } catch (error) {
      console.error(
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat bookings'
      );
    } finally {
      setIsLoadingBookings(false);
    }
  }, [debouncedSearch, paymentFilter, bookingTypeFilter]);

  const fetchBookingLinks = useCallback(async () => {
    try {
      setIsLoadingLinks(true);
      const response = await bookingLinkApi.getAllBookingLinks({ search: debouncedLinkSearch });
      if (response.success) setBookingLinks(response.data);
    } catch (error) {
      console.error(
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat booking links'
      );
    } finally {
      setIsLoadingLinks(false);
    }
  }, [debouncedLinkSearch]);

  const fetchBookingStatistics = useCallback(async () => {
    try {
      const response = await bookingApi.getStatistics();
      if (response.success) setBookingStats(response.data);
    } catch (error) {
      console.error('Failed to fetch booking statistics', error);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchBookingStatistics();
  }, [fetchBookings, fetchBookingStatistics]);

  useEffect(() => { fetchBookingLinks(); }, [fetchBookingLinks]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDeleteBooking = async (id: number, bookingCode: string) => {
    const result = await Swal.fire({
      title: 'Yakin hapus booking?',
      text: `Booking ${bookingCode} akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(id);
        Swal.fire('Terhapus!', 'Booking berhasil dihapus', 'success');
        fetchBookings();
        fetchBookingStatistics();
      } catch (error) {
        Swal.fire(
          'Gagal!',
          axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus',
          'error'
        );
      }
    }
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/booking/${token}`);
    Swal.fire({
      icon: 'success',
      title: 'Tersalin!',
      text: 'Link berhasil disalin ke clipboard',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleRegenerateToken = async (id: number) => {
    const result = await Swal.fire({
      title: 'Generate ulang token?',
      text: 'Link lama tidak akan bisa digunakan lagi',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Generate!',
    });
    if (result.isConfirmed) {
      try {
        await bookingLinkApi.regenerateToken(id);
        Swal.fire('Berhasil!', 'Token berhasil di-generate ulang', 'success');
        fetchBookingLinks();
      } catch (error) {
        Swal.fire(
          'Gagal!',
          axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal generate token',
          'error'
        );
      }
    }
  };

  const handleDeleteLink = async (id: number) => {
    const result = await Swal.fire({
      title: 'Yakin hapus link?',
      text: 'Link akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
    });
    if (result.isConfirmed) {
      try {
        await bookingLinkApi.deleteBookingLink(id);
        Swal.fire('Terhapus!', 'Link berhasil dihapus', 'success');
        fetchBookingLinks();
      } catch (error) {
        Swal.fire(
          'Gagal!',
          axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus',
          'error'
        );
      }
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return {
    // Data
    bookings,
    bookingLinks,
    bookingStats,

    // Loading
    isLoadingBookings,
    isLoadingLinks,

    // Filters
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    bookingTypeFilter,
    setBookingTypeFilter,
    linkSearchQuery,
    setLinkSearchQuery,

    // Navigation
    navigate,

    // Actions
    handleDeleteBooking,
    handleCopyLink,
    handleRegenerateToken,
    handleDeleteLink,

    // Helpers
    isExpired,
    formatDate,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, bookingLinkApi } from '@/api/bookingApi';
import type { Booking, BookingLink, BookingStats } from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLinks, setBookingLinks] = useState<BookingLink[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [debouncedLinkSearch, setDebouncedLinkSearch] = useState('');
  const [bookingStats, setBookingStats] = useState<BookingStats>({ total: 0, withPayment: 0, withoutPayment: 0, thisMonth: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLinkSearch(linkSearchQuery), 500);
    return () => clearTimeout(timer);
  }, [linkSearchQuery]);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoadingBookings(true);
      const filters: { search?: string; has_payment?: boolean } = {};
      if (debouncedSearch.trim()) filters.search = debouncedSearch;
      if (paymentFilter !== 'all') filters.has_payment = paymentFilter === 'with_payment';
      const response = await bookingApi.getAllBookings(filters);
      if (response.success) setBookings(response.data);
    } catch (error) {
      console.error(axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  }, [debouncedSearch, paymentFilter]);

  const fetchBookingLinks = useCallback(async () => {
    try {
      setIsLoadingLinks(true);
      const response = await bookingLinkApi.getAllBookingLinks({ search: debouncedLinkSearch });
      if (response.success) setBookingLinks(response.data);
    } catch (error) {
      console.error(axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat booking links');
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

  useEffect(() => { fetchBookings(); fetchBookingStatistics(); }, [fetchBookings, fetchBookingStatistics]);
  useEffect(() => { fetchBookingLinks(); }, [fetchBookingLinks]);

  const handleDeleteBooking = async (id: number, bookingCode: string) => {
    const result = await Swal.fire({
      title: 'Yakin hapus booking?', text: `Booking ${bookingCode} akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(id);
        Swal.fire('Terhapus!', 'Booking berhasil dihapus', 'success');
        fetchBookings();
        fetchBookingStatistics();
      } catch (error) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus', 'error');
      }
    }
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/booking/${token}`);
    Swal.fire({ icon: 'success', title: 'Tersalin!', text: 'Link berhasil disalin ke clipboard', timer: 1500, showConfirmButton: false });
  };

  const handleRegenerateToken = async (id: number) => {
    const result = await Swal.fire({ title: 'Generate ulang token?', text: 'Link lama tidak akan bisa digunakan lagi', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Generate!' });
    if (result.isConfirmed) {
      try {
        await bookingLinkApi.regenerateToken(id);
        Swal.fire('Berhasil!', 'Token berhasil di-generate ulang', 'success');
        fetchBookingLinks();
      } catch (error) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal generate token', 'error');
      }
    }
  };

  const handleDeleteLink = async (id: number) => {
    const result = await Swal.fire({ title: 'Yakin hapus link?', text: 'Link akan dihapus permanen!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!' });
    if (result.isConfirmed) {
      try {
        await bookingLinkApi.deleteBookingLink(id);
        Swal.fire('Terhapus!', 'Link berhasil dihapus', 'success');
        fetchBookingLinks();
      } catch (error) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus', 'error');
      }
    }
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    bookings, bookingLinks, isLoadingBookings, isLoadingLinks,
    searchQuery, setSearchQuery, paymentFilter, setPaymentFilter,
    linkSearchQuery, setLinkSearchQuery, bookingStats,
    navigate,
    handleDeleteBooking, handleCopyLink, handleRegenerateToken, handleDeleteLink,
    isExpired, formatDate,
  };
}
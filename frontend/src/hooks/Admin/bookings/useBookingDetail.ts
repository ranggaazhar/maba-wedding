// src/hooks/admin/bookings/useBookingDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Check, X } from 'lucide-react';
import { bookingApi } from '@/api/bookingApi';
import type { Booking, PaymentStatus } from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export const paymentStatusConfig: Record<PaymentStatus, {
  label: string;
  style: string;
  icon: React.ElementType;  // ← bukan string, tapi komponen
}> = {
  PENDING: { label: 'Belum Bayar', style: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', style: 'bg-blue-50 text-blue-600 border-blue-200', icon: AlertCircle },
  CONFIRMED: { label: 'DP Dikonfirmasi', style: 'bg-success/10 text-success border-success/20', icon: Check },
  REJECTED: { label: 'Ditolak', style: 'bg-destructive/10 text-destructive border-destructive/20', icon: X },
};

export function useBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchBookingDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await bookingApi.getBookingById(Number(id));
      if (response.success) {
        setBooking(response.data);
        setAdminNotes(response.data.admin_notes || '');
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat detail booking';
      Swal.fire('Error', message, 'error');
      navigate('/bookings');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchBookingDetail(); }, [fetchBookingDetail]);

  const handleConfirmPayment = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Pembayaran?',
      html: `<p>Booking <strong>${booking?.booking_code}</strong> akan dikonfirmasi.</p><p class="text-sm text-gray-500 mt-2">PDF detail booking akan dikirim ke WhatsApp customer.</p>`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#22c55e', confirmButtonText: 'Ya, Konfirmasi!', cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;
    try {
      setIsConfirming(true);
      const response = await bookingApi.confirmPayment(Number(id));
      if (response.success) {
        await Swal.fire({
          title: 'Berhasil!',
          html: `Pembayaran dikonfirmasi.<br/><small>${response.data.whatsapp_sent ? '✅ Notifikasi WA terkirim ke customer.' : '⚠️ WA gagal dikirim, tapi konfirmasi tetap tersimpan.'}</small>`,
          icon: 'success',
        });
        fetchBookingDetail();
      }
    } catch (error: unknown) {
      Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengkonfirmasi pembayaran', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRejectPayment = async () => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Tolak Pembayaran?',
      input: 'textarea', inputLabel: 'Alasan penolakan (opsional)',
      inputPlaceholder: 'Contoh: Bukti transfer tidak jelas, nominal tidak sesuai...',
      inputAttributes: { rows: '3' }, showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Tolak!', cancelButtonText: 'Batal',
    });
    if (!isConfirmed) return;
    try {
      setIsRejecting(true);
      await bookingApi.rejectPayment(Number(id), reason || '');
      Swal.fire('Ditolak', 'Pembayaran telah ditolak', 'info');
      fetchBookingDetail();
    } catch (error: unknown) {
      Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menolak pembayaran', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    const result = await Swal.fire({
      title: 'Yakin hapus booking?', text: `Booking ${booking.booking_code} akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(booking.id);
        Swal.fire('Terhapus!', 'Booking berhasil dihapus', 'success');
        navigate('/bookings');
      } catch (error: unknown) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus', 'error');
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalPropertyCost = booking?.properties?.reduce((sum, p) => sum + parseFloat(p.subtotal), 0) || 0;

  return {
    booking, isLoading, isConfirming, isRejecting,
    adminNotes, setAdminNotes,
    navigate, fetchBookingDetail,
    handleConfirmPayment, handleRejectPayment, handleDelete,
    formatDate, formatDateTime, totalPropertyCost,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Check } from 'lucide-react';
import { bookingApi } from '@/api/bookingApi';
import type {
  Booking,
  PaymentStatus,
} from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

// ── Payment status config ─────────────────────────────────────────────────────

export const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; style: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Belum Bayar',
    style: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
  },
  WAITING_CONFIRMATION: {
    label: 'Menunggu Konfirmasi',
    style: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: 'DP Dikonfirmasi',
    style: 'bg-success/10 text-success border-success/20',
    icon: Check,
  },
};


// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // ── Fetch detail booking ──────────────────────────────────────────────────

  const fetchBookingDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await bookingApi.getBookingById(Number(id));
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Gagal memuat detail booking';
      Swal.fire('Error', message, 'error');
      navigate('/admin/bookings');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchBookingDetail(); }, [fetchBookingDetail]);

  // ── Payment actions ───────────────────────────────────────────────────────

  const handleConfirmPayment = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Pembayaran?',
      html: `<p>Booking <strong>${booking?.booking_code}</strong> akan dikonfirmasi.</p>
             <p class="text-sm text-gray-500 mt-2">PDF detail booking akan dikirim ke WhatsApp customer.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Ya, Konfirmasi!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;

    try {
      setIsConfirming(true);
      const response = await bookingApi.confirmPayment(Number(id));
      if (response.success) {
        await Swal.fire({
          title: 'Berhasil!',
          html: `Pembayaran dikonfirmasi.<br/>
                 <small>${response.data.whatsapp_sent
              ? '✅ Notifikasi WA terkirim ke customer.'
              : '⚠️ WA gagal dikirim, tapi konfirmasi tetap tersimpan.'
            }</small>`,
          icon: 'success',
        });
        fetchBookingDetail();
      }
    } catch (error: unknown) {
      Swal.fire(
        'Gagal!',
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengkonfirmasi pembayaran',
        'error'
      );
    } finally {
      setIsConfirming(false);
    }
  };



  // ── Delete booking ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!booking) return;
    const result = await Swal.fire({
      title: 'Yakin hapus booking?',
      text: `Booking ${booking.booking_code} akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(booking.id);
        Swal.fire('Terhapus!', 'Booking berhasil dihapus', 'success');
        navigate('/admin/bookings');
      } catch (error: unknown) {
        Swal.fire(
          'Gagal!',
          axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus',
          'error'
        );
      }
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const formatCurrency = (value?: string | number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value));
  };

  const totalPropertyCost =
    booking?.properties?.reduce((sum, p) => sum + parseFloat(p.subtotal), 0) || 0;

  const totalModelCost =
    booking?.models?.reduce((sum, m) => sum + parseFloat(m.price || '0'), 0) || 0;

  const totalCustomEstimate = 0;


  return {
    // State
    booking,
    isLoading,
    isConfirming,

    // Actions
    navigate,
    fetchBookingDetail,
    handleConfirmPayment,
    handleDelete,

    // Helpers
    formatDate,
    formatDateTime,
    formatCurrency,

    // Computed
    totalPropertyCost,
    totalModelCost,
    totalCustomEstimate,

    // Config
    paymentStatusConfig,
  };
}
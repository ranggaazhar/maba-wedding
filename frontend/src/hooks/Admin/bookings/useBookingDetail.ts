// src/hooks/admin/bookings/useBookingDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Check, X } from 'lucide-react';
import { bookingApi, customRequestApi } from '@/api/bookingApi';
import type {
  Booking,
  PaymentStatus,
  BookingCustomRequest,
  CustomRequestStatus,
  ReviewCustomRequestData,
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
  REJECTED: {
    label: 'Ditolak',
    style: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: X,
  },
};

// ── Custom request status config ──────────────────────────────────────────────

export const customRequestStatusConfig: Record<
  CustomRequestStatus,
  { label: string; style: string }
> = {
  PENDING: {
    label: 'Menunggu Review',
    style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  REVIEWED: {
    label: 'Sudah Direview',
    style: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  APPROVED: {
    label: 'Disetujui',
    style: 'bg-green-50 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'Ditolak',
    style: 'bg-red-50 text-red-700 border-red-200',
  },
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReviewingRequest, setIsReviewingRequest] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // ── Fetch detail booking ──────────────────────────────────────────────────

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

  const handleRejectPayment = async () => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Tolak Pembayaran?',
      input: 'textarea',
      inputLabel: 'Alasan penolakan (opsional)',
      inputPlaceholder: 'Contoh: Bukti transfer tidak jelas, nominal tidak sesuai...',
      inputAttributes: { rows: '3' },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Tolak!',
      cancelButtonText: 'Batal',
    });
    if (!isConfirmed) return;

    try {
      setIsRejecting(true);
      await bookingApi.rejectPayment(Number(id), reason || '');
      Swal.fire('Ditolak', 'Pembayaran telah ditolak', 'info');
      fetchBookingDetail();
    } catch (error: unknown) {
      Swal.fire(
        'Gagal!',
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menolak pembayaran',
        'error'
      );
    } finally {
      setIsRejecting(false);
    }
  };

  // ── Custom request review ─────────────────────────────────────────────────

  const handleReviewCustomRequest = async (
    request: BookingCustomRequest,
    action: 'APPROVED' | 'REJECTED' | 'REVIEWED'
  ) => {
    // Kalau REJECTED → minta alasan
    let rejectionReason = '';
    if (action === 'REJECTED') {
      const { value, isConfirmed } = await Swal.fire({
        title: 'Tolak Custom Request?',
        input: 'textarea',
        inputLabel: 'Alasan penolakan',
        inputPlaceholder: 'Jelaskan alasan penolakan request ini...',
        inputAttributes: { rows: '3' },
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Tolak Request',
        cancelButtonText: 'Batal',
      });
      if (!isConfirmed) return;
      rejectionReason = value || '';
    }

    // Kalau APPROVED → minta estimasi harga
    let estimatedPrice: number | undefined;
    if (action === 'APPROVED') {
      const { value, isConfirmed } = await Swal.fire({
        title: 'Setujui Custom Request',
        html: `<p class="mb-3">Request: <strong>${request.title}</strong></p>
               <label class="block text-sm text-left mb-1">Estimasi Harga (opsional)</label>
               <input id="swal-price" type="number" min="0" step="1000"
                 class="swal2-input" placeholder="Contoh: 500000" style="width:100%">`,
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        confirmButtonText: 'Setujui',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const val = (document.getElementById('swal-price') as HTMLInputElement)?.value;
          return val ? Number(val) : undefined;
        },
      });
      if (!isConfirmed) return;
      estimatedPrice = value;
    }

    try {
      setIsReviewingRequest(true);
      const reviewData: ReviewCustomRequestData = {
        status: action,
        ...(rejectionReason && { rejection_reason: rejectionReason }),
        ...(estimatedPrice !== undefined && { estimated_price: estimatedPrice }),
      };
      await customRequestApi.review(request.id, reviewData);
      Swal.fire({
        icon: action === 'REJECTED' ? 'info' : 'success',
        title: action === 'APPROVED' ? 'Request Disetujui' : action === 'REJECTED' ? 'Request Ditolak' : 'Request Direview',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBookingDetail();
    } catch (error: unknown) {
      Swal.fire(
        'Gagal!',
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memproses review',
        'error'
      );
    } finally {
      setIsReviewingRequest(false);
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

  const totalCustomEstimate =
    booking?.customRequests?.reduce((sum, r) => sum + parseFloat(r.estimated_price || '0'), 0) || 0;

  // Pending custom requests yang butuh review
  const pendingCustomRequests =
    booking?.customRequests?.filter((r) => r.status === 'PENDING') || [];

  return {
    // State
    booking,
    isLoading,
    isConfirming,
    isRejecting,
    isReviewingRequest,
    adminNotes,
    setAdminNotes,

    // Actions
    navigate,
    fetchBookingDetail,
    handleConfirmPayment,
    handleRejectPayment,
    handleReviewCustomRequest,
    handleDelete,

    // Helpers
    formatDate,
    formatDateTime,
    formatCurrency,

    // Computed
    totalPropertyCost,
    totalModelCost,
    totalCustomEstimate,
    pendingCustomRequests,

    // Config
    paymentStatusConfig,
    customRequestStatusConfig,
  };
}
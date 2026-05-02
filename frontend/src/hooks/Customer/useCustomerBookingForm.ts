// src/hooks/customer/useCustomerBookingForm.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingLinkApi, bookingApi, customRequestApi } from '@/api/bookingApi';
import type { CreateBookingData, CreateCustomRequestData } from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

interface PaymentData {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export type BookingMode = 'catalog' | 'custom' | 'combination' | null;

export function useCustomerBookingForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [bookingCode, setBookingCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ── null = belum pilih mode ───────────────────────────────────────────────
  const [bookingMode, setBookingMode] = useState<BookingMode>(null);

  const [formData, setFormData] = useState<CreateBookingData>({
    booking_link_id: 0,
    customer_name: '',
    customer_phone: '',
    full_address: '',
    event_venue: '',
    event_date: '',
    event_type: '',
    referral_source: '',
    theme_color: '',
    customer_notes: '',
    models: [],
    properties: [],
    custom_requests: [],
  });

  const [customRequests, setCustomRequests] = useState<CreateCustomRequestData[]>([
    { title: '', description: '', color_theme: '', reference_images: [] },
  ]);
  const [customRequestFiles, setCustomRequestFiles] = useState<Record<number, File[]>>({});

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  // ── Total hanya dari katalog ──────────────────────────────────────────────
  const totalEstimate = (() => {
    if (bookingMode === 'custom') return 0;
    let total = 0;
    formData.models?.forEach((m) => { total += Number(m.price || 0); });
    formData.properties?.forEach((p) => { total += Number(p.subtotal || 0); });
    return total;
  })();

  const dpAmount = totalEstimate > 0 ? Math.ceil(totalEstimate * 0.1) : 0;

  const totalSteps = !bookingMode ? 99  // belum dipilih
    : bookingMode === 'catalog'     ? 5  // 1 info | 2 models | 3 props | 4 payment | 5 done
    : bookingMode === 'custom'      ? 4  // 1 info | 2 request | 3 konfirmasi | 4 done
    : 6;                                

  // ── Validate link ─────────────────────────────────────────────────────────
  useEffect(() => {
    const validateLink = async () => {
      if (!token) {
        Swal.fire('Error', 'Token booking tidak valid', 'error');
        navigate('/');
        return;
      }
      try {
        setIsValidating(true);
        const response = await bookingLinkApi.validateBookingLink(token);
        if (response.success) {
          const data = response.data;
          setFormData((prev) => ({
            ...prev,
            booking_link_id: data.id,
            customer_name: data.customer_name || '',
            customer_phone: data.customer_phone || '',
          }));
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : 'Link booking tidak valid atau sudah expired';
        Swal.fire('Error', message, 'error').then(() => navigate('/'));
      } finally {
        setIsValidating(false);
      }
    };
    validateLink();
  }, [token, navigate]);

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const { customer_name, customer_phone, full_address, event_venue, event_date, event_type } = formData;
    if (!customer_name || !customer_phone || !full_address || !event_venue || !event_date || !event_type) {
      Swal.fire('Validasi', 'Mohon lengkapi semua field yang wajib diisi', 'warning');
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (!validateStep1()) return;
    setCurrentStep(2);  
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSelectMode = (mode: BookingMode) => {
    setBookingMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep === 2 && bookingMode !== null) {
      setBookingMode(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Custom request helpers ────────────────────────────────────────────────
  const handleAddCustomRequest = () => {
    setCustomRequests((prev) => [
      ...prev,
      { title: '', description: '', color_theme: '', reference_images: [] },
    ]);
  };

  const handleUpdateCustomRequest = (index: number, data: Partial<CreateCustomRequestData>) => {
    setCustomRequests((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  };

  const handleRemoveCustomRequest = (index: number) => {
    if (customRequests.length <= 1) return;
    setCustomRequests((prev) => prev.filter((_, i) => i !== index));
    setCustomRequestFiles((prev) => {
      const updated = { ...prev };
      delete updated[index];
      const reindexed: Record<number, File[]> = {};
      Object.keys(updated).forEach((key) => {
        const k = Number(key);
        reindexed[k > index ? k - 1 : k] = updated[k];
      });
      return reindexed;
    });
  };

  const handleSetCustomRequestFiles = (index: number, files: File[]) => {
    setCustomRequestFiles((prev) => ({ ...prev, [index]: files }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
 const handleSubmitBooking = async () => {
  try {
    setIsSubmitting(true);

    const hasModels  = (formData.models?.length ?? 0) > 0;
    const validCRs   = customRequests.filter((r) => r.title?.trim() && r.description?.trim());
    const hasCustom  = validCRs.length > 0;

    if (!hasModels && !hasCustom) {
      Swal.fire('Error', 'Pilih model dari katalog atau tambahkan custom request', 'error');
      return;
    }

    const payload: CreateBookingData = {
      ...formData,
      total_estimate: totalEstimate > 0 ? String(totalEstimate) : undefined,
      dp_amount:      dpAmount > 0      ? String(dpAmount)      : undefined,
      custom_requests: hasCustom ? validCRs : [],
    };

    // ↓ Ubah di sini — kirim customRequestFiles sebagai File[][]
    const filesPerRequest: File[][] = validCRs.map((_, index) =>
      customRequestFiles[index] || []
    );

    const bookingResponse = await bookingApi.createBooking(payload, filesPerRequest);

    if (bookingResponse.success) {
      const bookingId = bookingResponse.data.id;
      setCreatedBookingId(bookingId);
      setBookingCode(bookingResponse.data.booking_code);

      if (paymentFile) {
        try {
          await bookingApi.uploadPaymentProof(bookingId, paymentFile, paymentData);
        } catch (uploadError) {
          console.error('Payment upload error:', uploadError);
        }
      }

      setIsSuccess(true);
    }
  } catch (error: unknown) {
    Swal.fire(
      'Error',
      axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan booking',
      'error'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return {
    // Navigation
    currentStep,
    totalSteps,
    isValidating,
    isSubmitting,
    isSuccess,
    handleNextFromStep1,  // khusus step 1
    handleSelectMode,     // pilih mode
    handleNext,
    handleBack,
    handleSubmitBooking,

    // Result
    createdBookingId,
    bookingCode,

    // Mode
    bookingMode,
    setBookingMode,

    // Form
    formData,
    setFormData,

    // Custom requests
    customRequests,
    customRequestFiles,
    handleAddCustomRequest,
    handleUpdateCustomRequest,
    handleRemoveCustomRequest,
    handleSetCustomRequestFiles,

    // Payment
    totalEstimate,
    dpAmount,
    paymentFile,
    setPaymentFile,
    paymentData,
    setPaymentData,
  };
}
// src/hooks/customer/useCustomerBookingForm.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingLinkApi, bookingApi } from '@/api/bookingApi';
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
    { title: '', description: '', color_theme: '#d4a017', reference_images: [] },
  ]);
  const [customRequestFiles, setCustomRequestFiles] = useState<Record<number, File[]>>({});

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  // ── Biaya dasar custom request berdasarkan jenis acara ──────────────────
  const CUSTOM_REQUEST_FEES: Record<string, number> = {
    Wedding: 1_000_000,
    Engagement: 300_000,
  };

  // Fee ini berlaku jika booking memiliki custom request
  const customRequestFee = (() => {
    const hasCustomMode = bookingMode === 'custom' || bookingMode === 'combination';
    if (!hasCustomMode) return 0;
    return CUSTOM_REQUEST_FEES[formData.event_type] ?? 0;
  })();

  // ── Total: katalog + properti + biaya custom request ─────────────────────
  const totalEstimate = (() => {
    let total = 0;
    formData.models?.forEach((m) => { total += Number(m.price || 0); });
    formData.properties?.forEach((p) => { total += Number(p.subtotal || 0); });
    // Tambahkan biaya base custom request jika ada
    total += customRequestFee;
    return total;
  })();

  const dpAmount = (() => {
    // 1. Hitung total katalog (models + properties)
    let catalogTotal = 0;
    formData.models?.forEach((m) => { catalogTotal += Number(m.price || 0); });
    formData.properties?.forEach((p) => { catalogTotal += Number(p.subtotal || 0); });
    const dpCatalog = Math.ceil(catalogTotal * 0.1);

    if (bookingMode === 'catalog') {
      return dpCatalog;
    }

    // Untuk custom & kombinasi, DP flat custom request sesuai jenis acara
    const dpCustomRequest = customRequestFee; // 1.000.000 (Wedding) / 300.000 (Engagement)

    let calculatedDp = 0;
    if (bookingMode === 'custom') {
      // DP = flat DP custom request + 10% properti (jika ada)
      calculatedDp = dpCustomRequest + dpCatalog;
    } else if (bookingMode === 'combination') {
      // DP = 10% katalog (model + properti) + flat DP custom request
      calculatedDp = dpCatalog + dpCustomRequest;
    } else {
      return 0;
    }

    // Cap DP agar tidak melebihi total estimasi
    if (totalEstimate > 0 && calculatedDp > totalEstimate) {
      return totalEstimate;
    }
    return calculatedDp;
  })();

  const totalSteps = !bookingMode ? 99
    : bookingMode === 'catalog' ? 4  // CATALOG_STEPS has 4 steps
      : bookingMode === 'custom' ? 4  // CUSTOM_STEPS now has 4 steps (+ property)
        : 5;                                 // COMBINATION_STEPS has 5 steps
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

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (event_date < todayStr) {
      Swal.fire('Validasi', 'Tanggal acara tidak boleh sebelum hari ini', 'warning');
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
    const totalUploaded = Object.values(customRequestFiles).reduce(
      (sum, files) => sum + (files?.length || 0),
      0
    );
    if (totalUploaded >= 25) {
      Swal.fire('Batas Maksimal', 'Total foto referensi sudah mencapai batas maksimal 25 gambar. Anda tidak dapat menambahkan custom request baru.', 'warning');
      return;
    }
    setCustomRequests((prev) => [
      ...prev,
      { title: '', description: '', color_theme: '#d4a017', reference_images: [] },
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

      const hasModels = (formData.models?.length ?? 0) > 0;
      const validCRs = customRequests.filter((r) => r.title?.trim() && r.description?.trim());
      const hasCustom = validCRs.length > 0;

      if (!hasModels && !hasCustom) {
        Swal.fire('Error', 'Pilih model dari katalog atau tambahkan custom request', 'error');
        return;
      }

      const payload: CreateBookingData = {
        ...formData,
        total_estimate: totalEstimate > 0 ? String(totalEstimate) : undefined,
        dp_amount: dpAmount > 0 ? String(dpAmount) : undefined,
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
    customRequestFee,
    dpAmount,
    paymentFile,
    setPaymentFile,
    paymentData,
    setPaymentData,
  };
}
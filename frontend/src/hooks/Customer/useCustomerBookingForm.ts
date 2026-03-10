import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingLinkApi, bookingApi } from '@/api/bookingApi';
import type { CreateBookingData } from '@/types/booking.types';
import Swal from 'sweetalert2';
import axios from 'axios';

interface PaymentData {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export function useCustomerBookingForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [bookingCode, setBookingCode] = useState('');

  const [formData, setFormData] = useState<CreateBookingData>({
    booking_link_id: 0,
    customer_name: '', customer_phone: '', full_address: '',
    event_venue: '', event_date: '', event_type: '',
    referral_source: '', theme_color: '', total_estimate: '0',
    customer_notes: '', models: [], properties: [],
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({ bank_name: '', account_number: '', account_name: '' });

  const totalEstimate = (() => {
    let total = 0;
    formData.models?.forEach(m => { total += Number(m.price || 0); });
    formData.properties?.forEach(p => { total += Number(p.subtotal || 0); });
    return total;
  })();

  const dpAmount = Math.ceil(totalEstimate * 0.1);

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
          setFormData(prev => ({
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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true);
      if (!formData.customer_name || !formData.customer_phone || !formData.event_date) {
        Swal.fire('Error', 'Data customer tidak lengkap', 'error');
        setCurrentStep(1);
        return;
      }
      if (!formData.models || formData.models.length === 0) {
        Swal.fire('Error', 'Pilih minimal 1 model dekorasi', 'error');
        setCurrentStep(2);
        return;
      }

      const bookingResponse = await bookingApi.createBooking({
        ...formData,
        total_estimate: String(totalEstimate),
        dp_amount: String(dpAmount),
      });

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
        setCurrentStep(5);
      }
    } catch (error: unknown) {
      Swal.fire('Error', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep, isValidating, isSubmitting,
    createdBookingId, bookingCode,
    formData, setFormData,
    paymentFile, setPaymentFile,
    paymentData, setPaymentData,
    totalEstimate, dpAmount,
    handleNext, handleBack, handleSubmitBooking,
  };
}
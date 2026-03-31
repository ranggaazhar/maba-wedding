// src/api/bookingApi.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type {
  Booking, BookingLink, BookingModel, BookingProperty,
  CreateBookingData, PaymentStatus, BookingStats,
} from '@/types/booking.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

class BookingLinkApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  }

  async getAllBookingLinks(filters?: { is_used?: boolean; is_expired?: boolean; search?: string }): Promise<ApiResponse<BookingLink[]>> {
    const params = new URLSearchParams();
    if (filters?.is_used !== undefined) params.append('is_used', String(filters.is_used));
    if (filters?.is_expired !== undefined) params.append('is_expired', String(filters.is_expired));
    if (filters?.search) params.append('search', filters.search);
    // ✅ /booking-links → /bookings/links
    const response = await axios.get(`${API_URL}/bookings/links?${params.toString()}`, this.getAuthHeaders());
    return response.data;
  }

  async getBookingLinkByToken(token: string): Promise<ApiResponse<BookingLink>> {
    // ✅ /booking-links/token → /bookings/links/token
    const response = await axios.get(`${API_URL}/bookings/links/token/${token}`);
    return response.data;
  }

  async validateBookingLink(token: string): Promise<ApiResponse<BookingLink>> {
    const response = await axios.post(`${API_URL}/bookings/links/validate/${token}`);
    return response.data;
  }

  async createBookingLink(data: Partial<BookingLink>): Promise<ApiResponse<BookingLink>> {
    const response = await axios.post(`${API_URL}/bookings/links`, data, this.getAuthHeaders());
    return response.data;
  }

  async updateBookingLink(id: number, data: Partial<BookingLink>): Promise<ApiResponse<BookingLink>> {
    const response = await axios.put(`${API_URL}/bookings/links/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteBookingLink(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/bookings/links/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async regenerateToken(id: number): Promise<ApiResponse<BookingLink>> {
    const response = await axios.patch(`${API_URL}/bookings/links/${id}/regenerate-token`, {}, this.getAuthHeaders());
    return response.data;
  }
}

class BookingApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  }

  async getAllBookings(filters?: {
    search?: string;
    event_date?: string;
    event_date_from?: string;
    event_date_to?: string;
    has_payment?: boolean;
    payment_status?: PaymentStatus;
  }): Promise<ApiResponse<Booking[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.event_date) params.append('event_date', filters.event_date);
    if (filters?.event_date_from) params.append('event_date_from', filters.event_date_from);
    if (filters?.event_date_to) params.append('event_date_to', filters.event_date_to);
    if (filters?.has_payment !== undefined) params.append('has_payment', String(filters.has_payment));
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    const response = await axios.get(`${API_URL}/bookings?${params.toString()}`, this.getAuthHeaders());
    return response.data;
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    const response = await axios.get(`${API_URL}/bookings/${id}`, this.getAuthHeaders());
    const data = response.data;

    if (data.success && data.data) {
      const booking = data.data;
      booking.models = booking.models?.map((m: BookingModel) => {
        const rawPath = m.project?.photos?.find(p => p.is_hero)?.url || m.project?.photos?.[0]?.url || m.project?.thumbnail_url;
        return { ...m, display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png' };
      });
      booking.properties = booking.properties?.map((p: BookingProperty) => {
        const rawPath = p.property?.images?.find(i => i.is_primary)?.url || p.property?.images?.[0]?.url || p.property?.thumbnail_url;
        return { ...p, display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png' };
      });
    }
    return data;
  }

  async getBookingByCode(code: string): Promise<ApiResponse<Booking>> {
    const response = await axios.get(`${API_URL}/bookings/code/${code}`);
    return response.data;
  }

  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    const response = await axios.post(`${API_URL}/bookings`, data);
    return response.data;
  }

  async updateBooking(id: number, data: Partial<CreateBookingData>): Promise<ApiResponse<Booking>> {
    const response = await axios.put(`${API_URL}/bookings/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteBooking(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/bookings/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async uploadPaymentProof(id: number, file: File, paymentData?: {
    bank_name?: string; account_number?: string; account_name?: string;
  }): Promise<ApiResponse<Booking>> {
    const formData = new FormData();
    formData.append('payment_proof', file);
    if (paymentData?.bank_name) formData.append('bank_name', paymentData.bank_name);
    if (paymentData?.account_number) formData.append('account_number', paymentData.account_number);
    if (paymentData?.account_name) formData.append('account_name', paymentData.account_name);
    const response = await axios.post(`${API_URL}/bookings/${id}/payment-proof/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  }

  async deletePaymentProof(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/bookings/${id}/payment-proof`, this.getAuthHeaders());
    return response.data;
  }

  async confirmPayment(id: number): Promise<ApiResponse<{ whatsapp_sent: boolean }>> {
    const response = await axios.post(`${API_URL}/bookings/${id}/confirm-payment`, {}, this.getAuthHeaders());
    return response.data;
  }

  async rejectPayment(id: number, reason?: string): Promise<ApiResponse<Booking>> {
    const response = await axios.post(`${API_URL}/bookings/${id}/reject-payment`, { reason: reason || '' }, this.getAuthHeaders());
    return response.data;
  }

  async getStatistics(): Promise<ApiResponse<BookingStats>> {
    const response = await axios.get(`${API_URL}/bookings/statistics`, this.getAuthHeaders());
    return response.data;
  }
}

export const bookingLinkApi = new BookingLinkApi();
export const bookingApi = new BookingApi();
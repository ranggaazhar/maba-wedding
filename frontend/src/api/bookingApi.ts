// src/api/bookingApi.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type {
  Booking,
  BookingLink,
  BookingModel,
  BookingProperty,
  BookingCustomRequest,
  CreateBookingData,
  UpdateBookingData,
  CreateCustomRequestData,
  UpdateCustomRequestData,
  ReviewCustomRequestData,
  CustomRequestStats,
  CustomRequestFilters,
  PaymentStatus,
  BookingStats,
} from '@/types/booking.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

// ─────────────────────────────────────────────────────────────────────────────
// BookingLink API
// ─────────────────────────────────────────────────────────────────────────────

class BookingLinkApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getAllBookingLinks(filters?: {
    is_used?: boolean;
    is_expired?: boolean;
    search?: string;
  }): Promise<ApiResponse<BookingLink[]>> {
    const params = new URLSearchParams();
    if (filters?.is_used !== undefined) params.append('is_used', String(filters.is_used));
    if (filters?.is_expired !== undefined) params.append('is_expired', String(filters.is_expired));
    if (filters?.search) params.append('search', filters.search);
    const response = await axios.get(
      `${API_URL}/bookings/links?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getBookingLinkByToken(token: string): Promise<ApiResponse<BookingLink>> {
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
    const response = await axios.patch(
      `${API_URL}/bookings/links/${id}/regenerate-token`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking API
// ─────────────────────────────────────────────────────────────────────────────

class BookingApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  /** Hydrate display_image untuk models & properties */
  private hydrateBooking(booking: Booking): Booking {
    booking.models = booking.models?.map((m: BookingModel) => {
      const rawPath =
        m.project?.photos?.find((p) => p.is_hero)?.url ||
        m.project?.photos?.[0]?.url ||
        m.project?.thumbnail_url;
      return {
        ...m,
        display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png',
      };
    });

    booking.properties = booking.properties?.map((p: BookingProperty) => {
      const rawPath =
        p.property?.images?.find((i) => i.is_primary)?.url ||
        p.property?.images?.[0]?.url ||
        p.property?.thumbnail_url;
      return {
        ...p,
        display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png',
      };
    });

    return booking;
  }

  async getAllBookings(filters?: {
    search?: string;
    event_date?: string;
    event_date_from?: string;
    event_date_to?: string;
    has_payment?: boolean;
    payment_status?: PaymentStatus;
    has_custom_request?: boolean;
  }): Promise<ApiResponse<Booking[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.event_date) params.append('event_date', filters.event_date);
    if (filters?.event_date_from) params.append('event_date_from', filters.event_date_from);
    if (filters?.event_date_to) params.append('event_date_to', filters.event_date_to);
    if (filters?.has_payment !== undefined) params.append('has_payment', String(filters.has_payment));
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.has_custom_request !== undefined)
      params.append('has_custom_request', String(filters.has_custom_request));

    const response = await axios.get(
      `${API_URL}/bookings?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    const response = await axios.get(`${API_URL}/bookings/${id}`, this.getAuthHeaders());
    const data = response.data;
    if (data.success && data.data) {
      data.data = this.hydrateBooking(data.data);
    }
    return data;
  }

  async getBookingByCode(code: string): Promise<ApiResponse<Booking>> {
    const response = await axios.get(`${API_URL}/bookings/code/${code}`);
    return response.data;
  }

  async createBooking(
  data: CreateBookingData,
  customRequestFiles?: File[][]
): Promise<ApiResponse<Booking>> {

  const formData = new FormData();

  // Field biasa
  formData.append('booking_link_id', String(data.booking_link_id));
  formData.append('customer_name', data.customer_name);
  formData.append('customer_phone', data.customer_phone);
  formData.append('full_address', data.full_address);
  formData.append('event_venue', data.event_venue);
  formData.append('event_date', data.event_date);
  formData.append('event_type', data.event_type);
  if (data.referral_source) formData.append('referral_source', data.referral_source);
  if (data.theme_color) formData.append('theme_color', data.theme_color);
  if (data.total_estimate) formData.append('total_estimate', data.total_estimate);
  if (data.dp_amount) formData.append('dp_amount', data.dp_amount);
  if (data.customer_notes) formData.append('customer_notes', data.customer_notes);

  // Array → JSON string
  formData.append('models', JSON.stringify(data.models || []));
  formData.append('properties', JSON.stringify(data.properties || []));

  // Custom requests dengan image_count sebagai penanda batas file
  const customRequestsMeta = (data.custom_requests || []).map((cr, index) => ({
    title:       cr.title,
    description: cr.description,
    color_theme: cr.color_theme || null,
    image_count: customRequestFiles?.[index]?.length || 0,
  }));
  formData.append('custom_requests', JSON.stringify(customRequestsMeta));

  // Append semua file berurutan — request 0 dulu, lalu request 1, dst
  if (customRequestFiles) {
    customRequestFiles.forEach(files => {
      files.forEach(file => {
        formData.append('custom_request_images', file);
      });
    });
  }

  const response = await axios.post(`${API_URL}/bookings`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
}

  async updateBooking(id: number, data: UpdateBookingData): Promise<ApiResponse<Booking>> {
    const response = await axios.put(`${API_URL}/bookings/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteBooking(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/bookings/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async uploadPaymentProof(
    id: number,
    file: File,
    paymentData?: {
      bank_name?: string;
      account_number?: string;
      account_name?: string;
    }
  ): Promise<ApiResponse<Booking>> {
    const formData = new FormData();
    formData.append('payment_proof', file);
    if (paymentData?.bank_name) formData.append('bank_name', paymentData.bank_name);
    if (paymentData?.account_number) formData.append('account_number', paymentData.account_number);
    if (paymentData?.account_name) formData.append('account_name', paymentData.account_name);
    const response = await axios.post(
      `${API_URL}/bookings/${id}/payment-proof/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async deletePaymentProof(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(
      `${API_URL}/bookings/${id}/payment-proof`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async confirmPayment(id: number): Promise<ApiResponse<{ whatsapp_sent: boolean }>> {
    const response = await axios.post(
      `${API_URL}/bookings/${id}/confirm-payment`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async rejectPayment(id: number, reason?: string): Promise<ApiResponse<Booking>> {
    const response = await axios.post(
      `${API_URL}/bookings/${id}/reject-payment`,
      { reason: reason || '' },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getStatistics(): Promise<ApiResponse<BookingStats>> {
    const response = await axios.get(`${API_URL}/bookings/statistics`, this.getAuthHeaders());
    return response.data;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Request API
// ─────────────────────────────────────────────────────────────────────────────

class CustomRequestApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async getByBooking(bookingId: number): Promise<ApiResponse<BookingCustomRequest[]>> {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}/custom-requests`);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<BookingCustomRequest>> {
    const response = await axios.get(`${API_URL}/custom-requests/${id}`);
    return response.data;
  }

  async create(
    bookingId: number,
    data: CreateCustomRequestData,
    files?: File[]
  ): Promise<ApiResponse<BookingCustomRequest>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.color_theme) formData.append('color_theme', data.color_theme);
    if (data.reference_images) {
      data.reference_images.forEach((url) => formData.append('reference_images', url));
    }
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('reference_images', file));
    }
    const response = await axios.post(
      `${API_URL}/bookings/${bookingId}/custom-requests`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
  async update(
    id: number,
    data: UpdateCustomRequestData,
    files?: File[]
  ): Promise<ApiResponse<BookingCustomRequest>> {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.color_theme !== undefined) formData.append('color_theme', data.color_theme);
    if (data.replace_images !== undefined)
      formData.append('replace_images', String(data.replace_images));
    if (data.reference_images) {
      data.reference_images.forEach((url) => formData.append('reference_images', url));
    }
    if (files && files.length > 0) {
      files.forEach((file) => formData.append('reference_images', file));
    }
    const response = await axios.put(`${API_URL}/custom-requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/custom-requests/${id}`);
    return response.data;
  }
  async deleteImage(id: number, index: number): Promise<ApiResponse<BookingCustomRequest>> {
    const response = await axios.delete(`${API_URL}/custom-requests/${id}/images/${index}`);
    return response.data;
  }

  async getAll(filters?: CustomRequestFilters): Promise<ApiResponse<BookingCustomRequest[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.booking_id) params.append('booking_id', String(filters.booking_id));
    if (filters?.search) params.append('search', filters.search);
    const response = await axios.get(
      `${API_URL}/admin/custom-requests?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async review(
    id: number,
    data: ReviewCustomRequestData
  ): Promise<ApiResponse<BookingCustomRequest>> {
    const response = await axios.patch(
      `${API_URL}/admin/custom-requests/${id}/review`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getStatistics(): Promise<ApiResponse<CustomRequestStats>> {
    const response = await axios.get(
      `${API_URL}/admin/custom-requests/statistics`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const bookingLinkApi = new BookingLinkApi();
export const bookingApi = new BookingApi();
export const customRequestApi = new CustomRequestApi();
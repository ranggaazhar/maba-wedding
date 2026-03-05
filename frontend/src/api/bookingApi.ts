// src/api/bookingApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ========== INTERFACES ==========
export interface PropertyImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface ProjectPhoto {
  id: number;
  url: string;
  is_hero: boolean;
  caption?: string;
}

export interface BookingLink {
  id: number;
  token: string;
  customer_name?: string;
  customer_phone?: string;
  expires_at?: string;
  is_used: boolean;
  sent_at?: string;
  created_by?: number;
  notes?: string;
  created_at: string;
  booking?: Booking;
}

export interface BookingModel {
  id?: number;
  booking_id?: number;
  category_id: number;
  project_id: number;
  project_title: string;
  price?: string;
  notes?: string;
  display_order?: number;
  category?: { name: string };
  project?: {
    photos: ProjectPhoto[];
    thumbnail_url?: string;
  };
  display_image?: string;
}

export interface BookingProperty {
  id?: number;
  booking_id?: number;
  property_id?: number;
  property_name: string;
  property_category: string;
  quantity: number;
  price: string;
  subtotal: string;
  property?: {
    images: PropertyImage[];
    thumbnail_url?: string;
  };
  display_image?: string;
}

export interface Booking {
  id: number;
  booking_link_id: number;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  full_address: string;
  event_venue: string;
  event_date: string;
  event_type: string;
  referral_source?: string;
  theme_color?: string;
  total_estimate?: string;
  customer_notes?: string;
  admin_notes?: string;
  payment_proof_url?: string;
  payment_proof_full_url?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  payment_date?: string;
  submitted_at: string;
  updated_at: string;
  bookingLink?: BookingLink;
  models?: BookingModel[];
  properties?: BookingProperty[];
}

export interface CreateBookingData {
  booking_link_id: number;
  customer_name: string;
  customer_phone: string;
  full_address: string;
  event_venue: string;
  event_date: string;
  event_type: string;
  referral_source?: string;
  theme_color?: string;
  total_estimate?: string;
  customer_notes?: string;
  models?: BookingModel[];
  properties?: BookingProperty[];
}

// ========== API CLASSES ==========

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
  }) {
    const params = new URLSearchParams();
    if (filters?.is_used !== undefined) params.append('is_used', String(filters.is_used));
    if (filters?.is_expired !== undefined) params.append('is_expired', String(filters.is_expired));
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(
      `${API_URL}/booking-links?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getBookingLinkByToken(token: string) {
    const response = await axios.get(`${API_URL}/booking-links/token/${token}`);
    return response.data;
  }

  async validateBookingLink(token: string) {
    const response = await axios.post(`${API_URL}/booking-links/validate/${token}`);
    return response.data;
  }

  async createBookingLink(data: Partial<BookingLink>) {
    const response = await axios.post(
      `${API_URL}/booking-links`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateBookingLink(id: number, data: Partial<BookingLink>) {
    const response = await axios.put(
      `${API_URL}/booking-links/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteBookingLink(id: number) {
    const response = await axios.delete(
      `${API_URL}/booking-links/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async regenerateToken(id: number) {
    const response = await axios.patch(
      `${API_URL}/booking-links/${id}/regenerate-token`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
}

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

  async getAllBookings(filters?: {
    search?: string;
    event_date?: string;
    event_date_from?: string;
    event_date_to?: string;
    has_payment?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.event_date) params.append('event_date', filters.event_date);
    if (filters?.event_date_from) params.append('event_date_from', filters.event_date_from);
    if (filters?.event_date_to) params.append('event_date_to', filters.event_date_to);
    if (filters?.has_payment !== undefined) params.append('has_payment', String(filters.has_payment));

    const response = await axios.get(
      `${API_URL}/bookings?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getBookingById(id: number) {
    const response = await axios.get(
      `${API_URL}/bookings/${id}`,
      this.getAuthHeaders()
    );

    const data = response.data;

    // --- HELPER PROSES GAMBAR ---
    if (data.success && data.data) {
      const booking = data.data;
      const BASE_URL = API_URL.replace('/api', '');

      // Proses Gambar Model
      booking.models = booking.models?.map((m: BookingModel) => {
        const rawPath = m.project?.photos?.find(p => p.is_hero)?.url || 
                        m.project?.photos?.[0]?.url || 
                        m.project?.thumbnail_url;
        return {
          ...m,
          display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png'
        };
      });

      // Proses Gambar Property
      booking.properties = booking.properties?.map((p: BookingProperty) => {
        const rawPath = p.property?.images?.find(i => i.is_primary)?.url || 
                        p.property?.images?.[0]?.url || 
                        p.property?.thumbnail_url;
        return {
          ...p,
          display_image: rawPath ? `${BASE_URL}/${rawPath}` : '/placeholder.png'
        };
      });
    }

    return data;
  }

  async getBookingByCode(code: string) {
    const response = await axios.get(`${API_URL}/bookings/code/${code}`);
    return response.data;
  }

  async createBooking(data: CreateBookingData) {
    const response = await axios.post(`${API_URL}/bookings`, data);
    return response.data;
  }

  async updateBooking(id: number, data: Partial<CreateBookingData>) {
    const response = await axios.put(
      `${API_URL}/bookings/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteBooking(id: number) {
    const response = await axios.delete(
      `${API_URL}/bookings/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async uploadPaymentProof(id: number, file: File, paymentData?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  }) {
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

  async deletePaymentProof(id: number) {
    const response = await axios.delete(
      `${API_URL}/bookings/${id}/payment-proof`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getStatistics() {
    const response = await axios.get(
      `${API_URL}/bookings/statistics`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const bookingLinkApi = new BookingLinkApi();
export const bookingApi = new BookingApi();
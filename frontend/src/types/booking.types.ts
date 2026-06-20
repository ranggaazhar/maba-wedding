// src/types/booking.types.ts



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
    image_url?: string;
    thumbnail_url?: string;
  };
  display_image?: string;
}

export type PaymentStatus = 'PENDING' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';

// ── Custom Request ────────────────────────────────────────────────────────────

export type CustomRequestStatus = 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

export interface BookingCustomRequest {
  id: number;
  booking_id: number;
  title: string;
  description: string;
  color_theme?: string;
  reference_images?: string[];
  reference_images_urls?: string[];
  estimated_price?: string;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  status: CustomRequestStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  booking?: Pick<
    Booking,
    'id' | 'booking_code' | 'customer_name' | 'customer_phone' | 'event_date' | 'event_venue'
  >;
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCustomRequestData {
  title: string;
  description: string;
  color_theme?: string;
  reference_images?: string[];
}

export interface UpdateCustomRequestData {
  title?: string;
  description?: string;
  color_theme?: string;
  reference_images?: string[];
  replace_images?: boolean;
}

export interface ReviewCustomRequestData {
  status: 'REVIEWED' | 'APPROVED' | 'REJECTED';
  estimated_price?: number;
  admin_notes?: string;
  rejection_reason?: string;
}

export interface CustomRequestStats {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
}

export interface CustomRequestFilters {
  status?: CustomRequestStatus;
  booking_id?: number;
  search?: string;
}

// ── Booking ───────────────────────────────────────────────────────────────────

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
  dp_amount?: string;
  customer_notes?: string;
  admin_notes?: string;
  payment_proof_url?: string;
  payment_proof_full_url?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  payment_date?: string;
  payment_status: PaymentStatus;
  confirmed_by?: number;
  confirmed_at?: string;
  rejection_reason?: string;
  submitted_at: string;
  updated_at: string;
  // ── Tipe booking ──────────────────────────────────────────────
  has_custom_request: boolean;
  // ── Relasi ────────────────────────────────────────────────────
  bookingLink?: BookingLink;
  models?: BookingModel[];
  properties?: BookingProperty[];
  customRequests?: BookingCustomRequest[];
  invoice?: {
    id: number;
    invoice_number: string;
    status: string;
    total_amount: string;
  };
}

// ── Booking tipe helper ───────────────────────────────────────────────────────

export type BookingType = 'CATALOG' | 'CUSTOM' | 'COMBINATION';

export function getBookingType(booking: Pick<Booking, 'has_custom_request' | 'models'>): BookingType {
  const hasModels = (booking.models?.length ?? 0) > 0;
  const hasCustom = booking.has_custom_request;

  if (hasModels && hasCustom) return 'COMBINATION';
  if (hasCustom) return 'CUSTOM';
  return 'CATALOG';
}

// ── Create / Update ───────────────────────────────────────────────────────────

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
  dp_amount?: string;
  customer_notes?: string;
  models?: BookingModel[];
  properties?: BookingProperty[];
  custom_requests?: CreateCustomRequestData[];
}

export interface UpdateBookingData {
  customer_name?: string;
  customer_phone?: string;
  full_address?: string;
  event_venue?: string;
  event_date?: string;
  event_type?: string;
  referral_source?: string;
  theme_color?: string;
  total_estimate?: string;
  dp_amount?: string;
  customer_notes?: string;
  models?: BookingModel[];
  properties?: BookingProperty[];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface BookingStats {
  total: number;
  withPayment: number;
  withoutPayment: number;
  thisMonth: number;
}
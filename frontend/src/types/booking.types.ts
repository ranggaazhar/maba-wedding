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

export type PaymentStatus = 'PENDING' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';

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
  dp_amount?: string;
  customer_notes?: string;
  models?: BookingModel[];
  properties?: BookingProperty[];
}

export interface BookingStats {
  total: number;
  withPayment: number;
  withoutPayment: number;
  thisMonth: number;
}
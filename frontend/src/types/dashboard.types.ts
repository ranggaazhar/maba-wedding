// src/types/dashboard.types.ts

export interface BookingByStatus {
  pending: number;
  waitingConfirmation: number;
  confirmed: number;
  rejected: number;
}

export interface MonthlyBookingChart {
  month: string;   // "2025-01"
  total: string;
  revenue: string | null;
}

export interface DashboardStats {
  bookings: {
    total: number;
    thisMonth: number;
    trend: number;       // % vs bulan lalu, bisa negatif
    byStatus: BookingByStatus;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    trend: number;
    totalDpConfirmed: number;
    totalEstimateAll: number;
  };
  projects: {
    total: number;
    published: number;
  };
  properties: {
    total: number;
    available: number;
  };
  reviews: {
    total: number;
    avgRating: string;  // "4.9"
  };
  charts: {
    monthlyBookings: MonthlyBookingChart[];
  };
}

export interface DashboardRecentBooking {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  event_date: string;
  event_venue: string;
  event_type: string;
  total_estimate: number | null;
  dp_amount: number | null;
  payment_status: 'PENDING' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';
  submitted_at: string;
}

export interface DashboardRecentReview {
  id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  submitted_at: string;
}
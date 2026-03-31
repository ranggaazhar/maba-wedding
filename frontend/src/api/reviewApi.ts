// src/api/reviewApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ============================================================
// INTERFACES
// ============================================================

export interface Review {
  id: number;
  review_link_id: number;
  customer_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_published: boolean;
  is_featured: boolean;
  admin_reply?: string;
  replied_at?: string;
  replied_by?: number;
  moderated_at?: string;
  moderated_by?: number;
  submitted_at: string;
  reviewLink?: {
    id: number;
    token: string;
    booking_id: number;
    booking?: {
      id: number;
      booking_code: string;
      customer_name: string;
      event_date: string;
      event_type: string;
      event_venue: string;
    };
  };
  replier?: { id: number; name: string; email: string };
  moderator?: { id: number; name: string; email: string };
}

export interface ReviewLink {
  id: number;
  booking_id: number;
  token: string;
  expires_at?: string;
  is_used: boolean;
  sent_at?: string;
  created_by?: number;
  created_at: string;
  booking?: {
    id: number;
    booking_code: string;
    customer_name: string;
    customer_phone: string;
    event_date: string;
    event_type: string;
    event_venue: string;
  };
  review?: Review;
  creator?: { id: number; name: string; email: string };
}

export interface ReviewStatistics {
  total: number;
  approved: number;
  published: number;
  featured: number;
  pending: number;
  withReply: number;
  averageRating: string;
  totalReviews: number;
}

export interface ReviewLinkStatistics {
  total: number;
  used: number;
  expired: number;
  active: number;
  unused: number;
}

export interface CreateReviewData {
  review_link_id: number;
  customer_name: string;
  rating: number;
  review_text: string;
}

// ============================================================
// REVIEW API
// ============================================================

class ReviewApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // ── Reviews ────────────────────────────────────────────────

  async getAllReviews(filters?: {
    is_approved?: boolean;
    is_published?: boolean;
    is_featured?: boolean;
    rating?: number;
    min_rating?: number;
    search?: string;
    has_reply?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_approved !== undefined) params.append('is_approved', String(filters.is_approved));
    if (filters?.is_published !== undefined) params.append('is_published', String(filters.is_published));
    if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters?.rating) params.append('rating', String(filters.rating));
    if (filters?.min_rating) params.append('min_rating', String(filters.min_rating));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.has_reply !== undefined) params.append('has_reply', String(filters.has_reply));

    const response = await axios.get(
      `${API_URL}/reviews?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getReviewById(id: number) {
    const response = await axios.get(`${API_URL}/reviews/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async getStatistics() {
    const response = await axios.get(`${API_URL}/reviews/statistics`, this.getAuthHeaders());
    return response.data;
  }

  async getPublishedReviews(limit?: number, featuredOnly?: boolean) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (featuredOnly) params.append('featured_only', 'true');
    const response = await axios.get(`${API_URL}/reviews/published?${params.toString()}`);
    return response.data;
  }

  async getAverageRating() {
    const response = await axios.get(`${API_URL}/reviews/average-rating`);
    return response.data;
  }

  async getRatingDistribution() {
    const response = await axios.get(`${API_URL}/reviews/rating-distribution`);
    return response.data;
  }

  async createReview(data: CreateReviewData) {
    const response = await axios.post(`${API_URL}/reviews`, data);
    return response.data;
  }

  async updateReview(id: number, data: Partial<CreateReviewData>) {
    const response = await axios.put(`${API_URL}/reviews/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteReview(id: number) {
    const response = await axios.delete(`${API_URL}/reviews/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async submitReply(id: number, adminReply: string) {
    const response = await axios.post(
      `${API_URL}/reviews/${id}/reply`,
      { admin_reply: adminReply },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async moderateReview(id: number, isApproved: boolean) {
    const response = await axios.post(
      `${API_URL}/reviews/${id}/moderate`,
      { is_approved: isApproved },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async togglePublishStatus(id: number) {
    const response = await axios.patch(
      `${API_URL}/reviews/${id}/toggle-publish`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async toggleFeaturedStatus(id: number) {
    const response = await axios.patch(
      `${API_URL}/reviews/${id}/toggle-featured`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ── Review Links ───────────────────────────────────────────
  // ✅ Semua /review-links → /reviews/links (ikut struktur route baru)

  async getAllReviewLinks(filters?: {
    is_used?: boolean;
    is_expired?: boolean;
    search?: string;
    include_review?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_used !== undefined) params.append('is_used', String(filters.is_used));
    if (filters?.is_expired !== undefined) params.append('is_expired', String(filters.is_expired));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_review) params.append('include_review', 'true');

    const response = await axios.get(
      `${API_URL}/reviews/links?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getReviewLinkByToken(token: string) {
    const response = await axios.get(`${API_URL}/reviews/links/token/${token}`);
    return response.data;
  }

  async validateReviewLink(token: string) {
    const response = await axios.post(`${API_URL}/reviews/links/validate/${token}`);
    return response.data;
  }

  async createReviewLink(bookingId: number) {
    const response = await axios.post(
      `${API_URL}/reviews/links`,
      { booking_id: bookingId },
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteReviewLink(id: number) {
    const response = await axios.delete(`${API_URL}/reviews/links/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async regenerateToken(id: number) {
    const response = await axios.patch(
      `${API_URL}/reviews/links/${id}/regenerate-token`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getReviewLinkStatistics() {
    const response = await axios.get(`${API_URL}/reviews/links/statistics`, this.getAuthHeaders());
    return response.data;
  }
}

export const reviewApi = new ReviewApi();
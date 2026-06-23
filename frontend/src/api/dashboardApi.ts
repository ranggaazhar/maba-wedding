// src/api/dashboardApi.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type {
  DashboardStats,
  DashboardRecentBooking,
  DashboardRecentReview,
} from '@/types/dashboard.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class DashboardApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await axios.get(`${API_URL}/dashboard/stats`, this.getAuthHeaders());
    return data;
  }

  async getRecentBookings(limit = 5): Promise<ApiResponse<DashboardRecentBooking[]>> {
    const { data } = await axios.get(`${API_URL}/dashboard/recent-bookings`, {
      params: { limit },
      ...this.getAuthHeaders(),
    });
    return data;
  }

  async getRecentReviews(limit = 5): Promise<ApiResponse<DashboardRecentReview[]>> {
    const { data } = await axios.get(`${API_URL}/dashboard/recent-reviews`, {
      params: { limit },
      ...this.getAuthHeaders(),
    });
    return data;
  }

  async globalSearch(q: string): Promise<ApiResponse<{
    bookings: { id: number; code: string; name: string }[];
    projects: { id: number; slug: string; title: string }[];
    properties: { id: number; name: string }[];
    invoices: { id: number; invoice_number: string; customer_name: string }[];
    reviews: { id: number; customer_name: string; rating: number; review_text: string }[];
    propertyCategories: { id: number; name: string }[];
    categories: { id: number; name: string }[];
  }>> {
    const { data } = await axios.get(`${API_URL}/search`, {
      params: { q },
      ...this.getAuthHeaders(),
    });
    return data;
  }

  async getNotifications(): Promise<ApiResponse<{
    notifications: {
      id: string;
      type: 'booking' | 'review';
      target_id: number;
      title: string;
      message: string;
      date: string;
      unread: boolean;
    }[];
    unreadCount: number;
  }>> {
    const { data } = await axios.get(`${API_URL}/notifications`, this.getAuthHeaders());
    return data;
  }
}

export const dashboardApi = new DashboardApi();
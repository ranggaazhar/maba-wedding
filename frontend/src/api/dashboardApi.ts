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
}

export const dashboardApi = new DashboardApi();
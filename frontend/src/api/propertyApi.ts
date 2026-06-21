// src/api/propertyApi.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type { Property } from '@/types/property.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class PropertyApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  private getMultipartHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };
  }

  async getAllProperties(filters?: {
    is_available?: boolean;
    category_id?: number;
    search?: string;
    include_images?: boolean;
  }): Promise<ApiResponse<Property[]>> {
    const params = new URLSearchParams();
    if (filters?.is_available !== undefined) params.append('is_available', String(filters.is_available));
    if (filters?.category_id) params.append('category_id', String(filters.category_id));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_images) params.append('include_images', 'true');

    const response = await axios.get(`${API_URL}/properties?${params.toString()}`, this.getAuthHeaders());
    return response.data;
  }

  async getPropertyById(id: number): Promise<ApiResponse<Property>> {
    const response = await axios.get(`${API_URL}/properties/${id}?include_relations=true`, this.getAuthHeaders());
    return response.data;
  }

  async createProperty(formData: FormData): Promise<ApiResponse<Property>> {
    const response = await axios.post(`${API_URL}/properties`, formData, this.getMultipartHeaders());
    return response.data;
  }

  async updateProperty(id: number, formData: FormData): Promise<ApiResponse<Property>> {
    const response = await axios.put(`${API_URL}/properties/${id}`, formData, this.getMultipartHeaders());
    return response.data;
  }

  async deleteProperty(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(`${API_URL}/properties/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async toggleAvailability(id: number): Promise<ApiResponse<Property>> {
    const response = await axios.patch(`${API_URL}/properties/${id}/toggle-availability`, {}, this.getAuthHeaders());
    return response.data;
  }
}

export const propertyApi = new PropertyApi();
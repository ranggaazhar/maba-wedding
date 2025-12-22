// src/api/propertyCategoryApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Buat interface untuk item properti agar tidak pakai 'any'
export interface PropertyItem {
  id: number;
  name: string;
  // tambahkan field lain jika perlu
}

export interface PropertyCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  properties?: PropertyItem[]; // GANTI: dari any[] ke PropertyItem[]
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyCategoryData {
  slug: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

// GANTI: Jangan pakai interface kosong, pakai type saja
export type UpdatePropertyCategoryData = Partial<CreatePropertyCategoryData>;

class PropertyCategoryApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getAllPropertyCategories(filters?: {
    is_active?: boolean;
    search?: string;
    include_properties?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_properties) params.append('include_properties', 'true');

    const response = await axios.get(
      `${API_URL}/property-categories?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getPropertyCategoryById(id: number, includeRelations = false) {
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await axios.get(
      `${API_URL}/property-categories/${id}${params}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getPropertyCategoryBySlug(slug: string, includeRelations = false) {
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await axios.get(
      `${API_URL}/property-categories/slug/${slug}${params}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createPropertyCategory(data: CreatePropertyCategoryData) {
    const response = await axios.post(
      `${API_URL}/property-categories`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updatePropertyCategory(id: number, data: UpdatePropertyCategoryData) {
    const response = await axios.put(
      `${API_URL}/property-categories/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deletePropertyCategory(id: number) {
    const response = await axios.delete(
      `${API_URL}/property-categories/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async togglePropertyCategoryStatus(id: number) {
    const response = await axios.patch(
      `${API_URL}/property-categories/${id}/toggle-status`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const propertyCategoryApi = new PropertyCategoryApi();
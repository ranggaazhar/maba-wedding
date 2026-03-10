// src/api/propertyCategoryApi.ts
import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type {
  PropertyCategory,
  CreatePropertyCategoryData,
  UpdatePropertyCategoryData,
} from '@/types/propertyCategory.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  }): Promise<ApiResponse<PropertyCategory[]>> {
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

  async getPropertyCategoryById(id: number, includeRelations = false): Promise<ApiResponse<PropertyCategory>> {
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await axios.get(
      `${API_URL}/property-categories/${id}${params}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getPropertyCategoryBySlug(slug: string, includeRelations = false): Promise<ApiResponse<PropertyCategory>> {
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await axios.get(
      `${API_URL}/property-categories/slug/${slug}${params}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createPropertyCategory(data: CreatePropertyCategoryData): Promise<ApiResponse<PropertyCategory>> {
    const response = await axios.post(
      `${API_URL}/property-categories`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updatePropertyCategory(id: number, data: UpdatePropertyCategoryData): Promise<ApiResponse<PropertyCategory>> {
    const response = await axios.put(
      `${API_URL}/property-categories/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deletePropertyCategory(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(
      `${API_URL}/property-categories/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async togglePropertyCategoryStatus(id: number): Promise<ApiResponse<PropertyCategory>> {
    const response = await axios.patch(
      `${API_URL}/property-categories/${id}/toggle-status`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const propertyCategoryApi = new PropertyCategoryApi();
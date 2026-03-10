import axios from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type { Category, CreateCategoryData, UpdateCategoryData } from '@/types/category.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class CategoryApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getAllCategories(filters?: {
    is_active?: boolean;
    search?: string;
    include_projects?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_projects) params.append('include_projects', 'true');

    const response = await axios.get(
      `${API_URL}/categories?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getCategoryById(id: number, includeRelations = false): Promise<ApiResponse<Category>> {
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await axios.get(
      `${API_URL}/categories/${id}${params}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    const response = await axios.post(
      `${API_URL}/categories`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async updateCategory(id: number, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    const response = await axios.put(
      `${API_URL}/categories/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete(
      `${API_URL}/categories/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async toggleCategoryStatus(id: number): Promise<ApiResponse<Category>> {
    const response = await axios.patch(
      `${API_URL}/categories/${id}/toggle-status`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const categoryApi = new CategoryApi();
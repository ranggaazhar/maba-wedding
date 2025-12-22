// src/api/propertyApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PropertyImage {
  id: number;
  property_id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Property {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  price: string;
  stock_quantity: number;
  is_available: boolean;
  image_url?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  category?: PropertyCategory;
  images?: PropertyImage[];
}

export interface CreatePropertyData {
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  price: string;
  stock_quantity?: number;
  is_available?: boolean;
  image_url?: string;
}

export interface PropertyFormData extends CreatePropertyData {
  images: File[];
  primary_image_index?: number;
}

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

  // Get all properties
  async getAllProperties(filters?: {
    is_available?: boolean;
    category_id?: number;
    search?: string;
    include_images?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_available !== undefined) params.append('is_available', String(filters.is_available));
    if (filters?.category_id) params.append('category_id', String(filters.category_id));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_images) params.append('include_images', 'true');

    const response = await axios.get(
      `${API_URL}/properties?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Get property by ID
  async getPropertyById(id: number) {
    const response = await axios.get(
      `${API_URL}/properties/${id}?include_relations=true`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ✅ FIXED: Create property with images
  async createProperty(data: PropertyFormData) {
    // 1. Create property first
    const propertyData: CreatePropertyData = {
      name: data.name,
      slug: data.slug,
      category_id: data.category_id,
      description: data.description,
      price: data.price,
      stock_quantity: data.stock_quantity || 1,
      is_available: data.is_available ?? true,
    };

    const propertyResponse = await axios.post(
      `${API_URL}/properties`,
      propertyData,
      this.getAuthHeaders()
    );

    const createdProperty = propertyResponse.data.data;

    // 2. Upload images if any
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      
      data.images.forEach((file) => {
        formData.append('images', file);
      });

      // ✅ FIXED: Send primary_image_index, not boolean
      if (data.primary_image_index !== undefined) {
        formData.append('primary_image_index', String(data.primary_image_index));
      }

      await axios.post(
        `${API_URL}/properties/${createdProperty.id}/images/upload-multiple`,
        formData,
        this.getMultipartHeaders()
      );

      // Get updated property with images
      return await this.getPropertyById(createdProperty.id);
    }

    return propertyResponse.data;
  }

  // Update property
  async updateProperty(id: number, data: Partial<CreatePropertyData>) {
    const response = await axios.put(
      `${API_URL}/properties/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // ✅ FIXED: Upload additional images
  async uploadImages(propertyId: number, files: File[], primaryIndex?: number) {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });

    // ✅ FIXED: Send primary_image_index once
    if (primaryIndex !== undefined) {
      formData.append('primary_image_index', String(primaryIndex));
    }

    const response = await axios.post(
      `${API_URL}/properties/${propertyId}/images/upload-multiple`,
      formData,
      this.getMultipartHeaders()
    );
    return response.data;
  }

  // Delete property image
  async deleteImage(imageId: number) {
    const response = await axios.delete(
      `${API_URL}/property-images/${imageId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Set primary image
  async setPrimaryImage(imageId: number) {
    const response = await axios.patch(
      `${API_URL}/property-images/${imageId}/set-primary`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Delete property
  async deleteProperty(id: number) {
    const response = await axios.delete(
      `${API_URL}/properties/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Toggle availability
  async toggleAvailability(id: number) {
    const response = await axios.patch(
      `${API_URL}/properties/${id}/toggle-availability`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  // Update stock
  async updateStock(id: number, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set') {
    const response = await axios.patch(
      `${API_URL}/properties/${id}/update-stock`,
      { quantity, operation },
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const propertyApi = new PropertyApi();
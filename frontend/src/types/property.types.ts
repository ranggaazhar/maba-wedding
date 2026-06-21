// src/types/property.types.ts

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
  is_available: boolean;
  image_url?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  category?: PropertyCategory;
  is_deletable?: boolean;
}

export interface CreatePropertyData {
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  price: string;
  is_available?: boolean;
  image_url?: string;
}

export interface PropertyFormData {
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  price: string;
  is_available?: boolean;
  image_url?: string;
  imageFile?: File | null;
}
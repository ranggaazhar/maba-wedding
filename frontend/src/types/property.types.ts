// src/types/property.types.ts

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
  is_available?: boolean;
  image_url?: string;
}

export interface PropertyFormData extends CreatePropertyData {
  images: File[];
  primary_image_index?: number;
}
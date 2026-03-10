// src/types/propertyCategory.types.ts

export interface PropertyItem {
  id: number;
  name: string;
}

export interface PropertyCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_active: boolean;
  properties?: PropertyItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyCategoryData {
  slug: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export type UpdatePropertyCategoryData = Partial<CreatePropertyCategoryData>;
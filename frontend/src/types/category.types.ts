export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_active: boolean;
  projects?: unknown[];
  bookingModels?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  slug: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;
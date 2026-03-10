// src/types/project.types.ts

export interface ProjectPhotoColor {
  id?: number;
  color_name: string;
  color_hex?: string;
  description?: string;
  display_order: number;
}

export interface ProjectPhotoFlower {
  id?: number;
  flower_name: string;
  description?: string;
  display_order: number;
}

export interface ProjectPhoto {
  id: number;
  project_id: number;
  url: string;
  caption?: string;
  position: 'left' | 'right' | 'center';
  display_order: number;
  is_hero: boolean;
  colors?: ProjectPhotoColor[];
  flowers?: ProjectPhotoFlower[];
}

export interface ProjectInclude {
  id?: number;
  item: string;
  display_order: number;
}

// ─── Project Detail ───────────────────────────────────────────────────────────

export interface ProjectDetailItem {
  id?: number;
  content: string;
  display_order: number;
}

export interface ProjectDetail {
  id?: number;
  detail_type: 'color_palette' | 'flowers' | 'other';
  title: string;
  display_order: number;
  items: ProjectDetailItem[];
}

// ─────────────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  title: string;
  slug: string;
  category_id: number;
  price?: string;
  theme?: string;
  description?: string;
  atmosphere_description?: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  category?: { id: number; name: string };
  photos?: ProjectPhoto[];
  includes?: ProjectInclude[];
  details?: ProjectDetail[];   // ← tambahan
}

export interface PhotoWithMetadata {
  file: File;
  caption: string;
  position: 'left' | 'right' | 'center';
  display_order: number;
  colors?: ProjectPhotoColor[];
  flowers?: ProjectPhotoFlower[];
}

export interface CreateCompleteProjectData {
  title: string;
  slug: string;
  category_id: number;
  price?: string;
  theme?: string;
  description?: string;
  atmosphere_description?: string;
  is_featured: boolean;
  is_published: boolean;
  photos: PhotoWithMetadata[];
  hero_photo_index: number;
  includes: ProjectInclude[];
  details?: ProjectDetail[];   // ← tambahan
}
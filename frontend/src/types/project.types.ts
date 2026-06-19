// src/types/project.types.ts

export interface ProjectPhoto {
  id: number;
  project_id: number;
  url: string;
  caption?: string;
  position: 'left' | 'right' | 'center';
  display_order: number;
  is_hero: boolean;
}

export interface ProjectInclude {
  id?: number;
  item: string;
  display_order: number;
}

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
}

export interface PhotoWithMetadata {
  file: File;
  caption: string;
  position: 'left' | 'right' | 'center';
  display_order: number;
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
}
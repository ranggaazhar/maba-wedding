import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ProjectPhoto {
  id: number;
  project_id: number;
  url: string;
  caption?: string;
  position: 'left' | 'right' | 'center';
  display_order: number;
  is_hero: boolean;
}

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

export interface ProjectInclude {
  id?: number;
  item: string;
  display_order: number;
}

export interface ProjectMood {
  id?: number;
  mood: string;
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
  details?: ProjectDetail[];
  includes?: ProjectInclude[];
  moods?: ProjectMood[];
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
  details: ProjectDetail[];
  includes: ProjectInclude[];
  moods: ProjectMood[];
}

class ProjectApi {
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


  async createCompleteProject(data: CreateCompleteProjectData) {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('category_id', String(data.category_id));
    if (data.price) formData.append('price', data.price);
    if (data.theme) formData.append('theme', data.theme);
    if (data.description) formData.append('description', data.description);
    if (data.atmosphere_description) formData.append('atmosphere_description', data.atmosphere_description);
    formData.append('is_featured', String(data.is_featured));
    formData.append('is_published', String(data.is_published));

    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photoData) => {
        formData.append('photos', photoData.file);
      });

      const photosMetadata = data.photos.map(p => ({
        caption: p.caption || '',
        position: p.position,
        display_order: p.display_order
      }));
      
      formData.append('photos_metadata', JSON.stringify(photosMetadata));
      formData.append('hero_photo_index', String(data.hero_photo_index));
    }
    if (data.details && data.details.length > 0) {
      formData.append('details', JSON.stringify(data.details));
    }

    if (data.includes && data.includes.length > 0) {
      formData.append('includes', JSON.stringify(data.includes));
    }
    if (data.moods && data.moods.length > 0) {
      formData.append('moods', JSON.stringify(data.moods));
    }

    const response = await axios.post(
      `${API_URL}/projects/complete`,
      formData,
      this.getMultipartHeaders()
    );

    return response.data;
  }
  async updateCompleteProject(
    id: number, 
    data: Partial<CreateCompleteProjectData>, 
    existingPhotos?: ProjectPhoto[]
  ) {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.category_id !== undefined) formData.append('category_id', String(data.category_id));
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.theme !== undefined) formData.append('theme', data.theme);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.atmosphere_description !== undefined) formData.append('atmosphere_description', data.atmosphere_description);
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
    if (data.is_published !== undefined) formData.append('is_published', String(data.is_published));
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photoData) => {
        formData.append('photos', photoData.file);
      });
      const photosMetadata = data.photos.map(p => ({
        caption: p.caption || '',
        position: p.position,
        display_order: p.display_order
      }));
      
      formData.append('photos_metadata', JSON.stringify(photosMetadata));
    }
    if (existingPhotos && existingPhotos.length > 0) {
      formData.append('update_photos_metadata', JSON.stringify(existingPhotos));
    }
    if (data.hero_photo_index !== undefined && existingPhotos && existingPhotos.length > 0) {
      const heroPhoto = existingPhotos[data.hero_photo_index];
      if (heroPhoto) {
        formData.append('hero_photo_id', String(heroPhoto.id));
      }
    }
    if (data.details !== undefined) {
      formData.append('details', JSON.stringify(data.details));
    }
    if (data.includes !== undefined) {
      formData.append('includes', JSON.stringify(data.includes));
    }
    if (data.moods !== undefined) {
      formData.append('moods', JSON.stringify(data.moods));
    }
    const response = await axios.put(
      `${API_URL}/projects/${id}/complete`,
      formData,
      this.getMultipartHeaders()
    );
    return response.data;
  }
  async deleteProject(id: number) {
    const response = await axios.delete(
      `${API_URL}/projects/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }
  async getProjectById(id: number) {
    const response = await axios.get(
      `${API_URL}/projects/${id}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async getAllProjects(filters?: {
    is_published?: boolean;
    is_featured?: boolean;
    category_id?: number;
    search?: string;
    include_photos?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.is_published !== undefined) params.append('is_published', String(filters.is_published));
    if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters?.category_id) params.append('category_id', String(filters.category_id));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_photos) params.append('include_photos', 'true');

    const response = await axios.get(
      `${API_URL}/projects?${params.toString()}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async togglePublishStatus(id: number) {
    const response = await axios.patch(
      `${API_URL}/projects/${id}/toggle-publish`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async toggleFeaturedStatus(id: number) {
    const response = await axios.patch(
      `${API_URL}/projects/${id}/toggle-featured`,
      {},
      this.getAuthHeaders()
    );
    return response.data;
  }

  async deletePhoto(photoId: number) {
    const response = await axios.delete(
      `${API_URL}/project-photos/${photoId}`,
      this.getAuthHeaders()
    );
    return response.data;
  }
}

export const projectApi = new ProjectApi();
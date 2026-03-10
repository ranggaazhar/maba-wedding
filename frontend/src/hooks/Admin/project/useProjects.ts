import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { categoryApi } from '@/api/categoryApi';
import type { Project } from '@/types/project.types';
import type { Category } from '@/types/category.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: { is_published?: boolean; category_id?: number; search?: string; include_photos?: boolean } = { include_photos: true };
      if (selectedStatus !== 'all') filters.is_published = selectedStatus === 'published';
      if (selectedCategory !== 'all') filters.category_id = parseInt(selectedCategory);
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const response = await projectApi.getAllProjects(filters);
      if (response.success) setProjects(response.data);
    } catch (error) {
      console.error(axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat projects');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getAllCategories({ is_active: true });
      if (response.success) setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(), 500);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Yakin hapus?', text: `Project "${title}" akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!',
    });
    if (result.isConfirmed) {
      try {
        const response = await projectApi.deleteProject(id);
        if (response.success) {
          Swal.fire('Terhapus!', 'Project berhasil dihapus.', 'success');
          fetchProjects();
        }
      } catch (error) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus', 'error');
      }
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const response = await projectApi.togglePublishStatus(id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status diubah', timer: 1500, showConfirmButton: false });
        fetchProjects();
      }
    } catch {
      Swal.fire('Gagal!', 'Tidak bisa mengubah status.', 'error');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await projectApi.toggleFeaturedStatus(id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status featured diperbarui', timer: 1500, showConfirmButton: false });
        fetchProjects();
      }
    } catch {
      Swal.fire('Gagal!', 'Tidak bisa mengubah status featured.', 'error');
    }
  };

  const getHeroImage = (project: Project) => {
    const heroPhoto = project.photos?.find(p => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop';
  };

  return {
    projects, categories, isLoading,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    fetchProjects, navigate,
    handleDelete, handleTogglePublish, handleToggleFeatured, getHeroImage,
  };
}
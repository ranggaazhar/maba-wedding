// src/hooks/admin/properties/useProperties.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { Property } from '@/types/property.types';
import type { PropertyCategory } from '@/types/propertyCategory.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: { is_available?: boolean; category_id?: number; search?: string; include_images?: boolean } = { include_images: true };
      if (selectedStatus !== 'all') filters.is_available = selectedStatus === 'available';
      if (selectedCategory !== 'all') filters.category_id = parseInt(selectedCategory);
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const response = await propertyApi.getAllProperties(filters);
      if (response.success) setProperties(response.data);
    } catch (error) {
      console.error(axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat properties');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await propertyCategoryApi.getAllPropertyCategories({ is_active: true });
      if (response.success) setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    const timer = setTimeout(() => fetchProperties(), 500);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Yakin hapus?', text: `Property "${name}" akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        const response = await propertyApi.deleteProperty(id);
        if (response.success) {
          Swal.fire('Terhapus!', 'Property berhasil dihapus.', 'success');
          fetchProperties();
        }
      } catch (error) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus', 'error');
      }
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      const response = await propertyApi.toggleAvailability(id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status ketersediaan diubah', timer: 1500, showConfirmButton: false });
        fetchProperties();
      }
    } catch {
      Swal.fire('Gagal!', 'Tidak bisa mengubah status.', 'error');
    }
  };

  const getPrimaryImage = (property: Property) => {
    const primaryImg = property.images?.find(img => img.is_primary);
    return primaryImg?.url || property.images?.[0]?.url || property.image_url ||
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop';
  };

  const formatPrice = (price: string) => parseFloat(price).toLocaleString('id-ID');

  return {
    properties, categories, isLoading,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    fetchProperties, navigate,
    handleDelete, handleToggleAvailability,
    getPrimaryImage, formatPrice,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { PropertyCategory, CreatePropertyCategoryData } from '@/types/propertyCategory.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function usePropertyCategory() {
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState<PropertyCategory | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const fetchPropertyCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyCategoryApi.getAllPropertyCategories({
        search: searchTerm || undefined,
        include_properties: true,
      });
      if (response.success) setPropertyCategories(response.data);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan saat memuat kategori properti';
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: message, confirmButtonColor: '#3b82f6' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => fetchPropertyCategories(), 300);
    return () => clearTimeout(delay);
  }, [fetchPropertyCategories]);

  // ── Dialog handlers ────────────────────────────────────
  const handleCreate = () => {
    setSelectedPropertyCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (propertyCategory: PropertyCategory) => {
    setSelectedPropertyCategory(propertyCategory);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPropertyCategory(null);
  };

  // ── CRUD ───────────────────────────────────────────────
  const handleSubmit = async (data: CreatePropertyCategoryData) => {
    try {
      setIsSubmitting(true);
      let response;

      if (selectedPropertyCategory) {
        response = await propertyCategoryApi.updatePropertyCategory(selectedPropertyCategory.id, data);
      } else {
        response = await propertyCategoryApi.createPropertyCategory(data);
      }

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Kategori properti berhasil ${selectedPropertyCategory ? 'diperbarui' : 'ditambahkan'}`,
          timer: 2000,
          showConfirmButton: false,
        });
        handleCloseDialog();
        fetchPropertyCategories();
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message, confirmButtonColor: '#3b82f6' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (propertyCategory: PropertyCategory) => {
    const propertyCount = propertyCategory.properties?.length || 0;

    const result = await Swal.fire({
      title: 'Hapus Kategori Properti?',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus kategori <strong>${propertyCategory.name}</strong>?</p>
          ${propertyCount > 0 ? `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-red-800">
                ⚠️ Kategori ini memiliki <strong>${propertyCount} properti</strong> terkait dan tidak dapat dihapus.
              </p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: propertyCount > 0 ? '#6b7280' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: propertyCount > 0 ? 'OK' : 'Ya, Hapus',
      cancelButtonText: 'Batal',
      showConfirmButton: propertyCount === 0,
    });

    if (result.isConfirmed && propertyCount === 0) {
      try {
        const response = await propertyCategoryApi.deletePropertyCategory(propertyCategory.id);
        if (response.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Kategori properti berhasil dihapus', timer: 2000, showConfirmButton: false });
          fetchPropertyCategories();
        }
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan';
        Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: message });
      }
    }
  };

  const handleToggleStatus = async (propertyCategory: PropertyCategory) => {
    try {
      const response = await propertyCategoryApi.togglePropertyCategoryStatus(propertyCategory.id);
      if (response.success) {
        setPropertyCategories(prev =>
          prev.map(cat => cat.id === propertyCategory.id ? { ...cat, is_active: !cat.is_active } : cat)
        );
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true })
          .fire({ icon: 'success', title: `Kategori ${!propertyCategory.is_active ? 'diaktifkan' : 'dinonaktifkan'}` });
      }
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengubah status';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message });
    }
  };

  return {
    // state
    propertyCategories,
    loading,
    isSubmitting,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    selectedPropertyCategory,
    // handlers
    handleCreate,
    handleEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
  };
}
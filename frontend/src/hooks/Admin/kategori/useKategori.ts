import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '@/api/categoryApi';
import type { Category, CreateCategoryData } from '@/types/category.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAllCategories({
        search: searchTerm || undefined,
        include_projects: true,
      });
      if (response.success) setCategories(response.data);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan saat memuat kategori';
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: message });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => fetchCategories(), 300);
    return () => clearTimeout(delay);
  }, [fetchCategories]);

  // ── Dialog handlers ────────────────────────────────────
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  // ── CRUD ───────────────────────────────────────────────
  const handleSubmit = async (data: CreateCategoryData) => {
    try {
      setIsSubmitting(true);
      let successMessage = '';

      if (selectedCategory) {
        const res = await categoryApi.updateCategory(selectedCategory.id, data);
        if (res.success) successMessage = 'Kategori berhasil diperbarui';
      } else {
        const res = await categoryApi.createCategory(data);
        if (res.success) successMessage = 'Kategori berhasil ditambahkan';
      }

      if (successMessage) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: successMessage, timer: 2000, showConfirmButton: false });
        handleCloseDialog();
        fetchCategories();
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const projectCount = category.projects?.length || 0;

    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      html: `
        <p>Apakah Anda yakin ingin menghapus <strong>${category.name}</strong>?</p>
        ${projectCount > 0 ? `
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p class="text-sm text-red-800">
              ⚠️ Kategori ini memiliki <strong>${projectCount} project</strong> dan tidak dapat dihapus.
            </p>
          </div>
        ` : ''}
      `,
      icon: 'warning',
      showCancelButton: projectCount === 0,
      confirmButtonColor: projectCount > 0 ? '#6b7280' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: projectCount > 0 ? 'OK' : 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed && projectCount === 0) {
      try {
        const res = await categoryApi.deleteCategory(category.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Kategori berhasil dihapus', timer: 2000, showConfirmButton: false });
          fetchCategories();
        }
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan';
        Swal.fire({ icon: 'error', title: 'Gagal', text: message });
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const res = await categoryApi.toggleCategoryStatus(category.id);
      if (res.success) {
        setCategories(prev =>
          prev.map(cat => cat.id === category.id ? { ...cat, is_active: !cat.is_active } : cat)
        );
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
          .fire({ icon: 'success', title: `Kategori ${!category.is_active ? 'diaktifkan' : 'dinonaktifkan'}` });
      }
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengubah status';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message });
    }
  };

  return {
    // state
    categories,
    loading,
    isSubmitting,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    selectedCategory,
    // handlers
    handleCreate,
    handleEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
  };
}
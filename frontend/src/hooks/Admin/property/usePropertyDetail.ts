// src/hooks/admin/properties/usePropertyDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '@/api/propertyApi';
import type { Property, PropertyImage } from '@/types/property.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function usePropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  const fetchPropertyDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await propertyApi.getPropertyById(Number(id));
      if (response.success) {
        setProperty(response.data);
        const primaryImg = response.data.images?.find((p: PropertyImage) => p.is_primary);
        setSelectedImage(primaryImg?.url || response.data.images?.[0]?.url || '');
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan saat memuat data';
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: message }).then(() => navigate('/properties'));
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchPropertyDetail(); }, [fetchPropertyDetail]);

  const handleDelete = async () => {
    if (!property) return;
    const result = await Swal.fire({
      title: 'Yakin hapus property ini?',
      html: `Property <strong>"${property.name}"</strong> akan dihapus permanen!`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal', reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        const response = await propertyApi.deleteProperty(property.id);
        if (response.success) {
          await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Property berhasil dihapus.', timer: 1500, showConfirmButton: false });
          navigate('/properties');
        }
      } catch (error: unknown) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus property' });
      }
    }
  };

  const handleToggleAvailability = async () => {
    if (!property) return;
    try {
      const response = await propertyApi.toggleAvailability(property.id);
      if (response.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Property ${!property.is_available ? 'tersedia' : 'tidak tersedia'}`, timer: 1500, showConfirmButton: false });
        fetchPropertyDetail();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Tidak bisa mengubah status ketersediaan.' });
    }
  };

  const formatPrice = (price: string): string => {
    try { return Number(price).toLocaleString('id-ID'); }
    catch { return '0'; }
  };

  return {
    property, isLoading, selectedImage, setSelectedImage,
    navigate, fetchPropertyDetail,
    handleDelete, handleToggleAvailability, formatPrice,
  };
}
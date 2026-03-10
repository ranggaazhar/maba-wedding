// src/hooks/usePropertyForm.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { PropertyFormData, Property, PropertyImage } from '@/types/property.types';
import type { PropertyCategory } from '@/types/propertyCategory.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export const usePropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    slug: '',
    category_id: 0,
    description: '',
    price: '',
    is_available: true,
    images: [],
    primary_image_index: 0,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await propertyCategoryApi.getAllPropertyCategories({ is_active: true });
        if (response.success) setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch property data in edit mode
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setIsFetching(true);
        const response = await propertyApi.getPropertyById(Number(id));
        if (response.success) {
          const property: Property = response.data;
          setFormData({
            name: property.name,
            slug: property.slug,
            category_id: property.category_id,
            description: property.description || '',
            price: property.price,
            is_available: property.is_available,
            images: [],
            primary_image_index: 0,
          });
          if (property.images) setExistingImages(property.images);
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : 'Gagal memuat data property';
        Swal.fire('Error', message, 'error').then(() => navigate('/properties'));
      } finally {
        setIsFetching(false);
      }
    };
    fetchProperty();
  }, [id, navigate]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value, slug: generateSlug(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      primary_image_index: prev.primary_image_index === index ? 0 : prev.primary_image_index,
    }));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    const result = await Swal.fire({
      title: 'Hapus gambar?', text: 'Gambar akan dihapus permanen!', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await propertyApi.deleteImage(imageId);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        Swal.fire('Terhapus!', 'Gambar berhasil dihapus.', 'success');
      } catch (error: unknown) {
        Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menghapus gambar', 'error');
      }
    }
  };

  const handleSetPrimaryExisting = async (imageId: number) => {
    try {
      await propertyApi.setPrimaryImage(imageId);
      setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Gambar utama diubah', timer: 1500, showConfirmButton: false });
    } catch (error: unknown) {
      Swal.fire('Gagal!', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengubah gambar utama', 'error');
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData(prev => ({ ...prev, primary_image_index: index }));
  };

  const updateFormData = (field: keyof PropertyFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.category_id || !formData.price) {
      Swal.fire('Error', 'Mohon lengkapi semua field yang wajib!', 'error');
      return;
    }
    try {
      setIsLoading(true);
      if (isEditMode && id) {
        await propertyApi.updateProperty(Number(id), {
          name: formData.name, slug: formData.slug,
          category_id: formData.category_id, description: formData.description,
          price: formData.price, is_available: formData.is_available,
        });
        if (formData.images.length > 0) {
          await propertyApi.uploadImages(Number(id), formData.images, formData.primary_image_index);
        }
        Swal.fire('Berhasil!', 'Property berhasil diupdate.', 'success');
      } else {
        await propertyApi.createProperty(formData);
        Swal.fire('Berhasil!', 'Property berhasil dibuat.', 'success');
      }
      navigate('/properties');
    } catch (error: unknown) {
      Swal.fire('Error', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan property', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading, isFetching, isEditMode,
    categories, existingImages, formData, imagePreviews,
    handleNameChange, handleFileChange, handleRemoveImage,
    handleDeleteExistingImage, handleSetPrimaryExisting,
    handleSetPrimaryImage, handleSubmit, updateFormData, navigate,
  };
};
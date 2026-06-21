// src/hooks/Admin/property/usePropertyForm.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { PropertyFormData, Property } from '@/types/property.types';
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

  // Single image states
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<PropertyFormData, 'imageFile'>>({
    name: '',
    slug: '',
    category_id: 0,
    description: '',
    price: '',
    is_available: true,
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
          });
          if (property.image_url) {
            setExistingImage(property.image_url);
          }
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : 'Gagal memuat data property';
        Swal.fire('Error', message, 'error').then(() => navigate('/admin/properties'));
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // 1. Validasi Tipe File (hanya gambar)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Format Tidak Sesuai', 'Hanya berkas gambar yang diperbolehkan (JPG, JPEG, PNG, GIF, WEBP)!', 'error');
        e.target.value = ''; // Reset input
        return;
      }

      // 2. Validasi Ukuran File (Maks. 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Swal.fire('File Terlalu Besar', 'Ukuran gambar maksimal adalah 5MB!', 'error');
        e.target.value = ''; // Reset input
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear existing image so the preview takes precedence
      setExistingImage(null);
    }
  };

  const handleRemovePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRemoveExistingImage = () => {
    setExistingImage(null);
  };

  const updateFormData = (field: keyof Omit<PropertyFormData, 'imageFile'>, value: unknown) => {
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
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('category_id', String(formData.category_id));
      submitData.append('description', formData.description || '');
      submitData.append('price', formData.price);
      submitData.append('is_available', String(formData.is_available));

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (!existingImage) {
        submitData.append('image_url', '');
      }

      if (isEditMode && id) {
        await propertyApi.updateProperty(Number(id), submitData);
        Swal.fire('Berhasil!', 'Property berhasil diupdate.', 'success');
      } else {
        await propertyApi.createProperty(submitData);
        Swal.fire('Berhasil!', 'Property berhasil dibuat.', 'success');
      }
      navigate('/admin/properties');
    } catch (error: unknown) {
      Swal.fire('Error', axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan property', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isFetching,
    isEditMode,
    categories,
    existingImage,
    imageFile,
    imagePreview,
    formData,
    handleNameChange,
    handleFileChange,
    handleRemovePreview,
    handleRemoveExistingImage,
    handleSubmit,
    updateFormData,
    navigate,
  };
};
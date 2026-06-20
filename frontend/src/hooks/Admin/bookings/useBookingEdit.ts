// src/hooks/admin/bookings/useBookingEdit.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '@/api/bookingApi';
import { projectApi } from '@/api/projectApi';
import { categoryApi } from '@/api/categoryApi';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { Booking, BookingModel, BookingProperty } from '@/types/booking.types';
import type { Project } from '@/types/project.types';
import type { Category } from '@/types/category.types';
import type { Property } from '@/types/property.types';
import type { PropertyCategory } from '@/types/propertyCategory.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useBookingEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // ── Master data ───────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([]);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    full_address: '',
    event_venue: '',
    event_date: '',
    event_type: '',
    referral_source: '',
    theme_color: '',
    customer_notes: '',
    total_estimate: '0',
  });

  const [selectedModels, setSelectedModels] = useState<BookingModel[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<BookingProperty[]>([]);

  // ── Tipe booking yang sedang diedit ──────────────────────────────────────
  const [hasCustomRequest, setHasCustomRequest] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [modelCategoryFilter, setModelCategoryFilter] = useState('all');
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState('all');

  useEffect(() => {
    if (id) {
      fetchBookingData();
      fetchMasterData();
    }
  }, [id]);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchBookingData = async () => {
    try {
      setIsLoading(true);
      const response = await bookingApi.getBookingById(Number(id));
      if (response.success) {
        const booking: Booking = response.data;
        setFormData({
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          full_address: booking.full_address,
          event_venue: booking.event_venue,
          event_date: booking.event_date,
          event_type: booking.event_type,
          referral_source: booking.referral_source || '',
          theme_color: booking.theme_color || '',
          customer_notes: booking.customer_notes || '',
          total_estimate: booking.total_estimate || '0',
        });
        setSelectedModels(booking.models || []);
        setSelectedProperties(booking.properties || []);
        setHasCustomRequest(booking.has_custom_request);
      }
    } catch (error: unknown) {
      Swal.fire(
        'Error',
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal memuat data booking',
        'error'
      );
      navigate('/admin/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [projectsRes, categoriesRes, propertiesRes, propCategoriesRes] = await Promise.all([
        projectApi.getAllProjects({ is_published: true, include_photos: true }),
        categoryApi.getAllCategories({ is_active: true }),
        propertyApi.getAllProperties({ is_available: true }),
        propertyCategoryApi.getAllPropertyCategories({ is_active: true }),
      ]);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (propertiesRes.success) setProperties(propertiesRes.data);
      if (propCategoriesRes.success) setPropertyCategories(propCategoriesRes.data);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  // ── Model handlers ────────────────────────────────────────────────────────

  const handleAddModel = (project: Project) => {
    if (selectedModels.find((m) => m.project_id === project.id)) {
      Swal.fire('Info', 'Model sudah ditambahkan', 'info');
      return;
    }
    setSelectedModels([
      ...selectedModels,
      {
        category_id: project.category_id,
        project_id: project.id,
        project_title: project.title,
        price: project.price || '0',
        notes: '',
        display_order: selectedModels.length,
      },
    ]);
  };

  const handleRemoveModel = (index: number) =>
    setSelectedModels(selectedModels.filter((_, i) => i !== index));

  const handleUpdateModelNotes = (index: number, notes: string) => {
    const updated = [...selectedModels];
    updated[index].notes = notes;
    setSelectedModels(updated);
  };

  // ── Property handlers ─────────────────────────────────────────────────────

  const handleAddProperty = (property: Property) => {
    const exists = selectedProperties.find((p) => p.property_id === property.id);
    if (exists) {
      handleUpdatePropertyQuantity(selectedProperties.indexOf(exists), exists.quantity + 1);
      return;
    }
    setSelectedProperties([
      ...selectedProperties,
      {
        property_id: property.id,
        property_name: property.name,
        property_category: property.category?.name || 'Uncategorized',
        quantity: 1,
        price: property.price,
        subtotal: property.price,
      },
    ]);
  };

  const handleUpdatePropertyQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = [...selectedProperties];
    updated[index].quantity = newQuantity;
    updated[index].subtotal = String(Number(updated[index].price) * newQuantity);
    setSelectedProperties(updated);
  };

  const handleRemoveProperty = (index: number) =>
    setSelectedProperties(selectedProperties.filter((_, i) => i !== index));

  // ── Calculate ─────────────────────────────────────────────────────────────

  const calculateTotal = () => {
    const modelTotal = selectedModels.reduce((sum, m) => sum + Number(m.price || 0), 0);
    const propertyTotal = selectedProperties.reduce((sum, p) => sum + Number(p.subtotal || 0), 0);
    return modelTotal + propertyTotal;
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.event_date) {
      Swal.fire('Error', 'Data customer tidak lengkap', 'error');
      setActiveTab('info');
      return;
    }

    // Validasi: booking non-custom wajib memiliki minimal 1 model dekorasi
    // Booking pure custom request tidak memerlukan model
    if (!hasCustomRequest && selectedModels.length === 0) {
      Swal.fire('Error', 'Pilih minimal 1 model dekorasi', 'error');
      setActiveTab('models');
      return;
    }

    try {
      setIsSaving(true);
      const total = calculateTotal();
      const response = await bookingApi.updateBooking(Number(id), {
        ...formData,
        total_estimate: total > 0 ? String(total) : undefined,
        models: selectedModels,
        properties: selectedProperties,
      });
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Booking berhasil diupdate',
          confirmButtonText: 'OK',
        }).then(() => navigate(`/admin/bookings/${id}`));
      }
    } catch (error: unknown) {
      Swal.fire(
        'Error',
        axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal menyimpan perubahan',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredProjects =
    modelCategoryFilter === 'all'
      ? projects
      : projects.filter((p) => String(p.category_id) === modelCategoryFilter);

  const filteredProperties =
    propertyCategoryFilter === 'all'
      ? properties
      : properties.filter((p) => String(p.category_id) === propertyCategoryFilter);

  // ── Image helpers ─────────────────────────────────────────────────────────

  const getProjectImage = (project: Project) => {
    const heroPhoto = project.photos?.find((p) => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || '';
  };

  const getPropertyImage = (property: Property) => {
    return property.image_url || '';
  };

  return {
    // Loading state
    isLoading,
    isSaving,

    // Tab
    activeTab,
    setActiveTab,

    // Booking type info
    hasCustomRequest,

    // Master data
    projects,
    categories,
    properties,
    propertyCategories,

    // Form
    formData,
    setFormData,

    // Selected items
    selectedModels,
    selectedProperties,

    // Filters
    modelCategoryFilter,
    setModelCategoryFilter,
    propertyCategoryFilter,
    setPropertyCategoryFilter,

    // Filtered
    filteredProjects,
    filteredProperties,

    // Actions
    navigate,
    handleAddModel,
    handleRemoveModel,
    handleUpdateModelNotes,
    handleAddProperty,
    handleUpdatePropertyQuantity,
    handleRemoveProperty,
    calculateTotal,
    handleSave,

    // Image helpers
    getProjectImage,
    getPropertyImage,
  };
}
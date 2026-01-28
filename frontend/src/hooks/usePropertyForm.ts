import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertyApi, type PropertyFormData, type Property, type PropertyImage } from "@/api/propertyApi";
import { propertyCategoryApi, type PropertyCategory } from "@/api/propertyCategoryApi";
import Swal from "sweetalert2";
import axios from "axios";

export const usePropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    slug: "",
    category_id: 0,
    description: "",
    price: "",
    stock_quantity: 1,
    is_available: true,
    images: [],
    primary_image_index: 0,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await propertyCategoryApi.getAllPropertyCategories({ is_active: true });
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
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
            description: property.description || "",
            price: property.price,
            stock_quantity: property.stock_quantity,
            is_available: property.is_available,
            images: [],
            primary_image_index: 0,
          });
          
          if (property.images) {
            setExistingImages(property.images);
          }
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Gagal memuat data property";
        
        Swal.fire("Error", message, "error").then(() => navigate("/properties"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  // Auto generate slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      primary_image_index: prev.primary_image_index === index ? 0 : prev.primary_image_index
    }));
  };

  // Delete existing image
  const handleDeleteExistingImage = async (imageId: number) => {
    const result = await Swal.fire({
      title: "Hapus gambar?",
      text: "Gambar akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await propertyApi.deleteImage(imageId);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        Swal.fire("Terhapus!", "Gambar berhasil dihapus.", "success");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Gagal menghapus gambar";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  // Set primary existing image
  const handleSetPrimaryExisting = async (imageId: number) => {
    try {
      await propertyApi.setPrimaryImage(imageId);
      setExistingImages(prev => 
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Gambar utama diubah", timer: 1500, showConfirmButton: false });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal mengubah gambar utama";
      Swal.fire("Gagal!", message, "error");
    }
  };

  // Set primary image for new uploads
  const handleSetPrimaryImage = (index: number) => {
    setFormData(prev => ({ ...prev, primary_image_index: index }));
  };

  // Update form data
  const updateFormData = (field: keyof PropertyFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.category_id || !formData.price) {
      Swal.fire("Error", "Mohon lengkapi semua field yang wajib!", "error");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditMode && id) {
        // Update property data
        await propertyApi.updateProperty(Number(id), {
          name: formData.name,
          slug: formData.slug,
          category_id: formData.category_id,
          description: formData.description,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
          is_available: formData.is_available,
        });

        // Upload new images if any
        if (formData.images.length > 0) {
          await propertyApi.uploadImages(Number(id), formData.images, formData.primary_image_index);
        }

        Swal.fire("Berhasil!", "Property berhasil diupdate.", "success");
      } else {
        // Create new property
        await propertyApi.createProperty(formData);
        Swal.fire("Berhasil!", "Property berhasil dibuat.", "success");
      }

      navigate("/properties");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal menyimpan property";
      
      Swal.fire("Error", message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // States
    isLoading,
    isFetching,
    isEditMode,
    categories,
    existingImages,
    formData,
    imagePreviews,
    
    // Handlers
    handleNameChange,
    handleFileChange,
    handleRemoveImage,
    handleDeleteExistingImage,
    handleSetPrimaryExisting,
    handleSetPrimaryImage,
    handleSubmit,
    updateFormData,
    navigate,
  };
};
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, X, Star, Package, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { propertyApi, type PropertyFormData, type Property, type PropertyImage } from "@/api/propertyApi";
import { propertyCategoryApi, type PropertyCategory } from "@/api/propertyCategoryApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function PropertyForm() {
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

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data property...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/properties")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {isEditMode ? "Edit Property" : "Tambah Property Baru"}
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Update informasi property" : "Isi form untuk menambah property baru"}
              </CardDescription>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save size={18} className="mr-2" /> Simpan</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Form Tabs */}
      <Tabs defaultValue="property" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Package size={16} />
            Data Property
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon size={16} />
            Upload Gambar
            {(imagePreviews.length + existingImages.length) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {imagePreviews.length + existingImages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Property Data Tab */}
        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Property</CardTitle>
              <CardDescription>Lengkapi data property di bawah ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Property *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masukkan nama property"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-property"
                  required
                />
                <p className="text-xs text-muted-foreground">URL-friendly name (otomatis dibuat dari nama)</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category_id ? String(formData.category_id) : ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi property"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="500000"
                    required
                    min="0"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                    placeholder="10"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="available">Status Ketersediaan</Label>
                  <p className="text-sm text-muted-foreground">
                    Property dapat disewa oleh customer
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Upload Gambar Property</CardTitle>
              <CardDescription>Tambahkan foto property (max 10 gambar)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Images */}
              {isEditMode && existingImages.length > 0 && (
                <div className="space-y-3">
                  <Label>Gambar yang Sudah Ada</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={img.url}
                            alt="Property"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {img.is_primary && (
                          <Badge className="absolute top-2 left-2 bg-amber-500">
                            <Star size={12} className="mr-1 fill-current" />
                            Utama
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.is_primary && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimaryExisting(img.id)}
                            >
                              <Star size={14} />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteExistingImage(img.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="space-y-3">
                <Label>{isEditMode ? "Tambah Gambar Baru" : "Upload Gambar"}</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={imagePreviews.length >= 10}
                  >
                    <Upload size={18} className="mr-2" />
                    Pilih Gambar
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    {imagePreviews.length} / 10 gambar
                  </span>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index === formData.primary_image_index && (
                        <Badge className="absolute top-2 left-2 bg-amber-500">
                          <Star size={12} className="mr-1 fill-current" />
                          Utama
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index !== formData.primary_image_index && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setFormData(prev => ({ ...prev, primary_image_index: index }))}
                          >
                            <Star size={14} />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                * Klik ikon bintang untuk mengatur gambar utama
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
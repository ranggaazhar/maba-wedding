import { useBookingEdit } from "@/hooks/Admin/bookings/useBookingEdit";
import {
  ArrowLeft, Save, Loader2, User, Package, ShoppingCart,
  Plus, Trash2, AlertCircle, Sparkles, Palette, ImageIcon, Edit, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookingCustomRequest } from "@/types/booking.types";
import Swal from "sweetalert2";

export default function BookingEdit() {
  const { id } = useParams<{ id: string }>();

  const {
    isLoading, isSaving, activeTab, setActiveTab,
    categories, propertyCategories,
    formData, setFormData,
    selectedModels, selectedProperties,
    modelCategoryFilter, setModelCategoryFilter,
    propertyCategoryFilter, setPropertyCategoryFilter,
    filteredProjects, filteredProperties,
    navigate,
    handleAddModel, handleRemoveModel, handleUpdateModelNotes,
    handleAddProperty, handleUpdatePropertyQuantity, handleRemoveProperty,
    calculateTotal, handleSave,
    getProjectImage, getPropertyImage,
    // Custom Request variables and handlers
    hasCustomRequest, customRequests,
    handleAddCustomRequest, handleUpdateCustomRequest,
    handleDeleteCustomRequest, handleDeleteCustomRequestImage,
  } = useBookingEdit();

  // ── Custom Request Modal States ───────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditCR, setCurrentEditCR] = useState<BookingCustomRequest | null>(null);

  const [crForm, setCrForm] = useState({
    title: '',
    description: '',
    color_theme: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleOpenAddModal = () => {
    setCrForm({ title: '', description: '', color_theme: '' });
    setSelectedFiles([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cr: BookingCustomRequest) => {
    setCurrentEditCR(cr);
    setCrForm({
      title: cr.title,
      description: cr.description,
      color_theme: cr.color_theme || '',
    });
    setSelectedFiles([]);
    setIsEditModalOpen(true);
  };

  const fileInputAddRef = useRef<HTMLInputElement>(null);
  const fileInputEditRef = useRef<HTMLInputElement>(null);

  const handleAddFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidTypeFiles: string[] = [];
    const invalidSizeFiles: string[] = [];
    const validFiles: File[] = [];

    newFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidTypeFiles.push(file.name);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidSizeFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidTypeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Format File Tidak Valid',
        text: `File berikut bukan gambar: ${invalidTypeFiles.join(', ')}. Harap gunakan format JPG, JPEG, PNG, atau WEBP.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    if (invalidSizeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran File Terlalu Besar',
        text: `File berikut melebihi batas 5MB: ${invalidSizeFiles.join(', ')}.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const remaining = 5 - selectedFiles.length;
    if (remaining <= 0) {
      Swal.fire({
        icon: 'info',
        title: 'Batas Foto',
        text: 'Maksimal 5 foto referensi',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const toAdd = validFiles.slice(0, remaining);
    setSelectedFiles(prev => [...prev, ...toAdd]);
    if (fileInputAddRef.current) fileInputAddRef.current.value = '';
  };

  const handleRemoveAddFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidTypeFiles: string[] = [];
    const invalidSizeFiles: string[] = [];
    const validFiles: File[] = [];

    newFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidTypeFiles.push(file.name);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidSizeFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidTypeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Format File Tidak Valid',
        text: `File berikut bukan gambar: ${invalidTypeFiles.join(', ')}. Harap gunakan format JPG, JPEG, PNG, atau WEBP.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    if (invalidSizeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran File Terlalu Besar',
        text: `File berikut melebihi batas 5MB: ${invalidSizeFiles.join(', ')}.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const existingCount = activeEditCR?.reference_images_urls?.length || 0;
    const remaining = 5 - existingCount - selectedFiles.length;
    if (remaining <= 0) {
      Swal.fire({
        icon: 'info',
        title: 'Batas Foto',
        text: `Maksimal 5 foto referensi (Saat ini sudah ada ${existingCount} foto terunggah)`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const toAdd = validFiles.slice(0, remaining);
    setSelectedFiles(prev => [...prev, ...toAdd]);
    if (fileInputEditRef.current) fileInputEditRef.current.value = '';
  };

  const handleRemoveEditFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crForm.title.trim() || !crForm.description.trim()) {
      return;
    }
    if (selectedFiles.length === 0) {
      Swal.fire('Validasi', 'Mohon upload minimal 1 foto referensi untuk custom request', 'warning');
      return;
    }
    await handleAddCustomRequest(crForm, selectedFiles);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditCR) return;
    if (!crForm.title.trim() || !crForm.description.trim()) {
      return;
    }
    const existingCount = activeEditCR?.reference_images_urls?.length || 0;
    if (existingCount + selectedFiles.length === 0) {
      Swal.fire('Validasi', 'Minimal harus ada 1 foto referensi (terunggah atau baru)', 'warning');
      return;
    }
    await handleUpdateCustomRequest(currentEditCR.id, {
      title: crForm.title,
      description: crForm.description,
      color_theme: crForm.color_theme,
      replace_images: false
    }, selectedFiles);
    setIsEditModalOpen(false);
  };

  const activeEditCR = customRequests.find(cr => cr.id === currentEditCR?.id) || currentEditCR;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data booking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          className="w-fit -ml-2"
          onClick={() => navigate(`/admin/bookings/${id}`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Detail
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Edit Booking</h1>
            <p className="text-muted-foreground">Update informasi booking customer</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-muted/50 inline-flex w-max min-w-full">
            <TabsTrigger value="info">
              <User size={16} className="mr-2" />
              Informasi
            </TabsTrigger>
            <TabsTrigger value="models">
              <Package size={16} className="mr-2" />
              Model Dekorasi ({selectedModels.length})
            </TabsTrigger>
            <TabsTrigger value="properties">
              <ShoppingCart size={16} className="mr-2" />
              Properties ({selectedProperties.length})
            </TabsTrigger>
            {hasCustomRequest && (
              <TabsTrigger value="custom-requests">
                <Sparkles size={16} className="mr-2" />
                Custom Request ({customRequests.length})
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* TAB 1: INFORMASI */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Acara</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_venue">
                    Lokasi Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event_venue"
                    value={formData.event_venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_venue: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date">
                    Tanggal Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">
                    Jenis Acara <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Pernikahan</SelectItem>
                      <SelectItem value="Birthday">Ulang Tahun</SelectItem>
                      <SelectItem value="Engagement">Lamaran</SelectItem>
                      <SelectItem value="Corporate">Corporate Event</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme_color">Warna Tema</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="theme_color"
                      type="color"
                      value={formData.theme_color || '#d4a017'}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                      className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-transparent"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.theme_color || '#d4a017'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Klik kotak untuk memilih warna tema acara
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_notes">Catatan Customer</Label>
                <Textarea
                  id="customer_notes"
                  value={formData.customer_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MODEL DEKORASI */}
        <TabsContent value="models" className="space-y-6">
          {selectedModels.length > 0 && (
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Model Terpilih ({selectedModels.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedModels.map((model, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{model.project_title}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {Number(model.price).toLocaleString("id-ID")}
                      </p>
                      <Textarea
                        placeholder="Catatan untuk model ini..."
                        value={model.notes || ""}
                        onChange={(e) => handleUpdateModelNotes(index, e.target.value)}
                        rows={2}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModel(index)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tambah Model Dekorasi</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  type="button"
                  variant={modelCategoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModelCategoryFilter("all")}
                >
                  Semua
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={modelCategoryFilter === String(cat.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setModelCategoryFilter(String(cat.id))}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredProjects.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Tidak ada project di kategori ini</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => {
                    const isSelected = selectedModels.find(m => m.project_id === project.id);
                    return (
                      <Card key={project.id} className={isSelected ? "ring-2 ring-primary" : ""}>
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          {getProjectImage(project) ? (
                            <img src={getProjectImage(project)} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold line-clamp-2 mb-2">{project.title}</h4>
                          <Badge variant="outline" className="mb-2">{project.category?.name}</Badge>
                          <p className="text-sm font-bold text-primary mb-3">
                            {project.price && project.price !== "0"
                              ? `Rp ${Number(project.price).toLocaleString("id-ID")}`
                              : "Hubungi Admin"}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full"
                            variant={isSelected ? "secondary" : "default"}
                            onClick={() => handleAddModel(project)}
                            disabled={!!isSelected}
                          >
                            {isSelected ? "Terpilih" : <><Plus size={16} className="mr-2" />Pilih</>}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PROPERTIES */}
        <TabsContent value="properties" className="space-y-6">
          {selectedProperties.length > 0 && (
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Property Terpilih ({selectedProperties.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedProperties.map((prop, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{prop.property_name}</p>
                      <p className="text-sm text-muted-foreground">{prop.property_category}</p>
                      <p className="text-sm text-primary font-semibold mt-1">
                        Rp {Number(prop.price).toLocaleString("id-ID")} × {prop.quantity} = Rp {Number(prop.subtotal).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdatePropertyQuantity(index, prop.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={prop.quantity}
                        onChange={(e) => handleUpdatePropertyQuantity(index, Number(e.target.value))}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdatePropertyQuantity(index, prop.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold">Total Properties:</span>
                  <span className="text-lg font-bold text-primary">
                    Rp {selectedProperties.reduce((sum, p) => sum + Number(p.subtotal), 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tambah Property</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  type="button"
                  variant={propertyCategoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropertyCategoryFilter("all")}
                >
                  Semua
                </Button>
                {propertyCategories.map(cat => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={propertyCategoryFilter === String(cat.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropertyCategoryFilter(String(cat.id))}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredProperties.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Tidak ada property di kategori ini</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProperties.map(property => {
                    const selectedProp = selectedProperties.find(p => p.property_id === property.id);
                    return (
                      <Card key={property.id} className={selectedProp ? "ring-2 ring-primary" : ""}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          {getPropertyImage(property) ? (
                            <img src={getPropertyImage(property)} alt={property.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold line-clamp-2 mb-2">{property.name}</h4>
                          <Badge variant="outline" className="mb-2">{property.category?.name}</Badge>
                          <p className="text-sm font-bold text-primary mb-3">
                            Rp {Number(property.price).toLocaleString("id-ID")}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddProperty(property)}
                          >
                            <Plus size={16} className="mr-2" />
                            {selectedProp ? `Tambah (${selectedProp.quantity})` : "Tambah"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: CUSTOM REQUEST */}
        {hasCustomRequest && (
          <TabsContent value="custom-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Custom Request Customer</h2>
                <p className="text-sm text-muted-foreground">Kelola detail custom request dan lampiran foto referensi</p>
              </div>
              <Button type="button" onClick={handleOpenAddModal} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus size={16} className="mr-2" />
                Tambah Request
              </Button>
            </div>

            {customRequests.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Tidak ada custom request pada booking ini</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {customRequests.map((cr, index) => (
                  <Card key={cr.id || `cr-${index}`} className="border-orange-100 bg-orange-50/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{cr.title}</h4>
                          {cr.color_theme && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                              <Palette size={14} className="text-orange-500" />
                              <span>Tema warna:</span>
                              <div
                                className="w-4 h-4 rounded-full border border-border shadow-sm flex-shrink-0"
                                style={{ backgroundColor: cr.color_theme }}
                                title={cr.color_theme}
                              />
                              <span className="text-xs">{cr.color_theme}</span>
                            </div>
                          )}
                        </div>
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                          <Sparkles size={12} className="mr-1" /> Custom
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {cr.description}
                      </p>

                      {cr.reference_images_urls && cr.reference_images_urls.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <ImageIcon size={12} /> Foto Referensi ({cr.reference_images_urls.length})
                          </p>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {cr.reference_images_urls.map((url, i) => (
                              <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                                <img src={url} alt={`Referensi ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          Diajukan pada {new Date(cr.created_at).toLocaleString("id-ID")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(cr)}
                          >
                            <Edit size={14} className="mr-1.5" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomRequest(cr.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 size={14} className="mr-1.5" /> Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Save Button Footer */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Estimasi</p>
              <p className="text-xl font-bold text-primary">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </p>
            </div>
            {/* Tombol save sengaja tidak ada type="button" agar bisa trigger handleSave */}
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full sm:w-auto">
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
              ) : (
                <><Save size={18} className="mr-2" />Simpan Perubahan</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog Tambah Custom Request ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
          <form onSubmit={handleAddSubmit} className="flex flex-col overflow-hidden flex-1">
            <DialogHeader>
              <DialogTitle>Tambah Custom Request</DialogTitle>
              <DialogDescription>
                Masukkan detail custom request untuk booking ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
              <div className="space-y-2">
                <Label htmlFor="add_cr_title">Judul Request <span className="text-destructive">*</span></Label>
                <Input
                  id="add_cr_title"
                  required
                  placeholder="Misal: Dekorasi Backdrop Tambahan"
                  value={crForm.title}
                  onChange={(e) => setCrForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_cr_theme">Tema Warna <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-3">
                  <input
                    id="add_cr_theme"
                    type="color"
                    value={crForm.color_theme || '#d4a017'}
                    onChange={(e) => setCrForm(prev => ({ ...prev, color_theme: e.target.value }))}
                    className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="text-sm text-muted-foreground">
                    {crForm.color_theme || '#d4a017'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_cr_desc">Deskripsi Detail <span className="text-destructive">*</span></Label>
                <Textarea
                  id="add_cr_desc"
                  required
                  rows={4}
                  placeholder="Jelaskan secara detail model/keinginan dekorasi kustom customer..."
                  value={crForm.description}
                  onChange={(e) => setCrForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    Foto Referensi <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal"> (maks. 5 foto)</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedFiles.length}/5
                  </span>
                </div>

                {/* Preview selected files to be uploaded */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedFiles.map((file, fi) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={fi} className="relative group aspect-square">
                          <img
                            src={url}
                            alt={`Preview ${fi + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            onClick={() => handleRemoveAddFile(fi)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload dashed button */}
                {selectedFiles.length < 5 && (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                    onClick={() => fileInputAddRef.current?.click()}
                  >
                    <Plus size={20} className="mx-auto text-muted-foreground mb-1 animate-pulse" />
                    <p className="text-xs text-muted-foreground">
                      Klik untuk tambah foto referensi (Maks. 5MB per file)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputAddRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleAddFilesChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Edit Custom Request ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
          <form onSubmit={handleEditSubmit} className="flex flex-col overflow-hidden flex-1">
            <DialogHeader>
              <DialogTitle>Edit Custom Request</DialogTitle>
              <DialogDescription>
                Ubah informasi detail custom request customer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
              <div className="space-y-2">
                <Label htmlFor="edit_cr_title">Judul Request <span className="text-destructive">*</span></Label>
                <Input
                  id="edit_cr_title"
                  required
                  value={crForm.title}
                  onChange={(e) => setCrForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cr_theme">Tema Warna <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-3">
                  <input
                    id="edit_cr_theme"
                    type="color"
                    value={crForm.color_theme || '#d4a017'}
                    onChange={(e) => setCrForm(prev => ({ ...prev, color_theme: e.target.value }))}
                    className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="text-sm text-muted-foreground">
                    {crForm.color_theme || '#d4a017'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cr_desc">Deskripsi Detail <span className="text-destructive">*</span></Label>
                <Textarea
                  id="edit_cr_desc"
                  required
                  rows={4}
                  value={crForm.description}
                  onChange={(e) => setCrForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Kelola Foto Referensi yang Sudah Ada */}
              {activeEditCR?.reference_images_urls && activeEditCR.reference_images_urls.length > 0 && (
                <div className="space-y-2">
                  <Label>Foto Referensi Terunggah ({activeEditCR.reference_images_urls.length})</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {activeEditCR.reference_images_urls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                        <img src={url} alt={`Referensi ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomRequestImage(activeEditCR.id, idx)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} className="text-white hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Arahkan kursor ke foto untuk menghapusnya.</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    Foto Baru Akan Diunggah <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal">
                      (maks. {5 - (activeEditCR?.reference_images_urls?.length || 0)} foto baru)
                    </span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedFiles.length}/{5 - (activeEditCR?.reference_images_urls?.length || 0)}
                  </span>
                </div>

                {/* Preview selected files to be uploaded */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedFiles.map((file, fi) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={fi} className="relative group aspect-square">
                          <img
                            src={url}
                            alt={`Preview ${fi + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            onClick={() => handleRemoveEditFile(fi)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload dashed button */}
                {((activeEditCR?.reference_images_urls?.length || 0) + selectedFiles.length) < 5 && (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                    onClick={() => fileInputEditRef.current?.click()}
                  >
                    <Plus size={20} className="mx-auto text-muted-foreground mb-1 animate-pulse" />
                    <p className="text-xs text-muted-foreground">
                      Klik untuk tambah foto referensi (Maks. 5MB per file)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputEditRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleEditFilesChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
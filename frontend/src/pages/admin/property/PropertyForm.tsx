import { ArrowLeft, Save, Loader2, Upload, X, Package, Image as ImageIcon } from "lucide-react";
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
import { usePropertyForm } from "@/hooks/Admin/property/usePropertyForm";
import { CurrencyInput } from "@/components/ui/currency-input";

export default function PropertyForm() {
  const {
    isLoading,
    isFetching,
    isEditMode,
    categories,
    existingImage,
    imagePreview,
    formData,
    handleNameChange,
    handleFileChange,
    handleRemovePreview,
    handleRemoveExistingImage,
    handleSubmit,
    updateFormData,
    navigate,
  } = usePropertyForm();

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data property...</p>
      </div>
    );
  }

  const activeImage = imagePreview || existingImage;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/properties")}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex-1">
             <h1 className="text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit Property" : "Tambah Property Baru"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Update informasi property" : "Isi form untuk menambah property baru"}
            </p>
          </div>
        </div>
        <Button 
          className="gradient-ocean text-primary-foreground h-10 text-base font-medium w-full sm:w-auto sm:ml-auto"
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save size={18} className="mr-2" /> Simpan</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property Information Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Informasi Properti
              </CardTitle>
              <CardDescription>Lengkapi rincian data dekorasi atau properti di bawah ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Property *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masukkan nama properti"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  placeholder="slug-property"
                  className="bg-muted cursor-not-allowed text-muted-foreground"
                  readOnly
                  required
                />
                <p className="text-xs text-muted-foreground">URL-friendly name (otomatis dibuat dari nama)</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category_id ? String(formData.category_id) : ""}
                  onValueChange={(value) => updateFormData("category_id", Number(value))}
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
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Masukkan deskripsi properti dekorasi"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Harga Sewa *</Label>
                  <CurrencyInput
                    id="price"
                    value={formData.price}
                    onChange={(val) => updateFormData("price", val)}
                    maxDigits={7}
                    placeholder="Contoh: 500.000"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="available">Status Ketersediaan</Label>
                  <p className="text-sm text-muted-foreground">
                    Tentukan apakah properti ini siap sewa
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => updateFormData("is_available", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Single Image Upload and Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                Gambar Properti
              </CardTitle>
              <CardDescription>Upload foto utama properti di sini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeImage ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-primary/20 aspect-square">
                  <img
                    src={activeImage}
                    alt="Pratinjau properti"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={imagePreview ? handleRemovePreview : handleRemoveExistingImage}
                      className="gap-2"
                    >
                      <X size={16} />
                      Ganti Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl aspect-square flex flex-col items-center justify-center p-6 gap-3 cursor-pointer transition-colors bg-muted/20"
                >
                  <div className="p-3 bg-muted rounded-full text-muted-foreground">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Pilih File Gambar</p>
                    <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG, WEBP (Maks. 5MB)</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    Cari File
                  </Button>
                </div>
              )}
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
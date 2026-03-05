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
import { usePropertyForm } from "@/hooks/usePropertyForm";

export default function PropertyForm() {
  const {
    isLoading,
    isFetching,
    isEditMode,
    categories,
    existingImages,
    formData,
    imagePreviews,
    handleNameChange,
    handleFileChange,
    handleRemoveImage,
    handleDeleteExistingImage,
    handleSetPrimaryExisting,
    handleSetPrimaryImage,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-semibold">
            {isEditMode ? "Edit Property" : "Tambah Property Baru"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update informasi property" : "Isi form untuk menambah property baru"}
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save size={18} className="mr-2" /> Simpan</>
          )}
        </Button>
      </div>

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
                  onChange={(e) => updateFormData("slug", e.target.value)}
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
                    onChange={(e) => updateFormData("price", e.target.value)}
                    placeholder="500000"
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
                  onCheckedChange={(checked) => updateFormData("is_available", checked)}
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
                            onClick={() => handleSetPrimaryImage(index)}
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
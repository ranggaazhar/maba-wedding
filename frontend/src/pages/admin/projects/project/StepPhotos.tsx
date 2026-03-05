// src/components/admin/project/StepPhotos.tsx
import { useState, useEffect } from 'react';
import { Upload, X, Star, Edit2, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreateCompleteProjectData, ProjectPhoto, PhotoWithMetadata } from '@/api/projectApi';
import { projectApi } from '@/api/projectApi';
import Swal from 'sweetalert2';

interface StepPhotosProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
  existingPhotos: ProjectPhoto[];
  onRefresh?: () => void;
}

// Definisikan tipe untuk posisi foto agar tidak menggunakan 'any'
type PhotoPosition = 'left' | 'right' | 'center';

export function StepPhotos({ formData, updateFormData, existingPhotos, onRefresh }: StepPhotosProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<ProjectPhoto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState({
    caption: '',
    position: 'center' as PhotoPosition,
    is_hero: false
  });

  useEffect(() => {
    const photos = formData.photos || [];
    
    if (photos.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews: string[] = [];
    let loadedCount = 0;

    photos.forEach((photoData) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === photos.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(photoData.file);
    });
  }, [formData.photos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentPhotos = formData.photos || [];
    const startIndex = currentPhotos.length;

    const newPhotos: PhotoWithMetadata[] = files.map((file, index) => ({
      file,
      caption: '',
      position: 'center' as const,
      display_order: startIndex + index,
    }));

    updateFormData({
      photos: [...currentPhotos, ...newPhotos],
    });
  };

  const removeNewPhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(index, 1);
    
    const reorderedPhotos = newPhotos.map((photo, idx) => ({
      ...photo,
      display_order: idx,
    }));

    updateFormData({ photos: reorderedPhotos });

    if (formData.hero_photo_index === (existingPhotos.length + index)) {
      updateFormData({ hero_photo_index: 0 });
    }
  };

  const setHeroPhoto = (index: number) => {
    updateFormData({ hero_photo_index: index });
  };

  const updatePhotoMetadata = (index: number, updates: Partial<PhotoWithMetadata>) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos[index] = { ...newPhotos[index], ...updates };
    updateFormData({ photos: newPhotos });
  };

  const openEditDialog = (photo: ProjectPhoto) => {
    setEditingPhoto(photo);
    setEditFormData({
      caption: photo.caption || '',
      position: photo.position as PhotoPosition,
      is_hero: photo.is_hero
    });
    setNewPhotoFile(null);
    setEditDialogOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhotoFile(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    try {
      const data = new FormData();
      data.append('caption', editFormData.caption);
      data.append('position', editFormData.position);
      data.append('is_hero', String(editFormData.is_hero));

      if (newPhotoFile) {
        data.append('photo', newPhotoFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/project-photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Foto berhasil diupdate',
          timer: 1500,
          showConfirmButton: false
        });
        setEditDialogOpen(false);
        onRefresh?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal update foto';
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errorMessage
      });
    }
  };

  const handleDeleteExistingPhoto = async (photoId: number) => {
    const result = await Swal.fire({
      title: 'Hapus foto?',
      text: 'Foto akan dihapus permanen dari storage!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await projectApi.deletePhoto(photoId);
        await Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Foto berhasil dihapus',
          timer: 1500,
          showConfirmButton: false
        });
        onRefresh?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus foto';
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorMessage
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Pengaturan Foto Project</h2>
        
        <div className="space-y-6">
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-3">
              <Label className="text-primary flex items-center gap-2">
                📷 Foto yang Sudah Ada ({existingPhotos.length})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingPhotos.map((photo, index) => {
                  const isHero = formData.hero_photo_index === index;
                  return (
                    <div key={photo.id} className="relative group border rounded-lg overflow-hidden">
                      <div className="aspect-square">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || 'Existing'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <Button
                          size="sm"
                          variant={isHero ? "default" : "secondary"}
                          className={isHero ? "bg-amber-500 hover:bg-amber-600 h-8" : "h-8"}
                          onClick={() => setHeroPhoto(index)}
                          type="button"
                        >
                          <Star size={12} className={`mr-1 ${isHero ? 'fill-current' : ''}`} />
                          Hero
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="h-8"
                          onClick={() => openEditDialog(photo)}
                          type="button"
                        >
                          <Edit2 size={12} className="mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() => handleDeleteExistingPhoto(photo.id)}
                          type="button"
                        >
                          <Trash2 size={12} className="mr-1" />
                          Hapus
                        </Button>
                      </div>

                      {isHero && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                          Hero
                        </Badge>
                      )}
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 line-clamp-2">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="space-y-3">
            <Label>Tambah Foto Baru</Label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-semibold">Klik untuk tambah file</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG (Max 5MB)</p>
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {/* New Photos Preview */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <Label className="text-blue-600 flex items-center gap-2">
                ✨ Foto Baru ({previews.length})
              </Label>
              <div className="space-y-3">
                {previews.map((preview, index) => {
                  const photoData = formData.photos![index];
                  const actualIndex = existingPhotos.length + index;
                  const isHero = formData.hero_photo_index === actualIndex;

                  return (
                    <div key={index} className="border rounded-lg p-4 bg-card space-y-3">
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden border-2 border-blue-200">
                          <img src={preview} alt="New" className="w-full h-full object-cover" />
                          {isHero && (
                            <Badge className="absolute top-1 right-1 bg-amber-500 text-white">
                              Hero
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <Label className="text-xs">Caption</Label>
                            <Textarea
                              value={photoData.caption}
                              onChange={(e) => updatePhotoMetadata(index, { caption: e.target.value })}
                              placeholder="Deskripsi foto..."
                              rows={2}
                              className="text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Position</Label>
                              <Select
                                value={photoData.position}
                                onValueChange={(value: PhotoPosition) => updatePhotoMetadata(index, { position: value })}
                              >
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Display Order</Label>
                              <Input
                                type="number"
                                value={photoData.display_order}
                                onChange={(e) => updatePhotoMetadata(index, { display_order: parseInt(e.target.value) || 0 })}
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant={isHero ? "default" : "outline"}
                            className={isHero ? "h-8 bg-amber-500 hover:bg-amber-600" : "h-8"}
                            onClick={() => setHeroPhoto(actualIndex)}
                            type="button"
                          >
                            <Star size={12} className={isHero ? 'fill-current' : ''} />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={() => removeNewPhoto(index)}
                            type="button"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
{/* Edit Dialog */}
<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  {/* Perbesar max-w agar layout grid terlihat bagus, misal max-w-2xl atau 3xl */}
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Foto</DialogTitle>
    </DialogHeader>

    {/* Container Grid: Gambar di kiri, Form di kanan */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      
      {/* SISI KIRI: Preview Gambar */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preview</Label>
        <div className="relative w-full aspect-square rounded-xl overflow-hidden border bg-muted/30">
          {newPhotoFile ? (
            <img 
              src={URL.createObjectURL(newPhotoFile)} 
              alt="New" 
              className="w-full h-full object-cover"
            />
          ) : editingPhoto ? (
            <img 
              src={editingPhoto.url} 
              alt="Current" 
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>

      {/* SISI KANAN: Form Inputs */}
      <div className="space-y-4">
        {/* Upload New File */}
        <div>
          <Label className="text-sm font-medium">Ganti Foto (Opsional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleEditFileChange}
            className="mt-1.5 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Kosongkan jika tidak ingin mengganti file fisik.
          </p>
        </div>

        {/* Position */}
        <div>
          <Label className="text-sm font-medium">Posisi Tampilan</Label>
          <Select
            value={editFormData.position}
            onValueChange={(value: PhotoPosition) => setEditFormData({ ...editFormData, position: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pilih posisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left (Kiri)</SelectItem>
              <SelectItem value="center">Center (Tengah)</SelectItem>
              <SelectItem value="right">Right (Kanan)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Caption */}
        <div>
          <Label className="text-sm font-medium">Keterangan (Caption)</Label>
          <Textarea
            value={editFormData.caption}
            onChange={(e) => setEditFormData({ ...editFormData, caption: e.target.value })}
            placeholder="Tulis deskripsi singkat foto..."
            rows={4}
            className="mt-1.5 resize-none"
          />
        </div>
      </div>
    </div>
    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
      <Button 
        variant="outline" 
        onClick={() => setEditDialogOpen(false)}
        type="button"
      >
        Batal
      </Button>
      <Button 
        onClick={handleSaveEdit}
        className="px-8"
        type="button"
      >
        Simpan Perubahan
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
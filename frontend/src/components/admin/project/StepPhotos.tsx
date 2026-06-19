// src/components/admin/project/StepPhotos.tsx
import { useState, useMemo } from 'react';
import { Upload, X, Star, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { projectApi } from '@/api/projectApi';
import type {
  CreateCompleteProjectData,
  ProjectPhoto,
  PhotoWithMetadata,
} from '@/types/project.types';
import Swal from 'sweetalert2';

interface StepPhotosProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
  existingPhotos: ProjectPhoto[];
  projectId?: number;
  onRefresh?: () => void;
}

type PhotoPosition = 'left' | 'right' | 'center';

export function StepPhotos({ formData, updateFormData, existingPhotos, projectId, onRefresh }: StepPhotosProps) {
  const [editingPhoto, setEditingPhoto] = useState<ProjectPhoto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState({
    caption: '',
    position: 'center' as PhotoPosition,
    is_hero: false,
  });

  // Generate preview URLs langsung dari formData.photos — selalu sinkron
  const previews = useMemo(
    () => (formData.photos || []).map((p) => URL.createObjectURL(p.file)),
    [formData.photos]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const currentPhotos = formData.photos || [];
    const newPhotos: PhotoWithMetadata[] = files.map((file, index) => ({
      file,
      caption: '',
      position: 'center' as const,
      display_order: currentPhotos.length + index,
    }));
    updateFormData({ photos: [...currentPhotos, ...newPhotos] });
  };

  const removeNewPhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(index, 1);
    updateFormData({ photos: newPhotos.map((p, idx) => ({ ...p, display_order: idx })) });
    if (formData.hero_photo_index === existingPhotos.length + index) {
      updateFormData({ hero_photo_index: 0 });
    }
  };

  const setHeroPhoto = (index: number) => updateFormData({ hero_photo_index: index });

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
      is_hero: photo.is_hero,
    });
    setNewPhotoFile(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto || !projectId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Project ID tidak ditemukan' });
      return;
    }
    try {
      const result = await projectApi.updateProjectPhoto(projectId, editingPhoto.id, {
        caption: editFormData.caption,
        position: editFormData.position,
        is_hero: editFormData.is_hero,
        file: newPhotoFile ?? undefined,
      });
      if (result.success) {
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Foto berhasil diupdate', timer: 1500, showConfirmButton: false });
        setEditDialogOpen(false);
        onRefresh?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal!', text: error instanceof Error ? error.message : 'Gagal update foto' });
    }
  };

  const handleDeleteExistingPhoto = async (photoId: number) => {
    const confirm = await Swal.fire({
      title: 'Hapus foto?', text: 'Foto akan dihapus permanen!', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    });
    if (confirm.isConfirmed) {
      try {
        if (!projectId) throw new Error('Project ID tidak ditemukan');
        const result = await projectApi.deleteProjectPhoto(projectId, photoId);
        if (result.success) {
          await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Foto berhasil dihapus', timer: 1500, showConfirmButton: false });
          onRefresh?.();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: error instanceof Error ? error.message : 'Gagal menghapus foto' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Pengaturan Foto Project</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload foto dan atur tampilan untuk setiap foto project.
        </p>

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
                    <div key={photo.id} className="relative border rounded-lg overflow-hidden">
                      <div className="aspect-square">
                        <img src={photo.url} alt={photo.caption || 'Existing'} className="w-full h-full object-cover" />
                      </div>
                      {isHero && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px]">
                          <Star size={9} className="mr-1 fill-current" />Hero
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setHeroPhoto(index)} className="gap-2 cursor-pointer">
                              <Star size={13} className={isHero ? 'fill-amber-500 text-amber-500' : ''} />
                              {isHero ? 'Hapus Hero' : 'Jadikan Hero'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(photo)} className="gap-2 cursor-pointer">
                              <Edit2 size={13} /> Edit Foto
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteExistingPhoto(photo.id)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 size={13} /> Hapus Foto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

          {/* New Photos */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <Label className="text-blue-600 flex items-center gap-2">✨ Foto Baru ({previews.length})</Label>
              <div className="space-y-4">
                {previews.map((preview, index) => {
                  const photoData = formData.photos![index];
                  const actualIndex = existingPhotos.length + index;
                  const isHero = formData.hero_photo_index === actualIndex;

                  return (
                    <div key={index} className="border rounded-xl p-4 bg-card space-y-4">
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden border-2 border-blue-200">
                          <img src={preview} alt="New" className="w-full h-full object-cover" />
                          {isHero && (
                            <Badge className="absolute top-1 right-1 bg-amber-500 text-white text-[9px]">Hero</Badge>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
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
                                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
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
                            variant={isHero ? 'default' : 'outline'}
                            className={isHero ? 'h-8 bg-amber-500 hover:bg-amber-600' : 'h-8'}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preview</Label>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border bg-muted/30">
                {newPhotoFile ? (
                  <img src={URL.createObjectURL(newPhotoFile)} alt="New" className="w-full h-full object-cover" />
                ) : editingPhoto ? (
                  <img src={editingPhoto.url} alt="Current" className="w-full h-full object-cover" />
                ) : null}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Ganti Foto (Opsional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setNewPhotoFile(f); }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Posisi Tampilan</Label>
                <Select
                  value={editFormData.position}
                  onValueChange={(value: PhotoPosition) => setEditFormData({ ...editFormData, position: value })}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Caption</Label>
                <Textarea
                  value={editFormData.caption}
                  onChange={(e) => setEditFormData({ ...editFormData, caption: e.target.value })}
                  placeholder="Keterangan foto..."
                  rows={3}
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} type="button">Batal</Button>
            <Button onClick={handleSaveEdit} className="px-8" type="button">Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
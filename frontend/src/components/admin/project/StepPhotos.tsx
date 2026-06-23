// src/components/admin/project/StepPhotos.tsx
import { useState, useMemo, useEffect } from 'react';
import { Upload, X, Star, Edit2, Trash2, MoreVertical, ArrowUp, ArrowDown, Info } from 'lucide-react';
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
  setExistingPhotos?: React.Dispatch<React.SetStateAction<ProjectPhoto[]>>;
  projectId?: number;
  onRefresh?: () => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

type PhotoPosition = 'left' | 'right' | 'center';

const POSITION_LABELS: Record<PhotoPosition, string> = {
  left: 'Kiri',
  center: 'Tengah (Lebar Penuh)',
  right: 'Kanan',
};

const MAX_PHOTOS = 3;

export function StepPhotos({ formData, updateFormData, existingPhotos, setExistingPhotos, projectId, onRefresh, errors, setErrors }: StepPhotosProps) {
  const [editingPhoto, setEditingPhoto] = useState<ProjectPhoto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [dialogError, setDialogError] = useState('');
  const [editFormData, setEditFormData] = useState({
    caption: '',
    position: 'left' as PhotoPosition,
    is_hero: false,
  });

  const totalPhotosCount = existingPhotos.length + (formData.photos?.length || 0);
  const remainingSlots = MAX_PHOTOS - totalPhotosCount;

  // Generate preview URLs langsung dari formData.photos — selalu sinkron
  const previews = useMemo(
    () => (formData.photos || []).map((p) => URL.createObjectURL(p.file)),
    [formData.photos]
  );

  // Automatic synchronization effect: forces photo positions, hero indices, and display orders
  // to strictly align with their index in the total combined list:
  // absolute index 0 -> center and hero
  // absolute index 1 -> left
  // absolute index 2 -> right
  useEffect(() => {
    let changed = false;

    // 1. Sync existingPhotos
    const syncedExisting = existingPhotos.map((photo, index) => {
      const absoluteIndex = index;
      let targetPosition: PhotoPosition = 'left';
      let targetIsHero = false;

      if (absoluteIndex === 0) {
        targetPosition = 'center';
        targetIsHero = true;
      } else if (absoluteIndex === 1) {
        targetPosition = 'left';
      } else if (absoluteIndex === 2) {
        targetPosition = 'right';
      }

      const shouldClearCaption = targetIsHero && (photo.caption || '') !== '';
      if (
        photo.position !== targetPosition ||
        photo.is_hero !== targetIsHero ||
        photo.display_order !== absoluteIndex ||
        shouldClearCaption
      ) {
        changed = true;
        return {
          ...photo,
          position: targetPosition,
          is_hero: targetIsHero,
          display_order: absoluteIndex,
          caption: targetIsHero ? '' : photo.caption,
        };
      }
      return photo;
    });

    // 2. Sync new photos (formData.photos)
    const currentPhotos = [...(formData.photos || [])];
    currentPhotos.sort((a, b) => a.display_order - b.display_order);

    const syncedPhotos = currentPhotos.map((photo, index) => {
      const absoluteIndex = existingPhotos.length + index;
      let targetPosition: PhotoPosition = 'left';

      if (absoluteIndex === 0) {
        targetPosition = 'center';
      } else if (absoluteIndex === 1) {
        targetPosition = 'left';
      } else if (absoluteIndex === 2) {
        targetPosition = 'right';
      }

      const isHero = absoluteIndex === 0;
      const shouldClearCaption = isHero && (photo.caption || '') !== '';

      if (
        photo.position !== targetPosition ||
        photo.display_order !== absoluteIndex ||
        shouldClearCaption
      ) {
        changed = true;
        return {
          ...photo,
          position: targetPosition,
          display_order: absoluteIndex,
          caption: isHero ? '' : photo.caption,
        };
      }
      return photo;
    });

    const targetHeroIndex = 0; // Always 0 is the hero index

    if (changed || formData.hero_photo_index !== targetHeroIndex) {
      if (changed && setExistingPhotos) {
        setExistingPhotos(syncedExisting);
      }
      updateFormData({
        photos: syncedPhotos,
        hero_photo_index: targetHeroIndex,
      });
    }
  }, [existingPhotos, formData.photos, setExistingPhotos, updateFormData, formData.hero_photo_index]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > remainingSlots) {
      Swal.fire({
        icon: 'warning',
        title: 'Batas Foto Terlampaui',
        text: `Maksimal hanya diperbolehkan ${MAX_PHOTOS} foto per project. Anda memilih ${files.length} file, tetapi slot tersisa hanya ${remainingSlots}.`,
      });
      e.target.value = '';
      return;
    }

    // 1. Validasi Tipe File (MIME harus image/*) dan Ukuran File (Maksimal 5MB)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidTypes: string[] = [];
    const oversizedFiles: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidTypes.push(file.name);
      } else if (file.size > maxSize) {
        oversizedFiles.push(file.name);
      }
    });

    if (invalidTypes.length > 0) {
      Swal.fire('Format Tidak Sesuai', `File berikut bukan format gambar yang valid:\n${invalidTypes.join(', ')}\n(Format yang diperbolehkan: JPG, JPEG, PNG, GIF, WEBP)`, 'error');
      e.target.value = '';
      return;
    }

    if (oversizedFiles.length > 0) {
      Swal.fire('File Terlalu Besar', `File berikut melebihi ukuran maksimal 5MB:\n${oversizedFiles.join(', ')}`, 'error');
      e.target.value = '';
      return;
    }

    const currentPhotos = formData.photos || [];
    const newPhotos: PhotoWithMetadata[] = files.map((file, index) => ({
      file,
      caption: '',
      position: 'left' as const,
      display_order: currentPhotos.length + index,
    }));

    updateFormData({
      photos: [...currentPhotos, ...newPhotos],
    });
    e.target.value = '';
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire('Format Tidak Sesuai', 'Hanya berkas gambar yang diperbolehkan (JPG, JPEG, PNG, GIF, WEBP)!', 'error');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire('File Terlalu Besar', 'Ukuran gambar maksimal adalah 5MB!', 'error');
      e.target.value = '';
      return;
    }

    setNewPhotoFile(file);
  };

  const removeNewPhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(index, 1);
    updateFormData({ photos: newPhotos });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`new_caption_${index}`];
      return next;
    });
  };

  const updatePhotoMetadata = (index: number, updates: Partial<PhotoWithMetadata>) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos[index] = { ...newPhotos[index], ...updates };
    updateFormData({ photos: newPhotos });
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const photos = [...(formData.photos || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    [photos[index], photos[targetIndex]] = [photos[targetIndex], photos[index]];
    updateFormData({ photos: photos.map((p, idx) => ({ ...p, display_order: idx })) });
  };

  const openEditDialog = (photo: ProjectPhoto) => {
    setEditingPhoto(photo);
    setEditFormData({
      caption: photo.caption || '',
      position: (photo.position as PhotoPosition) || 'left',
      is_hero: photo.is_hero,
    });
    setNewPhotoFile(null);
    setDialogError('');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto || !projectId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Project ID tidak ditemukan' });
      return;
    }
    if (!editFormData.is_hero && !editFormData.caption?.trim()) {
      setDialogError('Caption untuk foto detail wajib diisi.');
      return;
    }
    try {
      const result = await projectApi.updateProjectPhoto(projectId, editingPhoto.id, {
        caption: editFormData.is_hero ? '' : editFormData.caption,
        position: editFormData.position,
        is_hero: editFormData.is_hero,
        file: newPhotoFile ?? undefined,
      });
      if (result.success) {
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Foto berhasil diupdate', timer: 1500, showConfirmButton: false });
        setErrors((prev) => {
          const next = { ...prev };
          delete next[`existing_caption_${editingPhoto.id}`];
          return next;
        });
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
          setErrors((prev) => {
            const next = { ...prev };
            delete next[`existing_caption_${photoId}`];
            return next;
          });
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
        <p className="text-sm text-muted-foreground mb-2">
          Upload foto dan atur tampilan untuk setiap foto project.
        </p>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6 text-xs text-blue-700 dark:text-blue-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p><strong>Position</strong> = tata letak foto di halaman publik: <strong>Kiri</strong> / <strong>Kanan</strong> (setengah lebar) atau <strong>Tengah</strong> (lebar penuh, biasanya untuk foto hero).</p>
            <p><strong>Hero ⭐</strong> = foto utama yang muncul pertama kali di thumbnail dan header project. Hanya satu foto yang bisa jadi hero.</p>
            <p><strong>Display Order</strong> = urutan tampil foto (0 = paling pertama). Gunakan tombol ↑↓ untuk mengatur urutan.</p>
          </div>
        </div>

        <div className="space-y-6">
          {existingPhotos.length > 0 && (
            <div className="space-y-3">
              <Label className="text-primary flex items-center gap-2">
                📷 Foto yang Sudah Ada ({existingPhotos.length})
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {existingPhotos.map((photo, index) => {
                  const isHero = photo.is_hero;
                  return (
                    <div key={photo.id} className="relative border rounded-lg overflow-hidden group">
                      <div className="aspect-square">
                        <img src={photo.url} alt={photo.caption || 'Existing'} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isHero && (
                          <Badge className="bg-amber-500 text-white text-[10px]">
                            <Star size={9} className="mr-1 fill-current" />Hero
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[9px] opacity-80">
                          {POSITION_LABELS[photo.position as PhotoPosition] || photo.position}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] opacity-80 bg-white/80">
                          #{photo.display_order ?? index}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openEditDialog(photo)} className="gap-2 cursor-pointer">
                              <Edit2 size={13} /> Edit Foto
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteExistingPhoto(photo.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 size={13} /> Hapus Foto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {errors[`existing_caption_${photo.id}`] && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] text-center py-1 font-semibold z-10">
                          Caption wajib diisi
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalPhotosCount >= MAX_PHOTOS ? (
            <div className="flex flex-col items-center justify-center w-full p-6 border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg text-center gap-2">
              <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Batas Maksimal Foto Tercapai</p>
                <p className="text-xs text-amber-600/90 dark:text-amber-400/90 max-w-md mx-auto">
                  Untuk tampilan layout yang optimal di halaman utama, project dibatasi maksimal <strong>3 foto</strong>. Silakan hapus foto yang ada terlebih dahulu untuk menambahkan foto baru.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tambah Foto Baru</Label>
                <Badge variant="secondary" className="text-[10px]">
                  Tersisa {remainingSlots} dari {MAX_PHOTOS} slot
                </Badge>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-semibold">Klik untuk tambah file</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          )}

          {previews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-blue-600 flex items-center gap-2">✨ Foto Baru ({previews.length})</Label>
              </div>
              <div className="space-y-4">
                {previews.map((preview, index) => {
                  const photoData = formData.photos![index];
                  const actualIndex = existingPhotos.length + index;
                  const isHero = formData.hero_photo_index === actualIndex;

                  return (
                    <div key={index} className="border rounded-xl p-4 bg-card space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-32 aspect-video sm:aspect-square sm:h-32 shrink-0 rounded-lg overflow-hidden border-2 border-blue-200">
                          <img src={preview} alt="New" className="w-full h-full object-cover" />
                          {isHero && (
                            <Badge className="absolute top-1 right-1 bg-amber-500 text-white text-[9px]">Hero</Badge>
                          )}
                          <Badge variant="secondary" className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white border-0">
                            #{photoData.display_order}
                          </Badge>
                        </div>
                        <div className="flex-1 space-y-3">
                          {!isHero && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Caption <span className="text-destructive">*</span></Label>
                              <Textarea
                                value={photoData.caption}
                                onChange={(e) => {
                                  updatePhotoMetadata(index, { caption: e.target.value });
                                  setErrors((prev) => ({ ...prev, [`new_caption_${index}`]: '' }));
                                }}
                                placeholder="Deskripsi foto (wajib)..."
                                rows={2}
                                className="text-sm mt-1"
                              />
                              {errors[`new_caption_${index}`] && (
                                <p className="text-xs text-destructive mt-1">{errors[`new_caption_${index}`]}</p>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Position Layout</Label>
                              <Select
                                value={photoData.position || 'left'}
                                disabled={true}
                              >
                                <SelectTrigger className="h-9 text-sm mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">← Kiri (setengah)</SelectItem>
                                  <SelectItem value="center">⬛ Tengah (lebar penuh)</SelectItem>
                                  <SelectItem value="right">→ Kanan (setengah)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Display Order</Label>
                              <Input
                                type="number"
                                min={0}
                                value={photoData.display_order}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const parsed = parseInt(val, 10);
                                  updatePhotoMetadata(index, {
                                    display_order: isNaN(parsed) ? 0 : parsed,
                                  });
                                }}
                                className="h-9 text-sm mt-1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 shrink-0 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant={isHero ? 'default' : 'outline'}
                            className={isHero ? 'h-8 w-8 bg-amber-500 p-0 cursor-default' : 'h-8 w-8 p-0'}
                            disabled={true}
                            type="button"
                          >
                            <Star size={12} className={isHero ? 'fill-current' : ''} />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => movePhoto(index, 'up')} disabled={index === 0} type="button">
                            <ArrowUp size={12} />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => movePhoto(index, 'down')} disabled={index === previews.length - 1} type="button">
                            <ArrowDown size={12} />
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => removeNewPhoto(index)} type="button">
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preview</Label>
              <div className="relative w-full aspect-video sm:aspect-square rounded-xl overflow-hidden border bg-muted/30">
                {newPhotoFile ? (
                  <img src={URL.createObjectURL(newPhotoFile)} alt="New" className="w-full h-full object-cover" />
                ) : editingPhoto ? (
                  <img src={editingPhoto.url} alt="Current" className="w-full h-full object-cover" />
                ) : null}
              </div>
              {editingPhoto && (
                <div className="flex flex-wrap gap-1">
                  {editFormData.is_hero && (
                    <Badge className="bg-amber-500 text-white text-[10px]">
                      <Star size={9} className="mr-1 fill-current" />Hero
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {POSITION_LABELS[editFormData.position] || editFormData.position}
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Ganti Foto (Opsional)</Label>
                <Input type="file" accept="image/*" onChange={handleEditFileChange} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Posisi Tampilan</Label>
                <p className="text-xs text-muted-foreground mb-1">Tata letak diatur otomatis berdasarkan urutan foto</p>
                <Select
                  value={editFormData.position}
                  disabled={true}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">← Kiri (setengah lebar)</SelectItem>
                    <SelectItem value="center">⬛ Tengah (lebar penuh)</SelectItem>
                    <SelectItem value="right">→ Kanan (setengah lebar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Status Hero</Label>
                <p className="text-xs text-muted-foreground mb-1">Foto utama diatur otomatis pada foto pertama</p>
                <Button
                  type="button"
                  variant={editFormData.is_hero ? 'default' : 'outline'}
                  className={`w-full mt-1 gap-2 cursor-default ${editFormData.is_hero ? 'bg-amber-500 hover:bg-amber-500' : ''}`}
                  disabled={true}
                >
                  <Star size={14} className={editFormData.is_hero ? 'fill-current' : ''} />
                  {editFormData.is_hero ? 'Foto Hero Utama' : 'Bukan Hero'}
                </Button>
              </div>
              {!editFormData.is_hero && (
                <div>
                  <Label className="text-sm font-medium">Caption <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={editFormData.caption}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, caption: e.target.value });
                      setDialogError('');
                    }}
                    placeholder="Keterangan foto..."
                    rows={3}
                    className="mt-1.5 resize-none"
                  />
                  {dialogError && (
                    <p className="text-sm text-destructive mt-1">{dialogError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} type="button" className="w-full sm:w-auto">Batal</Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto px-8" type="button">Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
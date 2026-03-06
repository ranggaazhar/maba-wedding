import { useState, useEffect } from 'react';
import { Upload, X, Star, Edit2, Trash2, Plus, Palette, Flower, MoreVertical } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { projectApi } from '@/api/projectApi';
import type {
  CreateCompleteProjectData,
  ProjectPhoto,
  PhotoWithMetadata,
  ProjectPhotoColor,
  ProjectPhotoFlower,
} from '@/api/projectApi';
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
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<ProjectPhoto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState({
    caption: '',
    position: 'center' as PhotoPosition,
    is_hero: false,
  });

  // For color/flower inputs in edit dialog
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [newColorDesc, setNewColorDesc] = useState('');
  const [newFlowerName, setNewFlowerName] = useState('');
  const [newFlowerDesc, setNewFlowerDesc] = useState('');
  const [editColors, setEditColors] = useState<ProjectPhotoColor[]>([]);
  const [editFlowers, setEditFlowers] = useState<ProjectPhotoFlower[]>([]);

  useEffect(() => {
    const photos = formData.photos || [];
    if (photos.length === 0) { setPreviews([]); return; }

    const newPreviews: string[] = [];
    let loadedCount = 0;

    photos.forEach((photoData) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === photos.length) setPreviews(newPreviews);
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
      colors: [],
      flowers: [],
    }));

    updateFormData({ photos: [...currentPhotos, ...newPhotos] });
  };

  const removeNewPhoto = (index: number) => {
    const newPhotos = [...(formData.photos || [])];
    newPhotos.splice(index, 1);
    const reorderedPhotos = newPhotos.map((photo, idx) => ({ ...photo, display_order: idx }));
    updateFormData({ photos: reorderedPhotos });
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

  // ── Color helpers for new photos ──
  const addColorToNewPhoto = (photoIndex: number) => {
    const photos = [...(formData.photos || [])];
    const photo = photos[photoIndex];
    const colors = photo.colors || [];
    if (!newColorName.trim()) return;
    const newColor: ProjectPhotoColor = {
      color_name: newColorName.trim(),
      color_hex: newColorHex || undefined,
      description: newColorDesc || undefined,
      display_order: colors.length,
    };
    updatePhotoMetadata(photoIndex, { colors: [...colors, newColor] });
    setNewColorName(''); setNewColorHex(''); setNewColorDesc('');
  };

  const removeColorFromNewPhoto = (photoIndex: number, colorIndex: number) => {
    const photos = [...(formData.photos || [])];
    const colors = [...(photos[photoIndex].colors || [])];
    colors.splice(colorIndex, 1);
    updatePhotoMetadata(photoIndex, { colors: colors.map((c, i) => ({ ...c, display_order: i })) });
  };

  // ── Flower helpers for new photos ──
  const addFlowerToNewPhoto = (photoIndex: number) => {
    const photos = [...(formData.photos || [])];
    const photo = photos[photoIndex];
    const flowers = photo.flowers || [];
    if (!newFlowerName.trim()) return;
    const newFlower: ProjectPhotoFlower = {
      flower_name: newFlowerName.trim(),
      description: newFlowerDesc || undefined,
      display_order: flowers.length,
    };
    updatePhotoMetadata(photoIndex, { flowers: [...flowers, newFlower] });
    setNewFlowerName(''); setNewFlowerDesc('');
  };

  const removeFlowerFromNewPhoto = (photoIndex: number, flowerIndex: number) => {
    const photos = [...(formData.photos || [])];
    const flowers = [...(photos[photoIndex].flowers || [])];
    flowers.splice(flowerIndex, 1);
    updatePhotoMetadata(photoIndex, { flowers: flowers.map((f, i) => ({ ...f, display_order: i })) });
  };

  // ── Edit existing photo dialog ──
  const openEditDialog = (photo: ProjectPhoto) => {
    setEditingPhoto(photo);
    setEditFormData({ caption: photo.caption || '', position: photo.position as PhotoPosition, is_hero: photo.is_hero });
    setEditColors(photo.colors ? [...photo.colors] : []);
    setEditFlowers(photo.flowers ? [...photo.flowers] : []);
    setNewPhotoFile(null);
    setNewColorName(''); setNewColorHex(''); setNewColorDesc('');
    setNewFlowerName(''); setNewFlowerDesc('');
    setEditDialogOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewPhotoFile(file);
  };

  const addColorToEdit = () => {
    if (!newColorName.trim()) return;
    setEditColors(prev => [...prev, { color_name: newColorName.trim(), color_hex: newColorHex || undefined, description: newColorDesc || undefined, display_order: prev.length }]);
    setNewColorName(''); setNewColorHex(''); setNewColorDesc('');
  };

  const removeColorFromEdit = (index: number) => {
    setEditColors(prev => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, display_order: i })));
  };

  const addFlowerToEdit = () => {
    if (!newFlowerName.trim()) return;
    setEditFlowers(prev => [...prev, { flower_name: newFlowerName.trim(), description: newFlowerDesc || undefined, display_order: prev.length }]);
    setNewFlowerName(''); setNewFlowerDesc('');
  };

  const removeFlowerFromEdit = (index: number) => {
    setEditFlowers(prev => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, display_order: i })));
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    if (!projectId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Project ID tidak ditemukan' });
      return;
    }
    try {
      const result = await projectApi.updateProjectPhoto(projectId, editingPhoto.id, {
        caption: editFormData.caption,
        position: editFormData.position,
        is_hero: editFormData.is_hero,
        colors: editColors,
        flowers: editFlowers,
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
      showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
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
          Upload foto, lalu tambahkan informasi warna dan bunga untuk setiap foto.
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

                      {/* Color/Flower badges */}
                      {((photo.colors?.length ?? 0) > 0 || (photo.flowers?.length ?? 0) > 0) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5 flex gap-1 flex-wrap">
                          {(photo.colors?.length ?? 0) > 0 && (
                            <Badge className="text-[9px] bg-purple-500 border-none py-0">
                              <Palette size={8} className="mr-1" />{photo.colors!.length} warna
                            </Badge>
                          )}
                          {(photo.flowers?.length ?? 0) > 0 && (
                            <Badge className="text-[9px] bg-pink-500 border-none py-0">
                              <Flower size={8} className="mr-1" />{photo.flowers!.length} bunga
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Hero badge */}
                      {isHero && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px]">
                          <Star size={9} className="mr-1 fill-current" />Hero
                        </Badge>
                      )}

                      {/* Three-dot dropdown menu */}
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
                              <Edit2 size={13} />
                              Edit Foto
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteExistingPhoto(photo.id)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 size={13} />
                              Hapus Foto
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

          {/* New Photos with color/flower inputs */}
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
                      {/* Top row: preview + basic metadata */}
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden border-2 border-blue-200">
                          <img src={preview} alt="New" className="w-full h-full object-cover" />
                          {isHero && <Badge className="absolute top-1 right-1 bg-amber-500 text-white text-[9px]">Hero</Badge>}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <Label className="text-xs">Caption</Label>
                            <Textarea value={photoData.caption} onChange={(e) => updatePhotoMetadata(index, { caption: e.target.value })} placeholder="Deskripsi foto..." rows={2} className="text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Position</Label>
                              <Select value={photoData.position} onValueChange={(value: PhotoPosition) => updatePhotoMetadata(index, { position: value })}>
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
                              <Input type="number" value={photoData.display_order} onChange={(e) => updatePhotoMetadata(index, { display_order: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" variant={isHero ? 'default' : 'outline'} className={isHero ? 'h-8 bg-amber-500 hover:bg-amber-600' : 'h-8'} onClick={() => setHeroPhoto(actualIndex)} type="button">
                            <Star size={12} className={isHero ? 'fill-current' : ''} />
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8" onClick={() => removeNewPhoto(index)} type="button">
                            <X size={12} />
                          </Button>
                        </div>
                      </div>

                      {/* Colors & Flowers accordion */}
                      <Accordion type="multiple" className="border rounded-lg overflow-hidden">
                        {/* Warna */}
                        <AccordionItem value="colors" className="border-b last:border-0">
                          <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                            <span className="flex items-center gap-2">
                              <Palette size={14} className="text-purple-500" />
                              Warna <Badge variant="secondary" className="ml-1 text-[10px]">{photoData.colors?.length || 0}</Badge>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 space-y-3">
                            {/* Color list */}
                            {photoData.colors && photoData.colors.length > 0 && (
                              <div className="space-y-2">
                                {photoData.colors.map((color, colorIdx) => (
                                  <div key={colorIdx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                    {color.color_hex && (
                                      <div className="w-6 h-6 rounded-full border shrink-0" style={{ backgroundColor: color.color_hex }} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{color.color_name}</p>
                                      {color.description && <p className="text-xs text-muted-foreground truncate">{color.description}</p>}
                                    </div>
                                    <button type="button" onClick={() => removeColorFromNewPhoto(index, colorIdx)} className="text-muted-foreground hover:text-destructive shrink-0">
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Add color form */}
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-2 gap-2">
                                <Input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nama warna *" className="text-sm h-9" />
                                <div className="flex gap-2">
                                  <input type="color" value={newColorHex || '#000000'} onChange={(e) => setNewColorHex(e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                                  <Input value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} placeholder="#HEX" className="text-sm h-9 flex-1" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Input value={newColorDesc} onChange={(e) => setNewColorDesc(e.target.value)} placeholder="Deskripsi singkat (opsional)" className="text-sm h-9 flex-1" />
                                <Button size="sm" type="button" onClick={() => addColorToNewPhoto(index)} className="h-9 bg-purple-500 hover:bg-purple-600 text-white shrink-0">
                                  <Plus size={14} className="mr-1" /> Tambah
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Bunga */}
                        <AccordionItem value="flowers">
                          <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                            <span className="flex items-center gap-2">
                              <Flower size={14} className="text-pink-500" />
                              Bunga <Badge variant="secondary" className="ml-1 text-[10px]">{photoData.flowers?.length || 0}</Badge>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 space-y-3">
                            {photoData.flowers && photoData.flowers.length > 0 && (
                              <div className="space-y-2">
                                {photoData.flowers.map((flower, flowerIdx) => (
                                  <div key={flowerIdx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                    <span className="text-pink-500 shrink-0">🌸</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{flower.flower_name}</p>
                                      {flower.description && <p className="text-xs text-muted-foreground truncate">{flower.description}</p>}
                                    </div>
                                    <button type="button" onClick={() => removeFlowerFromNewPhoto(index, flowerIdx)} className="text-muted-foreground hover:text-destructive shrink-0">
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="space-y-2 pt-1">
                              <Input value={newFlowerName} onChange={(e) => setNewFlowerName(e.target.value)} placeholder="Nama bunga *" className="text-sm h-9" />
                              <div className="flex gap-2">
                                <Input value={newFlowerDesc} onChange={(e) => setNewFlowerDesc(e.target.value)} placeholder="Deskripsi singkat (opsional)" className="text-sm h-9 flex-1" />
                                <Button size="sm" type="button" onClick={() => addFlowerToNewPhoto(index)} className="h-9 bg-pink-500 hover:bg-pink-600 text-white shrink-0">
                                  <Plus size={14} className="mr-1" /> Tambah
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Existing Photo Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Preview */}
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

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Ganti Foto (Opsional)</Label>
                <Input type="file" accept="image/*" onChange={handleEditFileChange} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Posisi Tampilan</Label>
                <Select value={editFormData.position} onValueChange={(value: PhotoPosition) => setEditFormData({ ...editFormData, position: value })}>
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
                <Textarea value={editFormData.caption} onChange={(e) => setEditFormData({ ...editFormData, caption: e.target.value })} placeholder="Keterangan foto..." rows={3} className="mt-1.5 resize-none" />
              </div>
            </div>
          </div>

          {/* Colors & Flowers in edit dialog */}
          <Accordion type="multiple" className="border rounded-lg overflow-hidden mt-2">
            {/* Warna */}
            <AccordionItem value="colors" className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  <Palette size={14} className="text-purple-500" /> Warna
                  <Badge variant="secondary" className="ml-1 text-[10px]">{editColors.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {editColors.length > 0 && (
                  <div className="space-y-2">
                    {editColors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        {color.color_hex && <div className="w-6 h-6 rounded-full border shrink-0" style={{ backgroundColor: color.color_hex }} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{color.color_name}</p>
                          {color.description && <p className="text-xs text-muted-foreground">{color.description}</p>}
                        </div>
                        <button type="button" onClick={() => removeColorFromEdit(i)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nama warna *" className="text-sm h-9" />
                    <div className="flex gap-2">
                      <input type="color" value={newColorHex || '#000000'} onChange={(e) => setNewColorHex(e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} placeholder="#HEX" className="text-sm h-9 flex-1" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input value={newColorDesc} onChange={(e) => setNewColorDesc(e.target.value)} placeholder="Deskripsi (opsional)" className="text-sm h-9 flex-1" />
                    <Button size="sm" type="button" onClick={addColorToEdit} className="h-9 bg-purple-500 hover:bg-purple-600 text-white shrink-0">
                      <Plus size={14} className="mr-1" /> Tambah
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Bunga */}
            <AccordionItem value="flowers">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  <Flower size={14} className="text-pink-500" /> Bunga
                  <Badge variant="secondary" className="ml-1 text-[10px]">{editFlowers.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {editFlowers.length > 0 && (
                  <div className="space-y-2">
                    {editFlowers.map((flower, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <span className="shrink-0">🌸</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{flower.flower_name}</p>
                          {flower.description && <p className="text-xs text-muted-foreground">{flower.description}</p>}
                        </div>
                        <button type="button" onClick={() => removeFlowerFromEdit(i)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Input value={newFlowerName} onChange={(e) => setNewFlowerName(e.target.value)} placeholder="Nama bunga *" className="text-sm h-9" />
                  <div className="flex gap-2">
                    <Input value={newFlowerDesc} onChange={(e) => setNewFlowerDesc(e.target.value)} placeholder="Deskripsi (opsional)" className="text-sm h-9 flex-1" />
                    <Button size="sm" type="button" onClick={addFlowerToEdit} className="h-9 bg-pink-500 hover:bg-pink-600 text-white shrink-0">
                      <Plus size={14} className="mr-1" /> Tambah
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} type="button">Batal</Button>
            <Button onClick={handleSaveEdit} className="px-8" type="button">Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
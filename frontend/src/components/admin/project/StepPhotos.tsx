// src/components/admin/project/StepPhotos.tsx
import { useState, useEffect } from 'react';
import { Upload, X, Star, GripVertical, Edit2 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import type { CreateCompleteProjectData, ProjectPhoto, PhotoWithMetadata } from '@/api/projectApi';

interface StepPhotosProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
  existingPhotos?: ProjectPhoto[];
  // Tambahkan prop ini jika ingin menangani update metadata foto lama di parent
  onUpdateExistingPhoto?: (index: number, updates: Partial<ProjectPhoto>) => void;
}

export function StepPhotos({ formData, updateFormData, existingPhotos = [], onUpdateExistingPhoto }: StepPhotosProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews for new photos
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

  const movePhoto = (fromIndex: number, direction: 'up' | 'down') => {
    const photos = [...(formData.photos || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= photos.length) return;

    [photos[fromIndex], photos[toIndex]] = [photos[toIndex], photos[fromIndex]];

    const reordered = photos.map((photo, idx) => ({
      ...photo,
      display_order: idx,
    }));

    updateFormData({ photos: reordered });
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
                          className={isHero ? "bg-amber-500 hover:bg-amber-600" : ""}
                          onClick={() => setHeroPhoto(index)}
                          type="button"
                        >
                          <Star size={12} className={`mr-1 ${isHero ? 'fill-current' : ''}`} />
                          Hero
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary">
                              <Edit2 size={12} className="mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Metadata Foto</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Caption</Label>
                                <Textarea
                                  value={photo.caption || ''}
                                  onChange={(e) => onUpdateExistingPhoto?.(index, { caption: e.target.value })}
                                  placeholder="Deskripsi foto..."
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label>Position</Label>
                                <Select
                                  value={photo.position}
                                  onValueChange={(value: "left" | "center" | "right") => onUpdateExistingPhoto?.(index, { position: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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

          {/* New Photos */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <Label className="text-blue-600 flex items-center gap-2">
                ✨ Foto Baru ({previews.length})
              </Label>
              <div className="space-y-3">
                {previews.map((preview, index) => {
                  const photos = formData.photos || [];
                  const photoData = photos[index];
                  if (!photoData) return null;

                  const actualIndex = existingPhotos.length + index;
                  const isHero = formData.hero_photo_index === actualIndex;

                  return (
                    <div key={`new-photo-${index}`} className="border rounded-lg p-4 bg-card space-y-3">
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
                                onValueChange={(value: "left" | "center" | "right") => updatePhotoMetadata(index, { position: value })}
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
                            variant="outline"
                            className="h-8"
                            onClick={() => movePhoto(index, 'up')}
                            disabled={index === 0}
                            type="button"
                          >
                            <GripVertical size={12} />
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
    </div>
  );
}
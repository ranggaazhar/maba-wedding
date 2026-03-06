import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, CheckCircle, Image as ImageIcon, Star, MapPin, Palette, Flower } from 'lucide-react';
import type { CreateCompleteProjectData, ProjectPhoto } from '@/api/projectApi';

interface StepReviewProps {
  formData: CreateCompleteProjectData;
  goToStep: (step: number) => void;
  isEdit?: boolean;
  existingPhotos?: ProjectPhoto[];
}

export function StepReview({ formData, goToStep, isEdit = false, existingPhotos = [] }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {isEdit ? 'Review Perubahan' : 'Review & Konfirmasi'}
        </h2>
        <p className="text-muted-foreground mb-6">
          Periksa kembali semua informasi sebelum menyimpan project ini ke database.
        </p>

        <div className="space-y-8">

          {/* 1. Basic Info */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Info Dasar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="md:col-span-2">
                  <p className="text-lg font-bold text-foreground">{formData.title || '-'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Slug: {formData.slug || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kategori</p>
                  <p className="font-medium">Category #{formData.category_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Harga</p>
                  <p className="font-medium text-primary">
                    {formData.price ? `Rp ${Number(formData.price).toLocaleString('id-ID')}` : '-'}
                  </p>
                </div>
                {formData.theme && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tema</p>
                    <p className="font-medium">{formData.theme}</p>
                  </div>
                )}
                {formData.description && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Deskripsi</p>
                    <p className="text-muted-foreground bg-muted/20 p-3 rounded-md border text-xs leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}
                {formData.atmosphere_description && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Deskripsi Suasana</p>
                    <p className="text-muted-foreground bg-muted/20 p-3 rounded-md border text-xs leading-relaxed">
                      {formData.atmosphere_description}
                    </p>
                  </div>
                )}
                <div className="md:col-span-2 flex gap-2 pt-2">
                  <Badge variant={formData.is_published ? 'default' : 'secondary'}>
                    {formData.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {formData.is_featured && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Star size={12} className="mr-1 fill-current" /> Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(1)} className="ml-4 shrink-0">
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
          </div>

          {/* 2. Photos with colors & flowers */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <ImageIcon size={18} /> Foto Project
              </h3>

              {/* Existing photos summary */}
              {existingPhotos.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Foto existing: {existingPhotos.length} foto</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {existingPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        {photo.is_hero && (
                          <div className="absolute top-1 left-1 bg-amber-500 rounded-full p-0.5">
                            <Star size={8} className="text-white fill-current" />
                          </div>
                        )}
                        {((photo.colors?.length ?? 0) > 0 || (photo.flowers?.length ?? 0) > 0) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-0.5 flex gap-0.5 justify-center">
                            {(photo.colors?.length ?? 0) > 0 && <span className="text-[8px] text-purple-300">🎨{photo.colors!.length}</span>}
                            {(photo.flowers?.length ?? 0) > 0 && <span className="text-[8px] text-pink-300">🌸{photo.flowers!.length}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New photos */}
              {formData.photos && formData.photos.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    <span className="font-medium text-blue-600">{formData.photos.length}</span> foto baru akan diupload
                    {formData.hero_photo_index !== undefined && (
                      <span className="ml-1 text-muted-foreground">(Foto ke-{formData.hero_photo_index + 1} sebagai Hero)</span>
                    )}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(formData.photos).map((photoData, index) => {
                      const isHero = formData.hero_photo_index === (existingPhotos.length + index);
                      return (
                        <div key={index} className="border rounded-xl overflow-hidden bg-card">
                          <div className="flex gap-3 p-3">
                            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border">
                              <img
                                src={URL.createObjectURL(photoData.file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                              />
                              {isHero && (
                                <Badge className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] py-0 px-1">
                                  <Star size={8} className="mr-0.5 fill-current" />Hero
                                </Badge>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Badge variant="secondary" className="text-[9px]">
                                  <MapPin size={9} className="mr-1" />{photoData.position}
                                </Badge>
                                <Badge variant="outline" className="text-[9px]">#{photoData.display_order}</Badge>
                              </div>
                              {photoData.caption && (
                                <p className="text-xs text-muted-foreground line-clamp-2">"{photoData.caption}"</p>
                              )}
                            </div>
                          </div>

                          {/* Colors */}
                          {photoData.colors && photoData.colors.length > 0 && (
                            <div className="px-3 pb-2 border-t pt-2">
                              <p className="text-[10px] font-semibold text-purple-600 flex items-center gap-1 mb-1.5">
                                <Palette size={10} /> Warna ({photoData.colors.length})
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {photoData.colors.map((color, ci) => (
                                  <div key={ci} className="flex items-center gap-1 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5">
                                    {color.color_hex && (
                                      <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color.color_hex }} />
                                    )}
                                    <span className="text-[10px] text-purple-700">{color.color_name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Flowers */}
                          {photoData.flowers && photoData.flowers.length > 0 && (
                            <div className="px-3 pb-2 border-t pt-2">
                              <p className="text-[10px] font-semibold text-pink-600 flex items-center gap-1 mb-1.5">
                                <Flower size={10} /> Bunga ({photoData.flowers.length})
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {photoData.flowers.map((flower, fi) => (
                                  <div key={fi} className="flex items-center gap-1 bg-pink-50 border border-pink-100 rounded-full px-2 py-0.5">
                                    <span className="text-[10px]">🌸</span>
                                    <span className="text-[10px] text-pink-700">{flower.flower_name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {isEdit ? 'Tidak ada foto baru. Foto lama tetap dipertahankan.' : 'Belum ada foto yang dipilih.'}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(2)} className="ml-4 shrink-0">
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
          </div>

          {/* 3. Includes */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Yang Termasuk
              </h3>
              <div className="bg-muted/20 p-4 rounded-md border">
                {formData.includes && formData.includes.length > 0 ? (
                  <div className="space-y-1.5">
                    {formData.includes.map((include, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-xs">✓ {include.item}</span>
                        <Badge variant="outline" className="text-[9px]">#{include.display_order}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-xs">Tidak ada includes</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(3)} className="ml-4 shrink-0">
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-800 font-semibold">Siap untuk {isEdit ? 'diperbarui' : 'disimpan'}!</p>
            <p className="text-xs text-emerald-700 mt-1">Semua data sudah tervalidasi dan akan disimpan dalam 1 transaksi atomic.</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.photos?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Foto Baru</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {formData.photos?.reduce((acc, p) => acc + (p.colors?.length || 0), 0) || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Warna</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.includes?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Includes</p>
        </div>
      </div>
    </div>
  );
}
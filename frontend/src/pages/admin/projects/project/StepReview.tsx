// src/components/admin/project/StepReview.tsx - COMPLETE WITH ALL METADATA
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, CheckCircle, Image as ImageIcon, Star, MapPin } from 'lucide-react';
import type { CreateCompleteProjectData } from '@/api/projectApi';

interface StepReviewProps {
  formData: CreateCompleteProjectData;
  goToStep: (step: number) => void;
  isEdit?: boolean;
}

export function StepReview({ formData, goToStep, isEdit = false }: StepReviewProps) {
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
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-md border text-xs">
                      {formData.description}
                    </p>
                  </div>
                )}

                {formData.atmosphere_description && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Deskripsi Suasana</p>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-md border text-xs">
                      {formData.atmosphere_description}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 flex gap-2 pt-2">
                  <Badge variant={formData.is_published ? "default" : "secondary"}>
                    {formData.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {formData.is_featured && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Star size={12} className="mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(1)} className="ml-4 shrink-0">
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
          </div>

          {/* 2. Photos with Metadata */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <ImageIcon size={18} /> Foto Project
              </h3>
              {formData.photos && formData.photos.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    <span className="font-medium text-blue-600">{formData.photos.length}</span> foto baru akan diupload
                    {formData.hero_photo_index !== undefined && (
                      <span className="ml-1 text-muted-foreground">
                        (Foto ke-{formData.hero_photo_index + 1} sebagai Hero)
                      </span>
                    )}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from(formData.photos).map((photoData, index) => {
                      const isHero = formData.hero_photo_index === index;
                      return (
                        <div key={index} className="relative group border rounded-lg overflow-hidden bg-card">
                          <div className="aspect-square relative">
                            <img 
                              src={URL.createObjectURL(photoData.file)} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            />
                            
                            {/* Hero Badge */}
                            {isHero && (
                              <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-none">
                                <Star size={10} className="mr-1 fill-current" />
                                Hero
                              </Badge>
                            )}

                            {/* Position Badge */}
                            <Badge 
                              variant="secondary" 
                              className="absolute top-2 right-2 text-[9px] bg-black/60 text-white border-none"
                            >
                              {photoData.position}
                            </Badge>

                            {/* Display Order */}
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded">
                              #{photoData.display_order}
                            </div>
                          </div>

                          {/* Caption */}
                          {photoData.caption && (
                            <div className="p-2 bg-muted/50 border-t">
                              <p className="text-[10px] text-muted-foreground line-clamp-2">
                                {photoData.caption}
                              </p>
                            </div>
                          )}

                          {/* Metadata Summary */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] p-2">
                            <p className="font-bold">Foto #{index + 1}</p>
                            <div className="flex items-center gap-1">
                              <MapPin size={10} />
                              <span>{photoData.position}</span>
                            </div>
                            <p>Order: {photoData.display_order}</p>
                            {photoData.caption && (
                              <p className="text-center mt-1 line-clamp-2">"{photoData.caption}"</p>
                            )}
                          </div>
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

          {/* 3. Details with Metadata */}
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Detail & Komposisi
              </h3>
              {formData.details && formData.details.length > 0 ? (
                <div className="space-y-3">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="bg-muted/40 p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">
                            {detail.detail_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm font-semibold">{detail.title}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px]">
                          #{detail.display_order}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {detail.items.map((item, itemIdx) => (
                          <Badge 
                            key={itemIdx} 
                            variant="secondary" 
                            className="text-[10px] font-normal bg-white"
                          >
                            {item.content} <span className="ml-1 text-muted-foreground">#{item.display_order}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Tidak ada detail tambahan.</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(3)} className="ml-4 shrink-0">
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
          </div>

          {/* 4. Includes & Moods with Metadata */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <CheckCircle size={18} /> Konten Tambahan
              </h3>
              <div className="space-y-5 text-sm">
                
                {/* Includes */}
                <div className="bg-muted/20 p-4 rounded-md border">
                  <strong className="block mb-3 text-xs uppercase text-muted-foreground tracking-wider">
                    Sudah Termasuk (Includes):
                  </strong>
                  <div className="space-y-1.5">
                    {formData.includes && formData.includes.length > 0 ? (
                      formData.includes.map((include, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-xs">✓ {include.item}</span>
                          <Badge variant="outline" className="text-[9px]">
                            #{include.display_order}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Tidak ada includes</span>
                    )}
                  </div>
                </div>

                {/* Moods */}
                <div className="bg-muted/20 p-4 rounded-md border">
                  <strong className="block mb-3 text-xs uppercase text-muted-foreground tracking-wider">
                    Suasana (Moods):
                  </strong>
                  <div className="flex flex-wrap gap-2">
                    {formData.moods && formData.moods.length > 0 ? (
                      formData.moods.map((mood, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="font-normal bg-primary/10 text-primary border-primary/20"
                        >
                          {mood.mood} <span className="ml-1 opacity-60 text-[9px]">#{mood.display_order}</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Tidak ada mood</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(4)} className="ml-4 shrink-0">
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
            <p className="text-sm text-emerald-800 font-semibold">
              Siap untuk {isEdit ? 'diperbarui' : 'disimpan'}!
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Semua data sudah tervalidasi dan akan disimpan dalam 1 transaksi atomic.
            </p>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.photos?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Foto</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.details?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Detail Groups</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.includes?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Includes</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formData.moods?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Moods</p>
        </div>
      </div>
    </div>
  );
}
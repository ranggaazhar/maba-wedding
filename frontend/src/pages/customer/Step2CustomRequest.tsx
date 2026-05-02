// src/pages/customer/Step2CustomRequest.tsx
import { useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Plus, Trash2,
  Upload, X, Image as ImageIcon, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CreateCustomRequestData } from '@/types/booking.types';

interface Step2CustomRequestProps {
  customRequests: CreateCustomRequestData[];
  customRequestFiles: Record<number, File[]>;
  onAdd: () => void;
  onUpdate: (index: number, data: Partial<CreateCustomRequestData>) => void;
  onRemove: (index: number) => void;
  onSetFiles: (index: number, files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
  optional?: boolean; 
}

const MAX_FILES = 7;
const MAX_SIZE_MB = 10;

export default function Step2CustomRequest({
  customRequests,
  customRequestFiles,
  onAdd,
  onUpdate,
  onRemove,
  onSetFiles,
  onNext,
  onBack,
  optional = false,
}: Step2CustomRequestProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const current = customRequestFiles[index] || [];
    const remaining = MAX_FILES - current.length;
    if (remaining <= 0) {
      alert(`Maksimal ${MAX_FILES} foto per request`);
      return;
    }

    const toAdd: File[] = [];
    const skipped: string[] = [];
    newFiles.slice(0, remaining).forEach((f) => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) skipped.push(f.name);
      else toAdd.push(f);
    });

    if (skipped.length > 0) {
      alert(`File berikut melebihi ${MAX_SIZE_MB}MB:\n${skipped.join('\n')}`);
    }

    if (toAdd.length > 0) {
      onSetFiles(index, [...current, ...toAdd]);
    }

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const handleRemoveFile = (requestIndex: number, fileIndex: number) => {
    const current = customRequestFiles[requestIndex] || [];
    onSetFiles(requestIndex, current.filter((_, i) => i !== fileIndex));
  };

  const handleNext = () => {
    if (!optional) {
      const valid = customRequests.every((r) => r.title?.trim() && r.description?.trim());
      if (!valid || customRequests.length === 0) {
        alert('Lengkapi judul dan deskripsi setiap custom request');
        return;
      }
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-orange-500" />
          Custom Request
          {optional && (
            <Badge variant="outline" className="text-xs font-normal">Opsional</Badge>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          {optional
            ? 'Tambahkan custom request jika ada kebutuhan dekorasi di luar katalog (opsional).'
            : 'Ajukan dekorasi sesuai keinginan Anda. Sertakan foto referensi untuk membantu admin memahami kebutuhan Anda.'}
        </p>
      </div>

      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 text-sm">
          Estimasi harga akan ditentukan oleh admin setelah meninjau request Anda. Admin akan menghubungi Anda untuk konfirmasi.
        </AlertDescription>
      </Alert>

      {/* Request cards */}
      <div className="space-y-4">
        {customRequests.map((request, index) => {
          const files = customRequestFiles[index] || [];
          const previews = files.map((f) => URL.createObjectURL(f));

          return (
            <Card key={index} className="border-orange-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-500" />
                    Request #{index + 1}
                  </CardTitle>
                  {customRequests.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Judul */}
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`}>
                    Judul Request <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`title-${index}`}
                    value={request.title || ''}
                    onChange={(e) => onUpdate(index, { title: e.target.value })}
                    placeholder="Contoh: Backdrop Bunga Mawar Merah"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(request.title || '').length}/200
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <Label htmlFor={`desc-${index}`}>
                    Deskripsi <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`desc-${index}`}
                    value={request.description || ''}
                    onChange={(e) => onUpdate(index, { description: e.target.value })}
                    placeholder="Jelaskan detail dekorasi yang Anda inginkan: ukuran, susunan, material, dll."
                    rows={4}
                  />
                </div>

                {/* Tema warna */}
                <div className="space-y-2">
                  <Label htmlFor={`color-${index}`}>Tema Warna (Opsional)</Label>
                  <Input
                    id={`color-${index}`}
                    value={request.color_theme || ''}
                    onChange={(e) => onUpdate(index, { color_theme: e.target.value })}
                    placeholder="Contoh: Sage Green & Gold, Dusty Pink"
                    maxLength={100}
                  />
                </div>

                <Separator />

                {/* Upload foto referensi */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      Foto Referensi
                      <span className="text-muted-foreground font-normal">(maks. {MAX_FILES} foto)</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {files.length}/{MAX_FILES}
                    </span>
                  </div>

                  {/* Preview grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((url, fi) => (
                        <div key={fi} className="relative group aspect-square">
                          <img
                            src={url}
                            alt={`Referensi ${fi + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveFile(index, fi)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  {files.length < MAX_FILES && (
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Klik untuk upload foto referensi (PNG, JPG, maks. {MAX_SIZE_MB}MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(index, e)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tambah request */}
      <Button
        variant="outline"
        className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
        onClick={onAdd}
      >
        <Plus size={16} className="mr-2" />
        Tambah Custom Request
      </Button>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Button>
        <Button onClick={handleNext} className="gap-2">
          {optional && customRequests.length === 0
            ? 'Lewati'
            : 'Lanjut'}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
// src/components/admin/bookings/CustomRequestEditDialog.tsx
import { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookingCustomRequest } from "@/types/booking.types";

interface CustomRequestEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  customRequest: BookingCustomRequest | null;
  onSubmit: (crId: number, data: { title: string; description: string; color_theme: string }, files: File[]) => Promise<void>;
  onDeleteImage: (crId: number, index: number) => Promise<void>;
}

export function CustomRequestEditDialog({
  isOpen,
  onOpenChange,
  isSaving,
  customRequest,
  onSubmit,
  onDeleteImage,
}: CustomRequestEditDialogProps) {
  const [title, setTitle] = useState("");
  const [colorTheme, setColorTheme] = useState("#d4a017");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && customRequest) {
      setTitle(customRequest.title);
      setColorTheme(customRequest.color_theme || "#d4a017");
      setDescription(customRequest.description);
      setSelectedFiles([]);
    }
  }, [isOpen, customRequest]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidTypeFiles: string[] = [];
    const invalidSizeFiles: string[] = [];
    const validFiles: File[] = [];

    newFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidTypeFiles.push(file.name);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidSizeFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidTypeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Format File Tidak Valid',
        text: `File berikut bukan gambar: ${invalidTypeFiles.join(', ')}. Harap gunakan format JPG, JPEG, PNG, atau WEBP.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    if (invalidSizeFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Ukuran File Terlalu Besar',
        text: `File berikut melebihi batas 5MB: ${invalidSizeFiles.join(', ')}.`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const existingCount = customRequest?.reference_images_urls?.length || 0;
    const remaining = 5 - existingCount - selectedFiles.length;
    if (remaining <= 0) {
      Swal.fire({
        icon: 'info',
        title: 'Batas Foto',
        text: `Maksimal 5 foto referensi (Saat ini sudah ada ${existingCount} foto terunggah)`,
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const toAdd = validFiles.slice(0, remaining);
    setSelectedFiles((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }
    if (!customRequest?.id) return;
    await onSubmit(customRequest.id, { title, description, color_theme: colorTheme }, selectedFiles);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <form onSubmit={handleFormSubmit} className="flex flex-col overflow-hidden flex-1">
          <DialogHeader>
            <DialogTitle>Edit Custom Request</DialogTitle>
            <DialogDescription>
              Ubah informasi detail custom request customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
            <div className="space-y-2">
              <Label htmlFor="edit_cr_title">
                Judul Request <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit_cr_title"
                placeholder="Misal: Dekorasi Backdrop Tambahan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_cr_color">
                Tema Warna <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <input
                  id="edit_cr_color"
                  type="color"
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-transparent"
                />
                <span className="text-sm text-muted-foreground">{colorTheme}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_cr_description">
                Deskripsi Detail <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit_cr_description"
                placeholder="Jelaskan secara detail model/keinginan dekorasi kustom customer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>Foto Referensi Saat Ini</Label>
                <span className="text-xs text-muted-foreground">
                  {(customRequest?.reference_images_urls?.length || 0)}/5
                </span>
              </div>

              {customRequest?.reference_images_urls && customRequest.reference_images_urls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 border rounded-lg p-2 bg-muted/20">
                  {customRequest.reference_images_urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-md overflow-hidden group border bg-background"
                    >
                      <img
                        src={url}
                        alt="referensi"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => customRequest.id && onDeleteImage(customRequest.id, idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>
                  Tambah Foto Baru{" "}
                  <span className="text-xs text-muted-foreground">(maks. 5 foto)</span>
                </Label>
                <span className="text-xs text-muted-foreground">{selectedFiles.length} foto baru</span>
              </div>

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-5 gap-2 border rounded-lg p-2 bg-muted/20">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-md overflow-hidden group border bg-background"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {((customRequest?.reference_images_urls?.length || 0) + selectedFiles.length) < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border border-dashed rounded-md aspect-square cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Plus size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              {selectedFiles.length === 0 && ((customRequest?.reference_images_urls?.length || 0) < 5) && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Plus size={20} className="mx-auto text-muted-foreground mb-1 animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    Klik untuk tambah foto referensi (Maks. 5MB per file)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="gradient-ocean text-primary-foreground">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

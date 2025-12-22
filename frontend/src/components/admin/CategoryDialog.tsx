import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form'; 
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Category, CreateCategoryData } from '@/api/categoryApi';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryData) => void;
  category?: Category | null;
  isLoading?: boolean;
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
}: CategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control, // Dibutuhkan untuk useWatch
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      display_order: 0,
      is_active: true,
    },
  });

  // Perbaikan: Gunakan useWatch alih-alih watch('is_active') 
  // untuk performa dan kompatibilitas React Compiler
  const isActive = useWatch({
    control,
    name: 'is_active',
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        display_order: category.display_order,
        is_active: category.is_active,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        display_order: 0,
        is_active: true,
      });
    }
  }, [category, reset]);

  // Auto-generate slug dari name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!category) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug, { shouldValidate: true });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Nama Kategori <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Nama kategori wajib diisi',
                maxLength: {
                  value: 100,
                  message: 'Nama maksimal 100 karakter',
                },
              })}
              onChange={(e) => {
                register('name').onChange(e); // Trigger original onChange
                handleNameChange(e); // Trigger slug generation
              }}
              placeholder="Wedding Set"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register('slug', {
                required: 'Slug wajib diisi',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung',
                },
                maxLength: {
                  value: 100,
                  message: 'Slug maksimal 100 karakter',
                },
              })}
              placeholder="wedding-set"
              className="mt-1"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier (huruf kecil, angka, dan tanda hubung)
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Paket lengkap dekorasi pelaminan"
              rows={3}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          {/* Display Order */}
          <div>
            <Label htmlFor="display_order">Urutan Tampilan</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', {
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: 'Urutan minimal 0',
                },
              })}
              placeholder="0"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.display_order && (
              <p className="text-sm text-destructive mt-1">
                {errors.display_order.message}
              </p>
            )}
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label htmlFor="is_active" className="cursor-pointer">
                Status Aktif
              </Label>
              <p className="text-sm text-muted-foreground">
                Kategori akan ditampilkan di website
              </p>
            </div>
            <Switch
              id="is_active"
              checked={!!isActive} // Pastikan boolean
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-ocean text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </span>
              ) : category ? (
                'Update'
              ) : (
                'Tambah'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
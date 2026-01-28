import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form'; // Tambahkan useWatch
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { PropertyCategory, CreatePropertyCategoryData } from '@/api/propertyCategoryApi';

interface PropertyCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePropertyCategoryData) => void;
  propertyCategory?: PropertyCategory | null;
  isLoading?: boolean;
}

export function PropertyCategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  propertyCategory,
  isLoading = false,
}: PropertyCategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control, // Dibutuhkan untuk useWatch
    setValue,
    formState: { errors },
  } = useForm<CreatePropertyCategoryData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
    },
  });

  // PERBAIKAN: Gunakan useWatch alih-alih watch('is_active')
  const isActive = useWatch({
    control,
    name: 'is_active',
  });

  useEffect(() => {
    if (propertyCategory) {
      reset({
        name: propertyCategory.name,
        slug: propertyCategory.slug,
        description: propertyCategory.description || '',
        is_active: propertyCategory.is_active,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        is_active: true,
      });
    }
  }, [propertyCategory, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!propertyCategory) {
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
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {propertyCategory ? 'Edit Kategori Properti' : 'Tambah Kategori Properti'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nama Kategori <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              {...register('name', { required: 'Nama kategori wajib diisi' })}
              onChange={(e) => {
                register('name').onChange(e);
                handleNameChange(e);
              }}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
            <Input
              id="slug"
              {...register('slug', { required: 'Slug wajib diisi' })}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" {...register('description')} className="mt-1" disabled={isLoading} />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <Label htmlFor="is_active">Status Aktif</Label>
            <Switch
              id="is_active"
              checked={!!isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="flex-1 gradient-ocean text-primary-foreground" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : propertyCategory ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
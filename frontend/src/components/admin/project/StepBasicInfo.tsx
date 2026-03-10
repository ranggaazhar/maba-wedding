// src/components/admin/project/StepBasicInfo.tsx - COMPLETE ALL FIELDS
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateCompleteProjectData} from '@/types/project.types';
import { categoryApi } from '@/api/categoryApi';
import type { Category } from '@/types/category.types';

interface StepBasicInfoProps {
  formData: CreateCompleteProjectData;
  updateFormData: (data: Partial<CreateCompleteProjectData>) => void;
  onNext: () => void;
}

interface FormErrors {
  title?: string;
  slug?: string;
  category_id?: string;
}

export function StepBasicInfo({ formData, updateFormData }: StepBasicInfoProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors] = useState<FormErrors>({});
  const [isFetching, setIsFetching] = useState(false);

  const fetchCategories = useCallback(async (isMounted: boolean) => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      const response = await categoryApi.getAllCategories({ is_active: true });
      
      if (response.success && isMounted) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      if (isMounted) setIsFetching(false);
    }
  }, [isFetching]);

  useEffect(() => {
    let isMounted = true;
    fetchCategories(isMounted);
    return () => {
      isMounted = false;
    };
  }, []); 

  const handleTitleChange = (value: string) => {
    updateFormData({ title: value });
    
    // Auto-generate slug
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    updateFormData({ slug });
  };



  return (
    <div className="space-y-6">
      <div className="table-container p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Informasi Dasar Project</h2>
        <div className="space-y-4">
          
          {/* Judul Project */}
          <div>
            <Label htmlFor="title">
              Judul Project <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Ocean Blue Elegance"
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Slug (Auto-generated but editable) */}
          <div>
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => updateFormData({ slug: e.target.value })}
              placeholder="ocean-blue-elegance"
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
            <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier (auto-generated dari judul)</p>
          </div>

          {/* Kategori */}
          <div>
            <Label htmlFor="category">
              Kategori <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category_id ? String(formData.category_id) : ''}
              onValueChange={(value) => updateFormData({ category_id: parseInt(value) })}
            >
              <SelectTrigger className="mt-1 w-full bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm">
                <SelectValue placeholder={isFetching ? "Memuat..." : "Pilih kategori"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-destructive mt-1">{errors.category_id}</p>}
          </div>

          {/* Harga */}
          <div>
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ''}
              onChange={(e) => updateFormData({ price: e.target.value })}
              placeholder="15000000"
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Kosongkan jika tidak ingin menampilkan harga</p>
          </div>

          {/* Tema */}
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Input
              id="theme"
              value={formData.theme || ''}
              onChange={(e) => updateFormData({ theme: e.target.value })}
              placeholder="Contoh: Oceanic, Rustic, Modern"
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Tema utama dekorasi (opsional)</p>
          </div>

          {/* Deskripsi */}
          <div>
            <Label htmlFor="description">Deskripsi Project</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Ceritakan tentang konsep dan detail project ini..."
              rows={4}
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Deskripsi umum tentang project</p>
          </div>

          {/* Deskripsi Atmosfer */}
          <div>
            <Label htmlFor="atmosphere_description">Deskripsi Suasana / Atmosfer</Label>
            <Textarea
              id="atmosphere_description"
              value={formData.atmosphere_description || ''}
              onChange={(e) => updateFormData({ atmosphere_description: e.target.value })}
              placeholder="Jelaskan suasana yang ingin diciptakan..."
              rows={3}
              className="w-full pr-4 py-2 bg-[hsl(var(--ocean-pale))] border border-transparent rounded-lg focus:bg-white focus:border-[hsl(var(--ocean-light))] transition-all outline-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Deskripsi mood dan atmosphere yang dirasakan (opsional)</p>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="is_published" className="font-semibold">Publish Project</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Project akan langsung terlihat di website</p>
              </div>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => updateFormData({ is_published: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="is_featured" className="font-semibold">Featured Project</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Tampilkan di bagian highlight/unggulan</p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => updateFormData({ is_featured: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, GripVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyCategoryDialog } from '@/components/admin/PropertyCategoryDialog';
import {
  propertyCategoryApi,
  type PropertyCategory,
  type CreatePropertyCategoryData,
} from '@/api/propertyCategoryApi';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function PropertyCategories() {
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState<PropertyCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Perbaikan ESLint: Gunakan useCallback agar fungsi referensinya stabil
  const fetchPropertyCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyCategoryApi.getAllPropertyCategories({
        search: searchTerm || undefined,
        include_properties: true,
      });

      if (response.success) {
        setPropertyCategories(response.data);
      }
    } catch (error: unknown) {
      // Perbaikan ESLint: Ganti 'any' dengan 'unknown' dan cek tipe axios
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan saat memuat kategori properti';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: message,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]); // searchTerm masuk sebagai dependency di sini

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPropertyCategories();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchPropertyCategories]); // Sekarang aman memasukkan fetchPropertyCategories ke dependency array

  const handleCreate = () => {
    setSelectedPropertyCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (propertyCategory: PropertyCategory) => {
    setSelectedPropertyCategory(propertyCategory);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CreatePropertyCategoryData) => {
    try {
      setIsSubmitting(true);
      let response;

      if (selectedPropertyCategory) {
        response = await propertyCategoryApi.updatePropertyCategory(selectedPropertyCategory.id, data);
      } else {
        response = await propertyCategoryApi.createPropertyCategory(data);
      }

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Kategori properti berhasil ${selectedPropertyCategory ? 'diperbarui' : 'ditambahkan'}`,
          timer: 2000,
          showConfirmButton: false,
        });
        setIsDialogOpen(false);
        fetchPropertyCategories();
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Terjadi kesalahan';

      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errorMessage,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (propertyCategory: PropertyCategory) => {
    const propertyCount = propertyCategory.properties?.length || 0;

    const result = await Swal.fire({
      title: 'Hapus Kategori Properti?',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus kategori <strong>${propertyCategory.name}</strong>?</p>
          ${propertyCount > 0 ? `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-red-800">
                ⚠️ Kategori ini memiliki <strong>${propertyCount} properti</strong> terkait dan tidak dapat dihapus.
              </p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: propertyCount > 0 ? '#6b7280' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: propertyCount > 0 ? 'OK' : 'Ya, Hapus',
      cancelButtonText: 'Batal',
      showConfirmButton: propertyCount === 0,
    });

    if (result.isConfirmed && propertyCount === 0) {
      try {
        const response = await propertyCategoryApi.deletePropertyCategory(propertyCategory.id);
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Kategori properti berhasil dihapus',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchPropertyCategories();
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan';
        Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: message });
      }
    }
  };

  const handleToggleStatus = async (propertyCategory: PropertyCategory) => {
    try {
      const response = await propertyCategoryApi.togglePropertyCategoryStatus(propertyCategory.id);
      if (response.success) {
        setPropertyCategories((prev) =>
          prev.map((cat) =>
            cat.id === propertyCategory.id ? { ...cat, is_active: !cat.is_active } : cat
          )
        );

        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        }).fire({
          icon: 'success',
          title: `Kategori ${!propertyCategory.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
        });
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengubah status';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message });
    }
  };

  const propertyCategoryIcons: Record<string, string> = {
    backdrop: '🎭',
    furniture: '🪑',
    lighting: '💡',
    decoration: '🎨',
    tableware: '🍽️',
    textile: '🧵',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Kategori Properti</h1>
          <p className="page-subtitle text-muted-foreground">Kelola kategori item properti dekorasi</p>
        </div>
        <Button onClick={handleCreate} className="gradient-ocean text-primary-foreground">
          <Plus size={18} className="mr-2" />
          Tambah Kategori
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari kategori properti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : propertyCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tidak ditemukan</h3>
              <Button onClick={handleCreate} variant="outline" size="sm">Tambah Kategori Baru</Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="w-10 p-4"></th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kategori</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Slug</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Projects</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {propertyCategories.map((category) => (
                  <tr key={category.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground"><GripVertical size={16} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{propertyCategoryIcons[category.slug] || '📦'}</span>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{category.description || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code></td>
                    <td className="p-4"><Badge variant="secondary">{category.properties?.length || 0} items</Badge></td>
                    <td className="p-4">
                      <Switch checked={category.is_active} onCheckedChange={() => handleToggleStatus(category)} />
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Edit size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(category)}>
                            <Trash2 size={14} className="mr-2" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PropertyCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setSelectedPropertyCategory(null); }}
        onSubmit={handleSubmit}
        propertyCategory={selectedPropertyCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
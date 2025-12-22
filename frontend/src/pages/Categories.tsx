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
import { CategoryDialog } from '@/components/admin/CategoryDialog';
import { categoryApi, type Category, type CreateCategoryData } from '@/api/categoryApi';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Perbaikan: Gunakan useCallback agar fungsi stabil dan tidak menyebabkan re-render terus menerus
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAllCategories({
        search: searchTerm || undefined,
        include_projects: true,
      });
      
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : 'Terjadi kesalahan saat memuat kategori';
        
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: message,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchCategories]); // fetchCategories sekarang stabil berkat useCallback

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CreateCategoryData) => {
    try {
      setIsSubmitting(true);
      let successMessage = '';
      
      if (selectedCategory) {
        const response = await categoryApi.updateCategory(selectedCategory.id, data);
        if (response.success) successMessage = 'Kategori berhasil diperbarui';
      } else {
        const response = await categoryApi.createCategory(data);
        if (response.success) successMessage = 'Kategori berhasil ditambahkan';
      }
      
      if (successMessage) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: successMessage,
          timer: 2000,
          showConfirmButton: false,
        });
        setIsDialogOpen(false);
        fetchCategories();
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

  const handleDelete = async (category: Category) => {
    const projectCount = category.projects?.length || 0;
    
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menghapus kategori <strong>${category.name}</strong>?</p>
          ${projectCount > 0 ? `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p class="text-sm text-red-800">
                ⚠️ Kategori ini memiliki <strong>${projectCount} project</strong> terkait dan tidak dapat dihapus.
              </p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: projectCount > 0 ? '#6b7280' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: projectCount > 0 ? 'OK' : 'Ya, Hapus',
      cancelButtonText: 'Batal',
      showConfirmButton: projectCount === 0,
    });

    if (result.isConfirmed && projectCount === 0) {
      try {
        const response = await categoryApi.deleteCategory(category.id);
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Kategori berhasil dihapus',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCategories();
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Terjadi kesalahan';
        Swal.fire({ icon: 'error', title: 'Gagal', text: message });
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      const response = await categoryApi.toggleCategoryStatus(category.id);
      if (response.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === category.id ? { ...cat, is_active: !cat.is_active } : cat
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
          title: `Kategori ${!category.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
        });
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Gagal mengubah status';
      Swal.fire({ icon: 'error', title: 'Gagal!', text: message });
    }
  };

  const categoryIcons: Record<string, string> = {
    'wedding-set': '💒',
    'welcome-gate': '🚪',
    'set-akad': '💍',
    'lorong': '🌸',
    'reception': '🎊',
    'photo-booth': '📸',
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Kategori</h1>
          <p className="page-subtitle text-muted-foreground">Kelola kategori dekorasi wedding</p>
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
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
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
              {categories.map((category) => (
                <tr key={category.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-400"><GripVertical size={16} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoryIcons[category.slug] || '📦'}</span>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-slate-500">{category.description || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{category.slug}</code>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{category.projects?.length || 0} projects</Badge>
                  </td>
                  <td className="p-4">
                    <Switch checked={category.is_active} onCheckedChange={() => handleToggleStatus(category)} />
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}><Edit size={14} className="mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category)} className="text-red-600"><Trash2 size={14} className="mr-2" /> Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setSelectedCategory(null); }}
        onSubmit={handleSubmit}
        category={selectedCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
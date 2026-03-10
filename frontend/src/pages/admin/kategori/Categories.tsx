import { Plus, MoreHorizontal, Edit, Trash2, GripVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryDialog } from './CategoryDialog';
import { useKategori } from '@/hooks/Admin/kategori/useKategori'; 

const categoryIcons: Record<string, string> = {
  'wedding-set': '💒',
  'welcome-gate': '🚪',
  'set-akad': '💍',
  'lorong': '🌸',
  'reception': '🎊',
  'photo-booth': '📸',
};

export default function Categories() {
  const {
    categories, loading, isSubmitting,
    searchTerm, setSearchTerm,
    isDialogOpen, selectedCategory,
    handleCreate, handleEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleToggleStatus,
  } = useKategori(); // ← semua dari hook

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Kategori</h1>
          <p className="page-subtitle text-muted-foreground">Kelola kategori dekorasi wedding</p>
        </div>
        <Button onClick={handleCreate} className="gradient-ocean text-primary-foreground">
          <Plus size={18} className="mr-2" /> Tambah Kategori
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category)} className="text-red-600">
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

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        category={selectedCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
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
  } = useKategori();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title font-extrabold text-2xl">Kategori Project</h1>
          <p className="page-subtitle text-base">Kelola kategori dekorasi wedding</p>
        </div>
        <Button onClick={handleCreate} className="gradient-ocean text-primary-foreground w-full sm:w-auto">
          <Plus size={18} className="mr-2" /> Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 border rounded-lg bg-card">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <p className="text-muted-foreground">Tidak ada kategori ditemukan</p>
          <Button onClick={handleCreate} variant="outline" size="sm" className="mt-3">
            Tambah Kategori Baru
          </Button>
        </div>
      ) : (
        <>
          {/* ── Mobile Card View (< md) ── */}
          <div className="block md:hidden space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 bg-card space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{categoryIcons[category.slug] || '📦'}</span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{category.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{category.description || '-'}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(category)} className="text-destructive">
                        <Trash2 size={14} className="mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{category.slug}</code>
                    <Badge variant="secondary">{category.projects?.length || 0} projects</Badge>
                  </div>
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={() => handleToggleStatus(category)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Table View (>= md) ── */}
          <div className="hidden md:block border rounded-lg overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
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
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground"><GripVertical size={16} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{categoryIcons[category.slug] || '📦'}</span>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">{category.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
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
            </div>
          </div>
        </>
      )}

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
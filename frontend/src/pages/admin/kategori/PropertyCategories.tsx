import { Plus, MoreHorizontal, Edit, Trash2, GripVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyCategoryDialog } from './PropertyCategoryDialog';
import { usePropertyCategory } from '@/hooks/Admin/kategori/usePropertyCategory';

const propertyCategoryIcons: Record<string, string> = {
  backdrop: '🎭',
  furniture: '🪑',
  lighting: '💡',
  decoration: '🎨',
  tableware: '🍽️',
  textile: '🧵',
};

export default function PropertyCategories() {
  const {
    propertyCategories, loading, isSubmitting,
    searchTerm, setSearchTerm,
    isDialogOpen, selectedPropertyCategory,
    handleCreate, handleEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleToggleStatus,
  } = usePropertyCategory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Kategori Properti</h1>
          <p className="page-subtitle text-muted-foreground">Kelola kategori item properti dekorasi</p>
        </div>
        <Button onClick={handleCreate} className="gradient-ocean text-primary-foreground">
          <Plus size={18} className="mr-2" /> Tambah Kategori
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Properties</th>
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
                    <td className="p-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{category.properties?.length || 0} items</Badge>
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
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        propertyCategory={selectedPropertyCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
// src/pages/admin/properties/Properties.tsx
import {
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
  Package, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/hooks/Admin/property/useProperties';

export default function Properties() {
  const {
    properties, categories, isLoading,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    fetchProperties, navigate,
    handleDelete, handleToggleAvailability,
    getPrimaryImage, formatPrice,
  } = useProperties();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Properties</h1>
          <p className="page-subtitle text-muted-foreground">Katalog properti untuk disewakan</p>
        </div>
        <Button className="gradient-ocean text-primary-foreground" onClick={() => navigate('/properties/new')}>
          <Plus size={18} className="mr-2" /> Tambah Property
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari property..."
            className="pl-10 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 bg-card">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-40 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="available">Tersedia</SelectItem>
            <SelectItem value="unavailable">Tidak Tersedia</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchProperties}>
          <Filter size={18} />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">Belum ada property</h3>
          <Button variant="outline" onClick={() => navigate('/properties/new')} className="mt-2">
            Mulai Tambah Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="border rounded-xl bg-card overflow-hidden group shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={getPrimaryImage(property)}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  {!property.is_available && <Badge variant="secondary">Tidak Tersedia</Badge>}
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 opacity-90">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}`)}>
                        <Eye size={14} className="mr-2" /> Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/properties/edit/${property.id}`)}>
                        <Edit size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAvailability(property.id)}>
                        {property.is_available
                          ? <><EyeOff size={14} className="mr-2" /> Set Tidak Tersedia</>
                          : <><Eye size={14} className="mr-2" /> Set Tersedia</>
                        }
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(property.id, property.name)}>
                        <Trash2 size={14} className="mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold line-clamp-2">{property.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {property.description || 'Tidak ada deskripsi'}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline" className="text-xs">
                    {property.category?.name || 'No Category'}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-bold text-primary text-lg">Rp {formatPrice(property.price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
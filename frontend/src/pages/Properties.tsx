import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, 
  Package, Loader2, Eye, EyeOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { propertyApi, type Property } from "@/api/propertyApi";
import { propertyCategoryApi, type PropertyCategory } from "@/api/propertyCategoryApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function Properties() {
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: {
        is_available?: boolean;
        category_id?: number;
        search?: string;
        include_images?: boolean;
      } = { include_images: true };

      if (selectedStatus !== "all") {
        filters.is_available = selectedStatus === "available";
      }
      if (selectedCategory !== "all") {
        filters.category_id = parseInt(selectedCategory);
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await propertyApi.getAllProperties(filters);
      if (response.success) {
        setProperties(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Gagal memuat properties";
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await propertyCategoryApi.getAllPropertyCategories({ is_active: true });
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: `Property "${name}" akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await propertyApi.deleteProperty(id);
        if (response.success) {
          Swal.fire("Terhapus!", "Property berhasil dihapus.", "success");
          fetchProperties();
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.message 
          : "Gagal menghapus";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      const response = await propertyApi.toggleAvailability(id);
      if (response.success) {
        Swal.fire({ 
          icon: "success", 
          title: "Berhasil!", 
          text: "Status ketersediaan diubah", 
          timer: 1500, 
          showConfirmButton: false 
        });
        fetchProperties();
      }
    } catch (error: unknown) {
      console.error(error);
      Swal.fire("Gagal!", "Tidak bisa mengubah status.", "error");
    }
  };

  const getPrimaryImage = (property: Property) => {
    const primaryImg = property.images?.find(img => img.is_primary);
    return primaryImg?.url || property.images?.[0]?.url || property.image_url || 
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop";
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("id-ID");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Properties</h1>
          <p className="page-subtitle text-muted-foreground">Katalog properti untuk disewakan</p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground"
          onClick={() => navigate("/properties/new")}
        >
          <Plus size={18} className="mr-2" />
          Tambah Property
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">Belum ada property</h3>
          <Button 
            variant="outline" 
            onClick={() => navigate("/properties/new")} 
            className="mt-2"
          >
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
                <div className="absolute top-3 left-3 flex gap-2">
                  {!property.is_available && <Badge variant="secondary">Tidak Tersedia</Badge>}
                  {property.stock_quantity === 0 && <Badge variant="destructive">Habis</Badge>}
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
                        {property.is_available ? (
                          <><EyeOff size={14} className="mr-2" /> Set Tidak Tersedia</>
                        ) : (
                          <><Eye size={14} className="mr-2" /> Set Tersedia</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => handleDelete(property.id, property.name)}
                      >
                        <Trash2 size={14} className="mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <h3 className="font-bold line-clamp-2">{property.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {property.description || "Tidak ada deskripsi"}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {property.category?.name || "No Category"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Stok: {property.stock_quantity}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <p className="font-bold text-primary text-lg">
                    Rp {formatPrice(property.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
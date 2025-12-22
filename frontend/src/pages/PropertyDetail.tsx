import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit, Trash2, Loader2, ImageIcon, Package, 
  DollarSign, Box, Star, Eye, EyeOff, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { propertyApi, type Property, type PropertyImage } from "@/api/propertyApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [stockUpdate, setStockUpdate] = useState<number>(0);

  const fetchPropertyDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await propertyApi.getPropertyById(Number(id));
      
      if (response.success) {
        setProperty(response.data);
        
        const primaryImg = response.data.images?.find((p: PropertyImage) => p.is_primary);
        setSelectedImage(primaryImg?.url || response.data.images?.[0]?.url || "");
        setStockUpdate(response.data.stock_quantity);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Terjadi kesalahan saat memuat data";
      
      console.error("Error fetching property:", error);
      
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: message,
      }).then(() => navigate("/properties"));
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPropertyDetail();
  }, [fetchPropertyDetail]);

  const handleDelete = async () => {
    if (!property) return;
    
    const result = await Swal.fire({
      title: "Yakin hapus property ini?",
      html: `Property <strong>"${property.name}"</strong> akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const response = await propertyApi.deleteProperty(property.id);
        
        if (response.success) {
          await Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Property berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false
          });
          navigate("/properties");
        }
      } catch (error: unknown) {
        console.error("Error deleting property:", error);
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Gagal menghapus property";
        
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: message
        });
      }
    }
  };

  const handleToggleAvailability = async () => {
    if (!property) return;
    
    try {
      const response = await propertyApi.toggleAvailability(property.id);
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Property ${!property.is_available ? 'tersedia' : 'tidak tersedia'}`,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchPropertyDetail();
      }
    } catch (error: unknown) {
      console.error("Error toggling availability:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak bisa mengubah status ketersediaan."
      });
    }
  };

  const handleUpdateStock = async () => {
    if (!property || stockUpdate === property.stock_quantity) return;
    
    try {
      const response = await propertyApi.updateStock(property.id, stockUpdate, 'set');
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Stok berhasil diperbarui",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchPropertyDetail();
      }
    } catch (error: unknown) {
      console.error("Error updating stock:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak bisa mengupdate stok."
      });
    }
  };

  const formatPrice = (price: string): string => {
    try {
      return Number(price).toLocaleString("id-ID");
    } catch {
      return "0";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Memuat detail property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Package className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">Property tidak ditemukan</p>
            <Button onClick={() => navigate("/properties")}>
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/properties")}
              >
                <ArrowLeft size={20} />
              </Button>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{property.name}</CardTitle>
                  
                  {property.is_available ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Eye size={12} className="mr-1" />
                      Tersedia
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff size={12} className="mr-1" />
                      Tidak Tersedia
                    </Badge>
                  )}
                  
                  {property.stock_quantity === 0 && (
                    <Badge variant="destructive">Habis</Badge>
                  )}
                </div>
                
                <CardDescription className="flex items-center gap-2">
                  <span>{property.category?.name || "Uncategorized"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(property.created_at).toLocaleDateString("id-ID", {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleAvailability}
              >
                {property.is_available ? (
                  <><EyeOff size={16} className="mr-2" />Set Tidak Tersedia</>
                ) : (
                  <><Eye size={16} className="mr-2" />Set Tersedia</>
                )}
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate(`/properties/edit/${property.id}`)}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt={property.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <ImageIcon size={48} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Tidak ada gambar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {property.images && property.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon size={18} />
                  Gallery ({property.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {property.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === img.url 
                          ? "border-primary ring-2 ring-primary/20 scale-105" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={`${property.name} ${img.id}`}
                        className="w-full h-full object-cover" 
                      />
                      
                      {img.is_primary && (
                        <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-1 shadow-md">
                          <Star size={10} className="text-white fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Deskripsi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Detail Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Harga</span>
                <span className="font-bold text-primary text-lg">
                  Rp {formatPrice(property.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Kategori</span>
                <Badge variant="outline">{property.category?.name || "N/A"}</Badge>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge className={property.is_available ? "bg-green-500" : "bg-gray-500"}>
                  {property.is_available ? "Tersedia" : "Tidak Tersedia"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground text-sm">Dibuat</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  {new Date(property.created_at).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box size={20} />
                Manajemen Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Stok Saat Ini</span>
                <span className="font-bold text-2xl text-primary">
                  {property.stock_quantity}
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="stock">Update Stok</Label>
                <div className="flex gap-2">
                  <Input
                    id="stock"
                    type="number"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(Number(e.target.value))}
                    min="0"
                  />
                  <Button 
                    onClick={handleUpdateStock}
                    disabled={stockUpdate === property.stock_quantity}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Package size={20} />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Gambar</span>
                <Badge variant="outline" className="font-bold text-lg">
                  {property.images?.length || 0}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stok Tersedia</span>
                <span className="font-bold text-2xl text-primary">
                  {property.stock_quantity}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
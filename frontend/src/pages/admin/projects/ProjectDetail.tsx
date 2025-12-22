import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Calendar,
  Loader2,
  ImageIcon,
  CheckCircle2,
  Package,
  Palette,
  Heart,
  DollarSign,
  EyeOff,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectApi, type Project, type ProjectPhoto } from "@/api/projectApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch project detail
  const fetchProjectDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await projectApi.getProjectById(Number(id));
      
      if (response.success) {
        setProject(response.data);
        
        // Set hero image as default, fallback to first photo
        const heroImg = response.data.photos?.find((p: ProjectPhoto) => p.is_hero);
        setSelectedImage(heroImg?.url || response.data.photos?.[0]?.url || "");
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Terjadi kesalahan saat memuat data";
      
      console.error("Error fetching project:", error);
      
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: message,
      }).then(() => navigate("/projects"));
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProjectDetail();
  }, [fetchProjectDetail]);

  // Delete project handler
  const handleDelete = async () => {
    if (!project) return;
    
    const result = await Swal.fire({
      title: "Yakin hapus project ini?",
      html: `Project <strong>"${project.title}"</strong> akan dihapus permanen!<br/>Semua foto dan data terkait akan ikut terhapus.`,
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
        const response = await projectApi.deleteProject(project.id);
        
        if (response.success) {
          await Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Project berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false
          });
          navigate("/projects");
        }
      } catch (error: unknown) {
        console.error("Error deleting project:", error);
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Gagal menghapus project";
        
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: message
        });
      }
    }
  };

  // Toggle publish status
  const handleTogglePublish = async () => {
    if (!project) return;
    
    try {
      const response = await projectApi.togglePublishStatus(project.id);
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Project ${!project.is_published ? 'dipublish' : 'di-draft'}`,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProjectDetail();
      }
    } catch (error: unknown) {
      console.error("Error toggling publish:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak bisa mengubah status publish."
      });
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async () => {
    if (!project) return;
    
    try {
      const response = await projectApi.toggleFeaturedStatus(project.id);
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Project ${!project.is_featured ? 'ditandai' : 'dihapus dari'} featured`,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProjectDetail();
      }
    } catch (error: unknown) {
      console.error("Error toggling featured:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak bisa mengubah status featured."
      });
    }
  };

  // Format price safely
  const formatPrice = (price: string | null | undefined): string => {
    if (!price || price === "0") return "Hubungi Admin";
    try {
      return Number(price).toLocaleString("id-ID");
    } catch {
      return "Hubungi Admin";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Memuat detail project...</p>
      </div>
    );
  }

  // No project found
  if (!project) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">Project tidak ditemukan</p>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/projects")}
                className="shrink-0"
              >
                <ArrowLeft size={20} />
              </Button>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  
                  {project.is_featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      <Star size={12} className="mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                  
                  {project.is_published ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Eye size={12} className="mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff size={12} className="mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
                
                <CardDescription className="flex items-center gap-2">
                  <span>{project.category?.name || "Uncategorized"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {(project.view_count || 0).toLocaleString('id-ID')} views
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(project.created_at).toLocaleDateString("id-ID", {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTogglePublish}
              >
                {project.is_published ? (
                  <><EyeOff size={16} className="mr-2" />Unpublish</>
                ) : (
                  <><Eye size={16} className="mr-2" />Publish</>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleFeatured}
              >
                <Star 
                  size={16} 
                  className={`mr-2 ${project.is_featured ? "fill-amber-500 text-amber-500" : ""}`} 
                />
                {project.is_featured ? "Unfeature" : "Feature"}
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate(`/projects/edit/${project.id}`)}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image Display */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt={project.title} 
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

          {/* Thumbnail Gallery */}
          {project.photos && project.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon size={18} />
                  Gallery ({project.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {project.photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedImage(photo.url || "")}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === photo.url 
                          ? "border-primary ring-2 ring-primary/20 scale-105" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img 
                        src={photo.url || ""} 
                        alt={`${project.title} - ${photo.caption || 'Photo'}`}
                        className="w-full h-full object-cover" 
                      />
                      
                      {photo.is_hero && (
                        <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-1 shadow-md">
                          <Star size={10} className="text-white fill-current" />
                        </div>
                      )}
                      
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] p-1 text-center truncate">
                          {photo.caption}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Description & Details */}
          <Card>
            <Tabs defaultValue="description" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description" className="flex items-center gap-2">
                    <Package size={16} />
                    Deskripsi
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Palette size={16} />
                    Detail Dekorasi
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="description" className="space-y-4 mt-0">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Package size={18} className="text-primary" />
                      Deskripsi Project
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {project.description || "Tidak ada deskripsi."}
                    </p>
                  </div>
                  
                  {project.atmosphere_description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Heart size={18} className="text-primary" />
                          Suasana & Atmosfer
                        </h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {project.atmosphere_description}
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  {project.details && project.details.length > 0 ? (
                    <div className="space-y-6">
                      {project.details.map((detail) => (
                        <div key={detail.id}>
                          <h4 className="font-semibold mb-3 text-primary uppercase tracking-wide text-sm flex items-center gap-2">
                            <Sparkles size={14} />
                            {detail.title}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {detail.items && detail.items.length > 0 && detail.items.map((item) => (
                              <Alert key={item.id} className="py-2">
                                <AlertDescription className="text-sm">
                                  {item.content}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Tidak ada detail dekorasi
                    </p>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-6">
          {/* Price & Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Detail Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Display */}
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Harga</span>
                {project.price && project.price !== "0" ? (
                  <span className="font-bold text-primary text-lg">
                    Rp {formatPrice(project.price)}
                  </span>
                ) : (
                  <Badge variant="outline">
                    Hubungi Admin
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Tema</span>
                <span className="font-medium">{project.theme || "-"}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground text-sm">Kategori</span>
                <Badge variant="outline">{project.category?.name || "N/A"}</Badge>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground text-sm">Dibuat</span>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} />
                  {new Date(project.created_at).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Includes Card */}
          {project.includes && project.includes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 size={18} className="text-green-500" />
                  Paket Termasuk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.includes.map((inc) => (
                    <div 
                      key={inc.id} 
                      className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <CheckCircle2 
                        size={16} 
                        className="text-green-500 shrink-0 mt-0.5" 
                      />
                      <span>{inc.item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moods Card */}
          {project.moods && project.moods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart size={18} className="text-pink-500" />
                  Mood & Suasana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.moods.map((mood) => (
                    <Badge 
                      key={mood.id} 
                      variant="secondary"
                      className="hover:bg-primary hover:text-white transition-colors"
                    >
                      {mood.mood}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Eye size={20} />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-bold text-2xl text-primary">
                  {(project.view_count || 0).toLocaleString('id-ID')}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Foto</span>
                <Badge variant="outline" className="font-bold text-lg">
                  {project.photos?.length || 0}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={project.is_published ? "bg-green-500" : "bg-gray-500"}>
                  {project.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
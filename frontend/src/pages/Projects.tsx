import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, 
  Edit, Trash2, ImageIcon, Loader2, Star 
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
import { projectApi, type Project } from "@/api/projectApi";
import { categoryApi, type Category } from "@/api/categoryApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function Projects() {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: {
        is_published?: boolean;
        category_id?: number;
        search?: string;
        include_photos?: boolean;
      } = { include_photos: true };

      if (selectedStatus !== "all") {
        filters.is_published = selectedStatus === "published";
      }
      if (selectedCategory !== "all") {
        filters.category_id = parseInt(selectedCategory);
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await projectApi.getAllProjects(filters);
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : "Gagal memuat projects";
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getAllCategories({ is_active: true });
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
      fetchProjects();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: `Project "${title}" akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const response = await projectApi.deleteProject(id);
        if (response.success) {
          Swal.fire("Terhapus!", "Project berhasil dihapus.", "success");
          fetchProjects();
        }
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) ? error.response?.data?.message : "Gagal menghapus";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const response = await projectApi.togglePublishStatus(id);
      if (response.success) {
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Status diubah", timer: 1500, showConfirmButton: false });
        fetchProjects();
      }
    } catch (error: unknown) {
        console.error(error);
        Swal.fire("Gagal!", "Tidak bisa mengubah status.", "error");
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await projectApi.toggleFeaturedStatus(id);
      if (response.success) {
        Swal.fire({ 
          icon: "success", 
          title: "Berhasil!", 
          text: "Status featured diperbarui", 
          timer: 1500, 
          showConfirmButton: false 
        });
        fetchProjects();
      }
    } catch (error: unknown) {
        console.error(error);
        Swal.fire("Gagal!", "Tidak bisa mengubah status featured.", "error");
    }
  };

  const getHeroImage = (project: Project) => {
    const heroPhoto = project.photos?.find(p => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Projects</h1>
          <p className="page-subtitle text-muted-foreground">Kelola portfolio dekorasi Anda</p>
        </div>
        <Button className="gradient-ocean text-primary-foreground" onClick={() => navigate("/projects/new")}>
          <Plus size={18} className="mr-2" /> Tambah Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari project..."
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchProjects}><Filter size={18} /></Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">Belum ada project</h3>
          <Button variant="outline" onClick={() => navigate("/projects/new")} className="mt-2">Mulai Tambah Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="border rounded-xl bg-card overflow-hidden group shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="relative h-48 overflow-hidden">
                <img src={getHeroImage(project)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {project.is_featured && <Badge className="bg-amber-500">Featured</Badge>}
                  {!project.is_published && <Badge variant="secondary">Draft</Badge>}
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 opacity-90"><MoreHorizontal size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                        <Eye size={14} className="mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/projects/edit/${project.id}`)}>
                        <Edit size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      
                      {/* PERBAIKAN: Fungsi handleToggleFeatured dipanggil di sini */}
                      <DropdownMenuItem onClick={() => handleToggleFeatured(project.id)}>
                        <Star size={14} className={`mr-2 ${project.is_featured ? "fill-amber-500 text-amber-500" : ""}`} /> 
                        {project.is_featured ? "Hapus Featured" : "Jadikan Featured"}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleTogglePublish(project.id)}>
                        <Plus size={14} className="mr-2" /> {project.is_published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.id, project.title)}>
                        <Trash2 size={14} className="mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold line-clamp-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description || "No description"}</p>
                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline">{project.category?.name || "No Category"}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
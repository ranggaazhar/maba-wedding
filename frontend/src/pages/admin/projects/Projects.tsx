// src/pages/admin/projects/Projects.tsx
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, ImageIcon, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/Admin/project/useProjects";

export default function Projects() {
  const {
    projects, categories, isLoading,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedStatus, setSelectedStatus,
    fetchProjects, navigate,
    handleDelete, handleTogglePublish, handleToggleFeatured, getHeroImage,
  } = useProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title text-2xl font-bold">Projects</h1>
          <p className="page-subtitle text-muted-foreground">Kelola portfolio dekorasi Anda</p>
        </div>
        <Button className="gradient-ocean text-primary-foreground" onClick={() => navigate("/admin/projects/new")}>
          <Plus size={18} className="mr-2" /> Tambah Project
        </Button>
      </div>

      {/* Filters */}
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
        <Button variant="outline" size="icon" onClick={fetchProjects}>
          <Filter size={18} />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">Belum ada project</h3>
          <Button variant="outline" onClick={() => navigate("/admin/projects/new")} className="mt-2">
            Mulai Tambah Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="border rounded-xl bg-card overflow-hidden group shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getHeroImage(project)}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {project.is_featured && <Badge className="bg-amber-500">Featured</Badge>}
                  {!project.is_published && <Badge variant="secondary">Draft</Badge>}
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 opacity-90">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project.id}`)}>
                        <Eye size={14} className="mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/projects/edit/${project.id}`)}>
                        <Edit size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFeatured(project.id)}>
                        <Star size={14} className={`mr-2 ${project.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        {project.is_featured ? "Hapus Featured" : "Jadikan Featured"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(project.id)}>
                        <Eye size={14} className="mr-2" />
                        {project.is_published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(project.id, project.title)}
                      >
                        <Trash2 size={14} className="mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold line-clamp-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "No description"}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline">{project.category?.name || "No Category"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
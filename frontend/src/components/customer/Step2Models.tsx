import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { projectApi, type Project } from "@/api/projectApi";
import { categoryApi, type Category } from "@/api/categoryApi";
import type { BookingModel } from "@/api/bookingApi";
import Swal from "sweetalert2";

interface Step2Props {
  models: BookingModel[];
  setModels: (models: BookingModel[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Models({ models, setModels, onNext, onBack }: Step2Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const [projectsRes, categoriesRes] = await Promise.all([
          projectApi.getAllProjects({ is_published: true, include_photos: true }),
          categoryApi.getAllCategories({ is_active: true }),
        ]);

        console.log("Projects Response:", projectsRes);
        console.log("Categories Response:", categoriesRes);

        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
          console.log("Total Projects:", projectsRes.data.length);
        } else {
          setError("Gagal memuat data project");
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
          console.log("Total Categories:", categoriesRes.data.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Terjadi kesalahan saat memuat data. Silakan refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(p => String(p.category_id) === selectedCategory);

  const handleAddModel = (project: Project) => {
    const exists = models.find(m => m.project_id === project.id);
    if (exists) {
      Swal.fire("Info", "Model sudah ditambahkan", "info");
      return;
    }

    const newModel: BookingModel = {
      category_id: project.category_id,
      project_id: project.id,
      project_title: project.title,
      price: project.price || "0",
      notes: "",
      display_order: models.length,
    };

    setModels([...models, newModel]);
  };

  const handleRemoveModel = (index: number) => {
    setModels(models.filter((_, i) => i !== index));
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    const updated = [...models];
    updated[index].notes = notes;
    setModels(updated);
  };

  const handleNext = () => {
    if (models.length === 0) {
      Swal.fire("Info", "Pilih minimal 1 model dekorasi", "info");
      return;
    }
    onNext();
  };

  const getHeroImage = (project: Project) => {
    const heroPhoto = project.photos?.find(p => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || "";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat model dekorasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft size={18} className="mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pilih Model Dekorasi</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Semua ({projects.length})
          </Button>
          {categories.map(cat => {
            const count = projects.filter(p => p.category_id === cat.id).length;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === String(cat.id) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(String(cat.id))}
              >
                {cat.name} ({count})
              </Button>
            );
          })}
        </div>

        {/* Selected Models */}
        {models.length > 0 && (
          <Card className="mb-4 bg-primary/5">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Model Terpilih ({models.length})</h4>
              <div className="space-y-2">
                {models.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{model.project_title}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {Number(model.price).toLocaleString("id-ID")}
                      </p>
                      <Textarea
                        placeholder="Catatan untuk model ini..."
                        value={model.notes || ""}
                        onChange={(e) => handleUpdateNotes(index, e.target.value)}
                        rows={2}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveModel(index)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Projects */}
        {filteredProjects.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {selectedCategory === "all" 
                ? "Belum ada project yang dipublikasikan. Silakan hubungi admin."
                : "Tidak ada project di kategori ini."
              }
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => {
              const isSelected = models.find(m => m.project_id === project.id);
              
              return (
                <Card key={project.id} className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}>
                  <div className="aspect-video overflow-hidden">
                    {getHeroImage(project) ? (
                      <img
                        src={getHeroImage(project)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-2 mb-2">{project.title}</h4>
                    <Badge variant="outline" className="mb-2">
                      {project.category?.name || "Uncategorized"}
                    </Badge>
                    <p className="text-lg font-bold text-primary mb-3">
                      {project.price && project.price !== "0" 
                        ? `Rp ${Number(project.price).toLocaleString("id-ID")}`
                        : "Hubungi Admin"
                      }
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={isSelected ? "secondary" : "default"}
                      onClick={() => handleAddModel(project)}
                      disabled={!!isSelected}
                    >
                      {isSelected ? "Terpilih" : <><Plus size={16} className="mr-2" />Pilih</>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button onClick={handleNext} disabled={models.length === 0}>
          Lanjut ke Pilih Property
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
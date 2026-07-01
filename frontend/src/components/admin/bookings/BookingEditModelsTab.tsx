// src/components/admin/bookings/BookingEditModelsTab.tsx
import { Trash2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingModel } from "@/types/booking.types";
import type { Project } from "@/types/project.types";
import type { Category } from "@/types/category.types";

interface BookingEditModelsTabProps {
  selectedModels: BookingModel[];
  categories: Category[];
  modelCategoryFilter: string;
  setModelCategoryFilter: (value: string) => void;
  filteredProjects: Project[];
  handleAddModel: (project: Project) => void;
  handleRemoveModel: (index: number) => void;
  handleUpdateModelNotes: (index: number, notes: string) => void;
  getProjectImage: (project: Project) => string;
}

export function BookingEditModelsTab({
  selectedModels,
  categories,
  modelCategoryFilter,
  setModelCategoryFilter,
  filteredProjects,
  handleAddModel,
  handleRemoveModel,
  handleUpdateModelNotes,
  getProjectImage,
}: BookingEditModelsTabProps) {
  return (
    <div className="space-y-6">
      {selectedModels.length > 0 && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Model Terpilih ({selectedModels.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedModels.map((model, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{model.project_title}</p>
                  <p className="text-sm text-muted-foreground">
                    Rp {Number(model.price).toLocaleString("id-ID")}
                  </p>
                  <Textarea
                    placeholder="Catatan untuk model ini..."
                    value={model.notes || ""}
                    onChange={(e) => handleUpdateModelNotes(index, e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveModel(index)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tambah Model Dekorasi</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              type="button"
              variant={modelCategoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setModelCategoryFilter("all")}
            >
              Semua
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                type="button"
                variant={modelCategoryFilter === String(cat.id) ? "default" : "outline"}
                size="sm"
                onClick={() => setModelCategoryFilter(String(cat.id))}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Tidak ada project di kategori ini</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const isSelected = selectedModels.find((m) => m.project_id === project.id);
                return (
                  <Card key={project.id} className={isSelected ? "ring-2 ring-primary" : ""}>
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      {getProjectImage(project) ? (
                        <img
                          src={getProjectImage(project)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold line-clamp-2 mb-2">{project.title}</h4>
                      <Badge variant="outline" className="mb-2">
                        {project.category?.name}
                      </Badge>
                      <p className="text-sm font-bold text-primary mb-3">
                        {project.price && project.price !== "0"
                          ? `Rp ${Number(project.price).toLocaleString("id-ID")}`
                          : "Hubungi Admin"}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => handleAddModel(project)}
                        disabled={!!isSelected}
                      >
                        {isSelected ? (
                          "Terpilih"
                        ) : (
                          <>
                            <Plus size={16} className="mr-2" />
                            Pilih
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

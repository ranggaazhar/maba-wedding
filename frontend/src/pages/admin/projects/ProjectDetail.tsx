// src/pages/admin/projects/ProjectDetailPage.tsx
import {
  ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar, Palette,
  Flower2, Star, Check, ImageIcon, Loader2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectDetail } from "@/hooks/Admin/project/useProjectDetail";

export default function ProjectDetailPage() {
  const {
    project, isLoading, activeIndex, setActiveIndex,
    navigate, 
    handleDelete, handleTogglePublish, handleToggleFeatured, formatPrice,
  } = useProjectDetail();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Memuat detail project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">Project tidak ditemukan</p>
            <Button onClick={() => navigate("/admin/projects")}>
              <ArrowLeft size={16} className="mr-2" /> Kembali ke Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const photos = project.photos || [];
  const totalPhotos = photos.length;
  const activePhoto = photos[activeIndex] ?? null;
  const prevPhoto = () => setActiveIndex((i) => (i - 1 + totalPhotos) % totalPhotos);
  const nextPhoto = () => setActiveIndex((i) => (i + 1) % totalPhotos);

  const allColors = project.photos?.flatMap((p) => p.colors || []) || [];
  const uniqueColors = allColors.filter(
    (color, index, self) => index === self.findIndex((c) => c.color_name === color.color_name)
  );
  const allFlowers = project.photos?.flatMap((p) => p.flowers || []) || [];
  const uniqueFlowers = allFlowers.filter(
    (flower, index, self) => index === self.findIndex((f) => f.flower_name === flower.flower_name)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/projects")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              {project.is_featured && <Badge className="bg-warning text-warning-foreground">Featured</Badge>}
              {!project.is_published && <Badge variant="secondary">Draft</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{project.category?.name || "Uncategorized"}</Badge>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{(project.view_count || 0).toLocaleString("id-ID")} views</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleTogglePublish} title={project.is_published ? "Unpublish" : "Publish"}>
            {project.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleToggleFeatured}>
            <Star size={18} className={project.is_featured ? "fill-amber-500 text-amber-500" : ""} />
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/projects/edit/${project.id}`)}>
            <Edit size={16} /> Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Carousel */}
          <div className="relative rounded-xl overflow-hidden aspect-video shadow-elegant bg-muted group">
            {activePhoto ? (
              <>
                <img
                  key={activePhoto.id}
                  src={activePhoto.url}
                  alt={activePhoto.caption || project.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />

                <div className="absolute bottom-10 left-4 right-4 flex items-end justify-between">
                  <p className="text-white text-sm opacity-90 drop-shadow">{activePhoto.caption || ""}</p>
                  <div className="flex gap-1.5">
                    {(activePhoto.colors?.length ?? 0) > 0 && (
                      <span className="text-[10px] bg-black/50 text-purple-200 px-2 py-0.5 rounded-full">
                        🎨 {activePhoto.colors!.length}
                      </span>
                    )}
                    {(activePhoto.flowers?.length ?? 0) > 0 && (
                      <span className="text-[10px] bg-black/50 text-pink-200 px-2 py-0.5 rounded-full">
                        🌸 {activePhoto.flowers!.length}
                      </span>
                    )}
                  </div>
                </div>

                {totalPhotos > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === activeIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {totalPhotos > 1 && (
                  <>
                    <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {activePhoto.is_hero && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-current" /> Hero
                  </div>
                )}

                {totalPhotos > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {activeIndex + 1} / {totalPhotos}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <ImageIcon size={48} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tidak ada gambar</p>
              </div>
            )}
          </div>

          {/* Warna & Bunga foto aktif */}
          {activePhoto && ((activePhoto.colors?.length ?? 0) > 0 || (activePhoto.flowers?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePhoto.colors && activePhoto.colors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette size={18} className="text-primary" /> Palet Warna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activePhoto.colors.map((color, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          {color.color_hex ? (
                            <div className="w-5 h-5 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: color.color_hex }} />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0 ml-1.5" />
                          )}
                          <span>{color.color_name}</span>
                          {color.color_hex && <span className="text-xs opacity-60">{color.color_hex}</span>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {activePhoto.flowers && activePhoto.flowers.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flower2 size={18} className="text-primary" /> Jenis Bunga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activePhoto.flowers.map((flower, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                          <span>{flower.flower_name}</span>
                          {flower.description && <span className="text-xs opacity-60">— {flower.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Deskripsi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deskripsi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {project.description || "Tidak ada deskripsi."}
              </p>
              {project.atmosphere_description && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-foreground mb-2">Suasana & Atmosfer</h4>
                  <p className="text-muted-foreground leading-relaxed">{project.atmosphere_description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary semua warna & bunga */}
          {(uniqueColors.length > 0 || uniqueFlowers.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueColors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette size={18} className="text-primary" /> Semua Warna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {uniqueColors.map((color, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          {color.color_hex ? (
                            <div className="w-5 h-5 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: color.color_hex }} />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0 ml-1.5" />
                          )}
                          <span>{color.color_name}</span>
                          {color.color_hex && <span className="text-xs opacity-60">{color.color_hex}</span>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {uniqueFlowers.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flower2 size={18} className="text-primary" /> Semua Bunga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {uniqueFlowers.map((flower, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                          <span>{flower.flower_name}</span>
                          {flower.description && <span className="text-xs opacity-60">— {flower.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Price */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Harga Mulai Dari</p>
              {project.price && project.price !== "0" ? (
                <p className="text-3xl font-bold text-primary">{formatPrice(project.price)}</p>
              ) : (
                <p className="text-xl font-semibold text-muted-foreground">Hubungi Admin</p>
              )}
              <Separator className="my-4" />
              <Button className="w-full gradient-ocean text-primary-foreground">Buat Booking Link</Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">{new Date(project.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Palette size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tema</p>
                  <p className="font-medium">{project.theme || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <p className="font-medium">{project.category?.name || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Includes */}
          {project.includes && project.includes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check size={18} className="text-success" /> Yang Termasuk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.includes.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-success" />
                      </div>
                      <span className="text-muted-foreground">{item.item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{(project.view_count || 0).toLocaleString("id-ID")}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.photos?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Foto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
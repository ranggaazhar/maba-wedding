import { useBookingEdit } from "@/hooks/Admin/bookings/useBookingEdit"; 
import { 
  ArrowLeft, Save, Loader2, User, Package, ShoppingCart,
  Plus, Trash2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingEdit() {
  const {
    isLoading, isSaving, activeTab, setActiveTab,
    categories, propertyCategories,
    formData, setFormData,
    selectedModels, selectedProperties,
    modelCategoryFilter, setModelCategoryFilter,
    propertyCategoryFilter, setPropertyCategoryFilter,
    filteredProjects, filteredProperties,
    navigate,
    handleAddModel, handleRemoveModel, handleUpdateModelNotes,
    handleAddProperty, handleUpdatePropertyQuantity, handleRemoveProperty,
    calculateTotal, handleSave,
    getProjectImage, getPropertyImage,
  } = useBookingEdit();

  // ambil id dari hook navigate (atau bisa pakai useParams di sini juga)
  const id = window.location.pathname.split("/").at(-2); // atau tetap useParams

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data booking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit -ml-2"
          onClick={() => navigate(`/bookings/${id}`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Detail
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Edit Booking</h1>
            <p className="text-muted-foreground">
              Update informasi booking customer
            </p>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="info">
            <User size={16} className="mr-2" />
            Informasi
          </TabsTrigger>
          <TabsTrigger value="models">
            <Package size={16} className="mr-2" />
            Model Dekorasi ({selectedModels.length})
          </TabsTrigger>
          <TabsTrigger value="properties">
            <ShoppingCart size={16} className="mr-2" />
            Properties ({selectedProperties.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INFORMASI */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Acara</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_venue">
                    Lokasi Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event_venue"
                    value={formData.event_venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_venue: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date">
                    Tanggal Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">
                    Jenis Acara <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Pernikahan</SelectItem>
                      <SelectItem value="Birthday">Ulang Tahun</SelectItem>
                      <SelectItem value="Engagement">Lamaran</SelectItem>
                      <SelectItem value="Corporate">Corporate Event</SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme_color">Warna Tema</Label>
                  <Input
                    id="theme_color"
                    value={formData.theme_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                    placeholder="Gold & Cream"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_notes">Catatan Customer</Label>
                <Textarea
                  id="customer_notes"
                  value={formData.customer_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MODEL DEKORASI */}
        <TabsContent value="models" className="space-y-6">
          {/* Selected Models */}
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

          {/* Available Models */}
          <Card>
            <CardHeader>
              <CardTitle>Tambah Model Dekorasi</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={modelCategoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModelCategoryFilter("all")}
                >
                  Semua
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
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
                  {filteredProjects.map(project => {
                    const isSelected = selectedModels.find(m => m.project_id === project.id);
                    
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PROPERTIES */}
        <TabsContent value="properties" className="space-y-6">
          {/* Selected Properties */}
          {selectedProperties.length > 0 && (
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Property Terpilih ({selectedProperties.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedProperties.map((prop, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{prop.property_name}</p>
                      <p className="text-sm text-muted-foreground">{prop.property_category}</p>
                      <p className="text-sm text-primary font-semibold mt-1">
                        Rp {Number(prop.price).toLocaleString("id-ID")} × {prop.quantity} = 
                        Rp {Number(prop.subtotal).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdatePropertyQuantity(index, prop.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={prop.quantity}
                        onChange={(e) => handleUpdatePropertyQuantity(index, Number(e.target.value))}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdatePropertyQuantity(index, prop.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold">Total Properties:</span>
                  <span className="text-lg font-bold text-primary">
                    Rp {selectedProperties.reduce((sum, p) => sum + Number(p.subtotal), 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Tambah Property</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={propertyCategoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropertyCategoryFilter("all")}
                >
                  Semua
                </Button>
                {propertyCategories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={propertyCategoryFilter === String(cat.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropertyCategoryFilter(String(cat.id))}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredProperties.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Tidak ada property di kategori ini</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProperties.map(property => {
                    const selectedProp = selectedProperties.find(p => p.property_id === property.id);
                    
                    return (
                      <Card key={property.id} className={selectedProp ? "ring-2 ring-primary" : ""}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          {getPropertyImage(property) ? (
                            <img
                              src={getPropertyImage(property)}
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold line-clamp-2 mb-2">{property.name}</h4>
                          <Badge variant="outline" className="mb-2">{property.category?.name}</Badge>
                          <p className="text-sm font-bold text-primary mb-3">
                            Rp {Number(property.price).toLocaleString("id-ID")}
                          </p>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddProperty(property)}
                          >
                            <Plus size={16} className="mr-2" />
                            {selectedProp ? `Tambah (${selectedProp.quantity})` : "Tambah"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button Footer */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Estimasi</p>
              <p className="text-xl font-bold text-primary">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
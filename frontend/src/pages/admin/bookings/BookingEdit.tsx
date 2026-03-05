import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { bookingApi, type Booking, type BookingModel, type BookingProperty } from "@/api/bookingApi";
import { projectApi, type Project } from "@/api/projectApi";
import { categoryApi, type Category } from "@/api/categoryApi";
import { propertyApi, type Property } from "@/api/propertyApi";
import { propertyCategoryApi, type PropertyCategory } from "@/api/propertyCategoryApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function BookingEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Data master
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    full_address: "",
    event_venue: "",
    event_date: "",
    event_type: "",
    referral_source: "",
    theme_color: "",
    customer_notes: "",
    total_estimate: "0",
  });

  const [selectedModels, setSelectedModels] = useState<BookingModel[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<BookingProperty[]>([]);

  // Filters
  const [modelCategoryFilter, setModelCategoryFilter] = useState<string>("all");
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState<string>("all");

  useEffect(() => {
    if (id) {
      fetchBookingData();
      fetchMasterData();
    }
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setIsLoading(true);
      const response = await bookingApi.getBookingById(Number(id));
      
      if (response.success) {
        const booking: Booking = response.data;
        
        setFormData({
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          full_address: booking.full_address,
          event_venue: booking.event_venue,
          event_date: booking.event_date,
          event_type: booking.event_type,
          referral_source: booking.referral_source || "",
          theme_color: booking.theme_color || "",
          customer_notes: booking.customer_notes || "",
          total_estimate: booking.total_estimate || "0",
        });

        setSelectedModels(booking.models || []);
        setSelectedProperties(booking.properties || []);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal memuat data booking";
      Swal.fire("Error", message, "error");
      navigate("/bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [projectsRes, categoriesRes, propertiesRes, propCategoriesRes] = await Promise.all([
        projectApi.getAllProjects({ is_published: true, include_photos: true }),
        categoryApi.getAllCategories({ is_active: true }),
        propertyApi.getAllProperties({ is_available: true, include_images: true }),
        propertyCategoryApi.getAllPropertyCategories({ is_active: true }),
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (propertiesRes.success) setProperties(propertiesRes.data);
      if (propCategoriesRes.success) setPropertyCategories(propCategoriesRes.data);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const handleAddModel = (project: Project) => {
    const exists = selectedModels.find(m => m.project_id === project.id);
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
      display_order: selectedModels.length,
    };

    setSelectedModels([...selectedModels, newModel]);
  };

  const handleRemoveModel = (index: number) => {
    setSelectedModels(selectedModels.filter((_, i) => i !== index));
  };

  const handleUpdateModelNotes = (index: number, notes: string) => {
    const updated = [...selectedModels];
    updated[index].notes = notes;
    setSelectedModels(updated);
  };

  const handleAddProperty = (property: Property) => {
    const exists = selectedProperties.find(p => p.property_id === property.id);
    if (exists) {
      handleUpdatePropertyQuantity(selectedProperties.indexOf(exists), exists.quantity + 1);
      return;
    }

    const newProperty: BookingProperty = {
      property_id: property.id,
      property_name: property.name,
      property_category: property.category?.name || "Uncategorized",
      quantity: 1,
      price: property.price,
      subtotal: property.price,
    };

    setSelectedProperties([...selectedProperties, newProperty]);
  };

  const handleUpdatePropertyQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updated = [...selectedProperties];
    updated[index].quantity = newQuantity;
    updated[index].subtotal = String(Number(updated[index].price) * newQuantity);
    setSelectedProperties(updated);
  };

  const handleRemoveProperty = (index: number) => {
    setSelectedProperties(selectedProperties.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    let total = 0;
    
    selectedModels.forEach(model => {
      total += Number(model.price || 0);
    });
    
    selectedProperties.forEach(prop => {
      total += Number(prop.subtotal || 0);
    });
    
    return total;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validasi
      if (!formData.customer_name || !formData.customer_phone || !formData.event_date) {
        Swal.fire("Error", "Data customer tidak lengkap", "error");
        setActiveTab("info");
        return;
      }

      if (selectedModels.length === 0) {
        Swal.fire("Error", "Pilih minimal 1 model dekorasi", "error");
        setActiveTab("models");
        return;
      }

      const totalEstimate = calculateTotal();

      const updateData = {
        ...formData,
        total_estimate: String(totalEstimate),
        models: selectedModels,
        properties: selectedProperties,
      };

      const response = await bookingApi.updateBooking(Number(id), updateData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Booking berhasil diupdate",
          confirmButtonText: "OK"
        }).then(() => {
          navigate(`/bookings/${id}`);
        });
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal menyimpan perubahan";
      Swal.fire("Error", message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProjects = modelCategoryFilter === "all"
    ? projects
    : projects.filter(p => String(p.category_id) === modelCategoryFilter);

  const filteredProperties = propertyCategoryFilter === "all"
    ? properties
    : properties.filter(p => String(p.category_id) === propertyCategoryFilter);

  const getProjectImage = (project: Project) => {
    const heroPhoto = project.photos?.find(p => p.is_hero);
    return heroPhoto?.url || project.photos?.[0]?.url || "";
  };

  const getPropertyImage = (property: Property) => {
    const primaryImg = property.images?.find(img => img.is_primary);
    return primaryImg?.url || property.images?.[0]?.url || "";
  };

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
import { useBookingEdit } from "@/hooks/Admin/bookings/useBookingEdit";
import { ArrowLeft, Save, Loader2, User, Package, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useState } from "react";
import type { BookingCustomRequest } from "@/types/booking.types";

// Import modular sub-components
import { BookingEditInfoTab } from "@/components/admin/bookings/BookingEditInfoTab";
import { BookingEditModelsTab } from "@/components/admin/bookings/BookingEditModelsTab";
import { BookingEditPropertiesTab } from "@/components/admin/bookings/BookingEditPropertiesTab";
import { BookingEditCustomRequestsTab } from "@/components/admin/bookings/BookingEditCustomRequestsTab";
import { CustomRequestAddDialog } from "@/components/admin/bookings/CustomRequestAddDialog";
import { CustomRequestEditDialog } from "@/components/admin/bookings/CustomRequestEditDialog";

export default function BookingEdit() {
  const { id } = useParams<{ id: string }>();

  const {
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    categories,
    propertyCategories,
    formData,
    setFormData,
    selectedModels,
    selectedProperties,
    modelCategoryFilter,
    setModelCategoryFilter,
    propertyCategoryFilter,
    setPropertyCategoryFilter,
    filteredProjects,
    filteredProperties,
    navigate,
    handleAddModel,
    handleRemoveModel,
    handleUpdateModelNotes,
    handleAddProperty,
    handleUpdatePropertyQuantity,
    handleRemoveProperty,
    calculateTotal,
    handleSave,
    getProjectImage,
    getPropertyImage,
    // Custom Request variables and handlers
    hasCustomRequest,
    customRequests,
    handleAddCustomRequest,
    handleUpdateCustomRequest,
    handleDeleteCustomRequest,
    handleDeleteCustomRequestImage,
  } = useBookingEdit();

  // ── Custom Request Modal States ───────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditCR, setCurrentEditCR] = useState<BookingCustomRequest | null>(null);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cr: BookingCustomRequest) => {
    setCurrentEditCR(cr);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (
    data: { title: string; description: string; color_theme: string },
    files: File[]
  ) => {
    await handleAddCustomRequest(data, files);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (
    crId: number,
    data: { title: string; description: string; color_theme: string },
    files: File[]
  ) => {
    await handleUpdateCustomRequest(
      crId,
      {
        ...data,
        replace_images: false,
      },
      files
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteImage = async (crId: number, index: number) => {
    await handleDeleteCustomRequestImage(crId, index);
  };

  const activeEditCR = customRequests.find((cr) => cr.id === currentEditCR?.id) || currentEditCR;

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
          type="button"
          variant="ghost"
          className="w-fit -ml-2"
          onClick={() => navigate(`/admin/bookings/${id}`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Detail
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Edit Booking</h1>
            <p className="text-muted-foreground">Update informasi booking customer</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-muted/50 inline-flex w-max min-w-full">
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
            {hasCustomRequest && (
              <TabsTrigger value="custom-requests">
                <Sparkles size={16} className="mr-2" />
                Custom Request ({customRequests.length})
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* TAB 1: INFORMASI */}
        <TabsContent value="info" className="space-y-6">
          <BookingEditInfoTab formData={formData} setFormData={setFormData} />
        </TabsContent>

        {/* TAB 2: MODEL DEKORASI */}
        <TabsContent value="models" className="space-y-6">
          <BookingEditModelsTab
            selectedModels={selectedModels}
            categories={categories}
            modelCategoryFilter={modelCategoryFilter}
            setModelCategoryFilter={setModelCategoryFilter}
            filteredProjects={filteredProjects}
            handleAddModel={handleAddModel}
            handleRemoveModel={handleRemoveModel}
            handleUpdateModelNotes={handleUpdateModelNotes}
            getProjectImage={getProjectImage}
          />
        </TabsContent>

        {/* TAB 3: PROPERTIES */}
        <TabsContent value="properties" className="space-y-6">
          <BookingEditPropertiesTab
            selectedProperties={selectedProperties}
            propertyCategories={propertyCategories}
            propertyCategoryFilter={propertyCategoryFilter}
            setPropertyCategoryFilter={setPropertyCategoryFilter}
            filteredProperties={filteredProperties}
            handleAddProperty={handleAddProperty}
            handleUpdatePropertyQuantity={handleUpdatePropertyQuantity}
            handleRemoveProperty={handleRemoveProperty}
            getPropertyImage={getPropertyImage}
          />
        </TabsContent>

        {/* TAB 4: CUSTOM REQUEST */}
        {hasCustomRequest && (
          <TabsContent value="custom-requests" className="space-y-6">
            <BookingEditCustomRequestsTab
              customRequests={customRequests}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteCustomRequest={handleDeleteCustomRequest}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Save Button Footer */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Estimasi</p>
              <p className="text-xl font-bold text-primary">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </p>
            </div>
            {/* Tombol save sengaja tidak ada type="button" agar bisa trigger handleSave */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="w-full sm:w-auto gradient-ocean text-primary-foreground"
            >
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

      {/* dialogs */}
      <CustomRequestAddDialog
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        isSaving={isSaving}
        onSubmit={handleAddSubmit}
      />

      <CustomRequestEditDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        isSaving={isSaving}
        customRequest={activeEditCR}
        onSubmit={handleEditSubmit}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
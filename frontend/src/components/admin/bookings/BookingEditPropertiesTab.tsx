// src/components/admin/bookings/BookingEditPropertiesTab.tsx
import { Trash2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingProperty } from "@/types/booking.types";
import type { Property } from "@/types/property.types";
import type { PropertyCategory } from "@/types/propertyCategory.types";

interface BookingEditPropertiesTabProps {
  selectedProperties: BookingProperty[];
  propertyCategories: PropertyCategory[];
  propertyCategoryFilter: string;
  setPropertyCategoryFilter: (value: string) => void;
  filteredProperties: Property[];
  handleAddProperty: (property: Property) => void;
  handleUpdatePropertyQuantity: (index: number, qty: number) => void;
  handleRemoveProperty: (index: number) => void;
  getPropertyImage: (property: Property) => string;
}

export function BookingEditPropertiesTab({
  selectedProperties,
  propertyCategories,
  propertyCategoryFilter,
  setPropertyCategoryFilter,
  filteredProperties,
  handleAddProperty,
  handleUpdatePropertyQuantity,
  handleRemoveProperty,
  getPropertyImage,
}: BookingEditPropertiesTabProps) {
  return (
    <div className="space-y-6">
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
                    Rp {Number(prop.price).toLocaleString("id-ID")} × {prop.quantity} = Rp {Number(prop.subtotal).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
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
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdatePropertyQuantity(index, prop.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    type="button"
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

      <Card>
        <CardHeader>
          <CardTitle>Tambah Property</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              type="button"
              variant={propertyCategoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPropertyCategoryFilter("all")}
            >
              Semua
            </Button>
            {propertyCategories.map((cat) => (
              <Button
                key={cat.id}
                type="button"
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
              {filteredProperties.map((property) => {
                const selectedProp = selectedProperties.find((p) => p.property_id === property.id);
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
                      <Badge variant="outline" className="mb-2">
                        {property.category?.name}
                      </Badge>
                      <p className="text-sm font-bold text-primary mb-3">
                        Rp {Number(property.price).toLocaleString("id-ID")}
                      </p>
                      <Button
                        type="button"
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
    </div>
  );
}

import { useStep3Properties } from "@/hooks/Customer/useStep3Properties"; // sesuaikan path
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { BookingProperty } from "@/types/booking.types";

interface Step3Props {
  properties: BookingProperty[];
  setProperties: (properties: BookingProperty[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Properties({ properties, setProperties, onNext, onBack }: Step3Props) {
  const {
    categories, isLoading,
    selectedCategory, setSelectedCategory,
    filteredProperties,
    handleAddProperty, handleUpdateQuantity, handleRemoveProperty,
    getPrimaryImage, calculateTotal,
  } = useStep3Properties(properties, setProperties);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat properti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pilih Property Tambahan (Opsional)</h3>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Semua
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === String(cat.id) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(String(cat.id))}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Selected Properties */}
        {properties.length > 0 && (
          <Card className="mb-4 bg-primary/5">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Property Terpilih</h4>
              <div className="space-y-3">
                {properties.map((prop, index) => (
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
                        onClick={() => handleUpdateQuantity(index, prop.quantity - 1)}
                      >
                        <Minus size={16} />
                      </Button>
                      <Input
                        type="number"
                        value={prop.quantity}
                        onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(index, prop.quantity + 1)}
                      >
                        <Plus size={16} />
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

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Property:</span>
                    <span className="text-primary">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map(property => {
            const selectedProp = properties.find(p => p.property_id === property.id);
            
            return (
              <Card key={property.id} className={`overflow-hidden ${selectedProp ? "ring-2 ring-primary" : ""}`}>
                <div className="aspect-square overflow-hidden">
                  {getPrimaryImage(property) ? (
                    <img
                      src={getPrimaryImage(property)}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 mb-2">{property.name}</h4>
                  <Badge variant="outline" className="mb-2">{property.category?.name}</Badge>
                  <p className="text-lg font-bold text-primary mb-3">
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
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button onClick={onNext}>
          Lanjut ke Pembayaran
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
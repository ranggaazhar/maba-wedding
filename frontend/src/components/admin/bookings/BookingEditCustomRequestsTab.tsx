// src/components/admin/bookings/BookingEditCustomRequestsTab.tsx
import { AlertCircle, Palette, Sparkles, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingCustomRequest } from "@/types/booking.types";

interface BookingEditCustomRequestsTabProps {
  customRequests: BookingCustomRequest[];
  onOpenAddModal: () => void;
  onOpenEditModal: (cr: BookingCustomRequest) => void;
  onDeleteCustomRequest: (crId: number) => Promise<void>;
}

export function BookingEditCustomRequestsTab({
  customRequests,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteCustomRequest,
}: BookingEditCustomRequestsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Requests</h3>
          <p className="text-sm text-muted-foreground">Permintaan kustom dekorasi dari customer</p>
        </div>
        <Button
          type="button"
          onClick={onOpenAddModal}
          size="sm"
          className="gradient-ocean text-primary-foreground"
        >
          <Plus size={16} className="mr-2" />
          Tambah Request
        </Button>
      </div>

      {customRequests.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tidak ada custom request pada booking ini</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customRequests.map((cr, index) => (
            <Card key={cr.id || `cr-${index}`} className="border-orange-100 bg-orange-50/10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{cr.title}</h4>
                    {cr.color_theme && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Palette size={14} className="text-orange-500" />
                        <span>Tema warna:</span>
                        <div
                          className="w-4 h-4 rounded-full border border-border shadow-sm flex-shrink-0"
                          style={{ backgroundColor: cr.color_theme }}
                          title={cr.color_theme}
                        />
                        <span className="text-xs">{cr.color_theme}</span>
                      </div>
                    )}
                  </div>
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                    <Sparkles size={12} className="mr-1" /> Custom
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cr.description}</p>
                
                {cr.reference_images_urls && cr.reference_images_urls.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Foto Referensi:</p>
                    <div className="flex flex-wrap gap-2">
                      {cr.reference_images_urls.map((url, imgIdx) => (
                        <div key={imgIdx} className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={url} alt={`referensi-${imgIdx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-3 border-t justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenEditModal(cr)}
                    className="h-8 text-xs"
                  >
                    <Edit2 size={12} className="mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => cr.id && onDeleteCustomRequest(cr.id)}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={12} className="mr-1.5" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

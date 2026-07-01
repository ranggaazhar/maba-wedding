// src/components/admin/bookings/BookingEditInfoTab.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingEditInfoTabProps {
  formData: {
    event_venue: string;
    event_date: string;
    event_type: string;
    theme_color: string;
    customer_notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function BookingEditInfoTab({ formData, setFormData }: BookingEditInfoTabProps) {
  return (
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
              onChange={(e) => setFormData((prev: any) => ({ ...prev, event_venue: e.target.value }))}
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
              onChange={(e) => setFormData((prev: any) => ({ ...prev, event_date: e.target.value }))}
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
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, event_type: value }))}
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
            <div className="flex items-center gap-3">
              <input
                id="theme_color"
                type="color"
                value={formData.theme_color || '#d4a017'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, theme_color: e.target.value }))}
                className="w-12 h-10 rounded-md border cursor-pointer p-0.5 bg-transparent"
              />
              <span className="text-sm text-muted-foreground">
                {formData.theme_color || '#d4a017'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Klik kotak untuk memilih warna tema acara
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_notes">Catatan Customer</Label>
          <Textarea
            id="customer_notes"
            value={formData.customer_notes}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, customer_notes: e.target.value }))}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

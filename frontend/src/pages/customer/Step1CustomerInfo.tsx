import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateBookingData } from "@/api/bookingApi";
import Swal from "sweetalert2";

interface Step1Props {
  formData: CreateBookingData;
  setFormData: React.Dispatch<React.SetStateAction<CreateBookingData>>;
  onNext: () => void;
}

export default function Step1CustomerInfo({ formData, setFormData, onNext }: Step1Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customer_name || !formData.customer_phone || 
        !formData.full_address || !formData.event_venue || 
        !formData.event_date || !formData.event_type) {
      Swal.fire("Error", "Mohon lengkapi semua field yang wajib diisi", "error");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Diri Customer</h3>

        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customer_name">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        {/* Customer Phone */}
        <div className="space-y-2">
          <Label htmlFor="customer_phone">
            Nomor Telepon <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
            placeholder="08123456789"
            required
          />
        </div>

        {/* Full Address */}
        <div className="space-y-2">
          <Label htmlFor="full_address">
            Alamat Lengkap <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="full_address"
            value={formData.full_address}
            onChange={(e) => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
            placeholder="Masukkan alamat lengkap"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Venue */}
          <div className="space-y-2">
            <Label htmlFor="event_venue">
              Lokasi Acara <span className="text-destructive">*</span>
            </Label>
            <Input
              id="event_venue"
              value={formData.event_venue}
              onChange={(e) => setFormData(prev => ({ ...prev, event_venue: e.target.value }))}
              placeholder="Gedung/Ballroom"
              required
            />
          </div>

          {/* Event Date */}
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
          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="event_type">
              Jenis Acara <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis acara" />
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

          {/* Referral Source */}
          <div className="space-y-2">
            <Label htmlFor="referral_source">Dari Mana Anda Tahu?</Label>
            <Input
              id="referral_source"
              value={formData.referral_source}
              onChange={(e) => setFormData(prev => ({ ...prev, referral_source: e.target.value }))}
              placeholder="Instagram, Teman, dll"
            />
          </div>
        </div>

        {/* Theme Color */}
        <div className="space-y-2">
          <Label htmlFor="theme_color">Warna Tema</Label>
          <Input
            id="theme_color"
            value={formData.theme_color}
            onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
            placeholder="Contoh: Gold & Cream"
          />
        </div>

        {/* Customer Notes */}
        <div className="space-y-2">
          <Label htmlFor="customer_notes">Catatan Tambahan</Label>
          <Textarea
            id="customer_notes"
            value={formData.customer_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_notes: e.target.value }))}
            placeholder="Tambahkan catatan atau permintaan khusus"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Lanjut ke Pilih Model
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </form>
  );
}
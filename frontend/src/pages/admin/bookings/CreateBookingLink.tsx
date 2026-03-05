import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingLinkApi } from "@/api/bookingApi";
import Swal from "sweetalert2";
import axios from "axios";

export default function CreateBookingLink() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    expires_at: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await bookingLinkApi.createBookingLink(formData);

      if (response.success) {
        const link = `${window.location.origin}/booking/${response.data.token}`;
        setGeneratedLink(link);

        Swal.fire({
          icon: "success",
          title: "Link Berhasil Dibuat!",
          html: `
            <p class="mb-3">Link booking telah dibuat</p>
            <div class="bg-gray-100 p-3 rounded break-all text-sm">
              ${link}
            </div>
          `,
          confirmButtonText: "OK",
        }).then(() => {
          // Redirect ke halaman bookings setelah user klik OK
          navigate("/bookings");
        });
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal membuat booking link";
      Swal.fire("Error", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    Swal.fire({
      icon: "success",
      title: "Tersalin!",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/bookings")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="page-header mb-0">
          <h1 className="page-title">Buat Booking Link Baru</h1>
          <p className="page-subtitle">Buat link untuk customer melakukan booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="table-container p-6">
          <div className="space-y-6">
            {/* Nama Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-sm font-medium">
                Nama Customer
              </Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Nama customer"
                className="bg-background"
              />
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label htmlFor="customer_phone" className="text-sm font-medium">
                Nomor Telepon
              </Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="08123456789"
                className="bg-background"
              />
            </div>

            {/* Tanggal Expired */}
            <div className="space-y-2">
              <Label htmlFor="expires_at" className="text-sm font-medium">
                Tanggal Expired
              </Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk expired otomatis 30 hari
              </p>
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Catatan
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan internal"
                rows={4}
                className="bg-background resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full gradient-ocean text-primary-foreground h-12 text-base font-medium" 
            >
              {isSubmitting ? (
                "Membuat..."
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Buat Link
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="table-container border-2 border-success/50 animate-fade-in">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Save className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg text-success">Link Berhasil Dibuat!</h3>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value={generatedLink} 
                readOnly 
                className="bg-muted border-muted-foreground/20 font-mono text-sm" 
              />
              <Button 
                onClick={handleCopyLink} 
                className="gradient-ocean text-primary-foreground shrink-0"
                size="lg"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
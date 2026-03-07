import { CheckCircle2, Copy, Clock, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";

interface BookingSuccessProps {
  bookingCode: string;
  bookingId: number;
}

export default function BookingSuccess({ bookingCode }: BookingSuccessProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    Swal.fire({
      icon: "success",
      title: "Tersalin!",
      text: "Kode booking berhasil disalin",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success Header */}
        <Card className="border-green-300 bg-green-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-700">Booking & Pembayaran DP Berhasil!</CardTitle>
            <CardDescription className="text-green-600">
              Bukti transfer Anda telah kami terima dan sedang dalam proses verifikasi oleh admin.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Booking Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kode Booking Anda</CardTitle>
            <CardDescription>Simpan kode ini untuk referensi pesanan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-3xl font-bold text-primary tracking-wider">{bookingCode}</p>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status saat ini */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-500 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-blue-700">Status Saat Ini</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Menunggu Konfirmasi Admin
                  </Badge>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Admin akan memverifikasi bukti transfer Anda dalam 1×24 jam.
                  Notifikasi akan dikirim ke WhatsApp Anda setelah dikonfirmasi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Langkah Selanjutnya */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yang Akan Terjadi Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold shrink-0 text-sm">
                ✓
              </div>
              <div>
                <p className="font-semibold text-green-600">Booking & Bukti DP Diterima</p>
                <p className="text-sm text-muted-foreground">
                  Data booking dan bukti transfer Anda sudah tersimpan di sistem kami.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0 text-sm">
                2
              </div>
              <div>
                <p className="font-semibold">Verifikasi oleh Admin</p>
                <p className="text-sm text-muted-foreground">
                  Tim kami akan memverifikasi pembayaran DP dalam 1×24 jam kerja.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold shrink-0 text-sm">
                3
              </div>
              <div>
                <p className="font-semibold">Notifikasi WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Setelah dikonfirmasi, Anda akan menerima pesan WA beserta detail booking lengkap.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold shrink-0 text-sm">
                4
              </div>
              <div>
                <p className="font-semibold">Dekorasi Dipersiapkan</p>
                <p className="text-sm text-muted-foreground">
                  Tim kami akan mempersiapkan dekorasi sesuai pilihan Anda menjelang hari acara.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info penting */}
        <Alert>
          <AlertDescription>
            <p className="font-semibold mb-1">Penting untuk diingat</p>
            <p className="text-sm">
              Simpan kode booking <strong>{bookingCode}</strong> dan pastikan nomor WhatsApp Anda aktif
              untuk menerima notifikasi konfirmasi dari kami.
            </p>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            onClick={() => window.open(`https://wa.me/62081215061622?text=Halo, saya ingin konfirmasi booking dengan kode *${bookingCode}*`, '_blank')}
          >
            <MessageCircle size={18} className="mr-2" />
            Hubungi via WhatsApp
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/"}>
            <Home size={18} className="mr-2" />
            Kembali ke Beranda
          </Button>
        </div>

      </div>
    </div>
  );
}
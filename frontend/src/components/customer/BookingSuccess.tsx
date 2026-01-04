import { CheckCircle2, Copy, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
        {/* Success Message */}
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-600">Booking Berhasil!</CardTitle>
            <CardDescription>
              Terima kasih telah melakukan booking. Kami akan segera menghubungi Anda.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Booking Code */}
        <Card>
          <CardHeader>
            <CardTitle>Kode Booking Anda</CardTitle>
            <CardDescription>
              Simpan kode ini untuk tracking pesanan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-3xl font-bold text-primary tracking-wider">
                  {bookingCode}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold">Tim kami akan menghubungi Anda</p>
                <p className="text-sm text-muted-foreground">
                  Dalam 1x24 jam untuk konfirmasi dan detail pembayaran
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold">Lakukan pembayaran DP</p>
                <p className="text-sm text-muted-foreground">
                  Setelah mendapat konfirmasi dari admin
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold">Upload bukti pembayaran</p>
                <p className="text-sm text-muted-foreground">
                  Jika belum upload, Anda dapat mengirimkan bukti transfer nanti
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold">Pesanan diproses</p>
                <p className="text-sm text-muted-foreground">
                  Tim kami akan mempersiapkan dekorasi sesuai pilihan Anda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Alert>
          <AlertDescription>
            <p className="font-semibold mb-2">Butuh bantuan?</p>
            <p className="text-sm">
              Hubungi kami via WhatsApp atau email yang tertera di website untuk informasi lebih lanjut
              tentang booking Anda (Kode: <strong>{bookingCode}</strong>)
            </p>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" onClick={() => window.print()}>
            <Download size={18} className="mr-2" />
            Cetak/Download
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
import { useState } from "react";
import { ArrowLeft, Upload, X, Loader2, AlertCircle, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Swal from "sweetalert2";

interface Step4Props {
  paymentFile: File | null;
  setPaymentFile: (file: File | null) => void;
  paymentData: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  setPaymentData: (data: {
    bank_name: string;
    account_number: string;
    account_name: string;
  }) => void;
  totalEstimate: number; // Total dari model + property
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const DP_PERCENTAGE = 0.1; // 10%

export default function Step4Payment({
  paymentFile,
  setPaymentFile,
  paymentData,
  setPaymentData,
  totalEstimate,
  onBack,
  onSubmit,
  isSubmitting,
}: Step4Props) {
  const [preview, setPreview] = useState<string>("");

  const dpAmount = Math.ceil(totalEstimate * DP_PERCENTAGE);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  // Validasi: semua field wajib diisi
  const isPaymentComplete =
    !!paymentFile &&
    paymentData.bank_name.trim() !== "" &&
    paymentData.account_number.trim() !== "" &&
    paymentData.account_name.trim() !== "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "File harus berupa gambar (JPG, PNG, JPEG)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 10MB", "error");
      return;
    }

    setPaymentFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setPaymentFile(null);
    setPreview("");
    const fileInput = document.getElementById("payment_proof") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = () => {
    if (!isPaymentComplete) {
      Swal.fire({
        title: "Pembayaran Belum Lengkap",
        html: `
          <p>Mohon lengkapi semua data pembayaran:</p>
          <ul style="text-align:left; margin-top:8px;">
            ${!paymentFile ? "<li>• Upload bukti transfer</li>" : ""}
            ${!paymentData.bank_name ? "<li>• Nama bank</li>" : ""}
            ${!paymentData.account_number ? "<li>• Nomor rekening</li>" : ""}
            ${!paymentData.account_name ? "<li>• Nama pemilik rekening</li>" : ""}
          </ul>
        `,
        icon: "warning",
      });
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Pembayaran DP</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Lakukan pembayaran DP untuk mengkonfirmasi booking Anda.
        </p>

        {/* DP Summary Card */}
        <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Ringkasan Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Estimasi Dekorasi</span>
              <span className="font-medium">{formatRupiah(totalEstimate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Persentase DP</span>
              <Badge variant="outline">10%</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">Total DP yang Harus Dibayar</span>
              <span className="text-2xl font-bold text-primary">{formatRupiah(dpAmount)}</span>
            </div>
            <Alert className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Sisa pembayaran <strong>{formatRupiah(totalEstimate - dpAmount)}</strong> akan dilunasi sebelum hari acara.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Status info */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            Setelah submit, booking Anda akan berstatus <strong>"Menunggu Konfirmasi Admin"</strong>.
            Admin akan memverifikasi pembayaran dan mengirimkan detail booking ke WhatsApp Anda.
          </AlertDescription>
        </Alert>

        {/* Bank Information */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Data Rekening Pengirim <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Nama Bank <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank_name"
                value={paymentData.bank_name}
                onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
                placeholder="Contoh: BCA, Mandiri, BRI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                Nomor Rekening Pengirim <span className="text-destructive">*</span>
              </Label>
              <Input
                id="account_number"
                value={paymentData.account_number}
                onChange={(e) => setPaymentData({ ...paymentData, account_number: e.target.value })}
                placeholder="1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">
                Nama Pemilik Rekening <span className="text-destructive">*</span>
              </Label>
              <Input
                id="account_name"
                value={paymentData.account_name}
                onChange={(e) => setPaymentData({ ...paymentData, account_name: e.target.value })}
                placeholder="Nama sesuai rekening"
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className={paymentFile ? "border-green-300" : "border-dashed"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                Upload Bukti Transfer <span className="text-destructive">*</span>
              </span>
              {paymentFile && (
                <Badge className="bg-green-500 text-white gap-1">
                  <CheckCircle2 size={12} /> Terupload
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!paymentFile ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => document.getElementById("payment_proof")?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Klik untuk upload bukti transfer
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (Max. 10MB)</p>
              </div>
            ) : (
              <div className="relative">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview bukti pembayaran"
                    className="w-full h-64 object-contain rounded-lg border"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                  type="button"
                >
                  <X size={18} />
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  {paymentFile.name} ({(paymentFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <input
              id="payment_proof"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Checklist status */}
        <div className="mt-4 p-4 rounded-lg bg-muted/40 space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-2">Status kelengkapan:</p>
          {[
            { label: "Bukti transfer diupload", done: !!paymentFile },
            { label: "Nama bank diisi", done: !!paymentData.bank_name },
            { label: "Nomor rekening diisi", done: !!paymentData.account_number },
            { label: "Nama pemilik rekening diisi", done: !!paymentData.account_name },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 size={15} className="text-green-500 shrink-0" />
              ) : (
                <div className="w-[15px] h-[15px] rounded-full border-2 border-muted-foreground shrink-0" />
              )}
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isPaymentComplete}
          size="lg"
          className={isPaymentComplete ? "" : "opacity-50 cursor-not-allowed"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Submit Booking"
          )}
        </Button>
      </div>
    </div>
  );
}
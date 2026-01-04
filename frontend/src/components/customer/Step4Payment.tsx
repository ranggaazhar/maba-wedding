import { useState } from "react";
import { ArrowLeft, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function Step4Payment({
  paymentFile,
  setPaymentFile,
  paymentData,
  setPaymentData,
  onBack,
  onSubmit,
  isSubmitting
}: Step4Props) {
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire("Error", "File harus berupa gambar (JPG, PNG, JPEG)", "error");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 10MB", "error");
      return;
    }

    setPaymentFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setPaymentFile(null);
    setPreview("");
    // Reset file input
    const fileInput = document.getElementById('payment_proof') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = () => {
    // Validasi jika upload file tapi data bank tidak lengkap
    if (paymentFile && (!paymentData.bank_name || !paymentData.account_number || !paymentData.account_name)) {
      Swal.fire({
        title: "Data Pembayaran Tidak Lengkap",
        text: "Jika mengupload bukti pembayaran, mohon lengkapi data bank terlebih dahulu",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    // Jika tidak ada file, konfirmasi
    if (!paymentFile) {
      Swal.fire({
        title: "Lanjutkan tanpa bukti bayar?",
        text: "Anda dapat mengupload bukti pembayaran nanti setelah mendapat konfirmasi dari admin",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          onSubmit();
        }
      });
    } else {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Bukti Pembayaran DP (Opsional)</h3>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda dapat mengupload bukti pembayaran sekarang atau nanti setelah mendapat konfirmasi dari admin. 
            Silakan transfer DP ke rekening yang akan diberikan oleh admin.
          </AlertDescription>
        </Alert>

        {/* Bank Information (Optional but required if uploading file) */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Nama Bank {paymentFile && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="bank_name"
                value={paymentData.bank_name}
                onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
                placeholder="Contoh: BCA, Mandiri, BRI"
                required={!!paymentFile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                Nomor Rekening Pengirim {paymentFile && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="account_number"
                value={paymentData.account_number}
                onChange={(e) => setPaymentData({ ...paymentData, account_number: e.target.value })}
                placeholder="1234567890"
                required={!!paymentFile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">
                Nama Pemilik Rekening {paymentFile && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="account_name"
                value={paymentData.account_name}
                onChange={(e) => setPaymentData({ ...paymentData, account_name: e.target.value })}
                placeholder="Nama sesuai rekening"
                required={!!paymentFile}
              />
            </div>

            {paymentFile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Data bank wajib diisi jika mengupload bukti pembayaran
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="payment_proof">Upload Bukti Transfer</Label>
            
            {!paymentFile ? (
              <div
                className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById('payment_proof')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Klik untuk upload atau drag & drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG (Max. 10MB)
                </p>
              </div>
            ) : (
              <div className="mt-2 relative">
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
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, MapPin, Phone, Clock, 
  User, Check, X, Send, FileText, Edit, MessageSquare,
  Package, Palette, Loader2, Download, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { bookingApi, type Booking, type BookingModel, type BookingProperty, type PaymentStatus } from "@/api/bookingApi";
import Swal from "sweetalert2";
import axios from "axios";

// ── Status badge berdasarkan payment_status dari DB ──────────────────────────
const paymentStatusConfig: Record<PaymentStatus, { label: string; style: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Belum Bayar",
    style: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  WAITING_CONFIRMATION: {
    label: "Menunggu Konfirmasi",
    style: "bg-blue-50 text-blue-600 border-blue-200",
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: "DP Dikonfirmasi",
    style: "bg-success/10 text-success border-success/20",
    icon: Check,
  },
  REJECTED: {
    label: "Ditolak",
    style: "bg-destructive/10 text-destructive border-destructive/20",
    icon: X,
  },
};

export default function BookingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (id) fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setIsLoading(true);
      const response = await bookingApi.getBookingById(Number(id));
      if (response.success) {
        setBooking(response.data);
        setAdminNotes(response.data.admin_notes || "");
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal memuat detail booking";
      Swal.fire("Error", message, "error");
      navigate("/bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Konfirmasi Pembayaran ─────────────────────────────────────────────────
  const handleConfirmPayment = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Pembayaran?",
      html: `
        <p>Booking <strong>${booking?.booking_code}</strong> akan dikonfirmasi.</p>
        <p class="text-sm text-gray-500 mt-2">PDF detail booking akan dikirim ke WhatsApp customer.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      confirmButtonText: "Ya, Konfirmasi!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setIsConfirming(true);
      const response = await bookingApi.confirmPayment(Number(id));

      if (response.success) {
        await Swal.fire({
          title: "Berhasil!",
          html: `
            Pembayaran dikonfirmasi.<br/>
            <small>${response.data.whatsapp_sent ? "✅ Notifikasi WA terkirim ke customer." : "⚠️ WA gagal dikirim, tapi konfirmasi tetap tersimpan."}</small>
          `,
          icon: "success",
        });
        fetchBookingDetail(); // refresh data
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal mengkonfirmasi pembayaran";
      Swal.fire("Gagal!", message, "error");
    } finally {
      setIsConfirming(false);
    }
  };

  // ── Tolak Pembayaran ──────────────────────────────────────────────────────
  const handleRejectPayment = async () => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Tolak Pembayaran?",
      input: "textarea",
      inputLabel: "Alasan penolakan (opsional)",
      inputPlaceholder: "Contoh: Bukti transfer tidak jelas, nominal tidak sesuai...",
      inputAttributes: { rows: "3" },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    try {
      setIsRejecting(true);
      await bookingApi.rejectPayment(Number(id), reason || "");
      Swal.fire("Ditolak", "Pembayaran telah ditolak", "info");
      fetchBookingDetail();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal menolak pembayaran";
      Swal.fire("Gagal!", message, "error");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    const result = await Swal.fire({
      title: "Yakin hapus booking?",
      text: `Booking ${booking.booking_code} akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(booking.id);
        Swal.fire("Terhapus!", "Booking berhasil dihapus", "success");
        navigate("/bookings");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Gagal menghapus";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const totalPropertyCost = booking?.properties?.reduce(
    (sum, p) => sum + parseFloat(p.subtotal), 0
  ) || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!booking) return null;

  const paymentStatus = booking.payment_status || "PENDING";
  const statusInfo = paymentStatusConfig[paymentStatus];
  const StatusIcon = statusInfo.icon;

  // Tampilkan tombol konfirmasi/tolak hanya saat WAITING_CONFIRMATION
  const showConfirmActions = paymentStatus === "WAITING_CONFIRMATION";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/bookings")}
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Bookings
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{booking.booking_code}</h1>
              <Badge className={statusInfo.style}>
                <StatusIcon size={14} className="mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Disubmit pada {formatDateTime(booking.submitted_at)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate(`/bookings/edit/${booking.id}`)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <X size={16} className="mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        {/* ── Banner Konfirmasi (muncul hanya saat WAITING_CONFIRMATION) ── */}
        {showConfirmActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-blue-700">Bukti Pembayaran Diterima</p>
                    <p className="text-sm text-blue-600">
                      Customer telah mengupload bukti transfer. Silakan verifikasi dan konfirmasi atau tolak pembayaran ini.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleRejectPayment}
                    disabled={isRejecting || isConfirming}
                  >
                    {isRejecting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <XCircle size={16} className="mr-2" />}
                    Tolak
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirmPayment}
                    disabled={isConfirming || isRejecting}
                  >
                    {isConfirming ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                    Konfirmasi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner CONFIRMED */}
        {paymentStatus === "CONFIRMED" && booking.confirmed_at && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-3">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 size={18} />
                <p className="text-sm">
                  Dikonfirmasi pada <strong>{formatDateTime(booking.confirmed_at)}</strong>. 
                  PDF telah dikirim ke WhatsApp customer.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner REJECTED */}
        {paymentStatus === "REJECTED" && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-3">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle size={18} />
                <p className="text-sm">
                  Pembayaran ditolak.
                  {booking.rejection_reason && (
                    <> Alasan: <strong>{booking.rejection_reason}</strong></>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="info" className="data-[state=active]:bg-card">
                <User size={16} className="mr-2" />
                Informasi
              </TabsTrigger>
              <TabsTrigger value="models" className="data-[state=active]:bg-card">
                <Palette size={16} className="mr-2" />
                Model Dekorasi
              </TabsTrigger>
              <TabsTrigger value="properties" className="data-[state=active]:bg-card">
                <Package size={16} className="mr-2" />
                Properties
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Informasi */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    Informasi Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={User} label="Nama" value={booking.customer_name} />
                    <InfoItem icon={Phone} label="No. Telepon" value={booking.customer_phone} />
                  </div>
                  <Separator />
                  <InfoItem icon={MapPin} label="Alamat Lengkap" value={booking.full_address} />
                  {booking.referral_source && (
                    <>
                      <Separator />
                      <InfoItem icon={Send} label="Sumber Referral" value={booking.referral_source} />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    Informasi Acara
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={MapPin} label="Venue" value={booking.event_venue} />
                    <InfoItem icon={Calendar} label="Tanggal" value={formatDate(booking.event_date)} />
                    <InfoItem icon={FileText} label="Jenis Acara" value={booking.event_type} />
                    {booking.theme_color && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Palette size={12} />
                          Warna Tema
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border-2 border-border" style={{ backgroundColor: booking.theme_color }} />
                          <span className="text-sm font-medium">{booking.theme_color}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {booking.customer_notes && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare size={18} className="text-primary" />
                      Catatan Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground bg-accent/50 rounded-lg p-4 text-sm leading-relaxed">
                      {booking.customer_notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Proof */}
              {(booking.payment_proof_url || booking.payment_proof_full_url) && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      Bukti Pembayaran
                      <Badge className={statusInfo.style + " ml-auto"}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={booking.payment_proof_full_url || booking.payment_proof_url}
                        alt="Bukti Pembayaran"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(booking.payment_proof_full_url || booking.payment_proof_url, "_blank")}
                    >
                      <Download size={16} className="mr-2" />
                      Lihat Full Size
                    </Button>

                    {booking.bank_name && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Informasi Transfer</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Bank:</span> {booking.bank_name}</p>
                          {booking.account_name && <p><span className="text-muted-foreground">Atas Nama:</span> {booking.account_name}</p>}
                          {booking.account_number && <p><span className="text-muted-foreground">No. Rekening:</span> {booking.account_number}</p>}
                        </div>
                      </div>
                    )}

                    {/* Tombol konfirmasi/tolak inline di kartu bukti bayar */}
                    {showConfirmActions && (
                      <div className="pt-3 border-t flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={handleRejectPayment}
                          disabled={isRejecting || isConfirming}
                        >
                          <XCircle size={16} className="mr-2" />
                          Tolak
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleConfirmPayment}
                          disabled={isConfirming || isRejecting}
                        >
                          <CheckCircle2 size={16} className="mr-2" />
                          Konfirmasi
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB 2: Model Dekorasi */}
            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette size={18} className="text-primary" />
                    Model Dekorasi Dipilih
                    <Badge variant="secondary" className="ml-auto">
                      {booking.models?.length || 0} model
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.models && booking.models.length > 0 ? (
                    booking.models.map((model: BookingModel, index: number) => (
                      <div key={model.id || index}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="flex gap-4">
                          {model.display_image && (
                            <img
                              src={model.display_image}
                              alt={model.project_title}
                              className="w-28 h-20 rounded-lg object-cover border border-border"
                            />
                          )}
                          <div className="flex-1 space-y-1">
                            {model.category?.name && (
                              <Badge variant="outline" className="text-xs mb-1">{model.category.name}</Badge>
                            )}
                            <h4 className="font-semibold text-foreground">{model.project_title}</h4>
                            {model.price && (
                              <p className="text-sm text-muted-foreground">
                                Rp {parseFloat(model.price).toLocaleString("id-ID")}
                              </p>
                            )}
                            {model.notes && (
                              <p className="text-sm text-muted-foreground italic">"{model.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Tidak ada model dekorasi yang dipilih</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Properties */}
            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    Properties Tambahan
                    <Badge variant="secondary" className="ml-auto">
                      {booking.properties?.length || 0} item
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.properties && booking.properties.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {booking.properties.map((prop: BookingProperty, index: number) => (
                          <div key={prop.id || index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            {prop.display_image && (
                              <img
                                src={prop.display_image}
                                alt={prop.property_name}
                                className="w-12 h-12 rounded-lg object-cover border border-border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{prop.property_name}</p>
                              <p className="text-xs text-muted-foreground">{prop.property_category}</p>
                              <p className="text-xs text-muted-foreground">Qty: {prop.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                Rp {parseFloat(prop.subtotal).toLocaleString("id-ID")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                @ Rp {parseFloat(prop.price).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Total Properties</span>
                        <span className="text-lg font-bold text-primary">
                          Rp {totalPropertyCost.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Tidak ada properties tambahan</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Booking Summary */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3 gradient-ocean rounded-t-lg">
              <CardTitle className="text-lg text-primary-foreground">Ringkasan Booking</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <SummaryRow label="Kode Booking" value={booking.booking_code} mono />
              <SummaryRow label="Customer" value={booking.customer_name} />
              <SummaryRow label="Tanggal Acara" value={formatDate(booking.event_date)} />
              <SummaryRow label="Venue" value={booking.event_venue} />
              <Separator />
              <SummaryRow label="Model Dekorasi" value={`${booking.models?.length || 0} model`} />
              <SummaryRow label="Properties" value={`${booking.properties?.length || 0} item`} />
              {booking.total_estimate && (
                <SummaryRow
                  label="Estimasi Total"
                  value={`Rp ${parseFloat(booking.total_estimate).toLocaleString("id-ID")}`}
                  highlight
                />
              )}
              {booking.dp_amount && (
                <SummaryRow
                  label="DP (10%)"
                  value={`Rp ${parseFloat(booking.dp_amount).toLocaleString("id-ID")}`}
                />
              )}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <Badge className={statusInfo.style + " text-xs"}>
                  <StatusIcon size={11} className="mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText size={14} />
                Catatan Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Tambahkan catatan internal..."
                className="min-h-[80px] text-sm bg-muted/30"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button variant="outline" size="sm" className="w-full">
                <Edit size={14} className="mr-2" />
                Simpan Catatan
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => window.open(`https://wa.me/${booking.customer_phone.replace(/^0/, "62")}`, "_blank")}
              >
                <Send size={14} className="mr-2" />
                Kirim via WhatsApp
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText size={14} className="mr-2" />
                Export PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono text-xs" : ""} ${highlight ? "font-bold text-primary" : "font-medium text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
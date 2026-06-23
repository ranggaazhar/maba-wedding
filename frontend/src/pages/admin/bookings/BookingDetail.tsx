// src/pages/admin/BookingDetail.tsx
import {
  ArrowLeft, Calendar, MapPin, Phone,
  User, X, Send, FileText, Edit, MessageSquare,
  Package, Palette, Loader2,
  CheckCircle2, AlertCircle,
  Sparkles, Layers, BookOpen,
  Image as ImageIcon,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BookingModel, BookingProperty, BookingCustomRequest } from '@/types/booking.types';
import { getBookingType } from '@/types/booking.types';
import {
  useBookingDetail,
  paymentStatusConfig,
} from '@/hooks/Admin/bookings/useBookingDetail';
import { bookingApi } from '@/api/bookingApi';
import Swal from 'sweetalert2';


export default function BookingDetail() {
  const {
    booking, isLoading, isConfirming,
    navigate,
    handleConfirmPayment,
    handleDelete,
    formatDate, formatDateTime, formatCurrency,
    totalPropertyCost, totalModelCost,
  } = useBookingDetail();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!booking) return;
    try {
      setIsDownloadingPdf(true);
      await bookingApi.downloadBookingPdf(booking.id, `booking-${booking.booking_code}.pdf`);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'PDF booking berhasil didownload.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      console.error(err);
      Swal.fire('Error', 'Gagal mendownload PDF booking', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (!booking) return null;

  const paymentStatus = booking.payment_status || 'PENDING';
  const statusInfo = paymentStatusConfig[paymentStatus];
  const StatusIcon = statusInfo.icon;
  const showConfirmActions = paymentStatus === 'WAITING_CONFIRMATION';
  const bookingType = getBookingType(booking);

  // Tab default: selalu mulai dari info
  const defaultTab = 'info';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/admin/bookings')}>
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Bookings
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{booking.booking_code}</h1>
              <Badge className={statusInfo.style}>
                <StatusIcon size={14} className="mr-1" />
                {statusInfo.label}
              </Badge>
              {/* Tipe booking badge */}
              {bookingType === 'COMBINATION' && (
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                  <Layers size={12} /> Kombinasi
                </Badge>
              )}
              {bookingType === 'CUSTOM' && (
                <Badge className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                  <Sparkles size={12} /> Custom Request
                </Badge>
              )}
              {bookingType === 'CATALOG' && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                  <BookOpen size={12} /> Katalog
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Disubmit pada {formatDateTime(booking.submitted_at)}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/5 text-primary" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileText size={16} className="mr-2" />}
              Download PDF
            </Button>

            {paymentStatus === 'CONFIRMED' && !booking.invoice && (
              <Button
                className="gradient-ocean text-primary-foreground"
                onClick={() => navigate(`/admin/invoices/new?booking_id=${booking.id}`)}
              >
                <FileText size={16} className="mr-2" /> Buat Invoice
              </Button>
            )}

            {booking.invoice ? (
              <span title="Edit tidak dapat dilakukan karena invoice sudah diterbitkan" className="cursor-not-allowed">
                <Button variant="outline" disabled>
                  <Edit size={16} className="mr-2" /> Edit
                </Button>
              </span>
            ) : (
              <Button variant="outline" onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}>
                <Edit size={16} className="mr-2" /> Edit
              </Button>
            )}

            {booking.is_deletable === false ? (
              <span title="Booking tidak dapat dihapus karena invoice belum lunas" className="cursor-not-allowed">
                <Button variant="outline" className="text-destructive border-destructive/30" disabled>
                  <X size={16} className="mr-2" /> Hapus
                </Button>
              </span>
            ) : (
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete}>
                <X size={16} className="mr-2" /> Hapus
              </Button>
            )}
          </div>
        </div>


        {/* Banner: waiting confirmation */}
        {showConfirmActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-blue-700">Bukti Pembayaran Diterima</p>
                    <p className="text-sm text-blue-600">Customer telah mengupload bukti transfer. Silakan verifikasi pembayaran lalu klik tombol Konfirmasi.</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirmPayment} disabled={isConfirming}>
                    {isConfirming ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                    Konfirmasi Pembayaran
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner: confirmed */}
        {paymentStatus === 'CONFIRMED' && booking.confirmed_at && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-3">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 size={18} />
                <p className="text-sm">Dikonfirmasi pada <strong>{formatDateTime(booking.confirmed_at)}</strong>. PDF telah dikirim ke WhatsApp customer.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
              <TabsTrigger value="info" className="data-[state=active]:bg-card">
                <User size={16} className="mr-2" /> Informasi
              </TabsTrigger>

              {/* Tab model — tampil kalau ada models */}
              {(booking.models?.length ?? 0) > 0 && (
                <TabsTrigger value="models" className="data-[state=active]:bg-card">
                  <Palette size={16} className="mr-2" /> Model Dekorasi
                  <Badge variant="secondary" className="ml-2 text-xs">{booking.models!.length}</Badge>
                </TabsTrigger>
              )}

              {/* Tab properties — tampil kalau ada */}
              {(booking.properties?.length ?? 0) > 0 && (
                <TabsTrigger value="properties" className="data-[state=active]:bg-card">
                  <Package size={16} className="mr-2" /> Properties
                  <Badge variant="secondary" className="ml-2 text-xs">{booking.properties!.length}</Badge>
                </TabsTrigger>
              )}

              {/* Tab custom request — tampil kalau has_custom_request */}
              {booking.has_custom_request && (
                <TabsTrigger value="custom" className="data-[state=active]:bg-card">
                  <Sparkles size={16} className="mr-2" /> Custom Request
                  <Badge variant="secondary" className="ml-2 text-xs">{booking.customRequests?.length ?? 0}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── TAB: INFO ── */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User size={18} className="text-primary" /> Informasi Customer
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
                    <Calendar size={18} className="text-primary" /> Informasi Acara
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
                          <Palette size={12} /> Warna Tema
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
                      <MessageSquare size={18} className="text-primary" /> Catatan Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground bg-accent/50 rounded-lg p-4 text-sm leading-relaxed">
                      {booking.customer_notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {(booking.payment_proof_url || booking.payment_proof_full_url) && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      Bukti Pembayaran
                      <Badge className={statusInfo.style + ' ml-auto'}>
                        <StatusIcon size={12} className="mr-1" /> {statusInfo.label}
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
                    <Button variant="outline" className="w-full"
                      onClick={() => window.open(booking.payment_proof_full_url || booking.payment_proof_url, '_blank')}>
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
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── TAB: MODEL DEKORASI ── */}
            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette size={18} className="text-primary" />
                    Model Dekorasi Dipilih
                    <Badge variant="secondary" className="ml-auto">{booking.models?.length || 0} model</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.models && booking.models.length > 0 ? (
                    booking.models.map((model: BookingModel, index: number) => (
                      <div key={model.id || index}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="flex gap-4">
                          {model.display_image && (
                            <img src={model.display_image} alt={model.project_title}
                              className="w-28 h-20 rounded-lg object-cover border border-border shrink-0" />
                          )}
                          <div className="flex-1 space-y-1">
                            {model.category?.name && (
                              <Badge variant="outline" className="text-xs mb-1">{model.category.name}</Badge>
                            )}
                            <h4 className="font-semibold text-foreground">{model.project_title}</h4>
                            {model.price && (
                              <p className="text-sm text-muted-foreground">{formatCurrency(model.price)}</p>
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

                  {totalModelCost > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Model</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(totalModelCost)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: PROPERTIES ── */}
            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    Properties Tambahan
                    <Badge variant="secondary" className="ml-auto">{booking.properties?.length || 0} item</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.properties && booking.properties.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {booking.properties.map((prop: BookingProperty, index: number) => (
                          <div key={prop.id || index}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            {prop.display_image && (
                              <img src={prop.display_image} alt={prop.property_name}
                                className="w-12 h-12 rounded-lg object-cover border border-border" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{prop.property_name}</p>
                              <p className="text-xs text-muted-foreground">{prop.property_category}</p>
                              <p className="text-xs text-muted-foreground">Qty: {prop.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">{formatCurrency(prop.subtotal)}</p>
                              <p className="text-xs text-muted-foreground">@ {formatCurrency(prop.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Properties</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(totalPropertyCost)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Tidak ada properties tambahan</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: CUSTOM REQUEST ── */}
            {booking.has_custom_request && (
              <TabsContent value="custom" className="space-y-4">
                <Card className="border-orange-100 bg-orange-50/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-orange-500 mt-0.5 shrink-0" size={18} />
                      <p className="text-sm text-orange-700">
                        Customer mengajukan custom request. Diskusikan detail dan estimasi harga langsung dengan customer melalui <strong>WhatsApp</strong>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {booking.customRequests && booking.customRequests.length > 0 ? (
                  booking.customRequests.map((cr: BookingCustomRequest) => (
                    <CustomRequestCard
                      key={cr.id}
                      request={cr}
                      formatDateTime={formatDateTime}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Sparkles size={40} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Tidak ada custom request</p>
                    </CardContent>
                  </Card>
                )}


              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
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
              {(booking.models?.length ?? 0) > 0 && (
                <SummaryRow label="Model Dekorasi" value={`${booking.models!.length} model`} />
              )}
              {(booking.properties?.length ?? 0) > 0 && (
                <SummaryRow label="Properties" value={`${booking.properties!.length} item`} />
              )}
              {booking.has_custom_request && (
                <SummaryRow label="Custom Request" value={`${booking.customRequests?.length ?? 0} request`} />
              )}
              <Separator />
              {booking.total_estimate ? (
                <SummaryRow label="Estimasi Total" value={formatCurrency(booking.total_estimate)} highlight />
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimasi Total</span>
                  <span className="text-orange-600 font-medium text-xs">Menunggu admin</span>
                </div>
              )}
              {booking.dp_amount && (
                <SummaryRow label="DP (10%)" value={formatCurrency(booking.dp_amount)} />
              )}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <Badge className={statusInfo.style + ' text-xs'}>
                  <StatusIcon size={11} className="mr-1" /> {statusInfo.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CustomRequestCard({
  request, formatDateTime,
}: {
  request: BookingCustomRequest;
  formatDateTime: (v: string) => string;
}) {
  const [showImages, setShowImages] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{request.title}</h4>
          </div>
          <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs shrink-0">
            <Sparkles size={11} className="mr-1" /> Custom
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">{request.description}</p>

        {request.color_theme && (
          <div className="flex items-center gap-2 text-sm">
            <Palette size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Tema warna:</span>
            <div
              className="w-5 h-5 rounded-full border border-border shadow-sm flex-shrink-0"
              style={{ backgroundColor: request.color_theme }}
              title={request.color_theme}
            />
            <span className="font-medium text-muted-foreground text-xs">{request.color_theme}</span>
          </div>
        )}

        {/* Foto referensi */}
        {request.reference_images_urls && request.reference_images_urls.length > 0 && (
          <div>
            <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => setShowImages(!showImages)}>
              <span className="flex items-center gap-1.5 text-sm">
                <ImageIcon size={14} /> {request.reference_images_urls.length} foto referensi
              </span>
              {showImages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
            {showImages && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {request.reference_images_urls.map((url, i) => (
                  <img key={i} src={url} alt={`Referensi ${i + 1}`}
                    className="aspect-square rounded-lg object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')} />
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Diajukan pada {formatDateTime(request.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${highlight ? 'font-bold text-primary' : 'font-medium text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}
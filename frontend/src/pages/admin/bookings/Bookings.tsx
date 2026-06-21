import { useState, useEffect } from "react";
import { useBookings } from "@/hooks/Admin/bookings/useBooking";
import {
  Search, Eye, Trash2, Calendar, Loader2,
  CheckCircle2, Filter,
  Link2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@/types/booking.types";
import { getBookingType } from "@/types/booking.types";
import { Pagination } from "@/components/admin/Pagination";

// ── Booking type badge ────────────────────────────────────────────────────────

function BookingTypeBadge({ booking }: { booking: Booking }) {
  const type = getBookingType(booking);

  if (type === 'COMBINATION') {
    return (
      <Badge variant="secondary" className="text-xs">
        Kombinasi
      </Badge>
    );
  }
  if (type === 'CUSTOM') {
    return (
      <Badge variant="secondary" className="text-xs">
        Custom
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Katalog
    </Badge>
  );
}
const paymentStatusStyles: Record<string, string> = {
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  WAITING_CONFIRMATION: 'bg-blue-50 text-blue-600 border-blue-200',
  CONFIRMED: 'bg-success/10 text-success border-success/20',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Belum Bayar',
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi',
  CONFIRMED: 'DP Dikonfirmasi',
};

export default function Bookings() {
  const {
    bookings, bookingLinks, isLoadingBookings, isLoadingLinks,
    searchQuery, setSearchQuery,
    paymentFilter, setPaymentFilter,
    bookingTypeFilter, setBookingTypeFilter,
    linkSearchQuery, setLinkSearchQuery,
    bookingStats,
    navigate,
    handleDeleteBooking, handleCopyLink, handleRegenerateToken, handleDeleteLink,
    isExpired, formatDate,
  } = useBookings();

  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [currentLinkPage, setCurrentLinkPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page numbers when search / filter parameters change
  useEffect(() => {
    setCurrentBookingPage(1);
  }, [searchQuery, paymentFilter, bookingTypeFilter]);

  useEffect(() => {
    setCurrentLinkPage(1);
  }, [linkSearchQuery]);

  const totalBookingPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice(
    (currentBookingPage - 1) * ITEMS_PER_PAGE,
    currentBookingPage * ITEMS_PER_PAGE
  );

  const totalLinkPages = Math.ceil(bookingLinks.length / ITEMS_PER_PAGE);
  const paginatedBookingLinks = bookingLinks.slice(
    (currentLinkPage - 1) * ITEMS_PER_PAGE,
    currentLinkPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Kelola booking dan link booking</p>
        </div>
        <Button onClick={() => navigate("/admin/booking-links/new")} className="gradient-ocean text-primary-foreground">
          <Link2 size={18} className="mr-2" />
          Buat Link Booking
        </Button>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-card">
            <Calendar size={16} className="mr-2" /> Semua Booking
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-card">
            <Link2 size={16} className="mr-2" /> Booking Links
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: BOOKINGS ── */}
        <TabsContent value="bookings" className="space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Bayar DP</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingStats.withPayment}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingStats.thisMonth}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari kode booking atau nama..."
                className="pl-10 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter tipe booking */}
            <Select
              value={bookingTypeFilter}
              onValueChange={(v) => setBookingTypeFilter(v as typeof bookingTypeFilter)}
            >
              <SelectTrigger className="w-full md:w-44 bg-card">
                <Filter size={14} className="mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Tipe Booking" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="catalog">
                  <div className="flex items-center gap-2">
                    Katalog
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    Custom
                  </div>
                </SelectItem>
                <SelectItem value="combination">
                  <div className="flex items-center gap-2">
                    Kombinasi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filter status bayar */}
            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
              <SelectTrigger className="w-full md:w-44 bg-card">
                <SelectValue placeholder="Status Bayar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="with_payment">Sudah Bayar</SelectItem>
                <SelectItem value="without_payment">Belum Bayar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-20 text-center">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Tidak ada data ditemukan</h3>
                <p className="text-muted-foreground text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="table-container">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kode</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tanggal Acara</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venue</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Jenis Acara</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipe Booking</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status Bayar</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking, index) => (
                        <tr
                          key={booking.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <span className="font-mono text-sm text-foreground">{booking.booking_code}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{booking.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                          </td>
                          <td className="p-4 text-foreground whitespace-nowrap">{formatDate(booking.event_date)}</td>
                          <td className="p-4 text-muted-foreground max-w-[120px] truncate">{booking.event_venue}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="text-xs">{booking.event_type}</Badge>
                          </td>
                          <td className="p-4">
                            <BookingTypeBadge booking={booking} />
                          </td>
                          <td className="p-4">
                            <Badge className={`${paymentStatusStyles[booking.payment_status] ?? paymentStatusStyles.PENDING} text-xs`}>
                              {paymentStatusLabels[booking.payment_status] ?? 'Belum Bayar'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8"
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}>
                                <Eye size={16} />
                              </Button>
                              {booking.is_deletable === false ? (
                                <span title="Booking tidak dapat dihapus karena invoice belum lunas" className="cursor-not-allowed">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-50" disabled>
                                    <Trash2 size={16} />
                                  </Button>
                                </span>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteBooking(booking.id, booking.booking_code)}>
                                  <Trash2 size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={currentBookingPage}
                totalPages={totalBookingPages}
                onPageChange={setCurrentBookingPage}
                totalEntries={bookings.length}
                entriesPerPage={ITEMS_PER_PAGE}
                label="booking"
              />
            </div>
          )}
        </TabsContent>

        {/* ── TAB: BOOKING LINKS ── */}
        <TabsContent value="links" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Cari link..." className="pl-10 bg-card"
              value={linkSearchQuery} onChange={(e) => setLinkSearchQuery(e.target.value)} />
          </div>

          {isLoadingLinks ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Memuat booking links...</p>
            </div>
          ) : bookingLinks.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Link2 size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">Belum ada booking link</h3>
                <Button variant="outline" onClick={() => navigate("/admin/booking-links/new")} className="mt-4">
                  Buat Link Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="table-container">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dibuat</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kadaluarsa</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookingLinks.map((link, index) => (
                        <tr key={link.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}>
                          <td className="p-4">
                            <p className="font-medium text-foreground">{link.customer_name || `Link #${link.id}`}</p>
                            <p className="text-sm text-muted-foreground">{link.customer_phone}</p>
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDate(link.created_at)}</td>
                          <td className="p-4 text-muted-foreground">{link.expires_at ? formatDate(link.expires_at) : '-'}</td>
                          <td className="p-4">
                            {link.is_used ? (
                              <Badge className="bg-success/10 text-success border-success/20">Terisi</Badge>
                            ) : isExpired(link.expires_at) ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : (
                              <Badge className="bg-warning/10 text-warning border-warning/20">Belum Terisi</Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyLink(link.token)}>
                                <Link2 size={16} />
                              </Button>
                              {!link.is_used && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRegenerateToken(link.id)}>
                                  <RefreshCw size={16} />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteLink(link.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={currentLinkPage}
                totalPages={totalLinkPages}
                onPageChange={setCurrentLinkPage}
                totalEntries={bookingLinks.length}
                entriesPerPage={ITEMS_PER_PAGE}
                label="link"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
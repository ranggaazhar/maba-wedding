import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Eye, Trash2, Calendar, Loader2, 
  CheckCircle2, XCircle, Filter, 
  Link2, Send, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { bookingApi, bookingLinkApi, type Booking, type BookingLink } from "@/api/bookingApi";
import Swal from "sweetalert2";
import axios from "axios";

interface BookingFilters {
  search?: string;
  has_payment?: boolean;
}

interface BookingStats {
  total: number;
  withPayment: number;
  withoutPayment: number;
  thisMonth: number;
}

const statusStyles = {
  paid: "bg-success/10 text-success border-success/20",
  unpaid: "bg-warning/10 text-warning border-warning/20",
};

export default function Bookings() {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLinks, setBookingLinks] = useState<BookingLink[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [debouncedLinkSearch, setDebouncedLinkSearch] = useState("");
  
  const [bookingStats, setBookingStats] = useState<BookingStats>({ 
    total: 0, 
    withPayment: 0, 
    withoutPayment: 0, 
    thisMonth: 0 
  });


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLinkSearch(linkSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [linkSearchQuery]);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoadingBookings(true);
      const filters: BookingFilters = {};
      
      if (debouncedSearch.trim()) {
        filters.search = debouncedSearch;
      }
      
      if (paymentFilter !== "all") {
        filters.has_payment = paymentFilter === "with_payment";
      }

      const response = await bookingApi.getAllBookings(filters);
      
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Gagal memuat bookings";
      console.error(message);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [debouncedSearch, paymentFilter]);

  const fetchBookingLinks = useCallback(async () => {
    try {
      setIsLoadingLinks(true);
      const response = await bookingLinkApi.getAllBookingLinks({ 
        search: debouncedLinkSearch 
      });
      
      if (response.success) {
        setBookingLinks(response.data);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Gagal memuat booking links";
      console.error(message);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [debouncedLinkSearch]);

  const fetchBookingStatistics = useCallback(async () => {
    try {
      const response = await bookingApi.getStatistics();
      if (response.success) {
        setBookingStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch booking statistics", error);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchBookingStatistics();
  }, [fetchBookings, fetchBookingStatistics]);

  useEffect(() => {
    fetchBookingLinks();
  }, [fetchBookingLinks]);

  const handleDeleteBooking = async (id: number, bookingCode: string) => {
    const result = await Swal.fire({
      title: "Yakin hapus booking?",
      text: `Booking ${bookingCode} akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await bookingApi.deleteBooking(id);
        Swal.fire("Terhapus!", "Booking berhasil dihapus", "success");
        fetchBookings();
        fetchBookingStatistics();
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.message 
          : "Gagal menghapus";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/booking/${token}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: "success",
      title: "Tersalin!",
      text: "Link berhasil disalin ke clipboard",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleMarkAsSent = async (id: number) => {
    try {
      await bookingLinkApi.markAsSent(id);
      Swal.fire("Berhasil!", "Link ditandai sebagai terkirim", "success");
      fetchBookingLinks();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "Gagal update status";
      Swal.fire("Gagal!", message, "error");
    }
  };

  const handleRegenerateToken = async (id: number) => {
    const result = await Swal.fire({
      title: "Generate ulang token?",
      text: "Link lama tidak akan bisa digunakan lagi",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Generate!",
    });

    if (result.isConfirmed) {
      try {
        await bookingLinkApi.regenerateToken(id);
        Swal.fire("Berhasil!", "Token berhasil di-generate ulang", "success");
        fetchBookingLinks();
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.message 
          : "Gagal generate token";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const handleDeleteLink = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin hapus link?",
      text: "Link akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await bookingLinkApi.deleteBookingLink(id);
        Swal.fire("Terhapus!", "Link berhasil dihapus", "success");
        fetchBookingLinks();
      } catch (error: unknown) {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.message 
          : "Gagal menghapus";
        Swal.fire("Gagal!", message, "error");
      }
    }
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Kelola booking dan link booking</p>
        </div>
        <Button onClick={() => navigate("/booking-links/new")} className="gradient-ocean text-primary-foreground">
          <Link2 size={18} className="mr-2" />
          Buat Link Booking
        </Button>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-card">
            <Calendar size={16} className="mr-2" />
            Semua Booking
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-card">
            <Link2 size={16} className="mr-2" />
            Booking Links
          </TabsTrigger>
        </TabsList>

        {/* TAB: BOOKINGS */}
        <TabsContent value="bookings" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingStats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Bayar DP</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{bookingStats.withPayment}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{bookingStats.withoutPayment}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{bookingStats.thisMonth}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari kode booking atau nama..."
                className="pl-10 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-40 bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="with_payment">Sudah Bayar</SelectItem>
                <SelectItem value="without_payment">Belum Bayar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
          </div>

          {/* Bookings Table */}
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
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status Uang Muka</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr 
                        key={booking.id} 
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm text-foreground">{booking.booking_code}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{booking.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-foreground">{formatDate(booking.event_date)}</td>
                        <td className="p-4 text-muted-foreground">{booking.event_venue}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-xs">
                            {booking.event_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={booking.payment_proof_url ? statusStyles.paid : statusStyles.unpaid}>
                            {booking.payment_proof_url ? "Sudah Bayar DP" : "Belum bayar DP"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => navigate(`/bookings/${booking.id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteBooking(booking.id, booking.booking_code)}
                            >
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
          )}
        </TabsContent>

        {/* TAB: BOOKING LINKS */}
        <TabsContent value="links" className="space-y-4">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Cari link..."
              className="pl-10 bg-card"
              value={linkSearchQuery}
              onChange={(e) => setLinkSearchQuery(e.target.value)}
            />
          </div>

          {/* Booking Links Table */}
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
                <Button variant="outline" onClick={() => navigate("/booking-links/new")} className="mt-4">
                  Buat Link Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                    {bookingLinks.map((link, index) => (
                      <tr 
                        key={link.id} 
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{link.customer_name || `Link #${link.id}`}</p>
                            <p className="text-sm text-muted-foreground">{link.customer_phone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {formatDate(link.created_at)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {link.expires_at ? formatDate(link.expires_at) : '-'}
                        </td>
                        <td className="p-4">
                          {link.is_used ? (
                            <Badge className={statusStyles.paid}>Terisi</Badge>
                          ) : isExpired(link.expires_at) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge className={statusStyles.unpaid}>Belum Terisi</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleCopyLink(link.token)}
                            >
                              <Link2 size={16} />
                            </Button>
                            {!link.sent_at && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-success hover:bg-success/10"
                                onClick={() => handleMarkAsSent(link.id)}
                              >
                                <Send size={16} />
                              </Button>
                            )}
                            {!link.is_used && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleRegenerateToken(link.id)}
                              >
                                <RefreshCw size={16} />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteLink(link.id)}
                            >
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
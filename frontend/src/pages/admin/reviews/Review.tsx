// src/pages/admin/reviews/Reviews.tsx
import { useState, useEffect, useCallback } from "react";
import { Star, Check, X, Search, Eye, Link2, Plus, MessageSquare, ThumbsUp, Award, Loader2, Trash2, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/admin/StatCard";
import Swal from "sweetalert2";
import { reviewApi, type Review, type ReviewLink, type ReviewStatistics } from "@/api/reviewApi";

// ── Helpers ──────────────────────────────────────────────────

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size}
          className={cn(star <= rating ? "fill-warning text-warning" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Create Review Link Dialog ─────────────────────────────────

function CreateReviewLinkDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!bookingId) return Swal.fire("Error", "Masukkan Booking ID", "error");
    try {
      setIsCreating(true);
      const res = await reviewApi.createReviewLink(Number(bookingId));
      if (res.success) {
        Swal.fire({ icon: "success", title: "Review link dibuat!", timer: 1500, showConfirmButton: false });
        setOpen(false);
        setBookingId("");
        onCreated();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat review link";
      Swal.fire("Error", msg, "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus size={16} className="mr-2" />Buat Review Link</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Review Link Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Booking ID</Label>
            <Input
              type="number"
              placeholder="Masukkan ID booking..."
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link akan otomatis expire dalam 90 hari
            </p>
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={isCreating || !bookingId}>
            {isCreating
              ? <><Loader2 size={16} className="animate-spin mr-2" />Membuat...</>
              : <><Link2 size={16} className="mr-2" />Buat Link</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinksLoading, setIsLinksLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        reviewApi.getAllReviews(),
        reviewApi.getStatistics(),
      ]);
      if (reviewsRes.success) setReviews(reviewsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      Swal.fire("Error", "Gagal memuat data review", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReviewLinks = useCallback(async () => {
    try {
      setIsLinksLoading(true);
      const res = await reviewApi.getAllReviewLinks({ include_review: true });
      if (res.success) setReviewLinks(res.data);
    } catch {
      Swal.fire("Error", "Gagal memuat review links", "error");
    } finally {
      setIsLinksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchReviewLinks();
  }, [fetchReviews, fetchReviewLinks]);

  const handleApprove = async (id: number) => {
    try {
      await reviewApi.moderateReview(id, true);
      Swal.fire({ icon: "success", title: "Review disetujui", timer: 1200, showConfirmButton: false });
      fetchReviews();
    } catch { Swal.fire("Error", "Gagal menyetujui review", "error"); }
  };

  const handleReject = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Tolak review ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await reviewApi.moderateReview(id, false);
      Swal.fire({ icon: "info", title: "Review ditolak", timer: 1200, showConfirmButton: false });
      fetchReviews();
    } catch { Swal.fire("Error", "Gagal menolak review", "error"); }
  };

  const handleDeleteReviewLink = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus review link ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await reviewApi.deleteReviewLink(id);
      Swal.fire({ icon: "success", title: "Link dihapus", timer: 1200, showConfirmButton: false });
      fetchReviewLinks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus link";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleRegenerateToken = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Regenerate token?",
      text: "Link lama akan tidak berlaku.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Regenerate",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;
    try {
      await reviewApi.regenerateToken(id);
      Swal.fire({ icon: "success", title: "Token diperbarui", timer: 1200, showConfirmButton: false });
      fetchReviewLinks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal regenerate token";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleCopyLink = (token: string) => {
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    navigator.clipboard.writeText(`${FRONTEND_URL}/review/${token}`);
    Swal.fire({ icon: "success", title: "Link disalin!", timer: 1000, showConfirmButton: false });
  };

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);

  const filteredApproved = approvedReviews.filter((r) => {
    const matchSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
    return matchSearch && matchRating;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Kelola ulasan dari pelanggan</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingReviews.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <span className="text-sm font-medium text-warning">{pendingReviews.length} menunggu moderasi</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Review" value={stats.total.toString()} icon={MessageSquare} />
          <StatCard title="Rating Rata-rata" value={`⭐ ${stats.averageRating}`} icon={Star} />
          <StatCard title="Dipublikasikan" value={stats.published.toString()} icon={ThumbsUp} />
          <StatCard title="Featured" value={stats.featured.toString()} icon={Award} />
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">
            Menunggu ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-card">
            Disetujui ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-card">
            Review Links ({reviewLinks.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
          ) : pendingReviews.length === 0 ? (
            <div className="table-container p-12 text-center">
              <Check size={48} className="mx-auto text-success mb-3" />
              <p className="text-lg font-medium text-foreground">Semua review sudah dimoderasi</p>
              <p className="text-muted-foreground">Tidak ada review yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingReviews.map((review, index) => (
                <div key={review.id} className="table-container p-6 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-ocean flex items-center justify-center text-primary-foreground font-semibold">
                          {review.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{review.customer_name}</p>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} />
                            <span className="text-sm text-muted-foreground">• {formatDate(review.submitted_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-foreground">{review.review_text}</p>
                      {review.reviewLink?.booking && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{review.reviewLink.booking.event_type}</Badge>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {review.reviewLink.booking.booking_code}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9"
                        onClick={() => navigate(`/admin/reviews/${review.id}`)}>
                        <Eye size={16} />
                      </Button>
                      <Button className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleApprove(review.id)}>
                        <Check size={16} className="mr-2" />Setujui
                      </Button>
                      <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleReject(review.id)}>
                        <X size={16} className="mr-2" />Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Approved Tab ── */}
        <TabsContent value="approved" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Cari review..." className="pl-10 bg-card"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-40 bg-card">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rating</SelectItem>
                {[5, 4, 3, 2, 1].map(r => (
                  <SelectItem key={r} value={String(r)}>{r} Bintang</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
          ) : filteredApproved.length === 0 ? (
            <div className="table-container p-12 text-center">
              <Star size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Tidak ada review yang cocok</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApproved.map((review, index) => (
                <div key={review.id} className="table-container p-6 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-ocean flex items-center justify-center text-primary-foreground font-semibold">
                          {review.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{review.customer_name}</p>
                            {review.is_featured && (
                              <Badge className="bg-warning/10 text-warning border-warning/20">Featured</Badge>
                            )}
                            {review.is_published
                              ? <Badge className="bg-success/10 text-success border-success/20">Published</Badge>
                              : <Badge variant="secondary">Unpublished</Badge>
                            }
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} />
                            <span className="text-sm text-muted-foreground">• {formatDate(review.submitted_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-foreground">{review.review_text}</p>
                      {review.admin_reply && (
                        <div className="bg-muted/50 rounded-lg p-3 border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Balasan Admin</p>
                          <p className="text-sm text-foreground">{review.admin_reply}</p>
                        </div>
                      )}
                      {review.reviewLink?.booking && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{review.reviewLink.booking.event_type}</Badge>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {review.reviewLink.booking.booking_code}
                          </code>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      onClick={() => navigate(`/admin/reviews/${review.id}`)}>
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Review Links Tab ── */}
        <TabsContent value="links" className="space-y-4">
          <div className="flex justify-end">
            <CreateReviewLinkDialog onCreated={fetchReviewLinks} />
          </div>

          {isLinksLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
          ) : (
            <div className="table-container">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Booking</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dibuat</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kadaluarsa</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewLinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                          Belum ada review link
                        </td>
                      </tr>
                    ) : reviewLinks.map((link, index) => {
                      const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                      return (
                        <tr key={link.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}>
                          <td className="p-4">
                            <span className="font-mono text-sm">
                              {link.booking?.booking_code || `#${link.booking_id}`}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {link.booking?.customer_name || "-"}
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDate(link.created_at)}</td>
                          <td className="p-4 text-muted-foreground">
                            <span className={cn(isExpired && "text-destructive")}>
                              {formatDate(link.expires_at)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {link.is_used
                                ? <Badge className="bg-success/10 text-success border-success/20">Terisi</Badge>
                                : isExpired
                                  ? <Badge className="bg-destructive/10 text-destructive border-destructive/20">Kadaluarsa</Badge>
                                  : <Badge className="bg-warning/10 text-warning border-warning/20">Belum Terisi</Badge>
                              }
                              {link.sent_at && (
                                <Badge variant="outline" className="text-xs">Terkirim</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!link.is_used && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Copy Link"
                                  onClick={() => handleCopyLink(link.token)}>
                                  <Copy size={15} />
                                </Button>
                              )}
                              {!link.is_used && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Regenerate Token"
                                  onClick={() => handleRegenerateToken(link.id)}>
                                  <RefreshCw size={15} />
                                </Button>
                              )}
                              {!link.is_used && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  title="Hapus" onClick={() => handleDeleteReviewLink(link.id)}>
                                  <Trash2 size={15} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
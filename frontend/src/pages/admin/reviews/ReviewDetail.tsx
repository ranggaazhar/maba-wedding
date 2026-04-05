// src/pages/admin/ReviewDetail.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Check, X, Send, Globe, Award, MessageSquare,
  Calendar, User, Tag, Loader2, Eye, EyeOff, BookmarkCheck, Bookmark, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";
import { reviewApi, type Review } from "@/api/reviewApi";

// ── Helpers ──────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={20}
          className={cn(star <= rating ? "fill-warning text-warning" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);

  // Visibility state (local optimistic)
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  const fetchReview = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await reviewApi.getReviewById(Number(id));
      if (res.success) {
        setReview(res.data);
        setReplyText(res.data.admin_reply || "");
        setIsPublished(res.data.is_published);
        setIsFeatured(res.data.is_featured);
      }
    } catch {
      Swal.fire("Error", "Gagal memuat data review", "error");
      navigate("/admin/reviews");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchReview(); }, [fetchReview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={36} />
      </div>
    );
  }

  if (!review) return null;

  const booking = review.reviewLink?.booking;

  // ── Handlers ─────────────────────────────────────────────

  const handleApprove = async () => {
    try {
      setIsActionLoading(true);
      await reviewApi.moderateReview(review.id, true);
      Swal.fire({ icon: "success", title: "Review disetujui", timer: 1200, showConfirmButton: false });
      fetchReview();
    } catch { Swal.fire("Error", "Gagal menyetujui review", "error"); }
    finally { setIsActionLoading(false); }
  };

  const handleReject = async () => {
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
      setIsActionLoading(true);
      await reviewApi.moderateReview(review.id, false);
      Swal.fire({ icon: "info", title: "Review ditolak", timer: 1200, showConfirmButton: false });
      fetchReview();
    } catch { Swal.fire("Error", "Gagal menolak review", "error"); }
    finally { setIsActionLoading(false); }
  };

  const handleSaveReply = async () => {
    if (!replyText.trim()) return;
    try {
      setIsSavingReply(true);
      await reviewApi.submitReply(review.id, replyText);
      Swal.fire({ icon: "success", title: "Balasan tersimpan", timer: 1200, showConfirmButton: false });
      fetchReview();
    } catch { Swal.fire("Error", "Gagal menyimpan balasan", "error"); }
    finally { setIsSavingReply(false); }
  };

  const handleSaveVisibility = async () => {
    try {
      setIsSavingVisibility(true);

      // Toggle publish jika berubah
      if (isPublished !== review.is_published) {
        await reviewApi.togglePublishStatus(review.id);
      }

      // Toggle featured jika berubah
      if (isFeatured !== review.is_featured) {
        await reviewApi.toggleFeaturedStatus(review.id);
      }

      Swal.fire({ icon: "success", title: "Pengaturan tersimpan", timer: 1200, showConfirmButton: false });
      fetchReview();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan pengaturan";
      Swal.fire("Error", msg, "error");
      // Rollback optimistic
      setIsPublished(review.is_published);
      setIsFeatured(review.is_featured);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Hapus review ini?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await reviewApi.deleteReview(review.id);
      Swal.fire({ icon: "success", title: "Review dihapus", timer: 1200, showConfirmButton: false });
      navigate("/admin/reviews");
    } catch { Swal.fire("Error", "Gagal menghapus review", "error"); }
  };

  const visibilityChanged = isPublished !== review.is_published || isFeatured !== review.is_featured;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/reviews")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="page-title">Detail Review</h1>
          <p className="page-subtitle">Review dari {review.customer_name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!review.is_approved ? (
            <>
              <Button className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={handleApprove} disabled={isActionLoading}>
                {isActionLoading
                  ? <Loader2 size={16} className="animate-spin mr-2" />
                  : <Check size={16} className="mr-2" />}
                Setujui
              </Button>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleReject} disabled={isActionLoading}>
                <X size={16} className="mr-2" />Tolak
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"
              onClick={handleDelete}>
              <Trash2 size={16} className="mr-2" />Hapus
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Review Content */}
          <div className="table-container p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-lg">Ulasan</h2>
              <Badge className={cn(
                review.is_approved
                  ? review.is_published ? "bg-success/10 text-success" : "bg-blue-100 text-blue-700"
                  : "bg-warning/10 text-warning"
              )}>
                {review.is_approved
                  ? review.is_published ? "Dipublikasikan" : "Disetujui"
                  : "Menunggu Moderasi"}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full gradient-ocean flex items-center justify-center text-primary-foreground font-bold text-xl">
                {review.customer_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{review.customer_name}</p>
                <RatingStars rating={review.rating} />
              </div>
              {review.is_featured && (
                <Badge className="ml-auto bg-warning/10 text-warning border-warning/20">
                  ⭐ Featured
                </Badge>
              )}
            </div>

            <Separator />

            <div className="bg-muted/30 rounded-lg p-5">
              <p className="text-foreground leading-relaxed text-base">"{review.review_text}"</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Dikirim: {formatDate(review.submitted_at)}</span>
              </div>
              {review.moderated_at && (
                <div className="flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Dimoderasi: {formatDate(review.moderated_at)}</span>
                </div>
              )}
              {review.replied_at && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  <span>Dibalas: {formatDate(review.replied_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Reply */}
          <div className="table-container p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground text-lg">Balasan Admin</h2>
            </div>

            {review.admin_reply && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <p className="text-sm text-foreground">{review.admin_reply}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Dibalas: {formatDate(review.replied_at)}
                  {review.replier && ` · oleh ${review.replier.name}`}
                </p>
              </div>
            )}

            <Textarea
              placeholder="Tulis balasan untuk review ini..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSaveReply} disabled={!replyText.trim() || isSavingReply}>
              {isSavingReply
                ? <Loader2 size={16} className="animate-spin mr-2" />
                : <Send size={16} className="mr-2" />}
              {review.admin_reply ? "Update Balasan" : "Kirim Balasan"}
            </Button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Event Info */}
          <div className="table-container p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Info Event</h3>
            {booking ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Booking Code</p>
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">{booking.booking_code}</code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tipe Event</p>
                    <p className="text-sm font-medium text-foreground">{booking.event_type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Event</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(booking.event_date).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="text-sm font-medium text-foreground">{booking.event_venue}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => navigate(`/admin/bookings/${booking.id}`)}>
                  Lihat Booking
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada data booking terkait</p>
            )}
          </div>

          {/* Visibility Settings — hanya tampil kalau sudah approved */}
          {review.is_approved && (
            <div className="table-container p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Pengaturan Visibilitas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPublished ? <Eye size={16} className="text-muted-foreground" /> : <EyeOff size={16} className="text-muted-foreground" />}
                    <Label htmlFor="published">Publikasikan</Label>
                  </div>
                  <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
                <p className="text-xs text-muted-foreground -mt-2 ml-6">
                  Tampilkan di halaman ulasan publik
                </p>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFeatured ? <BookmarkCheck size={16} className="text-muted-foreground" /> : <Bookmark size={16} className="text-muted-foreground" />}
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                  <Switch
                    id="featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                    disabled={!isPublished}
                  />
                </div>
                <p className="text-xs text-muted-foreground -mt-2 ml-6">
                  {!isPublished
                    ? "Publikasikan dulu untuk mengaktifkan featured"
                    : "Tampilkan di halaman beranda"}
                </p>
              </div>

              <Button className="w-full" onClick={handleSaveVisibility}
                disabled={!visibilityChanged || isSavingVisibility}>
                {isSavingVisibility
                  ? <Loader2 size={14} className="animate-spin mr-2" />
                  : <Award size={14} className="mr-2" />}
                Simpan Pengaturan
              </Button>
            </div>
          )}

          {/* Moderator Info */}
          {review.moderator && (
            <div className="table-container p-6 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">Info Moderasi</h3>
              <p className="text-xs text-muted-foreground">
                Dimoderasi oleh <span className="font-medium text-foreground">{review.moderator.name}</span>
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(review.moderated_at)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
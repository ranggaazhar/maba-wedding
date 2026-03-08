// src/pages/ReviewForm.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { reviewApi, type ReviewLink } from "@/api/reviewApi";

// ── Star Input ────────────────────────────────────────────────

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  const labels = ["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={40}
              className={`transition-colors ${
                s <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-muted-foreground h-5">
        {labels[hovered || value]}
      </p>
    </div>
  );
}

// ── States ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={36} />
      <p className="text-muted-foreground mt-3 text-sm">Memuat...</p>
    </div>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="text-destructive" size={28} />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-sm">{message}</p>
    </div>
  );
}

function SuccessState({ customerName }: { customerName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle className="text-green-600" size={36} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Terima Kasih! 🎉</h2>
      <p className="text-muted-foreground max-w-sm">
        Halo <span className="font-semibold text-foreground">{customerName}</span>, ulasan Anda telah berhasil dikirim dan sangat berarti bagi kami!
      </p>
      <div className="mt-8 p-4 bg-muted/30 rounded-xl max-w-sm">
        <p className="text-sm text-muted-foreground">
          💍 Terima kasih telah mempercayakan dekorasi kepada <span className="font-medium text-foreground">Maba Wedding Decoration</span>. Semoga acara Anda berjalan lancar!
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function ReviewForm() {
  const { token } = useParams<{ token: string }>();

  const [reviewLink, setReviewLink] = useState<ReviewLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      try {
        const res = await reviewApi.validateReviewLink(token);
        if (res.success) {
          setReviewLink(res.data);
          // Pre-fill nama dari booking
          if (res.data.booking?.customer_name) {
            setCustomerName(res.data.booking.customer_name);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Link tidak valid";
        if (msg.includes("already been used")) {
          setError({ title: "Link Sudah Digunakan", message: "Anda sudah pernah mengisi ulasan menggunakan link ini. Terima kasih!" });
        } else if (msg.includes("expired")) {
          setError({ title: "Link Kadaluarsa", message: "Link ulasan ini sudah tidak aktif. Hubungi kami jika membutuhkan bantuan." });
        } else {
          setError({ title: "Link Tidak Valid", message: "Link ulasan tidak ditemukan atau sudah tidak aktif." });
        }
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async () => {
    setFormError("");

    if (!customerName.trim()) return setFormError("Nama tidak boleh kosong");
    if (rating === 0) return setFormError("Pilih rating bintang terlebih dahulu");
    if (reviewText.trim().length < 10) return setFormError("Ulasan minimal 10 karakter");
    if (!reviewLink) return;

    try {
      setIsSubmitting(true);
      const res = await reviewApi.createReview({
        review_link_id: reviewLink.id,
        customer_name: customerName.trim(),
        rating,
        review_text: reviewText.trim(),
      });

      if (res.success) {
        setIsSubmitted(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulasan";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState title={error.title} message={error.message} />;
  if (isSubmitted) return <SuccessState customerName={customerName} />;
  if (!reviewLink) return null;

  const booking = reviewLink.booking;
  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-";

  const isExpiringSoon = reviewLink.expires_at &&
    new Date(reviewLink.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl gradient-ocean mb-3">
            <span className="text-white font-bold text-xl">WD</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Berikan Ulasan Anda</h1>
          <p className="text-muted-foreground text-sm">
            Pengalaman Anda sangat berarti bagi kami dan calon pelanggan lainnya
          </p>
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon && reviewLink.expires_at && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
            <Clock size={16} />
            Link aktif hingga {formatDate(reviewLink.expires_at)}
          </div>
        )}

        {/* Booking Info */}
        {booking && (
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Detail Acara</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Kode Booking</span>
              <span className="font-medium text-foreground">{booking.booking_code}</span>
              <span className="text-muted-foreground">Jenis Acara</span>
              <span className="font-medium text-foreground">{booking.event_type}</span>
              <span className="text-muted-foreground">Venue</span>
              <span className="font-medium text-foreground">{booking.event_venue}</span>
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium text-foreground">{formatDate(booking.event_date)}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">

          {/* Nama */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nama Anda</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Ulasan <span className="text-muted-foreground font-normal">(min. 10 karakter)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan pengalaman Anda menggunakan jasa dekorasi kami..."
              rows={5}
              className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{reviewText.length} karakter</p>
          </div>

          {/* Error */}
          {formError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
            ) : (
              "Kirim Ulasan ✨"
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          💍 Maba Wedding Decoration · Purworejo, Jawa Tengah
        </p>
      </div>
    </div>
  );
}
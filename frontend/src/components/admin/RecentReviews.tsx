import { Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const reviews = [
  {
    id: 1,
    customer: "Dewi & Andi",
    rating: 5,
    text: "Dekorasi wedding kami sangat indah! Tim sangat profesional dan responsif. Semua tamu kagum dengan dekorasinya.",
    date: "3 hari lalu",
    approved: false,
  },
  {
    id: 2,
    customer: "Rina & Fajar",
    rating: 5,
    text: "Pelayanan luar biasa dari awal konsultasi sampai hari H. Sangat merekomendasikan!",
    date: "5 hari lalu",
    approved: false,
  },
  {
    id: 3,
    customer: "Siti & Ahmad",
    rating: 4,
    text: "Dekorasi sesuai ekspektasi, hanya ada sedikit keterlambatan pengerjaan tapi hasil akhir memuaskan.",
    date: "1 minggu lalu",
    approved: true,
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={cn(
            star <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export function RecentReviews() {
  return (
    <div className="table-container animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Review Terbaru</h3>
            <p className="text-sm text-muted-foreground">Menunggu moderasi</p>
          </div>
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{review.customer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={review.rating} />
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>
              {!review.approved && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success hover:bg-success/10">
                    <Check size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

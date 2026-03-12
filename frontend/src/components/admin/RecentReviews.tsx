// src/components/admin/RecentReviews.tsx
import { Star } from 'lucide-react';
import type { DashboardRecentReview } from '@/types/dashboard.types';

interface Props {
  reviews: DashboardRecentReview[];
  isLoading: boolean;
  formatDate: (s: string) => string;
}

export function RecentReviews({ reviews, isLoading, formatDate }: Props) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-5 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Review Terbaru</h3>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Belum ada review</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm text-foreground">{review.customer_name}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{review.review_text}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(review.submitted_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
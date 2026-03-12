// src/components/admin/RecentBookingsTable.tsx
import { useNavigate } from 'react-router-dom';
import type { DashboardRecentBooking } from '@/types/dashboard.types';

interface Props {
  bookings: DashboardRecentBooking[];
  isLoading: boolean;
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
  paymentStatusLabel: Record<string, { label: string; className: string }>;
}

export function RecentBookingsTable({
  bookings,
  isLoading,
  formatCurrency,
  formatDate,
  paymentStatusLabel,
}: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="h-5 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Booking Terbaru</h3>
        <button
          onClick={() => navigate('/admin/bookings')}
          className="text-sm text-primary hover:underline"
        >
          Lihat Semua →
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Belum ada booking
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-muted-foreground font-medium">Kode</th>
                <th className="pb-2 text-muted-foreground font-medium">Customer</th>
                <th className="pb-2 text-muted-foreground font-medium">Acara</th>
                <th className="pb-2 text-muted-foreground font-medium">DP</th>
                <th className="pb-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const status = paymentStatusLabel[booking.payment_status] ?? {
                  label: booking.payment_status,
                  className: 'bg-gray-100 text-gray-600',
                };
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                  >
                    <td className="py-3 font-mono text-xs text-primary">
                      {booking.booking_code}
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-foreground">{booking.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-foreground">{booking.event_type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(booking.event_date)}</p>
                    </td>
                    <td className="py-3 font-medium text-foreground">
                      {booking.dp_amount ? formatCurrency(booking.dp_amount) : '—'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const bookings = [
  {
    id: "WD-20241208-001",
    customer: "Sarah & Reza",
    date: "15 Jan 2025",
    venue: "Grand Ballroom Hotel",
    status: "confirmed",
    models: ["Wedding Set", "Welcome Gate"],
  },
  {
    id: "WD-20241207-002",
    customer: "Anita & Budi",
    date: "22 Jan 2025",
    venue: "Gedung Serbaguna",
    status: "pending",
    models: ["Set Akad", "Lorong"],
  },
  {
    id: "WD-20241206-003",
    customer: "Maya & Dimas",
    date: "28 Jan 2025",
    venue: "The Garden Venue",
    status: "confirmed",
    models: ["Wedding Set", "Reception", "Photo Booth"],
  },
  {
    id: "WD-20241205-004",
    customer: "Lisa & Anton",
    date: "5 Feb 2025",
    venue: "Beach Resort",
    status: "pending",
    models: ["Rustic Wedding"],
  },
];

const statusStyles = {
  confirmed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function RecentBookingsTable() {
  return (
    <div className="table-container animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Booking Terbaru</h3>
            <p className="text-sm text-muted-foreground">Daftar booking yang masuk</p>
          </div>
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kode</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tanggal</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venue</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Model</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-sm text-foreground">{booking.id}</span>
                </td>
                <td className="p-4">
                  <span className="font-medium text-foreground">{booking.customer}</span>
                </td>
                <td className="p-4 text-muted-foreground">{booking.date}</td>
                <td className="p-4 text-muted-foreground">{booking.venue}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {booking.models.slice(0, 2).map((model) => (
                      <Badge key={model} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {booking.models.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{booking.models.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={statusStyles[booking.status as keyof typeof statusStyles]}>
                    {booking.status === "confirmed" ? "Dikonfirmasi" : "Menunggu"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye size={14} className="mr-2" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem>Konfirmasi</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Batalkan</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useInvoices } from '@/hooks/Admin/invoices/useInvoices';
import { Plus, Search, Eye, Edit, Trash2, FileText, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { InvoiceStatus } from '@/types/invoice.types';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  DRAFT:   { label: 'Draft',     className: 'bg-muted text-muted-foreground border-border' },
  SENT:    { label: 'Terkirim',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  PAID:    { label: 'Lunas',     className: 'bg-green-100 text-green-700 border-green-200' },
  OVERDUE: { label: 'Terlambat', className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function Invoices() {
  const {
    invoices, stats, isLoading,
    search, setSearch,
    statusFilter, setStatusFilter,
    deleteId, setDeleteId,
    isDeleting, navigate,
    handleDelete,
  } = useInvoices();


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Invoice</h1>
          <p className="page-subtitle">Kelola invoice dan tagihan pelanggan</p>
        </div>
        <Button className="gradient-ocean text-primary-foreground" onClick={() => navigate("/invoices/new")}>
          <Plus size={18} className="mr-2" />
          Buat Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari invoice atau nama customer..."
            className="pl-10 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-44 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Terkirim</SelectItem>
            <SelectItem value="PAID">Lunas</SelectItem>
            <SelectItem value="OVERDUE">Terlambat</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter size={18} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Invoice</p>
          <p className="text-2xl font-bold text-foreground">{stats?.total ?? "-"}</p>
          <p className="text-xs text-muted-foreground mt-1">Bulan ini: {stats?.thisMonth ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Nilai</p>
          <p className="text-xl font-bold text-foreground">
            {stats ? formatCurrency(parseFloat(stats.totalAmount)) : "-"}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Sudah Lunas</p>
          <p className="text-2xl font-bold text-green-600">{stats?.paid ?? "-"}</p>
          <p className="text-xs text-muted-foreground mt-1">invoice</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
          <p className="text-xl font-bold text-destructive">
            {stats ? formatCurrency(parseFloat(stats.remainingAmount)) : "-"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={40} className="text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada invoice</p>
            <Button variant="outline" onClick={() => navigate("/invoices/new")}>
              <Plus size={16} className="mr-2" /> Buat Invoice
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">No. Invoice</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acara</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tgl Acara</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Sisa</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => {
                  const remaining = inv.total - inv.down_payment;
                  const cfg = statusConfig[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {inv.invoice_number}
                        </span>
                        {inv.booking && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inv.booking.booking_code}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{inv.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{inv.customer_phone}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{inv.event_type || "-"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[160px]">{inv.event_venue}</p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(inv.event_date)}
                      </td>
                      <td className="p-4 text-right font-medium text-foreground whitespace-nowrap">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="p-4 text-right text-sm whitespace-nowrap">
                        {inv.status === "PAID" ? (
                          <span className="text-green-600 font-medium">Lunas</span>
                        ) : (
                          <span className="text-destructive">{formatCurrency(remaining)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={cfg.className}>{cfg.label}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="Lihat Detail"
                            onClick={() => navigate(`/invoices/${inv.id}`)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="Edit"
                            onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                            disabled={inv.status === "PAID"}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Hapus"
                            onClick={() => setDeleteId(inv.id)}
                            disabled={inv.status === "PAID"}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Invoice</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus invoice ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
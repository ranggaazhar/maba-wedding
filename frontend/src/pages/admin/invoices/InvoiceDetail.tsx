import { useInvoiceDetail } from '@/hooks/Admin/invoices/useInvoiceDetail';
import {
  ArrowLeft, Edit, Download, Send, FileText, CheckCircle,
  AlertTriangle, Loader2, Clock, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { InvoiceStatus, InvoiceItem } from '@/types/invoice.types';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const statusConfig: Record<InvoiceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT:   { label: 'Draft',     className: 'bg-muted text-muted-foreground border-border',    icon: <Clock size={14} /> },
  SENT:    { label: 'Terkirim',  className: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <Send size={14} /> },
  PAID:    { label: 'Lunas',     className: 'bg-green-100 text-green-700 border-green-200',    icon: <CheckCircle size={14} /> },
  OVERDUE: { label: 'Terlambat', className: 'bg-red-100 text-red-700 border-red-200',          icon: <AlertTriangle size={14} /> },
};

const itemTypeLabel: Record<string, { label: string; className: string }> = {
  item:       { label: 'Item',    className: 'text-foreground' },
  discount:   { label: 'Diskon',  className: 'text-green-600' },
  penalty:    { label: 'Denda',   className: 'text-red-600' },
  adjustment: { label: 'Koreksi', className: 'text-orange-500' },
};

export default function InvoiceDetail() {
  const {
    id, invoice, isLoading,
    adminNotes, setAdminNotes,
    isSavingNotes, isActionLoading,
    calculatedTotal, navigate,
    handleSendWhatsapp, handleMarkAsPaid,
    handleMarkAsOverdue, handleSaveNotes,
  } = useInvoiceDetail();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={36} />
      </div>
    );
  }

  if (!invoice) return null;

  const remaining = invoice.total - invoice.down_payment;
  const cfg = statusConfig[invoice.status];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{invoice.invoice_number}</h1>
            <Badge className={`${cfg.className} flex items-center gap-1`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>
          <p className="page-subtitle">
            Dibuat: {formatDate(invoice.created_at)} · Jatuh tempo: {formatDate(invoice.due_date)}
            {invoice.paid_at && ` · Lunas: ${formatDate(invoice.paid_at)}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'PAID' && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/${id}/edit`)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          )}
          {invoice.pdf_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download size={16} className="mr-2" />
                PDF
              </a>
            </Button>
          )}
          {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
            <Button
              size="sm"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white"
              onClick={handleSendWhatsapp}
              disabled={isActionLoading}
            >
              {isActionLoading
                ? <Loader2 size={16} className="animate-spin mr-2" />
                : <MessageCircle size={16} className="mr-2" />
              }
              {invoice.status === 'DRAFT' ? 'Kirim ke Customer' : 'Kirim Ulang WA'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — Invoice Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-8 shadow-card">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg gradient-ocean flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">WD</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">Maba Wedding Decor</span>
                </div>
                <p className="text-sm text-muted-foreground">Purworejo, Jawa Tengah</p>
                <p className="text-sm text-muted-foreground">WA: 081215061622</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
                <p className="font-mono text-muted-foreground">{invoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground mt-1">Tgl: {formatDate(invoice.issue_date)}</p>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Customer & Event */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tagihan Kepada</p>
                <p className="font-semibold text-foreground">{invoice.customer_name}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                {invoice.customer_address && (
                  <p className="text-sm text-muted-foreground">{invoice.customer_address}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Detail Acara</p>
                <p className="font-semibold text-foreground">{invoice.event_type || '-'}</p>
                <p className="text-sm text-muted-foreground">{invoice.event_venue}</p>
                <p className="text-sm text-muted-foreground">Tanggal: {formatDate(invoice.event_date)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-lg border border-border overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">No</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tipe</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Harga</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: InvoiceItem, idx: number) => {
                    const typeInfo = itemTypeLabel[item.item_type] ?? itemTypeLabel.item;
                    const isDiscount = item.item_type === 'discount';
                    return (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-3 text-sm text-muted-foreground">{idx + 1}</td>
                        <td className="p-3">
                          <p className="text-sm font-medium text-foreground">{item.item_name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium ${typeInfo.className}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm text-foreground">{item.quantity}</td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className={`p-3 text-right text-sm font-medium ${isDiscount ? 'text-green-600' : 'text-foreground'}`}>
                          {isDiscount ? '- ' : ''}{formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tagihan</span>
                  <span className="text-foreground">{formatCurrency(calculatedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">DP Dibayar (10%)</span>
                  <span className="text-foreground">- {formatCurrency(invoice.down_payment)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Sisa Pembayaran</span>
                  <span className={invoice.status === 'PAID' ? 'text-green-600' : 'text-foreground'}>
                    {invoice.status === 'PAID' ? 'Lunas' : formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Catatan</p>
                <p className="text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}
            {invoice.payment_terms && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Syarat Pembayaran</p>
                <p className="text-sm text-foreground whitespace-pre-line">{invoice.payment_terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Ringkasan Pembayaran</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="font-medium text-foreground">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DP Dibayar</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.down_payment)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Sisa</span>
                <span className={`font-bold text-lg ${invoice.status === 'PAID' ? 'text-green-600' : 'text-destructive'}`}>
                  {invoice.status === 'PAID' ? '✓ Lunas' : formatCurrency(remaining)}
                </span>
              </div>
            </div>

            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={handleMarkAsPaid}
                disabled={isActionLoading}
              >
                {isActionLoading
                  ? <Loader2 size={16} className="animate-spin mr-2" />
                  : <CheckCircle size={16} className="mr-2" />
                }
                Tandai Lunas
              </Button>
            )}
            {invoice.status === 'SENT' && (
              <Button
                variant="outline" size="sm"
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={handleMarkAsOverdue}
                disabled={isActionLoading}
              >
                <AlertTriangle size={16} className="mr-2" />
                Tandai Terlambat
              </Button>
            )}
          </div>

          {/* Booking Terkait */}
          {invoice.booking && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground">Booking Terkait</h3>
              <Button
                variant="outline" className="w-full justify-start"
                onClick={() => navigate(`/bookings/${invoice.booking!.id}`)}
              >
                <FileText size={16} className="mr-2" />
                {invoice.booking.booking_code}
              </Button>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Catatan Admin</h3>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Tambah catatan internal..."
              className="min-h-[100px] bg-muted/30"
            />
            <Button
              variant="outline" size="sm" className="w-full"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
            >
              {isSavingNotes && <Loader2 size={14} className="animate-spin mr-2" />}
              Simpan Catatan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceApi } from '@/api/InvoiceApi';
import type { Invoice } from '@/types/invoice.types';
import Swal from 'sweetalert2';
import axios from 'axios';

export function useInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await invoiceApi.getInvoiceById(Number(id));
      if (res.success) {
        setInvoice(res.data);
        setAdminNotes(res.data.admin_notes || '');
      }
    } catch {
      Swal.fire('Error', 'Gagal memuat data invoice', 'error');
      navigate('/invoices');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const handleSendWhatsapp = async () => {
    if (!invoice) return;
    const confirm = await Swal.fire({
      title: 'Kirim Invoice via WhatsApp?',
      html: `
        <p>Invoice akan dikirim ke:</p>
        <p class="font-bold text-lg mt-1">${invoice.customer_name}</p>
        <p class="text-muted-foreground">${invoice.customer_phone}</p>
        <p class="mt-2 text-sm">PDF invoice akan digenerate otomatis dan link-nya dikirim via WA.</p>
        ${invoice.status === 'DRAFT' ? '<p class="text-blue-600 text-sm mt-1">Status invoice akan otomatis berubah ke <b>Terkirim</b>.</p>' : ''}
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Kirim WA',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#25D366',
    });
    if (!confirm.isConfirmed) return;

    try {
      setIsActionLoading(true);
      const res = await invoiceApi.sendInvoiceWhatsapp(invoice.id);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Invoice Terkirim!',
          html: `<p>Invoice berhasil dikirim ke WhatsApp customer.</p>
            ${res.data?.pdf_url ? `<p class="mt-2"><a href="${res.data.pdf_url}" target="_blank" class="text-blue-600 underline">Lihat PDF Invoice</a></p>` : ''}`,
          timer: 3000,
          showConfirmButton: false,
        });
        fetchInvoice();
      } else {
        Swal.fire('Peringatan', res.message || 'PDF dibuat tapi WA gagal dikirim', 'warning');
        fetchInvoice();
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : err instanceof Error ? err.message : 'Gagal mengirim invoice';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    const confirm = await Swal.fire({
      title: 'Tandai Lunas?',
      text: 'Konfirmasi bahwa customer sudah melakukan pelunasan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tandai Lunas',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;

    try {
      setIsActionLoading(true);
      const res = await invoiceApi.markAsPaid(invoice.id);
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Invoice Lunas!', timer: 1500, showConfirmButton: false });
        fetchInvoice();
      }
    } catch {
      Swal.fire('Error', 'Gagal menandai invoice sebagai lunas', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAsOverdue = async () => {
    if (!invoice) return;
    try {
      setIsActionLoading(true);
      await invoiceApi.markAsOverdue(invoice.id);
      Swal.fire({ icon: 'warning', title: 'Ditandai Terlambat', timer: 1500, showConfirmButton: false });
      fetchInvoice();
    } catch {
      Swal.fire('Error', 'Gagal mengubah status', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!invoice) return;
    try {
      setIsSavingNotes(true);
      await invoiceApi.updateInvoice(invoice.id, { admin_notes: adminNotes });
      Swal.fire({ icon: 'success', title: 'Catatan tersimpan', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Gagal menyimpan catatan', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const calculatedTotal = invoice?.items?.reduce((sum, item) => {
    const sub = parseFloat(String(item.subtotal));
    return item.item_type === 'discount' ? sum - sub : sum + sub;
  }, 0) ?? invoice?.total ?? 0;

  return {
    id, invoice, isLoading,
    adminNotes, setAdminNotes,
    isSavingNotes, isActionLoading,
    calculatedTotal, navigate,
    handleSendWhatsapp, handleMarkAsPaid, handleMarkAsOverdue, handleSaveNotes,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '@/api/InvoiceApi';
import type { Invoice, InvoiceStatus, InvoiceStatistics } from '@/types/invoice.types';
import Swal from 'sweetalert2';

export function useInvoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [invRes, statsRes] = await Promise.all([
        invoiceApi.getAllInvoices({
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter as InvoiceStatus : undefined,
          include_booking: true,
        }),
        invoiceApi.getStatistics(),
      ]);
      if (invRes.success) setInvoices(invRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      Swal.fire('Error', 'Gagal memuat data invoice', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await invoiceApi.deleteInvoice(deleteId);
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Invoice berhasil dihapus', timer: 1500, showConfirmButton: false });
        setDeleteId(null);
        fetchData();
      }
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Gagal menghapus invoice', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    invoices, stats, isLoading,
    search, setSearch,
    statusFilter, setStatusFilter,
    deleteId, setDeleteId,
    isDeleting, navigate,
    handleDelete,
  };
}
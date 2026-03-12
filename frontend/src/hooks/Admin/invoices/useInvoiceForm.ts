import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceApi } from '@/api/InvoiceApi';
import { bookingApi } from '@/api/bookingApi';
import type { ItemRow } from '@/types/invoice.types';
import type { Booking } from '@/types/booking.types';
import Swal from 'sweetalert2';

export const defaultPaymentTerms = `DP 10% saat konfirmasi booking.
Pelunasan paling lambat H-7 sebelum hari acara.
Pembatalan setelah DP tidak dapat di-refund.`;

const defaultItem = (): ItemRow => ({
  _tempId: Date.now(),
  item_name: '', item_type: 'item', description: '',
  quantity: 1, unit_price: 0, subtotal: 0,
});

export function useInvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingPopoverOpen, setBookingPopoverOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoadingFromBooking, setIsLoadingFromBooking] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [downPayment, setDownPayment] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState(defaultPaymentTerms);
  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ _tempId: 1, item_name: '', item_type: 'item', description: '', quantity: 1, unit_price: 0, subtotal: 0 }]);

  // Fetch bookings (hanya mode create)
  useEffect(() => {
    if (isEdit) return;
    const fetch_ = async () => {
      try {
        setIsLoadingBookings(true);
        const res = await bookingApi.getAllBookings({ payment_status: 'CONFIRMED' });
        if (res.success) setBookings(res.data || []);
      } catch {
        console.error('Gagal memuat data booking');
      } finally {
        setIsLoadingBookings(false);
      }
    };
    fetch_();
  }, [isEdit]);

  // Load invoice untuk edit
  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        const res = await invoiceApi.getInvoiceById(Number(id));
        if (res.success) {
          const inv = res.data;
          setCustomerName(inv.customer_name || '');
          setCustomerPhone(inv.customer_phone || '');
          setCustomerAddress(inv.customer_address || '');
          setEventVenue(inv.event_venue || '');
          setEventType(inv.event_type || '');
          setEventDate(inv.event_date || '');
          setIssueDate(inv.issue_date || new Date().toISOString().split('T')[0]);
          setDueDate(inv.due_date || '');
          setDownPayment(Number(inv.down_payment) || 0);
          setPaymentTerms(inv.payment_terms || defaultPaymentTerms);
          setNotes(inv.notes || '');
          setAdminNotes(inv.admin_notes || '');
          setBookingId(inv.booking_id ? String(inv.booking_id) : '');
          if (inv.items?.length > 0) {
            setItems(inv.items.map((item: ItemRow & { id: number }, i: number) => ({
              _tempId: item.id || i,
              item_name: item.item_name,
              item_type: item.item_type || 'item',
              description: item.description || '',
              quantity: item.quantity || 1,
              unit_price: Number(item.unit_price) || 0,
              subtotal: Number(item.subtotal) || 0,
              display_order: i,
            })));
          }
        }
      } catch {
        Swal.fire('Error', 'Gagal memuat data invoice', 'error');
        navigate('/invoices');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const handleSelectBooking = async (booking: Booking) => {
    setBookingPopoverOpen(false);
    setSelectedBooking(booking);
    try {
      setIsLoadingFromBooking(true);
      const res = await bookingApi.getBookingById(booking.id);
      if (!res.success) return;
      const detail: Booking = res.data;

      setCustomerName(detail.customer_name || '');
      setCustomerPhone(detail.customer_phone || '');
      setCustomerAddress(detail.full_address || '');
      setEventVenue(detail.event_venue || '');
      setEventType(detail.event_type || '');
      setEventDate(detail.event_date || '');
      setBookingId(String(detail.id));
      setDownPayment(parseFloat(detail.dp_amount || '0'));

      if (detail.event_date) {
        const due = new Date(detail.event_date);
        due.setDate(due.getDate() - 7);
        setDueDate(due.toISOString().split('T')[0]);
      }

      const newItems: ItemRow[] = [];
      let order = 0;
      for (const model of detail.models || []) {
        const price = parseFloat(model.price || '0');
        newItems.push({ _tempId: Date.now() + order, item_name: model.project_title, item_type: 'item', description: model.notes || '', quantity: 1, unit_price: price, subtotal: price, display_order: order++ });
      }
      for (const prop of detail.properties || []) {
        const subtotal = parseFloat(prop.subtotal || '0');
        newItems.push({ _tempId: Date.now() + order, item_name: prop.property_name, item_type: 'item', description: `Kategori: ${prop.property_category}`, quantity: prop.quantity, unit_price: parseFloat(prop.price || '0'), subtotal, display_order: order++ });
      }
      if (newItems.length > 0) setItems(newItems);

      Swal.fire({ icon: 'success', title: 'Data berhasil diisi!', text: `Invoice otomatis diisi dari booking ${booking.booking_code}`, timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Gagal mengambil detail booking', 'error');
    } finally {
      setIsLoadingFromBooking(false);
    }
  };

  const handleClearBooking = () => {
    setSelectedBooking(null);
    setBookingId('');
    setCustomerName(''); setCustomerPhone(''); setCustomerAddress('');
    setEventVenue(''); setEventType(''); setEventDate(''); setDueDate('');
    setDownPayment(0);
    setItems([{ ...defaultItem(), _tempId: 1 }]);
  };

  const addItem = () => setItems(prev => [...prev, defaultItem()]);

  const removeItem = (_tempId: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i._tempId !== _tempId));
  };

  const updateItem = (_tempId: number, field: keyof ItemRow, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item._tempId !== _tempId) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.subtotal = Number(updated.quantity) * Number(updated.unit_price);
      }
      return updated;
    }));
  };

  const calculatedTotal = items.reduce((sum, item) => {
    const sub = Number(item.subtotal);
    return item.item_type === 'discount' ? sum - sub : sum + sub;
  }, 0);

  const dpPercentage = calculatedTotal > 0
    ? ((downPayment / calculatedTotal) * 100).toFixed(1) : '0';

  const handleRecalculate = async () => {
    if (!isEdit || !id) return;
    try {
      setIsRecalculating(true);
      await invoiceApi.recalculateTotal(Number(id));
      Swal.fire({ icon: 'success', title: 'Total diperbarui', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Gagal menghitung ulang total', 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !eventVenue || !eventDate || !dueDate) {
      Swal.fire('Validasi', 'Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }
    if (items.some(i => !i.item_name || !i.unit_price)) {
      Swal.fire('Validasi', 'Mohon lengkapi nama dan harga semua item', 'warning');
      return;
    }

    const payload = {
      booking_id: bookingId ? Number(bookingId) : undefined,
      customer_name: customerName, customer_phone: customerPhone,
      customer_address: customerAddress || undefined,
      event_venue: eventVenue, event_type: eventType || undefined,
      event_date: eventDate, issue_date: issueDate, due_date: dueDate,
      total: Math.max(0, calculatedTotal), down_payment: downPayment,
      payment_terms: paymentTerms || undefined,
      notes: notes || undefined, admin_notes: adminNotes || undefined,
      items: items.map((item, i) => ({
        item_name: item.item_name, item_type: item.item_type || 'item',
        description: item.description || undefined,
        quantity: item.quantity, unit_price: item.unit_price,
        subtotal: item.subtotal, display_order: i,
      })),
    };

    try {
      setIsSubmitting(true);
      const res = isEdit
        ? await invoiceApi.updateInvoice(Number(id), payload)
        : await invoiceApi.createInvoice(payload);
      if (res.success) {
        Swal.fire({ icon: 'success', title: isEdit ? 'Invoice diperbarui!' : 'Invoice berhasil dibuat!', timer: 1500, showConfirmButton: false });
        navigate(`/invoices/${res.data.id}`);
      }
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Gagal menyimpan invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEdit, isLoading, isSubmitting, isRecalculating,
    bookings, isLoadingBookings, bookingPopoverOpen, setBookingPopoverOpen,
    selectedBooking, isLoadingFromBooking,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress,
    eventVenue, setEventVenue,
    eventType, setEventType,
    eventDate, setEventDate,
    issueDate, setIssueDate,
    dueDate, setDueDate,
    downPayment, setDownPayment,
    paymentTerms, setPaymentTerms,
    notes, setNotes,
    adminNotes, setAdminNotes,
    bookingId, setBookingId,
    items, calculatedTotal, dpPercentage,
    navigate,
    handleSelectBooking, handleClearBooking,
    addItem, removeItem, updateItem,
    handleRecalculate, handleSubmit,
  };
}
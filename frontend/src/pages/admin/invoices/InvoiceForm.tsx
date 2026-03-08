// src/pages/admin/invoices/InvoiceForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2, RefreshCw, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import Swal from "sweetalert2";
import {
  invoiceApi,
  type CreateInvoiceItemData,
  type InvoiceItemType,
} from "@/api/InvoiceApi";
import { bookingApi, type Booking } from "@/api/bookingApi";

// ── Types ─────────────────────────────────────────────────────

interface ItemRow extends Omit<CreateInvoiceItemData, 'subtotal'> {
  _tempId: number;
  subtotal: number;
}

const itemTypeOptions: { value: InvoiceItemType; label: string; description: string }[] = [
  { value: "item",       label: "Item",    description: "Item dekorasi / jasa normal" },
  { value: "discount",   label: "Diskon",  description: "Potongan / diskon harga" },
  { value: "penalty",    label: "Denda",   description: "Denda kerusakan / penggantian" },
  { value: "adjustment", label: "Koreksi", description: "Koreksi harga manual" },
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

const defaultPaymentTerms = `DP 10% saat konfirmasi booking.
Pelunasan paling lambat H-7 sebelum hari acara.
Pembatalan setelah DP tidak dapat di-refund.`;

// ── Component ────────────────────────────────────────────────

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading]         = useState(isEdit);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // ── Booking dropdown state ───────────────────────────────────
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingPopoverOpen, setBookingPopoverOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoadingFromBooking, setIsLoadingFromBooking] = useState(false);

  // ── Form fields ──────────────────────────────────────────────
  const [customerName, setCustomerName]       = useState("");
  const [customerPhone, setCustomerPhone]     = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [eventVenue, setEventVenue]           = useState("");
  const [eventType, setEventType]             = useState("");
  const [eventDate, setEventDate]             = useState("");
  const [issueDate, setIssueDate]             = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate]                 = useState("");
  const [downPayment, setDownPayment]         = useState(0);
  const [paymentTerms, setPaymentTerms]       = useState(defaultPaymentTerms);
  const [notes, setNotes]                     = useState("");
  const [adminNotes, setAdminNotes]           = useState("");
  const [bookingId, setBookingId]             = useState<string>("");

  const [items, setItems] = useState<ItemRow[]>([
    { _tempId: 1, item_name: "", item_type: "item", description: "", quantity: 1, unit_price: 0, subtotal: 0 }
  ]);

  // ── Fetch confirmed bookings ─────────────────────────────────
  useEffect(() => {
    if (isEdit) return; // mode edit tidak perlu dropdown booking
    const fetchBookings = async () => {
      try {
        setIsLoadingBookings(true);
        const res = await bookingApi.getAllBookings({
          payment_status: "CONFIRMED",
        });
        if (res.success) setBookings(res.data || []);
      } catch {
        console.error("Gagal memuat data booking");
      } finally {
        setIsLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [isEdit]);

  // ── Auto-fill from booking ───────────────────────────────────
  const handleSelectBooking = async (booking: Booking) => {
    setBookingPopoverOpen(false);
    setSelectedBooking(booking);

    try {
      setIsLoadingFromBooking(true);

      // Fetch detail booking supaya ada models & properties
      const res = await bookingApi.getBookingById(booking.id);
      console.log("RAW detail:", res.data); 
      if (!res.success) return;
      const detail: Booking = res.data;

      // Auto-fill data customer & acara
      setCustomerName(detail.customer_name || "");
      setCustomerPhone(detail.customer_phone || "");
      setCustomerAddress(detail.full_address || "");
      setEventVenue(detail.event_venue || "");
      setEventType(detail.event_type || "");
      setEventDate(detail.event_date || "");
      setBookingId(String(detail.id));

      // Set due_date = H-7 dari event_date
      if (detail.event_date) {
        const due = new Date(detail.event_date);
        due.setDate(due.getDate() - 7);
        setDueDate(due.toISOString().split("T")[0]);
      }

      // Set DP dari booking
      const dp = parseFloat(detail.dp_amount || "0");
      setDownPayment(dp);

      // Build items dari models + properties booking
      const newItems: ItemRow[] = [];
      let order = 0;

      for (const model of detail.models || []) {
        const price = parseFloat(model.price || "0");
        newItems.push({
          _tempId: Date.now() + order,
          item_name: model.project_title,
          item_type: "item",
          description: model.notes || "",
          quantity: 1,
          unit_price: price,
          subtotal: price,
          display_order: order++,
        });
      }

      for (const prop of detail.properties || []) {
        const subtotal = parseFloat(prop.subtotal || "0");
        const unitPrice = parseFloat(prop.price || "0");
        newItems.push({
          _tempId: Date.now() + order,
          item_name: prop.property_name,
          item_type: "item",
          description: `Kategori: ${prop.property_category}`,
          quantity: prop.quantity,
          unit_price: unitPrice,
          subtotal: subtotal,
          display_order: order++,
        });
      }

      if (newItems.length > 0) {
        setItems(newItems);
      }

      Swal.fire({
        icon: "success",
        title: "Data berhasil diisi!",
        text: `Invoice otomatis diisi dari booking ${booking.booking_code}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Gagal mengambil detail booking", "error");
    } finally {
      setIsLoadingFromBooking(false);
    }
  };

  const handleClearBooking = () => {
    setSelectedBooking(null);
    setBookingId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setEventVenue("");
    setEventType("");
    setEventDate("");
    setDueDate("");
    setDownPayment(0);
    setItems([{ _tempId: 1, item_name: "", item_type: "item", description: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
  };

  // ── Load invoice for edit ────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        const res = await invoiceApi.getInvoiceById(Number(id));
        if (res.success) {
          const inv = res.data;
          setCustomerName(inv.customer_name || "");
          setCustomerPhone(inv.customer_phone || "");
          setCustomerAddress(inv.customer_address || "");
          setEventVenue(inv.event_venue || "");
          setEventType(inv.event_type || "");
          setEventDate(inv.event_date || "");
          setIssueDate(inv.issue_date || new Date().toISOString().split("T")[0]);
          setDueDate(inv.due_date || "");
          setDownPayment(Number(inv.down_payment) || 0);
          setPaymentTerms(inv.payment_terms || defaultPaymentTerms);
          setNotes(inv.notes || "");
          setAdminNotes(inv.admin_notes || "");
          setBookingId(inv.booking_id ? String(inv.booking_id) : "");

          if (inv.items?.length > 0) {
            setItems(inv.items.map((item: ItemRow & { id: number }, i: number) => ({
              _tempId: item.id || i,
              item_name: item.item_name,
              item_type: item.item_type || "item",
              description: item.description || "",
              quantity: item.quantity || 1,
              unit_price: Number(item.unit_price) || 0,
              subtotal: Number(item.subtotal) || 0,
              display_order: i,
            })));
          }
        }
      } catch {
        Swal.fire("Error", "Gagal memuat data invoice", "error");
        navigate("/invoices");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  // ── Item handlers ────────────────────────────────────────────

  const addItem = () => {
    setItems(prev => [...prev, {
      _tempId: Date.now(),
      item_name: "", item_type: "item", description: "",
      quantity: 1, unit_price: 0, subtotal: 0
    }]);
  };

  const removeItem = (_tempId: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i._tempId !== _tempId));
  };

  const updateItem = (_tempId: number, field: keyof ItemRow, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item._tempId !== _tempId) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "unit_price") {
        updated.subtotal = Number(updated.quantity) * Number(updated.unit_price);
      }
      return updated;
    }));
  };

  // ── Total calculation ────────────────────────────────────────

  const calculatedTotal = items.reduce((sum, item) => {
    const sub = Number(item.subtotal);
    return item.item_type === "discount" ? sum - sub : sum + sub;
  }, 0);

  const dpPercentage = calculatedTotal > 0
    ? ((downPayment / calculatedTotal) * 100).toFixed(1)
    : "0";

  // ── Recalculate ──────────────────────────────────────────────

  const handleRecalculate = async () => {
    if (!isEdit || !id) return;
    try {
      setIsRecalculating(true);
      await invoiceApi.recalculateTotal(Number(id));
      Swal.fire({ icon: "success", title: "Total diperbarui", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Gagal menghitung ulang total", "error");
    } finally {
      setIsRecalculating(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !eventVenue || !eventDate || !dueDate) {
      Swal.fire("Validasi", "Mohon lengkapi semua field yang wajib diisi", "warning");
      return;
    }
    if (items.some(i => !i.item_name || !i.unit_price)) {
      Swal.fire("Validasi", "Mohon lengkapi nama dan harga semua item", "warning");
      return;
    }

    const payload = {
      booking_id:       bookingId ? Number(bookingId) : undefined,
      customer_name:    customerName,
      customer_phone:   customerPhone,
      customer_address: customerAddress || undefined,
      event_venue:      eventVenue,
      event_type:       eventType || undefined,
      event_date:       eventDate,
      issue_date:       issueDate,
      due_date:         dueDate,
      total:            Math.max(0, calculatedTotal),
      down_payment:     downPayment,
      payment_terms:    paymentTerms || undefined,
      notes:            notes || undefined,
      admin_notes:      adminNotes || undefined,
      items: items.map((item, i) => ({
        item_name:     item.item_name,
        item_type:     item.item_type || "item",
        description:   item.description || undefined,
        quantity:      item.quantity,
        unit_price:    item.unit_price,
        subtotal:      item.subtotal,
        display_order: i,
      })),
    };

    try {
      setIsSubmitting(true);
      const res = isEdit
        ? await invoiceApi.updateInvoice(Number(id), payload)
        : await invoiceApi.createInvoice(payload);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: isEdit ? "Invoice diperbarui!" : "Invoice berhasil dibuat!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/invoices/${res.data.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan invoice";
      Swal.fire("Error", msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="page-title">{isEdit ? "Edit Invoice" : "Buat Invoice Baru"}</h1>
          <p className="page-subtitle">{isEdit ? "Perbarui data invoice" : "Isi detail invoice untuk pelanggan"}</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Booking Dropdown (hanya di mode create) ── */}
        {!isEdit && (
          <div className="bg-card rounded-xl border border-primary/30 p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground text-lg">Isi dari Booking</h2>
              <Badge variant="outline" className="text-xs">Opsional</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Pilih booking yang sudah dikonfirmasi untuk mengisi form secara otomatis.
            </p>

            {selectedBooking ? (
              /* Booking sudah dipilih */
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <p className="font-medium text-foreground">{selectedBooking.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.booking_code} · {selectedBooking.event_venue}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingFromBooking && <Loader2 size={16} className="animate-spin text-primary" />}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleClearBooking}>
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              /* Dropdown pilih booking */
              <Popover open={bookingPopoverOpen} onOpenChange={setBookingPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled={isLoadingBookings}>
                    {isLoadingBookings
                      ? <><Loader2 size={16} className="animate-spin mr-2" /> Memuat booking...</>
                      : <><BookOpen size={16} className="mr-2" /> Pilih booking...</>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari nama customer atau kode booking..." />
                    <CommandList>
                      <CommandEmpty>
                        {bookings.length === 0
                          ? "Tidak ada booking confirmed yang belum dibuatkan invoice."
                          : "Booking tidak ditemukan."}
                      </CommandEmpty>
                      <CommandGroup heading={`${bookings.length} booking tersedia`}>
                        {bookings.map(b => (
                          <CommandItem
                            key={b.id}
                            value={`${b.customer_name} ${b.booking_code} ${b.event_venue}`}
                            onSelect={() => handleSelectBooking(b)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col py-1 w-full">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{b.customer_name}</span>
                                <span className="text-xs font-mono text-muted-foreground">{b.booking_code}</span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs text-muted-foreground truncate max-w-[280px]">{b.event_venue}</span>
                                <span className="text-xs text-muted-foreground">{b.event_date}</span>
                              </div>
                              {b.total_estimate && (
                                <span className="text-xs text-primary mt-0.5">
                                  {formatCurrency(parseFloat(b.total_estimate))}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Informasi Pelanggan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Customer <span className="text-destructive">*</span></Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Nama lengkap" className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon <span className="text-destructive">*</span></Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx" className="bg-muted/30" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Alamat</Label>
              <Textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                placeholder="Alamat lengkap customer" className="bg-muted/30" />
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Detail Acara</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Venue Acara <span className="text-destructive">*</span></Label>
              <Input value={eventVenue} onChange={e => setEventVenue(e.target.value)}
                placeholder="Nama venue / lokasi" className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label>Jenis Acara</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Pilih jenis acara" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wedding Reception">Wedding Reception</SelectItem>
                  <SelectItem value="Akad Nikah">Akad Nikah</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Birthday">Birthday</SelectItem>
                  <SelectItem value="Other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Acara <span className="text-destructive">*</span></Label>
              <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label>Booking ID</Label>
              <Input
                type="number" placeholder="Otomatis dari dropdown"
                value={bookingId} onChange={e => setBookingId(e.target.value)}
                className="bg-muted/30" disabled={!!selectedBooking}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Invoice</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label>Jatuh Tempo <span className="text-destructive">*</span></Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-muted/30" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground text-lg">Item Invoice</h2>
              {selectedBooking && (
                <p className="text-xs text-primary mt-0.5">Diisi otomatis dari booking · bisa diedit</p>
              )}
            </div>
            <div className="flex gap-2">
              {isEdit && (
                <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={isRecalculating}>
                  {isRecalculating ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                  Hitung Ulang
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-2" />
                Tambah Item
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => {
              const isDiscount = item.item_type === "discount";
              return (
                <div key={item._tempId} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item._tempId)}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Nama Item <span className="text-destructive">*</span></Label>
                      <Input value={item.item_name}
                        onChange={e => updateItem(item._tempId, "item_name", e.target.value)}
                        placeholder="Nama item / jasa" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tipe Item</Label>
                      <Select value={item.item_type}
                        onValueChange={val => updateItem(item._tempId, "item_type", val)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypeOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div>
                                <p className="font-medium">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Deskripsi</Label>
                    <Input value={item.description}
                      onChange={e => updateItem(item._tempId, "description", e.target.value)}
                      placeholder="Deskripsi singkat (opsional)" className="bg-background" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min={1} value={item.quantity}
                        onChange={e => updateItem(item._tempId, "quantity", parseInt(e.target.value) || 1)}
                        className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Harga Satuan <span className="text-destructive">*</span></Label>
                      <Input type="number" min={0} value={item.unit_price}
                        onChange={e => updateItem(item._tempId, "unit_price", parseFloat(e.target.value) || 0)}
                        className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subtotal</Label>
                      <Input
                        value={formatCurrency(Number(item.subtotal ?? 0))}
                        readOnly
                        className={`font-medium ${isDiscount ? "bg-green-50 text-green-700" : "bg-muted/50"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Total Preview */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              {items.some(i => i.item_type !== "item") && (
                <>
                  {items.filter(i => i.item_type !== "discount").map(i => (
                    <div key={i._tempId} className="flex justify-between text-sm text-muted-foreground">
                      <span className="truncate max-w-[150px]">{i.item_name || "Item"}</span>
                      <span>+{formatCurrency(Number(i.subtotal ?? 0))}</span>
                    </div>
                  ))}
                  {items.filter(i => i.item_type === "discount").map(i => (
                    <div key={i._tempId} className="flex justify-between text-sm text-green-600">
                      <span className="truncate max-w-[150px]">{i.item_name || "Diskon"}</span>
                      <span>-{formatCurrency(Number(i.subtotal ?? 0))}</span>
                    </div>
                  ))}
                  <Separator />
                </>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(Math.max(0, calculatedTotal))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Pembayaran & Catatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DP (Down Payment)</Label>
              <Input type="number" placeholder="Jumlah DP"
                value={downPayment} onChange={e => setDownPayment(parseFloat(e.target.value) || 0)}
                className="bg-muted/30" />
              {calculatedTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  {dpPercentage}% dari total · Sisa: {formatCurrency(Math.max(0, calculatedTotal - downPayment))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sisa Pembayaran</Label>
              <Input
                value={formatCurrency(Math.max(0, calculatedTotal - downPayment))}
                readOnly className="bg-muted/50 font-medium" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Syarat Pembayaran</Label>
              <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                className="bg-muted/30 min-h-[80px]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Catatan untuk Customer</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk customer..." className="bg-muted/30" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Catatan Admin (Internal)</Label>
              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder="Catatan internal admin..." className="bg-muted/30" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/invoices")}>Batal</Button>
          <Button
            className="gradient-ocean text-primary-foreground"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <Loader2 size={16} className="animate-spin mr-2" />
              : <Save size={16} className="mr-2" />
            }
            {isEdit ? "Simpan Perubahan" : "Buat Invoice"}
          </Button>
        </div>

      </div>
    </div>
  );
}
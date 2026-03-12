export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
export type InvoiceItemType = 'item' | 'discount' | 'penalty' | 'adjustment';

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_name: string;
  item_type: InvoiceItemType;
  description?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  project_id?: number;
  property_id?: number;
  display_order: number;
  project?: { id: number; title: string };
  property?: { id: number; name: string };
}

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  event_venue: string;
  event_date: string;
  event_type?: string;
  total: number;
  down_payment: number;
  status: InvoiceStatus;
  paid_at?: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  admin_notes?: string;
  payment_terms?: string;
  pdf_url?: string;
  pdf_generated_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  booking?: { id: number; booking_code: string; customer_name: string };
  creator?: { id: number; name: string; email: string };
  items?: InvoiceItem[];
}

export interface InvoiceStatistics {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  thisMonth: number;
  totalAmount: string;
  totalDownPayment: string;
  remainingAmount: string;
}

export interface CreateInvoiceItemData {
  item_name: string;
  item_type?: InvoiceItemType;
  description?: string;
  quantity?: number;
  unit_price: number;
  subtotal?: number;
  project_id?: number;
  property_id?: number;
  display_order?: number;
}

export interface CreateInvoiceData {
  booking_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  event_venue: string;
  event_date: string;
  event_type?: string;
  total?: number;
  down_payment?: number;
  issue_date?: string;
  due_date: string;
  notes?: string;
  admin_notes?: string;
  payment_terms?: string;
  items?: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
  admin_notes?: string;
}

export interface ItemRow extends Omit<CreateInvoiceItemData, 'subtotal'> {
  _tempId: number;
  subtotal: number;
}
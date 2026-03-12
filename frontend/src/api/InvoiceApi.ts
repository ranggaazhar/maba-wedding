import axios from 'axios';
import type {
  InvoiceStatus, CreateInvoiceData,
  UpdateInvoiceData, CreateInvoiceItemData,
} from '@/types/invoice.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class InvoiceApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getAllInvoices(filters?: {
    search?: string;
    status?: InvoiceStatus;
    event_date?: string;
    event_date_from?: string;
    event_date_to?: string;
    has_pdf?: boolean;
    include_booking?: boolean;
    include_items?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.event_date) params.append('event_date', filters.event_date);
    if (filters?.event_date_from) params.append('event_date_from', filters.event_date_from);
    if (filters?.event_date_to) params.append('event_date_to', filters.event_date_to);
    if (filters?.has_pdf !== undefined) params.append('has_pdf', String(filters.has_pdf));
    if (filters?.include_booking) params.append('include_booking', 'true');
    if (filters?.include_items) params.append('include_items', 'true');
    const response = await axios.get(`${API_URL}/invoices?${params.toString()}`, this.getAuthHeaders());
    return response.data;
  }

  async getInvoiceById(id: number) {
    const response = await axios.get(`${API_URL}/invoices/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async getStatistics() {
    const response = await axios.get(`${API_URL}/invoices/statistics`, this.getAuthHeaders());
    return response.data;
  }

  async getInvoicesByDateRange(startDate: string, endDate: string) {
    const response = await axios.get(
      `${API_URL}/invoices/date-range?start_date=${startDate}&end_date=${endDate}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async createInvoice(data: CreateInvoiceData) {
    const response = await axios.post(`${API_URL}/invoices`, data, this.getAuthHeaders());
    return response.data;
  }

  async createInvoiceFromBooking(bookingId: number) {
    const response = await axios.post(`${API_URL}/invoices/from-booking/${bookingId}`, {}, this.getAuthHeaders());
    return response.data;
  }

  async updateInvoice(id: number, data: UpdateInvoiceData) {
    const response = await axios.put(`${API_URL}/invoices/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteInvoice(id: number) {
    const response = await axios.delete(`${API_URL}/invoices/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async markAsSent(id: number) {
    const response = await axios.patch(`${API_URL}/invoices/${id}/mark-sent`, {}, this.getAuthHeaders());
    return response.data;
  }

  async markAsPaid(id: number) {
    const response = await axios.patch(`${API_URL}/invoices/${id}/mark-paid`, {}, this.getAuthHeaders());
    return response.data;
  }

  async markAsOverdue(id: number) {
    const response = await axios.patch(`${API_URL}/invoices/${id}/mark-overdue`, {}, this.getAuthHeaders());
    return response.data;
  }

  async recalculateTotal(id: number) {
    const response = await axios.patch(`${API_URL}/invoices/${id}/recalculate`, {}, this.getAuthHeaders());
    return response.data;
  }

  async updatePdfUrl(id: number, pdfUrl: string) {
    const response = await axios.patch(`${API_URL}/invoices/${id}/update-pdf`, { pdf_url: pdfUrl }, this.getAuthHeaders());
    return response.data;
  }

  async getItemsByInvoice(invoiceId: number) {
    const response = await axios.get(`${API_URL}/invoices/${invoiceId}/items`, this.getAuthHeaders());
    return response.data;
  }

  async getItemById(id: number) {
    const response = await axios.get(`${API_URL}/invoice-items/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async createItem(invoiceId: number, data: CreateInvoiceItemData) {
    const response = await axios.post(`${API_URL}/invoices/${invoiceId}/items`, data, this.getAuthHeaders());
    return response.data;
  }

  async bulkCreateItems(invoiceId: number, items: CreateInvoiceItemData[]) {
    const response = await axios.post(`${API_URL}/invoices/${invoiceId}/items/bulk`, { items }, this.getAuthHeaders());
    return response.data;
  }

  async updateItem(id: number, data: Partial<CreateInvoiceItemData>) {
    const response = await axios.put(`${API_URL}/invoice-items/${id}`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteItem(id: number) {
    const response = await axios.delete(`${API_URL}/invoice-items/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async reorderItems(invoiceId: number, itemIds: number[]) {
    const response = await axios.post(`${API_URL}/invoices/${invoiceId}/items/reorder`, { itemIds }, this.getAuthHeaders());
    return response.data;
  }

  async calculateItemsTotal(invoiceId: number) {
    const response = await axios.get(`${API_URL}/invoices/${invoiceId}/items/calculate-total`, this.getAuthHeaders());
    return response.data;
  }

  async sendInvoiceWhatsapp(id: number) {
    const response = await axios.post(`${API_URL}/invoices/${id}/send-whatsapp`, {}, this.getAuthHeaders());
    return response.data;
  }
}

export const invoiceApi = new InvoiceApi();
// controllers/invoiceController.js
const invoiceService = require('../services/invoiceService');

class InvoiceController {

  // ============================================================
  // INVOICE
  // ============================================================

  async getAllInvoices(req, res) {
    try {
      const filters = {
        search:           req.query.search,
        status:           req.query.status,
        event_date:       req.query.event_date,
        event_date_from:  req.query.event_date_from,
        event_date_to:    req.query.event_date_to,
        has_pdf:          req.query.has_pdf === 'true' ? true : req.query.has_pdf === 'false' ? false : undefined,
        includeBooking:   req.query.include_booking === 'true',
        includeCreator:   req.query.include_creator === 'true',
        includeItems:     req.query.include_items === 'true'
      };
      const invoices = await invoiceService.getAllInvoices(filters);
      return res.status(200).json({ success: true, message: 'Invoices retrieved successfully', data: invoices });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      return res.status(200).json({ success: true, message: 'Invoice retrieved successfully', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async createInvoice(req, res) {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.admin?.id);
      return res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice });
    } catch (error) {
      const status = error.message === 'Booking not found' ? 404 : error.message.includes('already exists') ? 409 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  async createInvoiceFromBooking(req, res) {
    try {
      const invoice = await invoiceService.createInvoiceFromBooking(req.params.bookingId, req.admin?.id);
      return res.status(201).json({ success: true, message: 'Invoice created from booking successfully', data: invoice });
    } catch (error) {
      const status = error.message === 'Booking not found' ? 404 : error.message.includes('already exists') ? 409 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  async updateInvoice(req, res) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Invoice updated successfully', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async deleteInvoice(req, res) {
    try {
      const result = await invoiceService.deleteInvoice(req.params.id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      const status = error.message === 'Invoice not found' ? 404 : error.message.includes('lunas') ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  async getInvoicesByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      if (!start_date || !end_date)
        return res.status(400).json({ success: false, message: 'start_date and end_date are required' });
      const invoices = await invoiceService.getInvoicesByDateRange(start_date, end_date);
      return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStatistics(req, res) {
    try {
      const statistics = await invoiceService.getStatistics();
      return res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ── Status ────────────────────────────────────────────────────────────────

  async markAsSent(req, res) {
    try {
      const invoice = await invoiceService.markAsSent(req.params.id);
      return res.status(200).json({ success: true, message: 'Invoice ditandai sebagai terkirim', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 400).json({ success: false, message: error.message });
    }
  }

  async markAsPaid(req, res) {
    try {
      const invoice = await invoiceService.markAsPaid(req.params.id);
      return res.status(200).json({ success: true, message: 'Invoice ditandai sebagai lunas', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 400).json({ success: false, message: error.message });
    }
  }

  async markAsOverdue(req, res) {
    try {
      const invoice = await invoiceService.markAsOverdue(req.params.id);
      return res.status(200).json({ success: true, message: 'Invoice ditandai sebagai overdue', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 400).json({ success: false, message: error.message });
    }
  }

  async updatePdfUrl(req, res) {
    try {
      const { pdf_url } = req.body;
      if (!pdf_url) return res.status(400).json({ success: false, message: 'PDF URL is required' });
      const invoice = await invoiceService.updatePdfUrl(req.params.id, pdf_url);
      return res.status(200).json({ success: true, message: 'PDF URL updated successfully', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async recalculateTotal(req, res) {
    try {
      const invoice = await invoiceService.recalculateTotal(req.params.id);
      return res.status(200).json({ success: true, message: 'Total recalculated successfully', data: invoice });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // INVOICE ITEMS
  // ============================================================

  async getItemsByInvoice(req, res) {
    try {
      const items = await invoiceService.getItemsByInvoiceId(req.params.invoiceId);
      return res.status(200).json({ success: true, message: 'Invoice items retrieved successfully', data: items });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async getItemById(req, res) {
    try {
      const item = await invoiceService.getItemById(req.params.id);
      return res.status(200).json({ success: true, message: 'Invoice item retrieved successfully', data: item });
    } catch (error) {
      return res.status(error.message === 'Invoice item not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async createItem(req, res) {
    try {
      const item = await invoiceService.createItem(req.params.invoiceId, req.body);
      return res.status(201).json({ success: true, message: 'Invoice item created successfully', data: item });
    } catch (error) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async updateItem(req, res) {
    try {
      const item = await invoiceService.updateItem(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Invoice item updated successfully', data: item });
    } catch (error) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async deleteItem(req, res) {
    try {
      const result = await invoiceService.deleteItem(req.params.id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      return res.status(error.message === 'Invoice item not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async bulkCreateItems(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items))
        return res.status(400).json({ success: false, message: 'items must be an array' });
      const created = await invoiceService.bulkCreateItems(req.params.invoiceId, items);
      return res.status(201).json({ success: true, message: 'Invoice items created successfully', data: created });
    } catch (error) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async reorderItems(req, res) {
    try {
      const { itemIds } = req.body;
      if (!Array.isArray(itemIds))
        return res.status(400).json({ success: false, message: 'itemIds must be an array' });
      const items = await invoiceService.reorderItems(req.params.invoiceId, itemIds);
      return res.status(200).json({ success: true, message: 'Invoice items reordered successfully', data: items });
    } catch (error) {
      return res.status(error.message === 'Invoice not found' ? 404 : 500).json({ success: false, message: error.message });
    }
  }

  async calculateItemsTotal(req, res) {
    try {
      const result = await invoiceService.calculateItemsTotal(req.params.invoiceId);
      return res.status(200).json({ success: true, message: 'Items total calculated successfully', data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendInvoiceWhatsapp(req, res) {
    try {
      const { id } = req.params;
      const result = await invoiceService.sendInvoiceWhatsapp(id);
      return res.status(200).json({
        success: true,
        message: result.whatsapp_sent
          ? 'Invoice berhasil dikirim ke WhatsApp customer'
          : 'PDF dibuat tapi WA gagal dikirim',
        data: result,
      });
    } catch (error) {
      const statusCode = error.message.includes('tidak ditemukan') ? 404 : 500;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = new InvoiceController();

// controllers/invoiceController.js
const invoiceService = require('../services/invoiceService');

class InvoiceController {
  async getAllInvoices(req, res) {
    try {
      const filters = {
        search: req.query.search,
        event_date: req.query.event_date,
        event_date_from: req.query.event_date_from,
        event_date_to: req.query.event_date_to,
        has_pdf: req.query.has_pdf === 'true' ? true : req.query.has_pdf === 'false' ? false : undefined,
        includeBooking: req.query.include_booking === 'true',
        includeCreator: req.query.include_creator === 'true',
        includeItems: req.query.include_items === 'true'
      };
      
      const invoices = await invoiceService.getAllInvoices(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve invoices',
        error: error.message
      });
    }
  }
  
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const includeAll = req.query.include_all !== 'false';
      
      const invoice = await invoiceService.getInvoiceById(id, includeAll);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createInvoice(req, res) {
    try {
      const adminId = req.admin?.id;
      const invoice = await invoiceService.createInvoice(req.body, adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Booking not found') {
        statusCode = 404;
      } else if (error.message.includes('already exists')) {
        statusCode = 409;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createInvoiceFromBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const adminId = req.admin?.id;
      
      const invoice = await invoiceService.createInvoiceFromBooking(bookingId, adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Invoice created from booking successfully',
        data: invoice
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Booking not found') {
        statusCode = 404;
      } else if (error.message.includes('already exists')) {
        statusCode = 409;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.updateInvoice(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;
      const result = await invoiceService.deleteInvoice(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updatePdfUrl(req, res) {
    try {
      const { id } = req.params;
      const { pdf_url } = req.body;
      
      if (!pdf_url) {
        return res.status(400).json({
          success: false,
          message: 'PDF URL is required'
        });
      }
      
      const invoice = await invoiceService.updatePdfUrl(id, pdf_url);
      
      return res.status(200).json({
        success: true,
        message: 'PDF URL updated successfully',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async recalculateTotal(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.recalculateTotal(id);
      
      return res.status(200).json({
        success: true,
        message: 'Total recalculated successfully',
        data: invoice
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getInvoicesByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'start_date and end_date are required'
        });
      }
      
      const invoices = await invoiceService.getInvoicesByDateRange(start_date, end_date);
      
      return res.status(200).json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve invoices',
        error: error.message
      });
    }
  }
  
  async getStatistics(req, res) {
    try {
      const statistics = await invoiceService.getStatistics();
      
      return res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error: error.message
      });
    }
  }
}

module.exports = new InvoiceController();
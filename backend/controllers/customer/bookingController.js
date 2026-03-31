const bookingService = require('../../services/customer/bookingService');
const FileHelper = require('../../utils/fileHelper');

class BookingController {
  async getAllBookings(req, res) {
    try {
      const filters = {
        search: req.query.search,
        event_date: req.query.event_date,
        event_date_from: req.query.event_date_from,
        event_date_to: req.query.event_date_to,
        has_payment: req.query.has_payment === 'true' ? true : req.query.has_payment === 'false' ? false : undefined,
        includeModels: req.query.include_models === 'true',
        includeProperties: req.query.include_properties === 'true',
        includeInvoice: req.query.include_invoice === 'true'
      };
      
      const bookings = await bookingService.getAllBookings(filters);
      
      // Add full URLs for payment proofs
      const bookingsWithUrls = bookings.map(booking => {
        const bookingData = booking.toJSON();
        if (bookingData.payment_proof_url) {
          bookingData.payment_proof_full_url = FileHelper.getFileUrl(bookingData.payment_proof_url, req);
        }
        return bookingData;
      });
      
      return res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookingsWithUrls
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookings',
        error: error.message
      });
    }
  }
  
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const includeAll = req.query.include_all !== 'false';
      
      const booking = await bookingService.getBookingById(id, includeAll);
      const bookingData = booking.toJSON();
      
      // Add full URL for payment proof
      if (bookingData.payment_proof_url) {
        bookingData.payment_proof_full_url = FileHelper.getFileUrl(bookingData.payment_proof_url, req);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Booking retrieved successfully',
        data: bookingData
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createBooking(req, res) {
    try {
      const booking = await bookingService.createBooking(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Booking link not found') {
        statusCode = 404;
      } else if (error.message.includes('already been used') || error.message.includes('expired')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.updateBooking(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      const result = await bookingService.deleteBooking(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 :
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // ✅ NEW: Upload payment proof with file
  async uploadPaymentProof(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No payment proof file uploaded'
        });
      }
      
      const booking = await bookingService.submitPaymentWithFile(
        id,
        req.file,
        req.body
      );
      
      const bookingData = booking.toJSON();
      if (bookingData.payment_proof_url) {
        bookingData.payment_proof_full_url = FileHelper.getFileUrl(bookingData.payment_proof_url, req);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment proof uploaded successfully',
        data: bookingData
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        await FileHelper.deleteFile(req.file.path);
      }
      
      const statusCode = error.message === 'Booking not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Original method for URL-based payment proof
  async submitPayment(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.submitPayment(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Payment submitted successfully',
        data: booking
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // ✅ NEW: Delete payment proof
  async deletePaymentProof(req, res) {
    try {
      const { id } = req.params;
      const result = await bookingService.deletePaymentProof(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 :
                        error.message === 'No payment proof to delete' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getBookingsByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'start_date and end_date are required'
        });
      }
      
      const bookings = await bookingService.getBookingsByDateRange(start_date, end_date);
      
      return res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully',
        data: bookings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookings',
        error: error.message
      });
    }
  }
  
  async getStatistics(req, res) {
    try {
      const statistics = await bookingService.getStatistics();
      
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
  async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id || null;
      const result = await bookingService.confirmPayment(id, adminId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      return res.status(200).json({
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi',
        data: {
          booking: result.booking,
          pdf_url: result.pdf_path ? `${baseUrl}/${result.pdf_path}` : null,
          whatsapp_sent: result.whatsapp_sent,
        },
      });
    } catch (error) {
      const statusCode =
        error.message === 'Booking not found' ? 404 :
        error.message.includes('Belum ada') || error.message.includes('sudah pernah') ? 400 : 500;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async rejectPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const booking = await bookingService.rejectPayment(id, reason);
      return res.status(200).json({ success: true, message: 'Pembayaran ditolak', data: booking });
    } catch (error) {
      return res.status(error.message === 'Booking not found' ? 404 : 500)
        .json({ success: false, message: error.message });
    }
  }
}

module.exports = new BookingController();
const bookingService = require('../../services/customer/bookingService');
const FileHelper = require('../../utils/fileHelper');
const bookingPdfService = require('../../services/admin/bookingPdfService');

class BookingController {
  async getAllBookings(req, res) {
    try {
      const filters = {
        search: req.query.search,
        event_date: req.query.event_date,
        event_date_from: req.query.event_date_from,
        event_date_to: req.query.event_date_to,
        has_payment: req.query.has_payment === 'true' ? true : req.query.has_payment === 'false' ? false : undefined,
        payment_status: req.query.payment_status || undefined,          // FIX: teruskan filter payment_status
        has_custom_request: req.query.has_custom_request === 'true' ? true  // FIX: teruskan filter has_custom_request
          : req.query.has_custom_request === 'false' ? false : undefined,
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

    // Full URL untuk payment proof
    if (bookingData.payment_proof_url) {
      bookingData.payment_proof_full_url = FileHelper.getFileUrl(bookingData.payment_proof_url, req);
    }

    if (bookingData.customRequests && Array.isArray(bookingData.customRequests)) {
      bookingData.customRequests = bookingData.customRequests.map(cr => ({
        ...cr,
        reference_images_urls: Array.isArray(cr.reference_images)
          ? cr.reference_images.map(imgPath => FileHelper.getFileUrl(imgPath, req))
          : []
      }));
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
    const data = { ...req.body };

    // Parse JSON fields — mirip projectController
    try {
      if (typeof data.models === 'string')
        data.models = JSON.parse(data.models);
      if (typeof data.properties === 'string')
        data.properties = JSON.parse(data.properties);
      if (typeof data.custom_requests === 'string')
        data.custom_requests = JSON.parse(data.custom_requests);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request data',
        error: parseError.message
      });
    }

    // Distribusi files ke masing-masing custom_request
    // berdasarkan image_count yang dikirim frontend
    if (Array.isArray(data.custom_requests) && req.files?.length > 0) {
      // 1. Validasi batas global (maks 25 foto)
      if (req.files.length > 25) {
        for (const file of req.files) {
          await FileHelper.deleteFile(file.path.replace(/\\/g, '/'));
        }
        return res.status(400).json({
          success: false,
          message: 'Total seluruh foto referensi custom request tidak boleh melebihi 25 foto.'
        });
      }

      // 2. Validasi batas per card request (maks 5 foto)
      for (const cr of data.custom_requests) {
        const count = parseInt(cr.image_count) || 0;
        if (count > 5) {
          for (const file of req.files) {
            await FileHelper.deleteFile(file.path.replace(/\\/g, '/'));
          }
          return res.status(400).json({
            success: false,
            message: 'Jumlah foto referensi untuk masing-masing custom request maksimal 5 foto.'
          });
        }
      }

      let fileOffset = 0;
      data.custom_requests = data.custom_requests.map(cr => {
        const count = parseInt(cr.image_count) || 0;
        const files = req.files.slice(fileOffset, fileOffset + count);
        fileOffset += count;
        return { ...cr, files };
      });
    }

    const booking = await bookingService.createBooking(data);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    // Cleanup semua uploaded files kalau gagal
    if (req.files?.length > 0) {
      for (const file of req.files) {
        await FileHelper.deleteFile(file.path.replace(/\\/g, '/'));
      }
    }

    let statusCode = 500;
    if (error.message === 'Booking link not found') statusCode = 404;
    else if (error.message.includes('already been used') || error.message.includes('expired')) statusCode = 400;

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

  async downloadBookingPdf(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id, true);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const bookingData = booking.toJSON ? booking.toJSON() : booking;
      const pdfPath = await bookingPdfService.generateBookingPdf(bookingData);
      return res.download(pdfPath);
    } catch (error) {
      console.error('Download Booking PDF Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

}

module.exports = new BookingController();
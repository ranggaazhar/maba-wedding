// controllers/customer/customRequestController.js
const customRequestService = require('../../services/customer/customRequestService');
const FileHelper = require('../../utils/fileHelper');

class CustomRequestController {

  _addImageUrls(request, req) {
    const data = request.toJSON ? request.toJSON() : { ...request };
    if (data.reference_images && Array.isArray(data.reference_images)) {
      data.reference_images_urls = data.reference_images.map(imgPath =>
        FileHelper.getFileUrl(imgPath, req)
      );
    }
    return data;
  }

  async getByBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const requests = await customRequestService.getRequestsByBookingId(bookingId);
      const data = requests.map(r => this._addImageUrls(r, req));
      return res.status(200).json({ success: true, message: 'Custom requests retrieved successfully', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const request = await customRequestService.getRequestById(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Custom request retrieved successfully',
        data: this._addImageUrls(request, req),
      });
    } catch (error) {
      return res.status(error.message.includes('tidak ditemukan') ? 404 : 500)
        .json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { bookingId } = req.params;
      const files = req.files || [];
      const request = await customRequestService.createRequest(bookingId, req.body, files);
      return res.status(201).json({
        success: true,
        message: 'Custom request berhasil dibuat',
        data: this._addImageUrls(request, req),
      });
    } catch (error) {
      if (req.files) {
        for (const f of req.files) await FileHelper.deleteFile(f.path.replace(/\\/g, '/'));
      }
      return res.status(error.message.includes('tidak ditemukan') ? 404 : 500)
        .json({ success: false, message: error.message });
    }
  }
  async update(req, res) {
    try {
      const files = req.files || [];
      const request = await customRequestService.updateRequest(req.params.id, req.body, files);
      return res.status(200).json({
        success: true,
        message: 'Custom request berhasil diperbarui',
        data: this._addImageUrls(request, req),
      });
    } catch (error) {
      if (req.files) {
        for (const f of req.files) await FileHelper.deleteFile(f.path.replace(/\\/g, '/'));
      }
      const statusCode = error.message.includes('tidak ditemukan') ? 404
        : error.message.includes('tidak dapat diedit') ? 400 : 500;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await customRequestService.deleteRequest(req.params.id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      const statusCode = error.message.includes('tidak ditemukan') ? 404
        : error.message.includes('tidak dapat dihapus') ? 400 : 500;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const { id, index } = req.params;
      const request = await customRequestService.deleteReferenceImage(id, parseInt(index));
      return res.status(200).json({
        success: true,
        message: 'Foto referensi berhasil dihapus',
        data: this._addImageUrls(request, req),
      });
    } catch (error) {
      const statusCode = error.message.includes('tidak ditemukan') ? 404
        : error.message.includes('tidak valid') ? 400 : 500;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const requests = await customRequestService.getAllRequests({
        status:     req.query.status,
        booking_id: req.query.booking_id,
        search:     req.query.search,
      });
      return res.status(200).json({
        success: true,
        message: 'Custom requests retrieved successfully',
        data: requests.map(r => this._addImageUrls(r, req)),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async review(req, res) {
    try {
      const adminId = req.admin?.id || null;
      const request = await customRequestService.reviewRequest(req.params.id, adminId, req.body);
      return res.status(200).json({
        success: true,
        message: `Request berhasil di-${req.body.status.toLowerCase()}`,
        data: this._addImageUrls(request, req),
      });
    } catch (error) {
      return res.status(error.message.includes('tidak ditemukan') ? 404 : 500)
        .json({ success: false, message: error.message });
    }
  }

  async getStatistics(req, res) {
    try {
      const stats = await customRequestService.getStatistics();
      return res.status(200).json({ success: true, message: 'Statistics retrieved successfully', data: stats });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CustomRequestController();
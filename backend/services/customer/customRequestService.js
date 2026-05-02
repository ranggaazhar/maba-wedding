// services/customer/customRequestService.js
const { BookingCustomRequest, Booking, Admin } = require('../../models');
const { Op } = require('sequelize');
const FileHelper = require('../../utils/fileHelper');

class CustomRequestService {

  _buildInclude(includeBooking = false, includeReviewer = false) {
    const include = [];
    if (includeBooking) {
      include.push({
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_code', 'customer_name', 'customer_phone', 'event_date', 'event_venue']
      });
    }
    if (includeReviewer) {
      include.push({
        model: Admin,
        as: 'reviewer',
        attributes: ['id', 'name', 'email']
      });
    }
    return include;
  }
  async getAllRequests(filters = {}) {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.booking_id) where.booking_id = filters.booking_id;

    if (filters.search) {
      where[Op.or] = [
        { title:       { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const requests = await BookingCustomRequest.findAll({
      where,
      include: this._buildInclude(true, true),
      order: [['created_at', 'DESC']],
    });

    return requests;
  }
  async getRequestsByBookingId(bookingId) {
    const requests = await BookingCustomRequest.findAll({
      where: { booking_id: bookingId },
      include: this._buildInclude(false, true),
      order: [['created_at', 'DESC']],
    });
    return requests;
  }
  async getRequestById(id) {
    const request = await BookingCustomRequest.findByPk(id, {
      include: this._buildInclude(true, true),
    });
    if (!request) throw new Error('Custom request tidak ditemukan');
    return request;
  }
  async createRequest(bookingId, data, files = []) {
    // Pastikan booking ada
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw new Error('Booking tidak ditemukan');
    const uploadedImages = files.map(f => f.path.replace(/\\/g, '/'));

    const existingImages = Array.isArray(data.reference_images) ? data.reference_images : [];
    const allImages = [...uploadedImages, ...existingImages];

    const request = await BookingCustomRequest.create({
      booking_id:       bookingId,
      title:            data.title,
      description:      data.description,
      color_theme:      data.color_theme || null,
      reference_images: allImages.length > 0 ? allImages : null,
      status:           'PENDING',
    });

    return await this.getRequestById(request.id);
  }
  async updateRequest(id, data, files = []) {
    const request = await this.getRequestById(id);

    if (request.status !== 'PENDING') {
      throw new Error('Request yang sudah diproses admin tidak dapat diedit');
    }
    const newUploads = files.map(f => f.path.replace(/\\/g, '/'));

    let finalImages;
    if (data.replace_images === 'true' || data.replace_images === true) {
      const oldImages = request.reference_images || [];
      for (const imgPath of oldImages) {
        await FileHelper.deleteFile(imgPath);
      }
      const manualUrls = Array.isArray(data.reference_images) ? data.reference_images : [];
      finalImages = [...newUploads, ...manualUrls];
    } else {
      const existing = request.reference_images || [];
      const manualUrls = Array.isArray(data.reference_images) ? data.reference_images : [];
      finalImages = [...existing, ...newUploads, ...manualUrls];
    }

    await request.update({
      title:            data.title       ?? request.title,
      description:      data.description ?? request.description,
      color_theme:      data.color_theme ?? request.color_theme,
      reference_images: finalImages.length > 0 ? finalImages : null,
    });

    return await this.getRequestById(id);
  }

  /**
   * Customer hapus request (hanya kalau masih PENDING)
   */
  async deleteRequest(id) {
    const request = await this.getRequestById(id);

    if (request.status !== 'PENDING') {
      throw new Error('Request yang sudah diproses admin tidak dapat dihapus');
    }

    // Hapus semua file referensi dari disk
    const images = request.reference_images || [];
    for (const imgPath of images) {
      await FileHelper.deleteFile(imgPath);
    }

    await request.destroy();
    return { message: 'Custom request berhasil dihapus' };
  }

  /**
   * Hapus satu foto referensi dari request
   */
  async deleteReferenceImage(id, imageIndex) {
    const request = await this.getRequestById(id);
    const images = request.reference_images || [];

    if (imageIndex < 0 || imageIndex >= images.length) {
      throw new Error('Index foto tidak valid');
    }

    const imgPath = images[imageIndex];
    await FileHelper.deleteFile(imgPath);

    images.splice(imageIndex, 1);
    await request.update({ reference_images: images.length > 0 ? images : null });

    return await this.getRequestById(id);
  }

  async reviewRequest(id, adminId, data) {
    const request = await this.getRequestById(id);

    const updateData = {
      status:           data.status,
      admin_notes:      data.admin_notes      || request.admin_notes,
      reviewed_by:      adminId,
      reviewed_at:      new Date(),
    };

    if (data.status === 'REJECTED') {
      updateData.rejection_reason = data.rejection_reason || null;
    }

    if (data.estimated_price !== undefined) {
      updateData.estimated_price = data.estimated_price;
    }

    await request.update(updateData);
    return await this.getRequestById(id);
  }
  async getStatistics() {
    const [total, pending, reviewed, approved, rejected] = await Promise.all([
      BookingCustomRequest.count(),
      BookingCustomRequest.count({ where: { status: 'PENDING' } }),
      BookingCustomRequest.count({ where: { status: 'REVIEWED' } }),
      BookingCustomRequest.count({ where: { status: 'APPROVED' } }),
      BookingCustomRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return { total, pending, reviewed, approved, rejected };
  }
}

module.exports = new CustomRequestService();
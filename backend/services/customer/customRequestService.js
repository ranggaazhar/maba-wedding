// services/customer/customRequestService.js
const { BookingCustomRequest, Booking, Admin, Invoice } = require('../../models');
const { Op } = require('sequelize');
const FileHelper = require('../../utils/fileHelper');

class CustomRequestService {

  _buildInclude(includeBooking = false, includeReviewer = false) {
    const include = [];
    if (includeBooking) {
      include.push({
        model: Booking,
        as: 'booking',
        attributes: ['id', 'booking_code', 'customer_name', 'customer_phone', 'event_date', 'event_venue', 'payment_status'],
        include: [{
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'status']
        }]
      });
    }
    return include;
  }
  async getAllRequests(filters = {}) {
    const where = {};

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
    });

    // Update parent booking custom request flag
    await booking.update({ has_custom_request: true });

    return await this.getRequestById(request.id);
  }
  async updateRequest(id, data, files = []) {
    const request = await this.getRequestById(id);

    if (request.booking && request.booking.invoice) {
      throw new Error('Request tidak dapat diedit karena booking sudah memiliki invoice');
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

    if (request.booking && request.booking.invoice) {
      throw new Error('Request tidak dapat dihapus karena booking sudah memiliki invoice');
    }

    // Hapus semua file referensi dari disk
    const images = request.reference_images || [];
    for (const imgPath of images) {
      await FileHelper.deleteFile(imgPath);
    }

    const bookingId = request.booking_id;
    await request.destroy();

    // Sync parent booking custom request flag
    const remainingCount = await BookingCustomRequest.count({ where: { booking_id: bookingId } });
    await Booking.update(
      { has_custom_request: remainingCount > 0 },
      { where: { id: bookingId } }
    );

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

  async getStatistics() {
    const total = await BookingCustomRequest.count();
    return { total };
  }
}

module.exports = new CustomRequestService();
// services/customer/bookingService.js
const { 
  Booking, 
  BookingLink, 
  BookingModel, 
  BookingProperty, 
  BookingCustomRequest,
  Category, 
  Project,
  ProjectPhoto,
  Property,
  Invoice,
  ReviewLink
} = require('../../models');
const { sequelize } = require('../../models');
const { Op } = require('sequelize');
const FileHelper = require('../../utils/fileHelper');
const bookingPdfService = require('../admin/bookingPdfService');
const whatsappService = require('../admin/whatsappService');

class BookingService {
  generateBookingCode() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BK${year}${month}${random}`;
  }
  
  async getAllBookings(filters = {}) {
    const where = {};
    
    if (filters.search) {
      where[Op.or] = [
        { booking_code: { [Op.like]: `%${filters.search}%` } },
        { customer_name: { [Op.like]: `%${filters.search}%` } },
        { customer_phone: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    if (filters.event_date) {
      where.event_date = filters.event_date;
    } else if (filters.event_date_from && filters.event_date_to) {
      where.event_date = {
        [Op.between]: [filters.event_date_from, filters.event_date_to]
      };
    } else if (filters.event_date_from) {
      where.event_date = { [Op.gte]: filters.event_date_from };
    } else if (filters.event_date_to) {
      where.event_date = { [Op.lte]: filters.event_date_to };
    }
    
    if (filters.has_payment !== undefined) {
      if (filters.has_payment) {
        where.payment_proof_url = { [Op.ne]: null };
      } else {
        where.payment_proof_url = null;
      }
    }

    // ← filter payment_status
    if (filters.payment_status) {
      where.payment_status = filters.payment_status;
    }

    // ← filter has_custom_request (FIX: tambahkan support filter ini)
    if (filters.has_custom_request !== undefined) {
      where.has_custom_request = filters.has_custom_request;
    }
    
    const include = [
      { model: BookingLink, as: 'bookingLink' }
    ];
    
    if (filters.includeModels) {
      include.push({
        model: BookingModel,
        as: 'models',
        include: [
          { model: Category, as: 'category' },
          { model: Project, as: 'project' }
        ],
        separate: true,
        order: [['display_order', 'ASC']]
      });
    }
    
    if (filters.includeProperties) {
      include.push({
        model: BookingProperty,
        as: 'properties',
        include: [{ model: Property, as: 'property' }],
        separate: true
      });
    }
    
    // Make sure invoice is included for is_deletable calculation
    const hasInvoiceInclude = include.some(inc => inc.model === Invoice);
    if (!hasInvoiceInclude) {
      include.push({ model: Invoice, as: 'invoice' });
    }
    
    const bookings = await Booking.findAll({
      where,
      include,
      order: [['submitted_at', 'DESC']]
    });

    for (const booking of bookings) {
      booking.dataValues.is_deletable = !booking.invoice || booking.invoice.status === 'PAID';
    }
    
    return bookings;
  }
  
  async getBookingById(id, includeAll = true) {
    const include = [
      { model: BookingLink, as: 'bookingLink' },
      { model: Invoice, as: 'invoice' }
    ];
    
    if (includeAll) {
      include.push(
        {
          model: BookingModel,
          as: 'models',
          include: [
            { model: Category, as: 'category' },
            { 
              model: Project, 
              as: 'project',
              include: [{ model: ProjectPhoto, as: 'photos' }]
            }
          ],
          separate: true,
          order: [['display_order', 'ASC']]
        },
        {
          model: BookingProperty,
          as: 'properties',
          include: [
            { 
              model: Property, 
              as: 'property'
            }
          ],
          separate: true
        },

        {
          model: BookingCustomRequest,
          as: 'customRequests',
          order: [['created_at', 'DESC']]
        }
      );
    }
    
    const booking = await Booking.findByPk(id, { include });
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.dataValues.is_deletable = !booking.invoice || booking.invoice.status === 'PAID';
    
    return booking;
  }
  
  async getBookingByCode(code, includeAll = true) {
    const include = [
      { model: BookingLink, as: 'bookingLink' },
      { model: Invoice, as: 'invoice' }
    ];
    
    if (includeAll) {
      include.push(
        {
          model: BookingModel,
          as: 'models',
          include: [
            { model: Category, as: 'category' },
            { 
              model: Project, 
              as: 'project',
              include: [{ model: ProjectPhoto, as: 'photos' }]
            }
          ],
          separate: true,
          order: [['display_order', 'ASC']]
        },
        {
          model: BookingProperty,
          as: 'properties',
          include: [{ model: Property, as: 'property' }],
          separate: true
        },

        {
          model: BookingCustomRequest,
          as: 'customRequests',
          order: [['created_at', 'DESC']]
        }
      );
    }
    
    const booking = await Booking.findOne({
      where: { booking_code: code },
      include
    });
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.dataValues.is_deletable = !booking.invoice || booking.invoice.status === 'PAID';
    
    return booking;
  }
  
  async createBooking(data) {
    const transaction = await sequelize.transaction();
    
    try {
      const bookingLink = await BookingLink.findByPk(data.booking_link_id);
      if (!bookingLink) throw new Error('Booking link not found');
      if (bookingLink.is_used) throw new Error('Booking link has already been used');
      if (bookingLink.expires_at && new Date(bookingLink.expires_at) < new Date()) {
        throw new Error('Booking link has expired');
      }
      
      let bookingCode = this.generateBookingCode();
      let exists = await Booking.findOne({ where: { booking_code: bookingCode } });
      while (exists) {
        bookingCode = this.generateBookingCode();
        exists = await Booking.findOne({ where: { booking_code: bookingCode } });
      }
      const hasModels = Array.isArray(data.models) && data.models.length > 0;
      const hasCustomRequests = Array.isArray(data.custom_requests) && data.custom_requests.length > 0;

      let totalEstimate = null;
      let dpAmount = null;

      if (hasModels) {
        totalEstimate = data.total_estimate ? parseFloat(data.total_estimate) : null;
        dpAmount = data.dp_amount
          ? parseFloat(data.dp_amount)
          : (totalEstimate ? Math.ceil(totalEstimate * 0.1) : null);
      }
      const booking = await Booking.create({
        booking_link_id:  data.booking_link_id,
        booking_code:     bookingCode,
        customer_name:    data.customer_name,
        customer_phone:   data.customer_phone,
        full_address:     data.full_address,
        event_venue:      data.event_venue,
        event_date:       data.event_date,
        event_type:       data.event_type,
        referral_source:  data.referral_source,
        theme_color:      data.theme_color,
        total_estimate:   totalEstimate,
        dp_amount:        dpAmount,
        customer_notes:   data.customer_notes,
        // Tandai tipe booking untuk keperluan frontend/admin
        has_custom_request: hasCustomRequests,
      }, { transaction });
      
      if (hasModels) {
        const models = data.models.map((model, index) => ({
          booking_id:    booking.id,
          category_id:   model.category_id,
          project_id:    model.project_id,
          project_title: model.project_title,
          price:         model.price,
          notes:         model.notes,
          display_order: model.display_order !== undefined ? model.display_order : index
        }));
        await BookingModel.bulkCreate(models, { transaction });
      } 
      
      if (data.properties && data.properties.length > 0) {
        const properties = data.properties.map(prop => ({
          booking_id:        booking.id,
          property_id:       prop.property_id,
          property_name:     prop.property_name,
          property_category: prop.property_category,
          quantity:          prop.quantity || 1,
          price:             prop.price,
          subtotal:          prop.subtotal
        }));
        await BookingProperty.bulkCreate(properties, { transaction });
      }
      if (hasCustomRequests) {
  const customRequests = data.custom_requests.map(cr => {
    // Ambil path file yang sudah diproses sharp & disimpan di uploads/custom-requests/
    const uploadedImages = (cr.files || []).map(f =>
      f.path.replace(/\\/g, '/')
    );

    return {
      booking_id:       booking.id,
      title:            cr.title,
      description:      cr.description,
      color_theme:      cr.color_theme || null,
      reference_images: uploadedImages.length > 0 ? uploadedImages : null,
    };
  });

  await BookingCustomRequest.bulkCreate(customRequests, { transaction });
}
      
      await bookingLink.update({ is_used: true }, { transaction });
      await transaction.commit();
      
      return await this.getBookingById(booking.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async updateBooking(id, data) {
    const transaction = await sequelize.transaction();

    try {
      const booking = await Booking.findByPk(id);
      if (!booking) throw new Error('Booking tidak ditemukan');

      // Hitung ulang dp_amount kalau total_estimate berubah
      const totalEstimate = parseFloat(data.total_estimate || booking.total_estimate || 0);
      const dpAmount = data.dp_amount
        ? parseFloat(data.dp_amount)
        : Math.ceil(totalEstimate * 0.1);

      // Sync has_custom_request flag based on actual custom requests count
      const customRequestsCount = await BookingCustomRequest.count({
        where: { booking_id: id },
        transaction
      });

      await booking.update({
        customer_name:   data.customer_name,
        customer_phone:  data.customer_phone,
        full_address:    data.full_address,
        event_venue:     data.event_venue,
        event_date:      data.event_date,
        event_type:      data.event_type,
        referral_source: data.referral_source,
        theme_color:     data.theme_color,
        total_estimate:  totalEstimate || null,
        dp_amount:       dpAmount || null,       // ← FIX: update dp_amount juga
        customer_notes:  data.customer_notes,
        has_custom_request: customRequestsCount > 0
      }, { transaction });

      if (data.models) {
        await BookingModel.destroy({ where: { booking_id: id }, transaction });
        if (data.models.length > 0) {
          const modelEntries = data.models.map((m, index) => ({
            booking_id:    id,
            category_id:   m.category_id,
            project_id:    m.project_id,
            project_title: m.project_title,
            price:         m.price,
            notes:         m.notes,
            display_order: index
          }));
          await BookingModel.bulkCreate(modelEntries, { transaction });
        }
      }

      if (data.properties) {
        await BookingProperty.destroy({ where: { booking_id: id }, transaction });
        if (data.properties.length > 0) {
          const propertyEntries = data.properties.map(p => ({
            booking_id:        id,
            property_id:       p.property_id,
            property_name:     p.property_name,
            property_category: p.property_category,
            quantity:          p.quantity,
            price:             p.price,
            subtotal:          p.subtotal
          }));
          await BookingProperty.bulkCreate(propertyEntries, { transaction });
        }
      }

      await transaction.commit();
      return await this.getBookingById(id);

    } catch (error) {
      await transaction.rollback();
      console.error("Update Booking Error:", error);
      throw error;
    }
  }

  async deleteBooking(id) {
    const booking = await this.getBookingById(id, true);
    
    if (booking.invoice && booking.invoice.status !== 'PAID') {
      throw new Error('Booking tidak dapat dihapus karena invoice belum lunas.');
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Lepas referensi invoice agar data keuangan tetap utuh
      if (booking.invoice) {
        await Invoice.update(
          { booking_id: null },
          { where: { id: booking.invoice.id }, transaction }
        );
      }

      // 2. Lepas referensi review_link agar data review tetap ada
      await ReviewLink.update(
        { booking_id: null },
        { where: { booking_id: id }, transaction }
      );

      // 3. Hapus custom requests
      if (booking.customRequests && booking.customRequests.length > 0) {
        await BookingCustomRequest.destroy({ where: { booking_id: id }, transaction });
      }

      // 4. Hapus detail model dan properti
      await BookingModel.destroy({ where: { booking_id: id }, transaction });
      await BookingProperty.destroy({ where: { booking_id: id }, transaction });

      // 5. Hapus booking
      await booking.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Hapus file dari disk SETELAH transaction berhasil (tidak bisa di-rollback)
    if (booking.payment_proof_url) {
      await FileHelper.deleteFile(booking.payment_proof_url).catch(() => {});
    }
    if (booking.customRequests && booking.customRequests.length > 0) {
      for (const cr of booking.customRequests) {
        if (cr.reference_images && Array.isArray(cr.reference_images)) {
          for (const imgPath of cr.reference_images) {
            await FileHelper.deleteFile(imgPath).catch(() => {});
          }
        }
      }
    }

    return { message: 'Booking deleted successfully' };
  }
  
  async submitPaymentWithFile(id, file, paymentData) {
    const booking = await this.getBookingById(id, false);

    if (booking.payment_proof_url) {
      await FileHelper.deleteFile(booking.payment_proof_url);
    }

    const paymentProofUrl = file.path.replace(/\\/g, '/');

    const updateData = {
      payment_proof_url: paymentProofUrl,
      bank_name:         paymentData.bank_name || null,
      account_number:    paymentData.account_number || null,
      account_name:      paymentData.account_name || null,
      payment_date:      new Date(),
      payment_status:    'WAITING_CONFIRMATION',
    };
    if (!booking.dp_amount && booking.total_estimate) {
      updateData.dp_amount = Math.ceil(Number(booking.total_estimate) * 0.1);
    }
    // ────────────────────────────────────────────────────────────────

    await booking.update(updateData);
    return booking;
  }

  async confirmPayment(id, adminId = null) {
    const booking = await this.getBookingById(id, true);
    if (!booking) throw new Error('Booking not found');

    if (!booking.payment_proof_url) {
      throw new Error('Belum ada bukti pembayaran yang diupload customer');
    }

    if (booking.payment_status === 'CONFIRMED') {
      throw new Error('Pembayaran sudah pernah dikonfirmasi sebelumnya');
    }

    await Booking.update(
      { payment_status: 'CONFIRMED', confirmed_by: adminId, confirmed_at: new Date() },
      { where: { id } }
    );

    let pdfPath = null;
    let pdfRelative = null;

    try {
      const bookingData = booking.toJSON ? booking.toJSON() : booking;
      pdfPath = await bookingPdfService.generateBookingPdf(bookingData);

      const normalized = pdfPath.replace(/\\/g, '/');
      const splitResult = normalized.split('/uploads/');
      pdfRelative = splitResult.length > 1 ? `uploads/${splitResult[1]}` : normalized;
    } catch (e) {
      console.error('❌ PDF gagal:', e.message);
    }

    let waResult = null;
    if (pdfPath && pdfRelative) {
      try {
        const bookingData = booking.toJSON ? booking.toJSON() : booking;
        waResult = await whatsappService.sendBookingConfirmation(bookingData, pdfRelative);
      } catch (e) {
        console.error('❌ WA gagal:', e.message);
      }
    }

    return {
      booking: await this.getBookingById(id, false),
      pdf_generated: !!pdfPath,
      pdf_path: pdfRelative,
      whatsapp_sent: waResult?.success || false,
    };
  }

  async submitPayment(id, paymentData) {
    const booking = await this.getBookingById(id, false);
    await booking.update({
      payment_proof_url: paymentData.payment_proof_url,
      bank_name:         paymentData.bank_name,
      account_number:    paymentData.account_number,
      account_name:      paymentData.account_name,
      payment_date:      new Date(),
      payment_status:    'WAITING_CONFIRMATION', // FIX: harus berubah status saat submit URL bukti bayar
    });
    return booking;
  }
  
  async deletePaymentProof(id) {
    const booking = await this.getBookingById(id, false);
    if (!booking.payment_proof_url) throw new Error('No payment proof to delete');

    await FileHelper.deleteFile(booking.payment_proof_url);
    await booking.update({
      payment_proof_url: null,
      bank_name:         null,
      account_number:    null,
      account_name:      null,
      payment_date:      null,
      payment_status:    'PENDING'
    });
    return { message: 'Payment proof deleted successfully' };
  }
  
  async getBookingsByDateRange(startDate, endDate) {
    return await Booking.findAll({
      where: {
        event_date: { [Op.between]: [startDate, endDate] }
      },
      include: [{ model: BookingLink, as: 'bookingLink' }],
      order: [['event_date', 'ASC']]
    });
  }
  
  async getStatistics() {
    const total = await Booking.count();
    const withPayment = await Booking.count({
      where: { payment_proof_url: { [Op.ne]: null } }
    });
    const withoutPayment = total - withPayment;
    const thisMonth = await Booking.count({
      where: {
        submitted_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    return { total, withPayment, withoutPayment, thisMonth };
  }
}

module.exports = new BookingService();
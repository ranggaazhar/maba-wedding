// services/bookingService.js
const { 
  Booking, 
  BookingLink, 
  BookingModel, 
  BookingProperty, 
  Category, 
  Project,
  ProjectPhoto,
  Property,
  PropertyImage,
  Invoice
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const FileHelper = require('../utils/fileHelper');
const bookingPdfService = require('./bookingPdfService');
const whatsappService = require('./whatsappService');

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
    }
    
    if (filters.event_date_from && filters.event_date_to) {
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
    
    if (filters.includeInvoice) {
      include.push({ model: Invoice, as: 'invoice' });
    }
    
    const bookings = await Booking.findAll({
      where,
      include,
      order: [['submitted_at', 'DESC']]
    });
    
    return bookings;
  }
  
// services/bookingService.js

async getBookingById(id, includeAll = true) {
  const include = [{ model: BookingLink, as: 'bookingLink' }];
  
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
            include: [{ model: ProjectPhoto, as: 'photos' }] // Project pakai 'photos'
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
            as: 'property',
            include: [
              { 
                model: PropertyImage, // Gunakan objek model PropertyImage
                as: 'images' // <--- UBAH INI dari 'photos' ke 'images'
              }
            ]
          }
        ],
        separate: true
      },
      { model: Invoice, as: 'invoice' }
    );
  }
  
  const booking = await Booking.findByPk(id, { include });
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return booking;
}
  
  async getBookingByCode(code, includeAll = true) {
    const include = [
      { model: BookingLink, as: 'bookingLink' }
    ];
    
    if (includeAll) {
      include.push(
        {
          model: BookingModel,
          as: 'models',
          include: [
            { model: Category, as: 'category' },
            { model: Project, as: 'project' }
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
        { model: Invoice, as: 'invoice' }
      );
    }
    
    const booking = await Booking.findOne({
      where: { booking_code: code },
      include
    });
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return booking;
  }
  
  async createBooking(data) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verify booking link exists and is valid
      const bookingLink = await BookingLink.findByPk(data.booking_link_id);
      if (!bookingLink) {
        throw new Error('Booking link not found');
      }
      
      if (bookingLink.is_used) {
        throw new Error('Booking link has already been used');
      }
      
      if (bookingLink.expires_at && new Date(bookingLink.expires_at) < new Date()) {
        throw new Error('Booking link has expired');
      }
      
      // Generate unique booking code
      let bookingCode = this.generateBookingCode();
      let exists = await Booking.findOne({ where: { booking_code: bookingCode } });
      while (exists) {
        bookingCode = this.generateBookingCode();
        exists = await Booking.findOne({ where: { booking_code: bookingCode } });
      }
      
      // Create booking
      const booking = await Booking.create({
        booking_link_id: data.booking_link_id,
        booking_code: bookingCode,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        full_address: data.full_address,
        event_venue: data.event_venue,
        event_date: data.event_date,
        event_type: data.event_type,
        referral_source: data.referral_source,
        theme_color: data.theme_color,
        total_estimate: data.total_estimate,
        customer_notes: data.customer_notes
      }, { transaction });
      
      // Create booking models if provided
      if (data.models && data.models.length > 0) {
        const models = data.models.map((model, index) => ({
          booking_id: booking.id,
          category_id: model.category_id,
          project_id: model.project_id,
          project_title: model.project_title,
          price: model.price,
          notes: model.notes,
          display_order: model.display_order !== undefined ? model.display_order : index
        }));
        
        await BookingModel.bulkCreate(models, { transaction });
      } 
      
      // Create booking properties if provided
      if (data.properties && data.properties.length > 0) {
        const properties = data.properties.map(prop => ({
          booking_id: booking.id,
          property_id: prop.property_id,
          property_name: prop.property_name,
          property_category: prop.property_category,
          quantity: prop.quantity || 1,
          price: prop.price,
          subtotal: prop.subtotal
        }));
        
        await BookingProperty.bulkCreate(properties, { transaction });
      }
      
      // Mark booking link as used
      await bookingLink.update({ is_used: true }, { transaction });
      
      await transaction.commit();
      
      return await this.getBookingById(booking.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
async updateBooking(id, data) {
  // Mulai transaksi
  const transaction = await sequelize.transaction();

  try {
    // 1. Cari data booking utama
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new Error('Booking tidak ditemukan');
    }

    // 2. Update informasi utama booking (Header)
    await booking.update({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      full_address: data.full_address,
      event_venue: data.event_venue,
      event_date: data.event_date,
      event_type: data.event_type,
      referral_source: data.referral_source,
      theme_color: data.theme_color,
      total_estimate: data.total_estimate,
      customer_notes: data.customer_notes
    }, { transaction });

    // 3. Sinkronisasi Model Dekorasi
    // Kita hapus semua yang lama, lalu masukkan yang baru dari list Frontend
    if (data.models) {
      await BookingModel.destroy({ 
        where: { booking_id: id }, 
        transaction 
      });

      if (data.models.length > 0) {
        const modelEntries = data.models.map((m, index) => ({
          booking_id: id,
          category_id: m.category_id,
          project_id: m.project_id,
          project_title: m.project_title,
          price: m.price,
          notes: m.notes,
          display_order: index
        }));
        await BookingModel.bulkCreate(modelEntries, { transaction });
      }
    }

    // 4. Sinkronisasi Properties
    // Sama seperti model, kita bersihkan data lama dan masukkan data baru
    if (data.properties) {
      await BookingProperty.destroy({ 
        where: { booking_id: id }, 
        transaction 
      });

      if (data.properties.length > 0) {
        const propertyEntries = data.properties.map(p => ({
          booking_id: id,
          property_id: p.property_id,
          property_name: p.property_name,
          property_category: p.property_category,
          quantity: p.quantity,
          price: p.price,
          subtotal: p.subtotal
        }));
        await BookingProperty.bulkCreate(propertyEntries, { transaction });
      }
    }

    // Jika semua proses di atas berhasil, simpan permanen ke database
    await transaction.commit();

    // Kembalikan data terbaru yang sudah di-update (termasuk relasi fotonya)
    return await this.getBookingById(id);

  } catch (error) {
    // Jika ada satu saja yang error, batalkan semua perubahan
    await transaction.rollback();
    console.error("Update Booking Error:", error);
    throw error;
  }
}
  async deleteBooking(id) {
    const booking = await this.getBookingById(id, true);
    
    // Check if has invoice
    if (booking.invoice) {
      throw new Error('Cannot delete booking with existing invoice');
    }
    
    // Delete payment proof file if exists
    if (booking.payment_proof_url) {
      await FileHelper.deleteFile(booking.payment_proof_url);
    }
    
    await booking.destroy();
    return { message: 'Booking deleted successfully' };
  }
  
    async submitPaymentWithFile(id, file, paymentData) {
    const booking = await this.getBookingById(id, false);

    if (booking.payment_proof_url) {
      await FileHelper.deleteFile(booking.payment_proof_url);
    }

    const paymentProofUrl = file.path.replace(/\\/g, '/');

    await booking.update({
      payment_proof_url: paymentProofUrl,
      bank_name: paymentData.bank_name || null,
      account_number: paymentData.account_number || null,
      account_name: paymentData.account_name || null,
      payment_date: new Date(),
      payment_status: 'WAITING_CONFIRMATION'  // ← otomatis saat customer upload
    });

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

    let pdfPath = null;        // full absolute path  → untuk whatsappService
    let pdfRelative = null;    // relative path       → untuk dikembalikan ke controller

    try {
      const bookingData = booking.toJSON ? booking.toJSON() : booking;
      pdfPath = await bookingPdfService.generateBookingPdf(bookingData);

      // Konversi: "D:\MYPROJECT\...\uploads\booking-pdfs\file.pdf"
      //       → "uploads/booking-pdfs/file.pdf"
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
        // Kirim pdfRelative ke WA — nanti digabung BASE_URL di whatsappService
        waResult = await whatsappService.sendBookingConfirmation(bookingData, pdfRelative);
      } catch (e) {
        console.error('❌ WA gagal:', e.message);
      }
    }

    return {
      booking: await this.getBookingById(id, false),
      pdf_generated: !!pdfPath,
      pdf_path: pdfRelative,   // ← relative path, bisa langsung dibuka di browser
      whatsapp_sent: waResult?.success || false,
    };
  }

  async rejectPayment(id, reason = '') {
    const booking = await this.getBookingById(id, false);
    if (!booking) throw new Error('Booking not found');

    await Booking.update(
      { payment_status: 'REJECTED', rejection_reason: reason || null },
      { where: { id } }
    );

    return await this.getBookingById(id, false);
  }
  
  // Original method for URL-based payment proof
  async submitPayment(id, paymentData) {
    const booking = await this.getBookingById(id, false);
    
    await booking.update({
      payment_proof_url: paymentData.payment_proof_url,
      bank_name: paymentData.bank_name,
      account_number: paymentData.account_number,
      account_name: paymentData.account_name,
      payment_date: new Date()
    });
    
    return booking;
  }
  
  // ✅ NEW: Delete payment proof
  async deletePaymentProof(id) {
    const booking = await this.getBookingById(id, false);
    
    if (!booking.payment_proof_url) {
      throw new Error('No payment proof to delete');
    }
    
    // Delete file
    await FileHelper.deleteFile(booking.payment_proof_url);
    
    // Clear payment data
    await booking.update({
      payment_proof_url: null,
      bank_name: null,
      account_number: null,
      account_name: null,
      payment_date: null
    });
    
    return { message: 'Payment proof deleted successfully' };
  }
  
  async getBookingsByDateRange(startDate, endDate) {
    return await Booking.findAll({
      where: {
        event_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: BookingLink, as: 'bookingLink' }
      ],
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
    
    return {
      total,
      withPayment,
      withoutPayment,
      thisMonth
    };
  }
}

module.exports = new BookingService();
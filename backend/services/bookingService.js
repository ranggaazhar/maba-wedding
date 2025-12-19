// services/bookingService.js
const { 
  Booking, 
  BookingLink, 
  BookingModel, 
  BookingProperty, 
  Category, 
  Project,
  Property,
  Invoice
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

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
  
  async getBookingById(id, includeAll = true) {
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
    const booking = await this.getBookingById(id, false);
    await booking.update(data);
    return await this.getBookingById(id);
  }
  
  async deleteBooking(id) {
    const booking = await this.getBookingById(id, true);
    
    // Check if has invoice
    if (booking.invoice) {
      throw new Error('Cannot delete booking with existing invoice');
    }
    
    await booking.destroy();
    return { message: 'Booking deleted successfully' };
  }
  
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
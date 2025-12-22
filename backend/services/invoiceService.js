// services/invoiceService.js
const { Invoice, InvoiceItem, Booking, Admin, Project, Property } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class InvoiceService {
  async getAllInvoices(filters = {}) {
    const where = {};
    
    if (filters.search) {
      where[Op.or] = [
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
    
    if (filters.has_pdf !== undefined) {
      if (filters.has_pdf) {
        where.pdf_url = { [Op.ne]: null };
      } else {
        where.pdf_url = null;
      }
    }
    
    const include = [];
    
    if (filters.includeBooking) {
      include.push({ model: Booking, as: 'booking' });
    }
    
    if (filters.includeCreator) {
      include.push({
        model: Admin,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      });
    }
    
    if (filters.includeItems) {
      include.push({
        model: InvoiceItem,
        as: 'items',
        include: [
          { model: Project, as: 'project' },
          { model: Property, as: 'property' }
        ],
        separate: true,
        order: [['display_order', 'ASC']]
      });
    }
    
    const invoices = await Invoice.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });
    
    return invoices;
  }
  
  async getInvoiceById(id, includeAll = true) {
    const include = [];
    
    if (includeAll) {
      include.push(
        { model: Booking, as: 'booking' },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            { model: Project, as: 'project' },
            { model: Property, as: 'property' }
          ],
          separate: true,
          order: [['display_order', 'ASC']]
        }
      );
    }
    
    const invoice = await Invoice.findByPk(id, { include });
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return invoice;
  }
  
  async createInvoice(data, adminId = null) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verify booking if provided
      if (data.booking_id) {
        const booking = await Booking.findByPk(data.booking_id);
        if (!booking) {
          throw new Error('Booking not found');
        }
        
        // Check if invoice already exists for this booking
        const existingInvoice = await Invoice.findOne({
          where: { booking_id: data.booking_id }
        });
        
        if (existingInvoice) {
          throw new Error('Invoice already exists for this booking');
        }
      }
      
      // Create invoice
      const invoice = await Invoice.create({
        booking_id: data.booking_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        event_venue: data.event_venue,
        event_date: data.event_date,
        event_type: data.event_type,
        total: data.total,
        down_payment: data.down_payment || 0,
        issue_date: data.issue_date,
        due_date: data.due_date,
        notes: data.notes,
        admin_notes: data.admin_notes,
        payment_terms: data.payment_terms,
        created_by: adminId
      }, { transaction });
      
      // Create invoice items if provided
      if (data.items && data.items.length > 0) {
        const items = data.items.map((item, index) => ({
          invoice_id: invoice.id,
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          project_id: item.project_id,
          property_id: item.property_id,
          display_order: item.display_order !== undefined ? item.display_order : index
        }));
        
        await InvoiceItem.bulkCreate(items, { transaction });
      }
      
      await transaction.commit();
      
      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async createInvoiceFromBooking(bookingId, adminId = null) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { 
          model: require('../models').BookingModel, 
          as: 'models',
          include: [{ model: Project, as: 'project' }]
        },
        { 
          model: require('../models').BookingProperty, 
          as: 'properties',
          include: [{ model: Property, as: 'property' }]
        }
      ]
    });
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({
      where: { booking_id: bookingId }
    });
    
    if (existingInvoice) {
      throw new Error('Invoice already exists for this booking');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      // Calculate total from booking models and properties
      let total = 0;
      const items = [];
      let displayOrder = 0;
      
      // Add booking models as invoice items
      if (booking.models) {
        for (const model of booking.models) {
          const price = parseFloat(model.price || 0);
          total += price;
          
          items.push({
            item_name: model.project_title,
            description: model.notes,
            quantity: 1,
            unit_price: price,
            subtotal: price,
            project_id: model.project_id,
            display_order: displayOrder++
          });
        }
      }
      
      // Add booking properties as invoice items
      if (booking.properties) {
        for (const prop of booking.properties) {
          const subtotal = parseFloat(prop.subtotal);
          total += subtotal;
          
          items.push({
            item_name: prop.property_name,
            description: `Category: ${prop.property_category}`,
            quantity: prop.quantity,
            unit_price: prop.price,
            subtotal: subtotal,
            property_id: prop.property_id,
            display_order: displayOrder++
          });
        }
      }
      
      // Create invoice
      const invoice = await Invoice.create({
        booking_id: bookingId,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_address: booking.full_address,
        event_venue: booking.event_venue,
        event_date: booking.event_date,
        event_type: booking.event_type,
        total: total,
        down_payment: 0,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: booking.customer_notes,
        created_by: adminId
      }, { transaction });
      
      // Create invoice items
      if (items.length > 0) {
        const invoiceItems = items.map(item => ({
          ...item,
          invoice_id: invoice.id
        }));
        
        await InvoiceItem.bulkCreate(invoiceItems, { transaction });
      }
      
      await transaction.commit();
      
      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async updateInvoice(id, data) {
    const invoice = await this.getInvoiceById(id, false);
    await invoice.update(data);
    return await this.getInvoiceById(id);
  }
  
  async deleteInvoice(id) {
    const invoice = await this.getInvoiceById(id);
    await invoice.destroy();
    return { message: 'Invoice deleted successfully' };
  }
  
  async updatePdfUrl(id, pdfUrl) {
    const invoice = await this.getInvoiceById(id, false);
    
    await invoice.update({
      pdf_url: pdfUrl,
      pdf_generated_at: new Date()
    });
    
    return invoice;
  }
  
  async recalculateTotal(id) {
    const invoice = await this.getInvoiceById(id, true);
    
    const total = invoice.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);
    
    await invoice.update({ total });
    
    return invoice;
  }
  
  async getInvoicesByDateRange(startDate, endDate) {
    return await Invoice.findAll({
      where: {
        event_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Booking, as: 'booking' }
      ],
      order: [['event_date', 'ASC']]
    });
  }
  
  async getStatistics() {
    const total = await Invoice.count();
    const withPdf = await Invoice.count({ where: { pdf_url: { [Op.ne]: null } } });
    const withoutPdf = total - withPdf;
    
    const totalAmount = await Invoice.sum('total');
    const totalDownPayment = await Invoice.sum('down_payment');
    
    const thisMonth = await Invoice.count({
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    
    return {
      total,
      withPdf,
      withoutPdf,
      thisMonth,
      totalAmount: parseFloat(totalAmount || 0).toFixed(2),
      totalDownPayment: parseFloat(totalDownPayment || 0).toFixed(2),
      remainingAmount: parseFloat((totalAmount || 0) - (totalDownPayment || 0)).toFixed(2)
    };
  }
}

module.exports = new InvoiceService();
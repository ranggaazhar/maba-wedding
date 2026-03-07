// services/invoiceService.js
const { Invoice, InvoiceItem, Booking, Admin, Project, Property } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class InvoiceService {
  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV${year}${month}${random}`;
  }

  _itemInclude() {
    return {
      model: InvoiceItem, as: 'items',
      include: [
        { model: Project, as: 'project' },
        { model: Property, as: 'property' }
      ],
      separate: true,
      order: [['display_order', 'ASC']]
    };
  }

  _fullInclude() {
    return [
      { model: Booking, as: 'booking' },
      { model: Admin, as: 'creator', attributes: ['id', 'name', 'email'] },
      this._itemInclude()
    ];
  }

  // ============================================================
  // INVOICE — GET
  // ============================================================

  async getAllInvoices(filters = {}) {
    const where = {};

    if (filters.search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${filters.search}%` } },
        { customer_phone: { [Op.like]: `%${filters.search}%` } },
        { invoice_number: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.event_date) where.event_date = filters.event_date;

    if (filters.event_date_from && filters.event_date_to) {
      where.event_date = { [Op.between]: [filters.event_date_from, filters.event_date_to] };
    } else if (filters.event_date_from) {
      where.event_date = { [Op.gte]: filters.event_date_from };
    } else if (filters.event_date_to) {
      where.event_date = { [Op.lte]: filters.event_date_to };
    }

    if (filters.has_pdf !== undefined) {
      where.pdf_url = filters.has_pdf ? { [Op.ne]: null } : null;
    }

    const include = [];
    if (filters.includeBooking) include.push({ model: Booking, as: 'booking' });
    if (filters.includeCreator) include.push({ model: Admin, as: 'creator', attributes: ['id', 'name', 'email'] });
    if (filters.includeItems) include.push(this._itemInclude());

    return await Invoice.findAll({ where, include, order: [['created_at', 'DESC']] });
  }

  async getInvoiceById(id, includeAll = true) {
    const invoice = await Invoice.findByPk(id, {
      include: includeAll ? this._fullInclude() : []
    });
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async getInvoicesByDateRange(startDate, endDate) {
    return await Invoice.findAll({
      where: { event_date: { [Op.between]: [startDate, endDate] } },
      include: [{ model: Booking, as: 'booking' }],
      order: [['event_date', 'ASC']]
    });
  }

  async getStatistics() {
    const total = await Invoice.count();
    const draft   = await Invoice.count({ where: { status: 'DRAFT' } });
    const sent    = await Invoice.count({ where: { status: 'SENT' } });
    const paid    = await Invoice.count({ where: { status: 'PAID' } });
    const overdue = await Invoice.count({ where: { status: 'OVERDUE' } });
    const thisMonth = await Invoice.count({
      where: { created_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
    });
    const totalAmount      = parseFloat(await Invoice.sum('total') || 0);
    const totalDownPayment = parseFloat(await Invoice.sum('down_payment') || 0);

    return {
      total, draft, sent, paid, overdue, thisMonth,
      totalAmount:      totalAmount.toFixed(2),
      totalDownPayment: totalDownPayment.toFixed(2),
      remainingAmount:  (totalAmount - totalDownPayment).toFixed(2)
    };
  }

  // ============================================================
  // INVOICE — CREATE / UPDATE / DELETE
  // ============================================================

  async _generateUniqueNumber() {
    let number = this.generateInvoiceNumber();
    while (await Invoice.findOne({ where: { invoice_number: number } })) {
      number = this.generateInvoiceNumber();
    }
    return number;
  }

  async createInvoice(data, adminId = null) {
    const transaction = await sequelize.transaction();
    try {
      if (data.booking_id) {
        const booking = await Booking.findByPk(data.booking_id);
        if (!booking) throw new Error('Booking not found');
        const existing = await Invoice.findOne({ where: { booking_id: data.booking_id } });
        if (existing) throw new Error('Invoice already exists for this booking');
      }

      const invoice = await Invoice.create({
        invoice_number: await this._generateUniqueNumber(),
        booking_id:       data.booking_id,
        customer_name:    data.customer_name,
        customer_phone:   data.customer_phone,
        customer_address: data.customer_address,
        event_venue:      data.event_venue,
        event_date:       data.event_date,
        event_type:       data.event_type,
        total:            data.total || 0,
        down_payment:     data.down_payment || 0,
        status:           'DRAFT',
        issue_date:       data.issue_date || new Date(),
        due_date:         data.due_date,
        notes:            data.notes,
        admin_notes:      data.admin_notes,
        payment_terms:    data.payment_terms,
        created_by:       adminId
      }, { transaction });

      if (data.items?.length > 0) {
        await InvoiceItem.bulkCreate(
          data.items.map((item, i) => ({
            invoice_id:    invoice.id,
            item_name:     item.item_name,
            item_type:     item.item_type || 'item',
            description:   item.description,
            quantity:      item.quantity || 1,
            unit_price:    item.unit_price,
            subtotal:      item.subtotal,
            project_id:    item.project_id,
            property_id:   item.property_id,
            display_order: item.display_order ?? i
          })),
          { transaction }
        );
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
        { model: require('../models').BookingModel,    as: 'models',     include: [{ model: Project,  as: 'project'  }] },
        { model: require('../models').BookingProperty, as: 'properties', include: [{ model: Property, as: 'property' }] }
      ]
    });

    if (!booking) throw new Error('Booking not found');
    const existing = await Invoice.findOne({ where: { booking_id: bookingId } });
    if (existing) throw new Error('Invoice already exists for this booking');

    const transaction = await sequelize.transaction();
    try {
      let total = 0;
      const items = [];
      let order = 0;

      for (const model of booking.models || []) {
        const price = parseFloat(model.price || 0);
        total += price;
        items.push({
          item_name:     model.project_title,
          item_type:     'item',
          description:   model.notes || null,
          quantity:      1,
          unit_price:    price,
          subtotal:      price,
          project_id:    model.project_id,
          display_order: order++
        });
      }

      for (const prop of booking.properties || []) {
        const subtotal = parseFloat(prop.subtotal);
        total += subtotal;
        items.push({
          item_name:     prop.property_name,
          item_type:     'item',
          description:   `Kategori: ${prop.property_category}`,
          quantity:      prop.quantity,
          unit_price:    prop.price,
          subtotal:      subtotal,
          property_id:   prop.property_id,
          display_order: order++
        });
      }

      const invoice = await Invoice.create({
        invoice_number:   await this._generateUniqueNumber(),
        booking_id:       bookingId,
        customer_name:    booking.customer_name,
        customer_phone:   booking.customer_phone,
        customer_address: booking.full_address,
        event_venue:      booking.event_venue,
        event_date:       booking.event_date,
        event_type:       booking.event_type,
        total,
        down_payment:     parseFloat(booking.dp_amount || 0),
        status:           'DRAFT',
        issue_date:       new Date(),
        due_date:         new Date(booking.event_date),
        notes:            booking.customer_notes,
        payment_terms:    'Pelunasan dilakukan sebelum hari acara',
        created_by:       adminId
      }, { transaction });

      if (items.length > 0) {
        await InvoiceItem.bulkCreate(
          items.map(item => ({ ...item, invoice_id: invoice.id })),
          { transaction }
        );
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
    if (invoice.status === 'PAID') throw new Error('Invoice yang sudah lunas tidak bisa dihapus');
    await invoice.destroy();
    return { message: 'Invoice deleted successfully' };
  }

  // ============================================================
  // INVOICE — STATUS
  // ============================================================

  async markAsSent(id) {
    const invoice = await this.getInvoiceById(id, false);
    if (invoice.status === 'PAID') throw new Error('Invoice sudah lunas, tidak bisa diubah');
    await invoice.update({ status: 'SENT' });
    return await this.getInvoiceById(id);
  }

  async markAsPaid(id) {
    const invoice = await this.getInvoiceById(id, false);
    await invoice.update({ status: 'PAID', paid_at: new Date() });
    return await this.getInvoiceById(id);
  }

  async markAsOverdue(id) {
    const invoice = await this.getInvoiceById(id, false);
    if (invoice.status === 'PAID') throw new Error('Invoice sudah lunas');
    await invoice.update({ status: 'OVERDUE' });
    return await this.getInvoiceById(id);
  }

  async updatePdfUrl(id, pdfUrl) {
    const invoice = await this.getInvoiceById(id, false);
    await invoice.update({ pdf_url: pdfUrl, pdf_generated_at: new Date() });
    return invoice;
  }

  async recalculateTotal(id) {
    const invoice = await this.getInvoiceById(id, true);
    let total = 0;
    for (const item of invoice.items) {
      const subtotal = parseFloat(item.subtotal);
      total += item.item_type === 'discount' ? -subtotal : subtotal;
    }
    await invoice.update({ total: Math.max(0, total) });
    return await this.getInvoiceById(id);
  }

  // ============================================================
  // INVOICE ITEMS
  // ============================================================

  async getItemsByInvoiceId(invoiceId) {
    await this.getInvoiceById(invoiceId, false);
    return await InvoiceItem.findAll({
      where: { invoice_id: invoiceId },
      include: [{ model: Project, as: 'project' }, { model: Property, as: 'property' }],
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
  }

  async getItemById(id) {
    const item = await InvoiceItem.findByPk(id, {
      include: [
        { model: Invoice,   as: 'invoice'  },
        { model: Project,   as: 'project'  },
        { model: Property,  as: 'property' }
      ]
    });
    if (!item) throw new Error('Invoice item not found');
    return item;
  }

  async createItem(invoiceId, data) {
    await this.getInvoiceById(invoiceId, false);

    if (data.project_id  && !(await Project.findByPk(data.project_id)))  throw new Error('Project not found');
    if (data.property_id && !(await Property.findByPk(data.property_id))) throw new Error('Property not found');

    const item = await InvoiceItem.create({
      invoice_id:    invoiceId,
      item_name:     data.item_name,
      item_type:     data.item_type || 'item',
      description:   data.description,
      quantity:      data.quantity || 1,
      unit_price:    data.unit_price,
      subtotal:      data.subtotal,
      project_id:    data.project_id,
      property_id:   data.property_id,
      display_order: data.display_order
    });

    return await this.getItemById(item.id);
  }

  async updateItem(id, data) {
    const item = await this.getItemById(id);

    const updateData = { ...data };
    if (data.quantity || data.unit_price) {
      const quantity  = data.quantity  || item.quantity;
      const unitPrice = data.unit_price || item.unit_price;
      updateData.subtotal = parseFloat(unitPrice) * parseInt(quantity);
    }

    await item.update(updateData);
    return await this.getItemById(id);
  }

  async deleteItem(id) {
    const item = await this.getItemById(id);
    await item.destroy();
    return { message: 'Invoice item deleted successfully' };
  }

  async bulkCreateItems(invoiceId, items) {
    await this.getInvoiceById(invoiceId, false);

    const itemData = await Promise.all(
      items.map(async (item, i) => {
        if (item.project_id  && !(await Project.findByPk(item.project_id)))
          throw new Error(`Project not found for item index ${i}`);
        if (item.property_id && !(await Property.findByPk(item.property_id)))
          throw new Error(`Property not found for item index ${i}`);

        const quantity  = item.quantity || 1;
        const unitPrice = parseFloat(item.unit_price);
        return {
          invoice_id:    invoiceId,
          item_name:     item.item_name,
          item_type:     item.item_type || 'item',
          description:   item.description,
          quantity,
          unit_price:    unitPrice,
          subtotal:      item.subtotal || unitPrice * quantity,
          project_id:    item.project_id,
          property_id:   item.property_id,
          display_order: item.display_order ?? i
        };
      })
    );

    return await InvoiceItem.bulkCreate(itemData);
  }

  async reorderItems(invoiceId, itemIds) {
    await this.getInvoiceById(invoiceId, false);
    await Promise.all(
      itemIds.map((itemId, index) =>
        InvoiceItem.update({ display_order: index }, { where: { id: itemId, invoice_id: invoiceId } })
      )
    );
    return await this.getItemsByInvoiceId(invoiceId);
  }

  async calculateItemsTotal(invoiceId) {
    const items = await this.getItemsByInvoiceId(invoiceId);
    let total = 0;
    for (const item of items) {
      const subtotal = parseFloat(item.subtotal);
      total += item.item_type === 'discount' ? -subtotal : subtotal;
    }
    return { total: Math.max(0, total), itemCount: items.length, items };
  }
}

module.exports = new InvoiceService();
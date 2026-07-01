const { BookingLink, Booking, Admin, Customer, sequelize } = require('../../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

class BookingLinkService {
  async deleteAllBookingLinks() {
    const transaction = await sequelize.transaction();
    try {
      // 1. Dapatkan semua customer_id yang terkait dengan booking links sebelum dihapus
      const links = await BookingLink.findAll({
        attributes: ['customer_id'],
        raw: true
      });
      const customerIds = [...new Set(links.map(l => l.customer_id).filter(Boolean))];

      // 2. Putuskan hubungan booking_link_id di tabel bookings (ubah ke NULL)
      await Booking.update(
        { booking_link_id: null },
        { where: {}, transaction }
      );

      // 3. Hapus semua data booking links
      const deletedCount = await BookingLink.destroy({
        where: {},
        transaction
      });

      // 4. Bersihkan data customer yatim piatu (tidak ada booking dan tidak ada link)
      if (customerIds.length > 0) {
        for (const customerId of customerIds) {
          const otherBookingsCount = await Booking.count({
            where: { customer_id: customerId },
            transaction
          });
          const otherLinksCount = await BookingLink.count({
            where: { customer_id: customerId },
            transaction
          });
          if (otherBookingsCount === 0 && otherLinksCount === 0) {
            await Customer.destroy({ where: { id: customerId }, transaction });
            console.log(`Deleted orphan customer during bulk delete: ${customerId}`);
          }
        }
      }
      
      await transaction.commit();
      return { message: `Semua ${deletedCount} link booking berhasil dihapus` };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  async getAllBookingLinks(filters = {}) {
    const where = {};
    
    if (filters.is_used !== undefined) {
      where.is_used = filters.is_used;
    }
    
    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        where.expires_at = { [Op.lt]: new Date() };
      } else {
        // FIX BUG-1: Gunakan Op.and agar tidak menimpa search Op.or
        where[Op.and] = [
          {
            [Op.or]: [
              { expires_at: null },
              { expires_at: { [Op.gte]: new Date() } }
            ]
          }
        ];
      }
    }
    
    if (filters.search) {
      const searchOr = [
        { '$customer.name$': { [Op.like]: `%${filters.search}%` } },
        { '$customer.phone$': { [Op.like]: `%${filters.search}%` } },
        { token: { [Op.like]: `%${filters.search}%` } }
      ];
      // Gabungkan dengan Op.and yang sudah ada jika ada, atau tambah baru
      if (where[Op.and]) {
        where[Op.and].push({ [Op.or]: searchOr });
      } else {
        where[Op.and] = [{ [Op.or]: searchOr }];
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
    
    const bookingLinks = await BookingLink.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });
    
    return bookingLinks;
  }
  
  async getBookingLinkById(id, includeRelations = true) {
    const include = [];
    
    if (includeRelations) {
      include.push(
        { model: Booking, as: 'booking' },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      );
    }
    
    const bookingLink = await BookingLink.findByPk(id, { include });
    
    if (!bookingLink) {
      throw new Error('Booking link not found');
    }
    
    return bookingLink;
  }
  
  async getBookingLinkByToken(token) {
    const bookingLink = await BookingLink.findOne({
      where: { token },
      include: [
        { model: Booking, as: 'booking' },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!bookingLink) {
      throw new Error('Booking link not found');
    }
    
    return bookingLink;
  }
  
  async createBookingLink(data, adminId = null) {
    const token = this.generateToken();
    
    // Set default expiration to 30 days if not provided
    const expiresAt = data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    let customerId = null;
    if (data.customer_phone) {
      let customer = await Customer.findOne({ where: { phone: data.customer_phone } });
      if (!customer) {
        customer = await Customer.create({
          name: data.customer_name || '',
          phone: data.customer_phone
        });
      }
      customerId = customer.id;
    }

    const bookingLink = await BookingLink.create({
      token,
      customer_id: customerId,
      expires_at: expiresAt,
      created_by: adminId || data.created_by
    });
    
    return bookingLink;
  }
  
  async updateBookingLink(id, data) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    // Don't allow updating if already used
    if (bookingLink.is_used) {
      throw new Error('Cannot update a used booking link');
    }
    
    let customerId = bookingLink.customer_id;
    if (data.customer_phone) {
      let customer = await Customer.findOne({ where: { phone: data.customer_phone } });
      if (!customer) {
        customer = await Customer.create({
          name: data.customer_name || (bookingLink.customer ? bookingLink.customer.name : ''),
          phone: data.customer_phone
        });
      } else {
        await customer.update({
          name: data.customer_name || customer.name
        });
      }
      customerId = customer.id;
    }

    const updateData = { ...data };
    if (updateData.expires_at === '') {
      updateData.expires_at = null;
    }
    
    updateData.customer_id = customerId;
    delete updateData.customer_name;
    delete updateData.customer_phone;
    
    await bookingLink.update(updateData);
    return bookingLink;
  }
  
  async deleteBookingLink(id) {
    const bookingLink = await this.getBookingLinkById(id, true);
    
    const customerId = bookingLink.customer_id;
    const transaction = await sequelize.transaction();
    try {
      // Lepaskan referensi booking_link_id di tabel bookings agar data booking tidak ikut terhapus
      await Booking.update(
        { booking_link_id: null },
        { where: { booking_link_id: id }, transaction }
      );

      await bookingLink.destroy({ transaction });
      
      if (customerId) {
        const otherBookingsCount = await Booking.count({
          where: { customer_id: customerId },
          transaction
        });
        const otherLinksCount = await BookingLink.count({
          where: { customer_id: customerId },
          transaction
        });
        if (otherBookingsCount === 0 && otherLinksCount === 0) {
          await Customer.destroy({ where: { id: customerId }, transaction });
          console.log(`Deleted orphan customer: ${customerId}`);
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    
    return { message: 'Booking link deleted successfully' };
  }
  
  async markAsSent(id) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    await bookingLink.update({ sent_at: new Date() });
    return bookingLink;
  }
  
  async validateBookingLink(token) {
    const bookingLink = await this.getBookingLinkByToken(token);
    
    // Check if already used or booking exists in database
    const bookingExists = await Booking.findOne({ where: { booking_link_id: bookingLink.id } });
    if (bookingExists || bookingLink.is_used) {
      if (!bookingLink.is_used) {
        await bookingLink.update({ is_used: true });
      }
      throw new Error('This booking link has already been used');
    }
    
    // Check if expired
    if (bookingLink.expires_at && new Date(bookingLink.expires_at) < new Date()) {
      throw new Error('This booking link has expired');
    }
    
    return bookingLink;
  }
  
  async markAsUsed(id) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    await bookingLink.update({ is_used: true });
    return bookingLink;
  }
  
  async regenerateToken(id) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    // Don't allow regenerating if already used
    if (bookingLink.is_used) {
      throw new Error('Cannot regenerate token for a used booking link');
    }
    
    const newToken = this.generateToken();
    await bookingLink.update({ token: newToken });
    
    return bookingLink;
  }
  
  async getStatistics() {
    const total = await BookingLink.count();
    const used = await BookingLink.count({ where: { is_used: true } });
    const expired = await BookingLink.count({
      where: {
        expires_at: { [Op.lt]: new Date() },
        is_used: false
      }
    });
    const active = await BookingLink.count({
      where: {
        is_used: false,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gte]: new Date() } }
        ]
      }
    });
    
    return {
      total,
      used,
      expired,
      active,
      unused: total - used
    };
  }
}

module.exports = new BookingLinkService();
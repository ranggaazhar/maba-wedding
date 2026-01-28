// services/bookingLinkService.js
const { BookingLink, Booking, Admin } = require('../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

class BookingLinkService {
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
        where[Op.or] = [
          { expires_at: null },
          { expires_at: { [Op.gte]: new Date() } }
        ];
      }
    }
    
    if (filters.search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${filters.search}%` } },
        { customer_phone: { [Op.like]: `%${filters.search}%` } },
        { token: { [Op.like]: `%${filters.search}%` } }
      ];
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
    
    const bookingLink = await BookingLink.create({
      token,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      expires_at: expiresAt,
      created_by: adminId || data.created_by,
      notes: data.notes
    });
    
    return bookingLink;
  }
  
  async updateBookingLink(id, data) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    // Don't allow updating if already used
    if (bookingLink.is_used) {
      throw new Error('Cannot update a used booking link');
    }
    
    await bookingLink.update(data);
    return bookingLink;
  }
  
  async deleteBookingLink(id) {
    const bookingLink = await this.getBookingLinkById(id, true);
    
    await bookingLink.destroy();
    return { message: 'Booking link deleted successfully' };
  }
  
  async markAsSent(id) {
    const bookingLink = await this.getBookingLinkById(id, false);
    
    await bookingLink.update({ sent_at: new Date() });
    return bookingLink;
  }
  
  async validateBookingLink(token) {
    const bookingLink = await this.getBookingLinkByToken(token);
    
    // Check if already used
    if (bookingLink.is_used) {
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
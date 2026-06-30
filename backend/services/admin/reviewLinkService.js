const { ReviewLink, Booking, Review, Admin, sequelize } = require('../../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

class ReviewLinkService {
  async deleteAllReviewLinks() {
    const transaction = await sequelize.transaction();
    try {
      await Review.update({ review_link_id: null }, { where: {}, transaction });
      await ReviewLink.destroy({ where: {}, transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    return { message: 'All review links deleted successfully' };
  }
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  async getAllReviewLinks(filters = {}) {
    const where = {};
    
    if (filters.is_used !== undefined) {
      where.is_used = filters.is_used;
    }
    
    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        where.expires_at = { [Op.lt]: new Date() };
      } else {
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
        { token: { [Op.like]: `%${filters.search}%` } },
        { '$booking.customer.name$': { [Op.like]: `%${filters.search}%` } },
        { '$booking.customer.phone$': { [Op.like]: `%${filters.search}%` } }
      ];
      
      if (where[Op.and]) {
        where[Op.and].push({ [Op.or]: searchOr });
      } else {
        where[Op.and] = [{ [Op.or]: searchOr }];
      }
    }
    
    const include = [
      { 
        model: Booking, 
        as: 'booking',
        include: [{ model: require('../../models').Customer, as: 'customer' }]
      }
    ];
    
    if (filters.includeReview) {
      include.push({ model: Review, as: 'review' });
    }
    
    if (filters.includeCreator) {
      include.push({
        model: Admin,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      });
    }
    
    const reviewLinks = await ReviewLink.findAll({
      where,
      include,
      order: [['created_at', 'DESC']]
    });
    
    return reviewLinks;
  }
  
  async getReviewLinkById(id, includeRelations = true) {
    const include = [
      { model: Booking, as: 'booking' }
    ];
    
    if (includeRelations) {
      include.push(
        { model: Review, as: 'review' },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      );
    }
    
    const reviewLink = await ReviewLink.findByPk(id, { include });
    
    if (!reviewLink) {
      throw new Error('Review link not found');
    }
    
    return reviewLink;
  }
  
  async getReviewLinkByToken(token) {
    const reviewLink = await ReviewLink.findOne({
      where: { token },
      include: [
        { model: Booking, as: 'booking' },
        { model: Review, as: 'review' },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!reviewLink) {
      throw new Error('Review link not found');
    }
    
    return reviewLink;
  }
  
  async createReviewLink(data, adminId = null) {
    // Check if booking exists
    const booking = await Booking.findByPk(data.booking_id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Check if review link already exists for this booking
    const existingLink = await ReviewLink.findOne({
      where: { booking_id: data.booking_id }
    });
    
    if (existingLink) {
      throw new Error('Review link already exists for this booking');
    }
    
    const token = this.generateToken();
    
    // Set default expiration to 90 days if not provided
    const expiresAt = data.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    const reviewLink = await ReviewLink.create({
      booking_id: data.booking_id,
      token,
      expires_at: expiresAt,
      created_by: adminId || data.created_by
    });
    
    return reviewLink;
  }
  
  async updateReviewLink(id, data) {
    const reviewLink = await this.getReviewLinkById(id, false);
    
    // Don't allow updating if already used
    if (reviewLink.is_used) {
      throw new Error('Cannot update a used review link');
    }
    
    await reviewLink.update(data);
    return reviewLink;
  }
  
  async deleteReviewLink(id) {
    const reviewLink = await this.getReviewLinkById(id, true);
    const transaction = await sequelize.transaction();
    try {
      if (reviewLink.review) {
        await reviewLink.review.update({ review_link_id: null }, { transaction });
      }
      await reviewLink.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    return { message: 'Review link deleted successfully' };
  }
  
  async markAsSent(id) {
    const reviewLink = await this.getReviewLinkById(id, false);
    
    await reviewLink.update({ sent_at: new Date() });
    return reviewLink;
  }
  
  async validateReviewLink(token) {
    const reviewLink = await this.getReviewLinkByToken(token);
    
    // Check if already used
    if (reviewLink.is_used) {
      throw new Error('This review link has already been used');
    }
    
    // Check if expired
    if (reviewLink.expires_at && new Date(reviewLink.expires_at) < new Date()) {
      throw new Error('This review link has expired');
    }
    
    return reviewLink;
  }
  
  async markAsUsed(id) {
    const reviewLink = await this.getReviewLinkById(id, false);
    
    await reviewLink.update({ is_used: true });
    return reviewLink;
  }
  
  async regenerateToken(id) {
    const reviewLink = await this.getReviewLinkById(id, false);
    
    // Don't allow regenerating if already used
    if (reviewLink.is_used) {
      throw new Error('Cannot regenerate token for a used review link');
    }
    
    const newToken = this.generateToken();
    await reviewLink.update({ token: newToken });
    
    return reviewLink;
  }
  
  async getStatistics() {
    const total = await ReviewLink.count();
    const used = await ReviewLink.count({ where: { is_used: true } });
    const expired = await ReviewLink.count({
      where: {
        expires_at: { [Op.lt]: new Date() },
        is_used: false
      }
    });
    const active = await ReviewLink.count({
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

module.exports = new ReviewLinkService();
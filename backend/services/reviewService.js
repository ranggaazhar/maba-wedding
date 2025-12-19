// services/reviewService.js
const { Review, ReviewLink, Booking, Admin } = require('../models');
const { Op } = require('sequelize');

class ReviewService {
  async getAllReviews(filters = {}) {
    const where = {};
    
    if (filters.is_approved !== undefined) {
      where.is_approved = filters.is_approved;
    }
    
    if (filters.is_published !== undefined) {
      where.is_published = filters.is_published;
    }
    
    if (filters.is_featured !== undefined) {
      where.is_featured = filters.is_featured;
    }
    
    if (filters.rating) {
      where.rating = filters.rating;
    }
    
    if (filters.min_rating) {
      where.rating = { [Op.gte]: filters.min_rating };
    }
    
    if (filters.search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${filters.search}%` } },
        { review_text: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    if (filters.has_reply !== undefined) {
      if (filters.has_reply) {
        where.admin_reply = { [Op.ne]: null };
      } else {
        where.admin_reply = null;
      }
    }
    
    const include = [
      { 
        model: ReviewLink, 
        as: 'reviewLink',
        include: [{ model: Booking, as: 'booking' }]
      }
    ];
    
    if (filters.includeReplier) {
      include.push({
        model: Admin,
        as: 'replier',
        attributes: ['id', 'name', 'email']
      });
    }
    
    if (filters.includeModerator) {
      include.push({
        model: Admin,
        as: 'moderator',
        attributes: ['id', 'name', 'email']
      });
    }
    
    const reviews = await Review.findAll({
      where,
      include,
      order: [['submitted_at', 'DESC']]
    });
    
    return reviews;
  }
  
  async getReviewById(id, includeAll = true) {
    const include = [
      { 
        model: ReviewLink, 
        as: 'reviewLink',
        include: [{ model: Booking, as: 'booking' }]
      }
    ];
    
    if (includeAll) {
      include.push(
        {
          model: Admin,
          as: 'replier',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Admin,
          as: 'moderator',
          attributes: ['id', 'name', 'email']
        }
      );
    }
    
    const review = await Review.findByPk(id, { include });
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    return review;
  }
  
  async createReview(data) {
    // Verify review link exists and is valid
    const reviewLink = await ReviewLink.findByPk(data.review_link_id);
    if (!reviewLink) {
      throw new Error('Review link not found');
    }
    
    if (reviewLink.is_used) {
      throw new Error('Review link has already been used');
    }
    
    if (reviewLink.expires_at && new Date(reviewLink.expires_at) < new Date()) {
      throw new Error('Review link has expired');
    }
    
    // Create review
    const review = await Review.create({
      review_link_id: data.review_link_id,
      customer_name: data.customer_name,
      rating: data.rating,
      review_text: data.review_text
    });
    
    // Mark review link as used
    await reviewLink.update({ is_used: true });
    
    return await this.getReviewById(review.id);
  }
  
  async updateReview(id, data) {
    const review = await this.getReviewById(id, false);
    await review.update(data);
    return await this.getReviewById(id);
  }
  
  async deleteReview(id) {
    const review = await this.getReviewById(id);
    await review.destroy();
    return { message: 'Review deleted successfully' };
  }
  
  async submitReply(id, replyData, adminId) {
    const review = await this.getReviewById(id, false);
    
    await review.update({
      admin_reply: replyData.admin_reply,
      replied_at: new Date(),
      replied_by: adminId
    });
    
    return await this.getReviewById(id);
  }
  
  async moderateReview(id, moderationData, adminId) {
    const review = await this.getReviewById(id, false);
    
    await review.update({
      is_approved: moderationData.is_approved,
      moderated_at: new Date(),
      moderated_by: adminId
    });
    
    return await this.getReviewById(id);
  }
  
  async togglePublishStatus(id) {
    const review = await this.getReviewById(id, false);
    
    // Can only publish approved reviews
    if (!review.is_approved && !review.is_published) {
      throw new Error('Cannot publish an unapproved review');
    }
    
    await review.update({ is_published: !review.is_published });
    return review;
  }
  
  async toggleFeaturedStatus(id) {
    const review = await this.getReviewById(id, false);
    
    // Can only feature published reviews
    if (!review.is_published && !review.is_featured) {
      throw new Error('Cannot feature an unpublished review');
    }
    
    await review.update({ is_featured: !review.is_featured });
    return review;
  }
  
  async getPublishedReviews(limit = null, featuredOnly = false) {
    const where = {
      is_published: true,
      is_approved: true
    };
    
    if (featuredOnly) {
      where.is_featured = true;
    }
    
    const options = {
      where,
      include: [
        { 
          model: ReviewLink, 
          as: 'reviewLink',
          include: [{ model: Booking, as: 'booking' }]
        }
      ],
      order: [['submitted_at', 'DESC']]
    };
    
    if (limit) {
      options.limit = limit;
    }
    
    return await Review.findAll(options);
  }
  
  async getAverageRating() {
    const result = await Review.findOne({
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'averageRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'totalReviews']
      ],
      where: {
        is_approved: true,
        is_published: true
      },
      raw: true
    });
    
    return {
      averageRating: parseFloat(result.averageRating || 0).toFixed(2),
      totalReviews: parseInt(result.totalReviews || 0)
    };
  }
  
  async getRatingDistribution() {
    const distribution = await Review.findAll({
      attributes: [
        'rating',
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'count']
      ],
      where: {
        is_approved: true,
        is_published: true
      },
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });
    
    // Format as object with all ratings (1-5)
    const result = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    
    distribution.forEach(item => {
      result[item.rating] = parseInt(item.count);
    });
    
    return result;
  }
  
  async getStatistics() {
    const total = await Review.count();
    const approved = await Review.count({ where: { is_approved: true } });
    const published = await Review.count({ where: { is_published: true } });
    const featured = await Review.count({ where: { is_featured: true } });
    const pending = await Review.count({ where: { is_approved: false } });
    const withReply = await Review.count({ where: { admin_reply: { [Op.ne]: null } } });
    
    const avgRating = await this.getAverageRating();
    
    return {
      total,
      approved,
      published,
      featured,
      pending,
      withReply,
      averageRating: avgRating.averageRating,
      totalReviews: avgRating.totalReviews
    };
  }
}

module.exports = new ReviewService();
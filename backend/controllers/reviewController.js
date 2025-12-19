// controllers/reviewController.js
const reviewService = require('../services/reviewService');

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const filters = {
        is_approved: req.query.is_approved === 'true' ? true : req.query.is_approved === 'false' ? false : undefined,
        is_published: req.query.is_published === 'true' ? true : req.query.is_published === 'false' ? false : undefined,
        is_featured: req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : undefined,
        rating: req.query.rating ? parseInt(req.query.rating) : undefined,
        min_rating: req.query.min_rating ? parseInt(req.query.min_rating) : undefined,
        search: req.query.search,
        has_reply: req.query.has_reply === 'true' ? true : req.query.has_reply === 'false' ? false : undefined,
        includeReplier: req.query.include_replier === 'true',
        includeModerator: req.query.include_moderator === 'true'
      };
      
      const reviews = await reviewService.getAllReviews(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: reviews
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve reviews',
        error: error.message
      });
    }
  }
  
  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const includeAll = req.query.include_all !== 'false';
      
      const review = await reviewService.getReviewById(id, includeAll);
      
      return res.status(200).json({
        success: true,
        message: 'Review retrieved successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createReview(req, res) {
    try {
      const review = await reviewService.createReview(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Review link not found') {
        statusCode = 404;
      } else if (error.message.includes('already been used') || error.message.includes('expired')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.updateReview(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async submitReply(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      const review = await reviewService.submitReply(id, req.body, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Reply submitted successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async moderateReview(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      const review = await reviewService.moderateReview(id, req.body, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Review moderated successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async togglePublishStatus(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.togglePublishStatus(id);
      
      return res.status(200).json({
        success: true,
        message: 'Review publish status toggled successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 :
                        error.message.includes('Cannot publish') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async toggleFeaturedStatus(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.toggleFeaturedStatus(id);
      
      return res.status(200).json({
        success: true,
        message: 'Review featured status toggled successfully',
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Review not found' ? 404 :
                        error.message.includes('Cannot feature') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getPublishedReviews(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      const featuredOnly = req.query.featured_only === 'true';
      
      const reviews = await reviewService.getPublishedReviews(limit, featuredOnly);
      
      return res.status(200).json({
        success: true,
        message: 'Published reviews retrieved successfully',
        data: reviews
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve published reviews',
        error: error.message
      });
    }
  }
  
  async getAverageRating(req, res) {
    try {
      const result = await reviewService.getAverageRating();
      
      return res.status(200).json({
        success: true,
        message: 'Average rating retrieved successfully',
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve average rating',
        error: error.message
      });
    }
  }
  
  async getRatingDistribution(req, res) {
    try {
      const distribution = await reviewService.getRatingDistribution();
      
      return res.status(200).json({
        success: true,
        message: 'Rating distribution retrieved successfully',
        data: distribution
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rating distribution',
        error: error.message
      });
    }
  }
  
  async getStatistics(req, res) {
    try {
      const statistics = await reviewService.getStatistics();
      
      return res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ReviewController();
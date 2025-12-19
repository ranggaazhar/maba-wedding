// controllers/reviewLinkController.js
const reviewLinkService = require('../services/reviewLinkService');

class ReviewLinkController {
  async getAllReviewLinks(req, res) {
    try {
      const filters = {
        is_used: req.query.is_used === 'true' ? true : req.query.is_used === 'false' ? false : undefined,
        is_expired: req.query.is_expired === 'true' ? true : req.query.is_expired === 'false' ? false : undefined,
        search: req.query.search,
        includeReview: req.query.include_review === 'true',
        includeCreator: req.query.include_creator === 'true'
      };
      
      const reviewLinks = await reviewLinkService.getAllReviewLinks(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Review links retrieved successfully',
        data: reviewLinks
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve review links',
        error: error.message
      });
    }
  }
  
  async getReviewLinkById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include_relations !== 'false';
      
      const reviewLink = await reviewLinkService.getReviewLinkById(id, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Review link retrieved successfully',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getReviewLinkByToken(req, res) {
    try {
      const { token } = req.params;
      const reviewLink = await reviewLinkService.getReviewLinkByToken(token);
      
      return res.status(200).json({
        success: true,
        message: 'Review link retrieved successfully',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createReviewLink(req, res) {
    try {
      const adminId = req.admin?.id;
      const reviewLink = await reviewLinkService.createReviewLink(req.body, adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Review link created successfully',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking not found' ? 404 :
                        error.message.includes('already exists') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateReviewLink(req, res) {
    try {
      const { id } = req.params;
      const reviewLink = await reviewLinkService.updateReviewLink(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Review link updated successfully',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 :
                        error.message.includes('Cannot update') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteReviewLink(req, res) {
    try {
      const { id } = req.params;
      const result = await reviewLinkService.deleteReviewLink(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 :
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async markAsSent(req, res) {
    try {
      const { id } = req.params;
      const reviewLink = await reviewLinkService.markAsSent(id);
      
      return res.status(200).json({
        success: true,
        message: 'Review link marked as sent',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async validateReviewLink(req, res) {
    try {
      const { token } = req.params;
      const reviewLink = await reviewLinkService.validateReviewLink(token);
      
      return res.status(200).json({
        success: true,
        message: 'Review link is valid',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async regenerateToken(req, res) {
    try {
      const { id } = req.params;
      const reviewLink = await reviewLinkService.regenerateToken(id);
      
      return res.status(200).json({
        success: true,
        message: 'Token regenerated successfully',
        data: reviewLink
      });
    } catch (error) {
      const statusCode = error.message === 'Review link not found' ? 404 :
                        error.message.includes('Cannot regenerate') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getStatistics(req, res) {
    try {
      const statistics = await reviewLinkService.getStatistics();
      
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

module.exports = new ReviewLinkController();
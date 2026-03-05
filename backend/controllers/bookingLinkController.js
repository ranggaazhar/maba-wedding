// controllers/bookingLinkController.js
const bookingLinkService = require('../services/bookingLinkService');

class BookingLinkController {
  async getAllBookingLinks(req, res) {
    try {
      const filters = {
        is_used: req.query.is_used === 'true' ? true : req.query.is_used === 'false' ? false : undefined,
        is_expired: req.query.is_expired === 'true' ? true : req.query.is_expired === 'false' ? false : undefined,
        search: req.query.search,
        includeBooking: req.query.include_booking === 'true',
        includeCreator: req.query.include_creator === 'true'
      };
      
      const bookingLinks = await bookingLinkService.getAllBookingLinks(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Booking links retrieved successfully',
        data: bookingLinks
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve booking links',
        error: error.message
      });
    }
  }
  
  async getBookingLinkById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include_relations !== 'false';
      
      const bookingLink = await bookingLinkService.getBookingLinkById(id, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Booking link retrieved successfully',
        data: bookingLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getBookingLinkByToken(req, res) {
    try {
      const { token } = req.params;
      const bookingLink = await bookingLinkService.getBookingLinkByToken(token);
      
      return res.status(200).json({
        success: true,
        message: 'Booking link retrieved successfully',
        data: bookingLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createBookingLink(req, res) {
    try {
      const adminId = req.admin?.id;
      const bookingLink = await bookingLinkService.createBookingLink(req.body, adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Booking link created successfully',
        data: bookingLink
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking link',
        error: error.message
      });
    }
  }
  
  async updateBookingLink(req, res) {
    try {
      const { id } = req.params;
      const bookingLink = await bookingLinkService.updateBookingLink(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Booking link updated successfully',
        data: bookingLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 :
                        error.message.includes('Cannot update') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteBookingLink(req, res) {
    try {
      const { id } = req.params;
      const result = await bookingLinkService.deleteBookingLink(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 :
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async validateBookingLink(req, res) {
    try {
      const { token } = req.params;
      const bookingLink = await bookingLinkService.validateBookingLink(token);
      
      return res.status(200).json({
        success: true,
        message: 'Booking link is valid',
        data: bookingLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async regenerateToken(req, res) {
    try {
      const { id } = req.params;
      const bookingLink = await bookingLinkService.regenerateToken(id);
      
      return res.status(200).json({
        success: true,
        message: 'Token regenerated successfully',
        data: bookingLink
      });
    } catch (error) {
      const statusCode = error.message === 'Booking link not found' ? 404 :
                        error.message.includes('Cannot regenerate') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getStatistics(req, res) {
    try {
      const statistics = await bookingLinkService.getStatistics();
      
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

module.exports = new BookingLinkController();
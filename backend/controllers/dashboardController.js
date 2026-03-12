// controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getStats(req, res) {
    try {
      const data = await dashboardService.getStats();
      return res.status(200).json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data,
      });
    } catch (error) {
      console.error('Dashboard getStats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard stats',
        error: error.message,
      });
    }
  }

  async getRecentBookings(req, res) {
    try {
      const limit = req.query.limit || 5;
      const data = await dashboardService.getRecentBookings(limit);
      return res.status(200).json({
        success: true,
        message: 'Recent bookings retrieved successfully',
        data,
      });
    } catch (error) {
      console.error('Dashboard getRecentBookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent bookings',
        error: error.message,
      });
    }
  }

  async getRecentReviews(req, res) {
    try {
      const limit = req.query.limit || 5;
      const data = await dashboardService.getRecentReviews(limit);
      return res.status(200).json({
        success: true,
        message: 'Recent reviews retrieved successfully',
        data,
      });
    } catch (error) {
      console.error('Dashboard getRecentReviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent reviews',
        error: error.message,
      });
    }
  }
}

module.exports = new DashboardController();
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/admin/dashboardController');
const authMiddleware = require('../middleware/auth');

router.get('/stats',           authMiddleware, dashboardController.getStats);
router.get('/recent-bookings', authMiddleware, dashboardController.getRecentBookings);
router.get('/recent-reviews',  authMiddleware, dashboardController.getRecentReviews);

module.exports = router;
// routes/customRequestRoutes.js
const express = require('express');
const router = express.Router();
const customRequestController = require('../controllers/customer/customRequestController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processMultipleImages } = require('../middleware/imageProcessor');
const {
  createCustomRequestValidation,
  updateCustomRequestValidation,
  reviewCustomRequestValidation,
  customRequestIdValidation,
  validate,
} = require('../validators/customRequestValidator');
router.get(
  '/admin/custom-requests/statistics',
  authMiddleware,
  customRequestController.getStatistics
);

// GET  /api/admin/custom-requests
router.get(
  '/admin/custom-requests',
  authMiddleware,
  customRequestController.getAll
);

// PATCH /api/admin/custom-requests/:id/review
router.patch(
  '/admin/custom-requests/:id/review',
  authMiddleware,
  reviewCustomRequestValidation, validate,
  customRequestController.review
);

// =============================================================================
// CUSTOMER ROUTES (public)
// =============================================================================

// GET  /api/bookings/:bookingId/custom-requests
router.get(
  '/bookings/:bookingId/custom-requests',
  customRequestController.getByBooking
);

// POST /api/bookings/:bookingId/custom-requests
router.post(
  '/bookings/:bookingId/custom-requests',
  upload.customRequestImages.array('reference_images', 7),
  (req, res, next) => {
    console.log('Files setelah multer:', req.files); // ← cek apakah multer berhasil
    next();
  },
  processMultipleImages({ width: 1280, quality: 80, format: 'jpeg' }),
  (req, res, next) => {
    console.log('Files setelah optimize:', req.files); // ← cek apakah sharp berhasil
    next();
  },
  createCustomRequestValidation, validate,
  customRequestController.create
);

// GET  /api/custom-requests/:id
router.get(
  '/custom-requests/:id',
  customRequestIdValidation, validate,
  customRequestController.getById
);

// PUT  /api/custom-requests/:id
router.put(
  '/custom-requests/:id',
  upload.customRequestImages.array('reference_images', 7),
  processMultipleImages({ width: 1280, quality: 80, format: 'jpeg' }),
  updateCustomRequestValidation, validate,
  customRequestController.update
);

// DELETE /api/custom-requests/:id
router.delete(
  '/custom-requests/:id',
  customRequestIdValidation, validate,
  customRequestController.delete
);

// DELETE /api/custom-requests/:id/images/:index
router.delete(
  '/custom-requests/:id/images/:index',
  customRequestController.deleteImage
);

module.exports = router;
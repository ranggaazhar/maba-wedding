const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/customer/bookingController');
const bookingLinkController = require('../controllers/admin/bookingLinkController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processImage } = require('../middleware/imageProcessor');
const {
  createBookingLinkValidation,
  updateBookingLinkValidation,
  bookingLinkTokenValidation,
  createBookingValidation,
  updateBookingValidation,
  submitPaymentValidation,
  uploadPaymentProofValidation,
  bookingIdValidation,
  validate,
} = require('../validators/bookingValidator');


router.get('/links', authMiddleware, bookingLinkController.getAllBookingLinks);
router.get('/links/token/:token', bookingLinkTokenValidation, validate, bookingLinkController.getBookingLinkByToken);
router.post('/links/validate/:token',bookingLinkTokenValidation, validate, bookingLinkController.validateBookingLink);
router.get('/links/:id', authMiddleware, bookingLinkController.getBookingLinkById);
router.post('/links', authMiddleware, createBookingLinkValidation, validate, bookingLinkController.createBookingLink);
router.put('/links/:id',authMiddleware, updateBookingLinkValidation, validate, bookingLinkController.updateBookingLink);
router.delete('/links/:id',authMiddleware, bookingLinkController.deleteBookingLink);
router.patch('/links/:id/regenerate-token',authMiddleware, bookingLinkController.regenerateToken);


router.get('/',authMiddleware, bookingController.getAllBookings);
router.get('/statistics',authMiddleware, bookingController.getStatistics);
router.get('/date-range',authMiddleware, bookingController.getBookingsByDateRange);
router.get('/:id',authMiddleware, bookingIdValidation, validate, bookingController.getBookingById);
router.post('/', createBookingValidation, validate, bookingController.createBooking);
router.put('/:id',authMiddleware, updateBookingValidation, validate, bookingController.updateBooking);
router.delete('/:id',authMiddleware, bookingIdValidation, validate, bookingController.deleteBooking);

router.post('/:id/payment-proof/upload',
  upload.paymentProof.single('payment_proof'),
  processImage({ width: 1920, quality: 80 }),
  uploadPaymentProofValidation, validate,
  bookingController.uploadPaymentProof
);
router.post('/:id/submit-payment',   bookingIdValidation, submitPaymentValidation, validate, bookingController.submitPayment);
router.post('/:id/confirm-payment',  authMiddleware, bookingIdValidation, validate, bookingController.confirmPayment);
router.post('/:id/reject-payment',   authMiddleware, bookingIdValidation, validate, bookingController.rejectPayment);

module.exports = router;
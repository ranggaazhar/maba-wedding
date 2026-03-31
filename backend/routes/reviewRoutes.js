const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/customer/reviewController');
const reviewLinkController = require('../controllers/admin/reviewLinkController');
const authMiddleware = require('../middleware/auth');
const {
  createReviewLinkValidation,
  updateReviewLinkValidation,
  reviewLinkTokenValidation,
  createReviewValidation,
  updateReviewValidation,
  submitReplyValidation,
  moderateReviewValidation,
  reviewIdValidation,
  validate,
} = require('../validators/reviewValidator');

// ── Review Links ───────────────────────────────────────────────
router.get('/links',                          authMiddleware, reviewLinkController.getAllReviewLinks);
router.get('/links/statistics',               authMiddleware, reviewLinkController.getStatistics);
router.get('/links/token/:token',             reviewLinkTokenValidation, validate, reviewLinkController.getReviewLinkByToken);
router.post('/links/validate/:token',         reviewLinkTokenValidation, validate, reviewLinkController.validateReviewLink);
router.get('/links/:id',                      authMiddleware, reviewLinkController.getReviewLinkById);
router.post('/links',                         authMiddleware, createReviewLinkValidation, validate, reviewLinkController.createReviewLink);
router.put('/links/:id',                      authMiddleware, updateReviewLinkValidation, validate, reviewLinkController.updateReviewLink);
router.delete('/links/:id',                   authMiddleware, reviewLinkController.deleteReviewLink);
router.patch('/links/:id/mark-sent',          authMiddleware, reviewLinkController.markAsSent);
router.patch('/links/:id/regenerate-token',   authMiddleware, reviewLinkController.regenerateToken);

// ── Reviews ────────────────────────────────────────────────────
router.get('/published',          reviewController.getPublishedReviews);
router.get('/average-rating',     reviewController.getAverageRating);
router.get('/rating-distribution',reviewController.getRatingDistribution);
router.get('/statistics',         authMiddleware, reviewController.getStatistics);
router.get('/',                   authMiddleware, reviewController.getAllReviews);
router.get('/:id',                authMiddleware, reviewIdValidation, validate, reviewController.getReviewById);
router.post('/',                  createReviewValidation, validate, reviewController.createReview);
router.put('/:id',                authMiddleware, updateReviewValidation, validate, reviewController.updateReview);
router.delete('/:id',             authMiddleware, reviewIdValidation, validate, reviewController.deleteReview);
router.post('/:id/reply',         authMiddleware, submitReplyValidation, validate, reviewController.submitReply);
router.post('/:id/moderate',      authMiddleware, moderateReviewValidation, validate, reviewController.moderateReview);
router.patch('/:id/toggle-publish',  authMiddleware, reviewIdValidation, validate, reviewController.togglePublishStatus);
router.patch('/:id/toggle-featured', authMiddleware, reviewIdValidation, validate, reviewController.toggleFeaturedStatus);

module.exports = router;
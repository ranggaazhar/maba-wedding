// validators/reviewValidator.js
const { body, param, validationResult } = require('express-validator');

// ReviewLink Validations
const createReviewLinkValidation = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('expires_at')
    .optional()
    .isISO8601().withMessage('Expires at must be a valid date')
];

const updateReviewLinkValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid review link ID'),
  
  body('expires_at')
    .optional()
    .isISO8601().withMessage('Expires at must be a valid date')
];

const reviewLinkTokenValidation = [
  param('token')
    .trim()
    .notEmpty().withMessage('Token is required')
];

// Review Validations
const createReviewValidation = [
  body('review_link_id')
    .notEmpty().withMessage('Review link ID is required')
    .isInt({ min: 1 }).withMessage('Invalid review link ID'),
  
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('review_text')
    .trim()
    .notEmpty().withMessage('Review text is required')
];

const updateReviewValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid review ID'),
  
  body('customer_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Customer name cannot be empty')
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('review_text')
    .optional()
    .trim()
    .notEmpty().withMessage('Review text cannot be empty')
];

const submitReplyValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid review ID'),
  
  body('admin_reply')
    .trim()
    .notEmpty().withMessage('Admin reply is required')
];

const moderateReviewValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid review ID'),
  
  body('is_approved')
    .notEmpty().withMessage('Approval status is required')
    .isBoolean().withMessage('is_approved must be a boolean')
];

const reviewIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid review ID')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  createReviewLinkValidation,
  updateReviewLinkValidation,
  reviewLinkTokenValidation,
  createReviewValidation,
  updateReviewValidation,
  submitReplyValidation,
  moderateReviewValidation,
  reviewIdValidation,
  validate
};
// validators/bookingValidator.js
const { body, param, query, validationResult } = require('express-validator');

// BookingLink Validations
const createBookingLinkValidation = [
  body('customer_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('customer_phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  
  body('expires_at')
    .optional()
    .isISO8601().withMessage('Expires at must be a valid date'),
  
  body('notes')
    .optional()
    .trim()
];

const updateBookingLinkValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid booking link ID'),
  
  body('customer_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('customer_phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  
  body('expires_at')
    .optional()
    .isISO8601().withMessage('Expires at must be a valid date'),
  
  body('notes')
    .optional()
    .trim()
];

const bookingLinkTokenValidation = [
  param('token')
    .trim()
    .notEmpty().withMessage('Token is required')
];

// Booking Validations
const createBookingValidation = [
  body('booking_link_id')
    .notEmpty().withMessage('Booking link ID is required')
    .isInt({ min: 1 }).withMessage('Invalid booking link ID'),
  
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('customer_phone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  
  body('full_address')
    .trim()
    .notEmpty().withMessage('Full address is required'),
  
  body('event_venue')
    .trim()
    .notEmpty().withMessage('Event venue is required'),
  
  body('event_date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Event date must be a valid date'),
  
  body('event_type')
    .trim()
    .notEmpty().withMessage('Event type is required')
    .isLength({ max: 100 }).withMessage('Event type must not exceed 100 characters'),
  
  body('referral_source')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Referral source must not exceed 100 characters'),
  
  body('theme_color')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Theme color must not exceed 100 characters'),
  
  body('total_estimate')
    .optional()
    .isDecimal().withMessage('Total estimate must be a valid decimal number'),
  
  body('customer_notes')
    .optional()
    .trim(),
  
  body('models')
    .optional()
    .isArray().withMessage('Models must be an array'),
  
  body('properties')
    .optional()
    .isArray().withMessage('Properties must be an array')
];

const updateBookingValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('customer_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Customer name cannot be empty')
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('customer_phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Customer phone cannot be empty')
    .isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  
  body('full_address')
    .optional()
    .trim()
    .notEmpty().withMessage('Full address cannot be empty'),
  
  body('event_venue')
    .optional()
    .trim()
    .notEmpty().withMessage('Event venue cannot be empty'),
  
  body('event_date')
    .optional()
    .isISO8601().withMessage('Event date must be a valid date'),
  
  body('event_type')
    .optional()
    .trim()
    .notEmpty().withMessage('Event type cannot be empty')
    .isLength({ max: 100 }).withMessage('Event type must not exceed 100 characters'),
  
  body('referral_source')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Referral source must not exceed 100 characters'),
  
  body('theme_color')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Theme color must not exceed 100 characters'),
  
  body('total_estimate')
    .optional()
    .isDecimal().withMessage('Total estimate must be a valid decimal number'),
  
  body('customer_notes')
    .optional()
    .trim()
];

const uploadPaymentProofValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('bank_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Bank name must not exceed 100 characters'),
  
  body('account_number')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Account number must not exceed 50 characters'),
  
  body('account_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Account name must not exceed 100 characters')
];


const submitPaymentValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('payment_proof_url')
    .trim()
    .notEmpty().withMessage('Payment proof URL is required')
    .isURL().withMessage('Payment proof URL must be valid'),
  
  body('bank_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Bank name must not exceed 100 characters'),
  
  body('account_number')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Account number must not exceed 50 characters'),
  
  body('account_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Account name must not exceed 100 characters')
];

// BookingModel Validations
const createBookingModelValidation = [
  param('bookingId')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Invalid category ID'),
  
  body('project_id')
    .notEmpty().withMessage('Project ID is required')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('project_title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ max: 200 }).withMessage('Project title must not exceed 200 characters'),
  
  body('price')
    .optional()
    .isDecimal().withMessage('Price must be a valid decimal number'),
  
  body('notes')
    .optional()
    .trim(),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

// BookingProperty Validations
const createBookingPropertyValidation = [
  param('bookingId')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('property_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid property ID'),
  
  body('property_name')
    .trim()
    .notEmpty().withMessage('Property name is required')
    .isLength({ max: 200 }).withMessage('Property name must not exceed 200 characters'),
  
  body('property_category')
    .trim()
    .notEmpty().withMessage('Property category is required')
    .isLength({ max: 100 }).withMessage('Property category must not exceed 100 characters'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isDecimal().withMessage('Price must be a valid decimal number'),
  
  body('subtotal')
    .notEmpty().withMessage('Subtotal is required')
    .isDecimal().withMessage('Subtotal must be a valid decimal number')
];

const bookingIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid booking ID')
];

const bookingCodeValidation = [
  param('code')
    .trim()
    .notEmpty().withMessage('Booking code is required')
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
  createBookingLinkValidation,
  updateBookingLinkValidation,
  bookingLinkTokenValidation,
  createBookingValidation,
  updateBookingValidation,
  submitPaymentValidation,
  createBookingModelValidation,
  createBookingPropertyValidation,
  uploadPaymentProofValidation,
  bookingIdValidation,
  bookingCodeValidation,
  validate
};
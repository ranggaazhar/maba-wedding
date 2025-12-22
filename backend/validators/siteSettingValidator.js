// validators/siteSettingValidator.js
const { body, param, validationResult } = require('express-validator');

const createSiteSettingValidation = [
  body('setting_key')
    .trim()
    .notEmpty().withMessage('Setting key is required')
    .isLength({ max: 100 }).withMessage('Setting key must not exceed 100 characters')
    .matches(/^[a-z0-9_]+$/).withMessage('Setting key must contain only lowercase letters, numbers, and underscores'),
  
  body('setting_value')
    .optional()
    .trim(),
  
  body('setting_type')
    .optional()
    .trim()
    .isIn(['text', 'number', 'boolean', 'json', 'url', 'email', 'tel', 'textarea'])
    .withMessage('Invalid setting type'),
  
  body('description')
    .optional()
    .trim()
];

const updateSiteSettingValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid site setting ID'),
  
  body('setting_value')
    .optional()
    .trim(),
  
  body('setting_type')
    .optional()
    .trim()
    .isIn(['text', 'number', 'boolean', 'json', 'url', 'email', 'tel', 'textarea'])
    .withMessage('Invalid setting type'),
  
  body('description')
    .optional()
    .trim()
];

const bulkUpdateSettingsValidation = [
  body('settings')
    .isArray().withMessage('Settings must be an array'),
  
  body('settings.*.setting_key')
    .trim()
    .notEmpty().withMessage('Setting key is required'),
  
  body('settings.*.setting_value')
    .optional()
];

// validators/invoiceValidator.js
const createInvoiceValidation = [
  body('booking_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),
  
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  
  body('customer_phone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  
  body('customer_address')
    .optional()
    .trim(),
  
  body('event_venue')
    .trim()
    .notEmpty().withMessage('Event venue is required'),
  
  body('event_date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Event date must be a valid date'),
  
  body('event_type')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Event type must not exceed 100 characters'),
  
  body('total')
    .notEmpty().withMessage('Total is required')
    .isDecimal().withMessage('Total must be a valid decimal number'),
  
  body('down_payment')
    .optional()
    .isDecimal().withMessage('Down payment must be a valid decimal number'),
  
  body('issue_date')
    .notEmpty().withMessage('Issue date is required')
    .isISO8601().withMessage('Issue date must be a valid date'),
  
  body('due_date')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date'),
  
  body('notes')
    .optional()
    .trim(),
  
  body('admin_notes')
    .optional()
    .trim(),
  
  body('payment_terms')
    .optional()
    .trim(),
  
  body('items')
    .optional()
    .isArray().withMessage('Items must be an array')
];

const updateInvoiceValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid invoice ID'),
  
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
  
  body('customer_address')
    .optional()
    .trim(),
  
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
    .isLength({ max: 100 }).withMessage('Event type must not exceed 100 characters'),
  
  body('total')
    .optional()
    .isDecimal().withMessage('Total must be a valid decimal number'),
  
  body('down_payment')
    .optional()
    .isDecimal().withMessage('Down payment must be a valid decimal number'),
  
  body('issue_date')
    .optional()
    .isISO8601().withMessage('Issue date must be a valid date'),
  
  body('due_date')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),
  
  body('notes')
    .optional()
    .trim(),
  
  body('admin_notes')
    .optional()
    .trim(),
  
  body('payment_terms')
    .optional()
    .trim()
];

const createInvoiceItemValidation = [
  param('invoiceId')
    .isInt({ min: 1 }).withMessage('Invalid invoice ID'),
  
  body('item_name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 255 }).withMessage('Item name must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('unit_price')
    .notEmpty().withMessage('Unit price is required')
    .isDecimal().withMessage('Unit price must be a valid decimal number'),
  
  body('subtotal')
    .notEmpty().withMessage('Subtotal is required')
    .isDecimal().withMessage('Subtotal must be a valid decimal number'),
  
  body('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('property_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid property ID'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

const invoiceIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid invoice ID')
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
  createSiteSettingValidation,
  updateSiteSettingValidation,
  bulkUpdateSettingsValidation,
  createInvoiceValidation,
  updateInvoiceValidation,
  createInvoiceItemValidation,
  invoiceIdValidation,
  validate
};
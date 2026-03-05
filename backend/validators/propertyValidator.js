// validators/propertyValidator.js
const { body, param, validationResult } = require('express-validator');

const createPropertyValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 200 }).withMessage('Name must not exceed 200 characters'),
  
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .isLength({ max: 200 }).withMessage('Slug must not exceed 200 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isDecimal({ decimal_digits: '0,2' }).withMessage('Price must be a valid decimal number')
    .custom(value => parseFloat(value) >= 0).withMessage('Price must be a positive number'),

  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL'),
  
  body('created_by')
    .optional()
    .isInt({ min: 1 }).withMessage('created_by must be a valid integer')
];

const updatePropertyValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid property ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 200 }).withMessage('Name must not exceed 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .notEmpty().withMessage('Slug cannot be empty')
    .isLength({ max: 200 }).withMessage('Slug must not exceed 200 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('Price must be a valid decimal number')
    .custom(value => parseFloat(value) >= 0).withMessage('Price must be a positive number'),
  
  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean'),
  
  body('image_url')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL')
];

const propertyIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid property ID')
];

const propertySlugValidation = [
  param('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
];

// Validation for PropertyImage
const createPropertyImageValidation = [
  param('propertyId')
    .isInt({ min: 1 }).withMessage('Invalid property ID'),
  
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL().withMessage('Must be a valid URL'),
  
  body('is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

const updatePropertyImageValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid image ID'),
  
  body('url')
    .optional()
    .trim()
    .notEmpty().withMessage('URL cannot be empty')
    .isURL().withMessage('Must be a valid URL'),
  
  body('is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

const imageIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid image ID')
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
  createPropertyValidation,
  updatePropertyValidation,
  propertyIdValidation,
  propertySlugValidation,
  createPropertyImageValidation,
  updatePropertyImageValidation,
  imageIdValidation,
  validate
};
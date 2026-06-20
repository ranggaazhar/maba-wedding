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
    .trim(),
  
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
  validate
};
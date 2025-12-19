// validators/propertyCategoryValidator.js
const { body, param, validationResult } = require('express-validator');

const createPropertyCategoryValidation = [
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .isLength({ max: 100 }).withMessage('Slug must not exceed 100 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean')
];

const updatePropertyCategoryValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid property category ID'),
  
  body('slug')
    .optional()
    .trim()
    .notEmpty().withMessage('Slug cannot be empty')
    .isLength({ max: 100 }).withMessage('Slug must not exceed 100 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean')
];

const propertyCategoryIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid property category ID')
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
  createPropertyCategoryValidation,
  updatePropertyCategoryValidation,
  propertyCategoryIdValidation,
  validate
};
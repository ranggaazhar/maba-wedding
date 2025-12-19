// validators/projectValidator.js
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const createProjectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .isLength({ max: 200 }).withMessage('Slug must not exceed 200 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
  
  body('price')
    .optional()
    .isDecimal().withMessage('Price must be a valid decimal number'),
  
  body('theme')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Theme must not exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('atmosphere_description')
    .optional()
    .trim(),
  
  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean'),
  
  body('is_published')
    .optional()
    .isBoolean().withMessage('is_published must be a boolean'),
  
  body('created_by')
    .optional()
    .isInt({ min: 1 }).withMessage('created_by must be a valid integer')
];

const updateProjectValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .notEmpty().withMessage('Slug cannot be empty')
    .isLength({ max: 200 }).withMessage('Slug must not exceed 200 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
  
  body('price')
    .optional()
    .isDecimal().withMessage('Price must be a valid decimal number'),
  
  body('theme')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Theme must not exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('atmosphere_description')
    .optional()
    .trim(),
  
  body('is_featured')
    .optional()
    .isBoolean().withMessage('is_featured must be a boolean'),
  
  body('is_published')
    .optional()
    .isBoolean().withMessage('is_published must be a boolean')
];

const projectIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid project ID')
];

const projectSlugValidation = [
  param('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
];

// Validation for nested resources
const createProjectPhotoValidation = [
  param('projectId')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL().withMessage('Must be a valid URL'),
  
  body('caption')
    .optional()
    .trim(),
  
  body('position')
    .optional()
    .isIn(['left', 'right', 'center']).withMessage('Position must be left, right, or center'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('is_hero')
    .optional()
    .isBoolean().withMessage('is_hero must be a boolean')
];

const createProjectDetailValidation = [
  param('projectId')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('detail_type')
    .optional()
    .isIn(['color_palette', 'flowers', 'other']).withMessage('Invalid detail type'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('items')
    .optional()
    .isArray().withMessage('Items must be an array'),
  
  body('items.*.content')
    .if(body('items').exists())
    .trim()
    .notEmpty().withMessage('Item content is required'),
  
  body('items.*.display_order')
    .if(body('items').exists())
    .optional()
    .isInt({ min: 0 }).withMessage('Item display order must be a positive integer')
];

const createProjectIncludeValidation = [
  param('projectId')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('item')
    .trim()
    .notEmpty().withMessage('Item is required'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
];

const createProjectMoodValidation = [
  param('projectId')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),
  
  body('mood')
    .trim()
    .notEmpty().withMessage('Mood is required')
    .isLength({ max: 100 }).withMessage('Mood must not exceed 100 characters'),
  
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer')
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
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  projectSlugValidation,
  createProjectPhotoValidation,
  createProjectDetailValidation,
  createProjectIncludeValidation,
  createProjectMoodValidation,
  validate
};
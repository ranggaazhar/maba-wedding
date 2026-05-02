// validators/customRequestValidator.js
const { body, param, validationResult } = require('express-validator');

const createCustomRequestValidation = [
  param('bookingId')
    .isInt({ min: 1 }).withMessage('Invalid booking ID'),

  body('title')
    .trim()
    .notEmpty().withMessage('Judul request tidak boleh kosong')
    .isLength({ max: 200 }).withMessage('Judul maksimal 200 karakter'),

  body('description')
    .trim()
    .notEmpty().withMessage('Deskripsi tidak boleh kosong'),

  body('color_theme')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tema warna maksimal 100 karakter'),

  body('reference_images')
    .optional()
    .isArray().withMessage('Reference images harus berupa array URL'),
];

const updateCustomRequestValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid request ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Judul tidak boleh kosong')
    .isLength({ max: 200 }).withMessage('Judul maksimal 200 karakter'),

  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Deskripsi tidak boleh kosong'),

  body('color_theme')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tema warna maksimal 100 karakter'),

  body('reference_images')
    .optional()
    .isArray().withMessage('Reference images harus berupa array URL'),
];

const reviewCustomRequestValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid request ID'),

  body('status')
    .notEmpty().withMessage('Status wajib diisi')
    .isIn(['REVIEWED', 'APPROVED', 'REJECTED']).withMessage('Status tidak valid'),

  body('estimated_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimasi harga tidak boleh negatif'),

  body('admin_notes')
    .optional()
    .trim(),

  body('rejection_reason')
    .if(body('status').equals('REJECTED'))
    .notEmpty().withMessage('Alasan penolakan wajib diisi jika status REJECTED'),
];

const customRequestIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid request ID'),
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
  createCustomRequestValidation,
  updateCustomRequestValidation,
  reviewCustomRequestValidation,
  customRequestIdValidation,
  validate,
};
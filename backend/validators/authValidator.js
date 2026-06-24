const { body, validationResult } = require('express-validator');

// Validation rules for registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(?:\+62|62|0)8[1-9][0-9]{7,11}$/).withMessage('Invalid phone number format. Must be a valid Indonesian phone number (e.g. 08..., +628...)')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email salah')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];

// Validation rules for update profile
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nama harus antara 3 dan 100 karakter'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email salah')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]*$/).withMessage('Format nomor telepon salah')
];

// Validation rules for password change
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Password saat ini wajib diisi'),
  
  body('newPassword')
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/[A-Z]/).withMessage('Password harus mengandung minimal 1 huruf besar')
    .matches(/\d/).withMessage('Password harus mengandung minimal 1 angka')
    .matches(/[^A-Za-z0-9]/).withMessage('Password harus mengandung minimal 1 simbol/tanda'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Konfirmasi password wajib diisi')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Konfirmasi password tidak cocok');
      }
      return true;
    })
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  validate
};

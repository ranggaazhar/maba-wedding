const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation, 
  updateProfileValidation,
  changePasswordValidation,
  validate 
} = require('../validators/authValidator');

// Public routes
router.post('/auth/register', registerValidation, validate, authController.register);
router.post('/auth/login', loginValidation, validate, authController.login);

// Protected routes (require authentication)
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, updateProfileValidation, validate, authController.updateProfile);
router.post('/auth/change-password', authMiddleware, changePasswordValidation, validate, authController.changePassword);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/verify', authMiddleware, authController.verifyToken);

module.exports = router;
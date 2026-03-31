const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  validate,
} = require('../validators/authValidator');

router.post('/login',           loginValidation, validate, authController.login);
router.get('/profile',          authMiddleware, authController.getProfile);
router.put('/profile',          authMiddleware, updateProfileValidation, validate, authController.updateProfile);
router.post('/change-password', authMiddleware, changePasswordValidation, validate, authController.changePassword);
router.post('/logout',          authMiddleware, authController.logout);
router.get('/verify',           authMiddleware, authController.verifyToken);

module.exports = router;
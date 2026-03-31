const express = require('express');
const router = express.Router();
const propertyImageController = require('../controllers/admin/propertyImageController');
const authMiddleware = require('../middleware/auth');
const { imageIdValidation, updatePropertyImageValidation, validate } = require('../validators/propertyValidator');

router.get('/:id',           imageIdValidation, validate, propertyImageController.getImageById);
router.put('/:id',           authMiddleware, updatePropertyImageValidation, validate, propertyImageController.updateImage);
router.delete('/:id',        authMiddleware, imageIdValidation, validate, propertyImageController.deleteImage);
router.patch('/:id/set-primary', authMiddleware, imageIdValidation, validate, propertyImageController.setPrimaryImage);

module.exports = router;    
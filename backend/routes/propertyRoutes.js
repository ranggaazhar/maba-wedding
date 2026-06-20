const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/admin/propertyController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processImage } = require('../middleware/imageProcessor');
const {
  createPropertyValidation,
  updatePropertyValidation,
  propertyIdValidation,
  propertySlugValidation,
  validate,
} = require('../validators/propertyValidator');

// Property CRUD
router.get('/',                         propertyController.getAllProperties);
router.get('/available',                propertyController.getAvailableProperties);
router.get('/slug/:slug',               propertySlugValidation, validate, propertyController.getPropertyBySlug);
router.get('/:id',                      propertyIdValidation, validate, propertyController.getPropertyById);

router.post('/',
  authMiddleware,
  upload.propertyImage.single('image'),
  processImage({ width: 1920, quality: 85 }),
  createPropertyValidation,
  validate,
  propertyController.createProperty
);

router.put('/:id',
  authMiddleware,
  upload.propertyImage.single('image'),
  processImage({ width: 1920, quality: 85 }),
  updatePropertyValidation,
  validate,
  propertyController.updateProperty
);

router.delete('/:id',                   authMiddleware, propertyIdValidation, validate, propertyController.deleteProperty);
router.patch('/:id/toggle-availability',authMiddleware, propertyIdValidation, validate, propertyController.toggleAvailability);

module.exports = router;
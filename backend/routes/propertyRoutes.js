const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/admin/propertyController');
const propertyImageController = require('../controllers/admin/propertyImageController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processImage, processMultipleImages } = require('../middleware/imageProcessor');
const {
  createPropertyValidation,
  updatePropertyValidation,
  propertyIdValidation,
  propertySlugValidation,
  createPropertyImageValidation,
  updatePropertyImageValidation,
  imageIdValidation,
  validate,
} = require('../validators/propertyValidator');

// Property CRUD
router.get('/',                         propertyController.getAllProperties);
router.get('/available',                propertyController.getAvailableProperties);
router.get('/slug/:slug',               propertySlugValidation, validate, propertyController.getPropertyBySlug);
router.get('/:id',                      propertyIdValidation, validate, propertyController.getPropertyById);
router.post('/',                        authMiddleware, createPropertyValidation, validate, propertyController.createProperty);
router.put('/:id',                      authMiddleware, updatePropertyValidation, validate, propertyController.updateProperty);
router.delete('/:id',                   authMiddleware, propertyIdValidation, validate, propertyController.deleteProperty);
router.patch('/:id/toggle-availability',authMiddleware, propertyIdValidation, validate, propertyController.toggleAvailability);

// Property Images
router.get('/:propertyId/images',       propertyImageController.getImagesByProperty);
router.post('/:propertyId/images',      authMiddleware, createPropertyImageValidation, validate, propertyImageController.createImage);
router.post('/:propertyId/images/bulk', authMiddleware, propertyImageController.bulkCreateImages);
router.post('/:propertyId/images/reorder', authMiddleware, propertyImageController.reorderImages);
router.post('/:propertyId/images/upload',
  authMiddleware,
  upload.propertyImage.single('image'),
  processImage({ width: 1920, quality: 85 }),
  propertyImageController.uploadImage
);
router.post('/:propertyId/images/upload-multiple',
  authMiddleware,
  upload.propertyImage.array('images', 10),
  processMultipleImages({ width: 1920, quality: 85 }),
  propertyImageController.uploadMultipleImages
);

module.exports = router;
const express = require('express');
const router = express.Router();
const propertyCategoryController = require('../controllers/admin/propertyCategoryController');
const authMiddleware = require('../middleware/auth');
const {
  createPropertyCategoryValidation,
  updatePropertyCategoryValidation,
  propertyCategoryIdValidation,
  validate,
} = require('../validators/propertyCategoryValidator');

router.get('/',                    propertyCategoryController.getAllPropertyCategories);
router.get('/slug/:slug',          propertyCategoryController.getPropertyCategoryBySlug);
router.get('/:id',                 propertyCategoryIdValidation, validate, propertyCategoryController.getPropertyCategoryById);
router.post('/',                   authMiddleware, createPropertyCategoryValidation, validate, propertyCategoryController.createPropertyCategory);
router.put('/:id',                 authMiddleware, updatePropertyCategoryValidation, validate, propertyCategoryController.updatePropertyCategory);
router.delete('/:id',              authMiddleware, propertyCategoryIdValidation, validate, propertyCategoryController.deletePropertyCategory);
router.patch('/:id/toggle-status', authMiddleware, propertyCategoryIdValidation, validate, propertyCategoryController.togglePropertyCategoryStatus);

module.exports = router;
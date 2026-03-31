const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/admin/categoryController');
const authMiddleware = require('../middleware/auth');
const {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
  validate,
} = require('../validators/categoryValidator');

router.get('/',                    categoryController.getAllCategories);
router.get('/slug/:slug',          categoryController.getCategoryBySlug);
router.get('/:id',                 categoryIdValidation, validate, categoryController.getCategoryById);
router.post('/',                   authMiddleware, createCategoryValidation, validate, categoryController.createCategory);
router.put('/:id',                 authMiddleware, updateCategoryValidation, validate, categoryController.updateCategory);
router.delete('/:id',              authMiddleware, categoryIdValidation, validate, categoryController.deleteCategory);
router.patch('/:id/toggle-status', authMiddleware, categoryIdValidation, validate, categoryController.toggleCategoryStatus);

module.exports = router;
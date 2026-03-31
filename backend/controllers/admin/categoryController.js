// controllers/categoryController.js
const categoryService = require('../../services/admin/categoryService');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        search: req.query.search,
        includeProjects: req.query.include_projects === 'true'
      };
      
      const categories = await categoryService.getAllCategories(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error.message
      });
    }
  }
  
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include_relations === 'true';
      
      const category = await categoryService.getCategoryById(id, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const includeRelations = req.query.include_relations === 'true';
      
      const category = await categoryService.getCategoryBySlug(slug, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const category = await categoryService.createCategory(categoryData);
      
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message === 'Category with this slug already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await categoryService.updateCategory(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 
                        error.message === 'Category with this slug already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async toggleCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.toggleCategoryStatus(id);
      
      return res.status(200).json({
        success: true,
        message: 'Category status toggled successfully',
        data: category
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CategoryController();
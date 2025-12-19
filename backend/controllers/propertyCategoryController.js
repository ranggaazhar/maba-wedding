// controllers/propertyCategoryController.js
const propertyCategoryService = require('../services/propertyCategoryService');

class PropertyCategoryController {
  async getAllPropertyCategories(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        search: req.query.search,
        includeProperties: req.query.include_properties === 'true'
      };
      
      const propertyCategories = await propertyCategoryService.getAllPropertyCategories(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Property categories retrieved successfully',
        data: propertyCategories
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve property categories',
        error: error.message
      });
    }
  }
  
  async getPropertyCategoryById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include_relations === 'true';
      
      const propertyCategory = await propertyCategoryService.getPropertyCategoryById(id, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Property category retrieved successfully',
        data: propertyCategory
      });
    } catch (error) {
      const statusCode = error.message === 'Property category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getPropertyCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const includeRelations = req.query.include_relations === 'true';
      
      const propertyCategory = await propertyCategoryService.getPropertyCategoryBySlug(slug, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Property category retrieved successfully',
        data: propertyCategory
      });
    } catch (error) {
      const statusCode = error.message === 'Property category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createPropertyCategory(req, res) {
    try {
      const propertyCategoryData = req.body;
      const propertyCategory = await propertyCategoryService.createPropertyCategory(propertyCategoryData);
      
      return res.status(201).json({
        success: true,
        message: 'Property category created successfully',
        data: propertyCategory
      });
    } catch (error) {
      const statusCode = error.message === 'Property category with this slug already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updatePropertyCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const propertyCategory = await propertyCategoryService.updatePropertyCategory(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Property category updated successfully',
        data: propertyCategory
      });
    } catch (error) {
      const statusCode = error.message === 'Property category not found' ? 404 : 
                        error.message === 'Property category with this slug already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deletePropertyCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await propertyCategoryService.deletePropertyCategory(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Property category not found' ? 404 : 
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async togglePropertyCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const propertyCategory = await propertyCategoryService.togglePropertyCategoryStatus(id);
      
      return res.status(200).json({
        success: true,
        message: 'Property category status toggled successfully',
        data: propertyCategory
      });
    } catch (error) {
      const statusCode = error.message === 'Property category not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PropertyCategoryController();
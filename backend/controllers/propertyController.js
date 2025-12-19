// controllers/propertyController.js
const propertyService = require('../services/propertyService');

class PropertyController {
  async getAllProperties(req, res) {
    try {
      const filters = {
        is_available: req.query.is_available === 'true' ? true : req.query.is_available === 'false' ? false : undefined,
        category_id: req.query.category_id,
        search: req.query.search,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        in_stock: req.query.in_stock === 'true',
        includeImages: req.query.include_images === 'true',
        includeCreator: req.query.include_creator === 'true',
        orderBy: req.query.order_by || 'created_at',
        orderDir: req.query.order_dir || 'DESC'
      };
      
      const properties = await propertyService.getAllProperties(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve properties',
        error: error.message
      });
    }
  }
  
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include_relations !== 'false';
      
      const property = await propertyService.getPropertyById(id, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Property retrieved successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getPropertyBySlug(req, res) {
    try {
      const { slug } = req.params;
      const includeRelations = req.query.include_relations !== 'false';
      
      const property = await propertyService.getPropertyBySlug(slug, includeRelations);
      
      return res.status(200).json({
        success: true,
        message: 'Property retrieved successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createProperty(req, res) {
    try {
      const propertyData = {
        ...req.body,
        created_by: req.admin?.id || req.body.created_by
      };
      
      const property = await propertyService.createProperty(propertyData);
      
      return res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Property with this slug already exists') {
        statusCode = 409;
      } else if (error.message === 'Property category not found') {
        statusCode = 404;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await propertyService.updateProperty(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: property
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Property not found' || error.message === 'Property category not found') {
        statusCode = 404;
      } else if (error.message === 'Property with this slug already exists') {
        statusCode = 409;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const result = await propertyService.deleteProperty(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 :
                        error.message.includes('Cannot delete') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const property = await propertyService.toggleAvailability(id);
      
      return res.status(200).json({
        success: true,
        message: 'Property availability toggled successfully',
        data: property
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;
      
      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          success: false,
          message: 'Quantity is required'
        });
      }
      
      const property = await propertyService.updateStock(id, parseInt(quantity), operation);
      
      return res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: property
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Property not found') {
        statusCode = 404;
      } else if (error.message === 'Insufficient stock') {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getAvailableProperties(req, res) {
    try {
      const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
      const properties = await propertyService.getAvailableProperties(categoryId);
      
      return res.status(200).json({
        success: true,
        message: 'Available properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available properties',
        error: error.message
      });
    }
  }
}

module.exports = new PropertyController();
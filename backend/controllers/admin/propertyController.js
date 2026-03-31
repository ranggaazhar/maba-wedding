// controllers/propertyController.js - FIXED (Bind Context)
const propertyService = require('../../services/admin/propertyService');
const FileHelper = require('../../utils/fileHelper');

function addFullUrlsToProperty(property, req) {
  if (!property) return property;
  
  // Handle both Sequelize instance and plain object
  let propertyData;
  try {
    propertyData = property.toJSON ? property.toJSON() : { ...property };
  } catch (error) {
    console.error('Error converting property to JSON:', error);
    propertyData = { ...property };
  }
  
  
  if (propertyData.images && Array.isArray(propertyData.images)) {
    propertyData.images = propertyData.images.map(img => {
      const imageData = img.toJSON ? img.toJSON() : { ...img };
      return {
        ...imageData,
        url: FileHelper.getFileUrl(imageData.url, req),
        original_url: imageData.url // Keep original path
      };
    });
  }
  
  // Add full URL to primary image_url if exists
  if (propertyData.image_url) {
    propertyData.image_url = FileHelper.getFileUrl(propertyData.image_url, req);
  }
  
  return propertyData;
}

class PropertyController {
  async getAllProperties(req, res) {
    try {
      const filters = {
        is_available: req.query.is_available === 'true' ? true : req.query.is_available === 'false' ? false : undefined,
        category_id: req.query.category_id,
        search: req.query.search,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        includeImages: req.query.include_images === 'true',
        includeCreator: req.query.include_creator === 'true',
        orderBy: req.query.order_by || 'created_at',
        orderDir: req.query.order_dir || 'DESC'
      };
      
      const properties = await propertyService.getAllProperties(filters);
      
      // ✅ FIXED: Use standalone function
      const propertiesWithUrls = properties.map(prop => {
        try {
          return addFullUrlsToProperty(prop, req);
        } catch (error) {
          console.error('Error processing property:', prop.id, error);
          return prop.toJSON ? prop.toJSON() : prop;
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Properties retrieved successfully',
        data: propertiesWithUrls
      });
    } catch (error) {
      console.error('getAllProperties error:', error);
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
      const propertyWithUrls = addFullUrlsToProperty(property, req);
      
      return res.status(200).json({
        success: true,
        message: 'Property retrieved successfully',
        data: propertyWithUrls
      });
    } catch (error) {
      console.error('getPropertyById error:', error);
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
      const propertyWithUrls = addFullUrlsToProperty(property, req);
      
      return res.status(200).json({
        success: true,
        message: 'Property retrieved successfully',
        data: propertyWithUrls
      });
    } catch (error) {
      console.error('getPropertyBySlug error:', error);
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
      const propertyWithUrls = addFullUrlsToProperty(property, req);
      
      return res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: propertyWithUrls
      });
    } catch (error) {
      console.error('createProperty error:', error);
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
      const propertyWithUrls = addFullUrlsToProperty(property, req);
      
      return res.status(200).json({
        success: true,
        message: 'Property updated successfully',
        data: propertyWithUrls
      });
    } catch (error) {
      console.error('updateProperty error:', error);
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
      console.error('deleteProperty error:', error);
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
      const propertyWithUrls = addFullUrlsToProperty(property, req);
      
      return res.status(200).json({
        success: true,
        message: 'Property availability toggled successfully',
        data: propertyWithUrls
      });
    } catch (error) {
      console.error('toggleAvailability error:', error);
      const statusCode = error.message === 'Property not found' ? 404 : 500;
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
      
      // ✅ FIXED: Use standalone function
      const propertiesWithUrls = properties.map(prop => {
        try {
          return addFullUrlsToProperty(prop, req);
        } catch (error) {
          console.error('Error processing property:', prop.id, error);
          return prop.toJSON ? prop.toJSON() : prop;
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Available properties retrieved successfully',
        data: propertiesWithUrls
      });
    } catch (error) {
      console.error('getAvailableProperties error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available properties',
        error: error.message
      });
    }
  }
}

module.exports = new PropertyController();
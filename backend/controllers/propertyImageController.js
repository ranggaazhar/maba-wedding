// controllers/propertyImageController.js
const propertyImageService = require('../services/propertyImageService');

class PropertyImageController {
  async getImagesByProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const images = await propertyImageService.getImagesByPropertyId(propertyId);
      
      return res.status(200).json({
        success: true,
        message: 'Images retrieved successfully',
        data: images
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve images',
        error: error.message
      });
    }
  }
  
  async getImageById(req, res) {
    try {
      const { id } = req.params;
      const image = await propertyImageService.getImageById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Image retrieved successfully',
        data: image
      });
    } catch (error) {
      const statusCode = error.message === 'Image not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createImage(req, res) {
    try {
      const { propertyId } = req.params;
      const image = await propertyImageService.createImage(propertyId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Image created successfully',
        data: image
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const image = await propertyImageService.updateImage(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: image
      });
    } catch (error) {
      const statusCode = error.message === 'Image not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const result = await propertyImageService.deleteImage(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Image not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async reorderImages(req, res) {
    try {
      const { propertyId } = req.params;
      const { imageIds } = req.body;
      
      if (!Array.isArray(imageIds)) {
        return res.status(400).json({
          success: false,
          message: 'imageIds must be an array'
        });
      }
      
      const images = await propertyImageService.reorderImages(propertyId, imageIds);
      
      return res.status(200).json({
        success: true,
        message: 'Images reordered successfully',
        data: images
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async setPrimaryImage(req, res) {
    try {
      const { id } = req.params;
      const image = await propertyImageService.setPrimaryImage(id);
      
      return res.status(200).json({
        success: true,
        message: 'Primary image set successfully',
        data: image
      });
    } catch (error) {
      const statusCode = error.message === 'Image not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkCreateImages(req, res) {
    try {
      const { propertyId } = req.params;
      const { images } = req.body;
      
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: 'images must be an array'
        });
      }
      
      const created = await propertyImageService.bulkCreateImages(propertyId, images);
      
      return res.status(201).json({
        success: true,
        message: 'Images created successfully',
        data: created
      });
    } catch (error) {
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PropertyImageController();
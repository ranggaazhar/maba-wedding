// controllers/propertyImageController.js
const propertyImageService = require('../services/propertyImageService');
const FileHelper = require('../utils/fileHelper');

class PropertyImageController {
  async getImagesByProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const images = await propertyImageService.getImagesByPropertyId(propertyId);
      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        full_url: FileHelper.getFileUrl(image.url, req)
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Images retrieved successfully',
        data: imagesWithUrls
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
        data: {
          ...image.toJSON(),
          full_url: FileHelper.getFileUrl(image.url, req)
        }
      });
    } catch (error) {
      const statusCode = error.message === 'Image not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async uploadImage(req, res) {
    try {
      const { propertyId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const image = await propertyImageService.createImageWithFile(
        propertyId,
        req.file,
        req.body
      );
      
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          ...image.toJSON(),
          full_url: FileHelper.getFileUrl(image.url, req)
        }
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        await FileHelper.deleteFile(req.file.path);
      }
      
      const statusCode = error.message === 'Property not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  async uploadMultipleImages(req, res) {
    try {
      const { propertyId } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const images = await propertyImageService.uploadMultipleImages(
        propertyId,
        req.files,
        req.body
      );
      
      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        full_url: FileHelper.getFileUrl(image.url, req)
      }));
      
      return res.status(201).json({
        success: true,
        message: `${images.length} images uploaded successfully`,
        data: imagesWithUrls
      });
    } catch (error) {
      if (req.files) {
        for (const file of req.files) {
          await FileHelper.deleteFile(file.path);
        }
      }
      
      const statusCode = error.message === 'Property not found' ? 404 : 500;
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
        data: {
          ...image.toJSON(),
          full_url: FileHelper.getFileUrl(image.url, req)
        }
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
      
      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        full_url: FileHelper.getFileUrl(image.url, req)
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Images reordered successfully',
        data: imagesWithUrls
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
        data: {
          ...image.toJSON(),
          full_url: FileHelper.getFileUrl(image.url, req)
        }
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
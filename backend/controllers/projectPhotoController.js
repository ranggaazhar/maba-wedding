// controllers/projectPhotoController.js
const projectPhotoService = require('../services/projectPhotoService');

class ProjectPhotoController {
  async getPhotosByProject(req, res) {
    try {
      const { projectId } = req.params;
      const photos = await projectPhotoService.getPhotosByProjectId(projectId);
      
      return res.status(200).json({
        success: true,
        message: 'Photos retrieved successfully',
        data: photos
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve photos',
        error: error.message
      });
    }
  }
  
  async getPhotoById(req, res) {
    try {
      const { id } = req.params;
      const photo = await projectPhotoService.getPhotoById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Photo retrieved successfully',
        data: photo
      });
    } catch (error) {
      const statusCode = error.message === 'Photo not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createPhoto(req, res) {
    try {
      const { projectId } = req.params;
      const photo = await projectPhotoService.createPhoto(projectId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Photo created successfully',
        data: photo
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updatePhoto(req, res) {
    try {
      const { id } = req.params;
      const photo = await projectPhotoService.updatePhoto(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Photo updated successfully',
        data: photo
      });
    } catch (error) {
      const statusCode = error.message === 'Photo not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deletePhoto(req, res) {
    try {
      const { id } = req.params;
      const result = await projectPhotoService.deletePhoto(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Photo not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async reorderPhotos(req, res) {
    try {
      const { projectId } = req.params;
      const { photoIds } = req.body;
      
      if (!Array.isArray(photoIds)) {
        return res.status(400).json({
          success: false,
          message: 'photoIds must be an array'
        });
      }
      
      const photos = await projectPhotoService.reorderPhotos(projectId, photoIds);
      
      return res.status(200).json({
        success: true,
        message: 'Photos reordered successfully',
        data: photos
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProjectPhotoController();
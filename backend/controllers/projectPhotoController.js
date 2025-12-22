// controllers/projectPhotoController.js - FIXED UPDATE & DELETE
const projectPhotoService = require('../services/projectPhotoService');
const FileHelper = require('../utils/fileHelper');

class ProjectPhotoController {
  async getPhotosByProject(req, res) {
    try {
      const { projectId } = req.params;
      const photos = await projectPhotoService.getPhotosByProjectId(projectId);
      
      const photosWithUrls = photos.map(photo => ({
        ...photo.toJSON(),
        full_url: FileHelper.getFileUrl(photo.url, req)
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Photos retrieved successfully',
        data: photosWithUrls
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
        data: {
          ...photo.toJSON(),
          full_url: FileHelper.getFileUrl(photo.url, req)
        }
      });
    } catch (error) {
      const statusCode = error.message === 'Photo not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async uploadPhoto(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const photo = await projectPhotoService.createPhotoWithFile(
        projectId,
        req.file,
        req.body
      );
      
      return res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: {
          ...photo.toJSON(),
          full_url: FileHelper.getFileUrl(photo.url, req)
        }
      });
    } catch (error) {
      if (req.file) {
        await FileHelper.deleteFile(req.file.path);
      }
      
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async uploadMultiplePhotos(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const photos = await projectPhotoService.uploadMultiplePhotos(
        projectId,
        req.files,
        req.body
      );
      
      const photosWithUrls = photos.map(photo => ({
        ...photo.toJSON(),
        full_url: FileHelper.getFileUrl(photo.url, req)
      }));
      
      return res.status(201).json({
        success: true,
        message: `${photos.length} photos uploaded successfully`,
        data: photosWithUrls
      });
    } catch (error) {
      if (req.files) {
        for (const file of req.files) {
          await FileHelper.deleteFile(file.path);
        }
      }
      
      const statusCode = error.message === 'Project not found' ? 404 : 500;
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
  
  /**
   * ✅ UPDATE PHOTO - dengan opsi upload file baru
   */
  async updatePhoto(req, res) {
    try {
      const { id } = req.params;
      const newFile = req.file || null; // File baru (optional)
      
      const photo = await projectPhotoService.updatePhoto(id, req.body, newFile);
      
      return res.status(200).json({
        success: true,
        message: 'Photo updated successfully',
        data: {
          ...photo.toJSON(),
          full_url: FileHelper.getFileUrl(photo.url, req)
        }
      });
    } catch (error) {
      // Cleanup uploaded file jika error
      if (req.file) {
        await FileHelper.deleteFile(req.file.path);
      }
      
      const statusCode = error.message === 'Photo not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * ✅ DELETE PHOTO - hapus dari DB dan storage
   */
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
      
      const photosWithUrls = photos.map(photo => ({
        ...photo.toJSON(),
        full_url: FileHelper.getFileUrl(photo.url, req)
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Photos reordered successfully',
        data: photosWithUrls
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
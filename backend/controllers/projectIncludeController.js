// controllers/projectIncludeController.js
const projectIncludeService = require('../services/projectIncludeService');

class ProjectIncludeController {
  async getIncludesByProject(req, res) {
    try {
      const { projectId } = req.params;
      const includes = await projectIncludeService.getIncludesByProjectId(projectId);
      
      return res.status(200).json({
        success: true,
        message: 'Includes retrieved successfully',
        data: includes
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve includes',
        error: error.message
      });
    }
  }
  
  async getIncludeById(req, res) {
    try {
      const { id } = req.params;
      const include = await projectIncludeService.getIncludeById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Include retrieved successfully',
        data: include
      });
    } catch (error) {
      const statusCode = error.message === 'Include not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createInclude(req, res) {
    try {
      const { projectId } = req.params;
      const include = await projectIncludeService.createInclude(projectId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Include created successfully',
        data: include
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateInclude(req, res) {
    try {
      const { id } = req.params;
      const include = await projectIncludeService.updateInclude(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Include updated successfully',
        data: include
      });
    } catch (error) {
      const statusCode = error.message === 'Include not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteInclude(req, res) {
    try {
      const { id } = req.params;
      const result = await projectIncludeService.deleteInclude(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Include not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkCreateIncludes(req, res) {
    try {
      const { projectId } = req.params;
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'items must be an array'
        });
      }
      
      const includes = await projectIncludeService.bulkCreateIncludes(projectId, items);
      
      return res.status(201).json({
        success: true,
        message: 'Includes created successfully',
        data: includes
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

module.exports = new ProjectIncludeController();
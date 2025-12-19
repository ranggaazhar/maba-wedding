// controllers/projectDetailController.js
const projectDetailService = require('../services/projectDetailService');

class ProjectDetailController {
  async getDetailsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const details = await projectDetailService.getDetailsByProjectId(projectId);
      
      return res.status(200).json({
        success: true,
        message: 'Details retrieved successfully',
        data: details
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve details',
        error: error.message
      });
    }
  }
  
  async getDetailById(req, res) {
    try {
      const { id } = req.params;
      const detail = await projectDetailService.getDetailById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Detail retrieved successfully',
        data: detail
      });
    } catch (error) {
      const statusCode = error.message === 'Detail not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createDetail(req, res) {
    try {
      const { projectId } = req.params;
      const detail = await projectDetailService.createDetail(projectId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Detail created successfully',
        data: detail
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateDetail(req, res) {
    try {
      const { id } = req.params;
      const detail = await projectDetailService.updateDetail(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Detail updated successfully',
        data: detail
      });
    } catch (error) {
      const statusCode = error.message === 'Detail not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteDetail(req, res) {
    try {
      const { id } = req.params;
      const result = await projectDetailService.deleteDetail(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Detail not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProjectDetailController();
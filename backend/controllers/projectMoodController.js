// controllers/projectMoodController.js
const projectMoodService = require('../services/projectMoodService');

class ProjectMoodController {
  async getMoodsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const moods = await projectMoodService.getMoodsByProjectId(projectId);
      
      return res.status(200).json({
        success: true,
        message: 'Moods retrieved successfully',
        data: moods
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve moods',
        error: error.message
      });
    }
  }
  
  async getMoodById(req, res) {
    try {
      const { id } = req.params;
      const mood = await projectMoodService.getMoodById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Mood retrieved successfully',
        data: mood
      });
    } catch (error) {
      const statusCode = error.message === 'Mood not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createMood(req, res) {
    try {
      const { projectId } = req.params;
      const mood = await projectMoodService.createMood(projectId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Mood created successfully',
        data: mood
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateMood(req, res) {
    try {
      const { id } = req.params;
      const mood = await projectMoodService.updateMood(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Mood updated successfully',
        data: mood
      });
    } catch (error) {
      const statusCode = error.message === 'Mood not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteMood(req, res) {
    try {
      const { id } = req.params;
      const result = await projectMoodService.deleteMood(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Mood not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkCreateMoods(req, res) {
    try {
      const { projectId } = req.params;
      const { moods } = req.body;
      
      if (!Array.isArray(moods)) {
        return res.status(400).json({
          success: false,
          message: 'moods must be an array'
        });
      }
      
      const created = await projectMoodService.bulkCreateMoods(projectId, moods);
      
      return res.status(201).json({
        success: true,
        message: 'Moods created successfully',
        data: created
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

module.exports = new ProjectMoodController();
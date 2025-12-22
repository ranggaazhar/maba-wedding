// controllers/projectController.js - COMPLETE REPLACEMENT
const projectService = require('../services/projectService');

class ProjectController {
 async createCompleteProject(req, res) {
  try {
    const projectData = {
      ...req.body,
      created_by: req.admin?.id || req.body.created_by
    };
    try {
      if (typeof projectData.details === 'string') {
        projectData.details = JSON.parse(projectData.details);
      }
      if (typeof projectData.includes === 'string') {
        projectData.includes = JSON.parse(projectData.includes);
      }
      if (typeof projectData.moods === 'string') {
        projectData.moods = JSON.parse(projectData.moods);
      }
      if (typeof projectData.photos_metadata === 'string') {
        projectData.photos_metadata = JSON.parse(projectData.photos_metadata);
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request data',
        error: parseError.message
      });
    }
    const files = req.files || [];
    const project = await projectService.createCompleteProject(projectData, files);
    
    return res.status(201).json({
      success: true,
      message: 'Project created successfully with all related data',
      data: project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
  async updateCompleteProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (typeof updateData.details === 'string') {
        updateData.details = JSON.parse(updateData.details);
      }
      if (typeof updateData.includes === 'string') {
        updateData.includes = JSON.parse(updateData.includes);
      }
      if (typeof updateData.moods === 'string') {
        updateData.moods = JSON.parse(updateData.moods);
      }
      if (typeof updateData.photos_metadata === 'string') {
        updateData.photos_metadata = JSON.parse(updateData.photos_metadata);
      }
      if (typeof updateData.update_photos_metadata === 'string') {
        updateData.update_photos_metadata = JSON.parse(updateData.update_photos_metadata);
      }

      const newFiles = req.files || [];
      const project = await projectService.updateCompleteProject(id, updateData, newFiles);
      
      return res.status(200).json({
        success: true,
        message: 'Project updated successfully with all related data',
        data: project
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllProjects(req, res) {
    try {
      const filters = {
        is_published: req.query.is_published === 'true' ? true : req.query.is_published === 'false' ? false : undefined,
        is_featured: req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : undefined,
        category_id: req.query.category_id,
        search: req.query.search,
        includePhotos: req.query.include_photos === 'true',
        orderBy: req.query.order_by,
        orderDir: req.query.order_dir
      };
      
      const projects = await projectService.getAllProjects(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve projects',
        error: error.message
      });
    }
  }

  /**
   * GET PROJECT BY ID
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
      return res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
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
   * GET PROJECT BY SLUG
   */
  async getProjectBySlug(req, res) {
    try {
      const { slug } = req.params;
      const incrementView = req.query.increment_view === 'true';
      
      const project = await projectService.getProjectBySlug(slug, incrementView);
      
      return res.status(200).json({
        success: true,
        message: 'Project retrieved successfully',
        data: project
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
   * TOGGLE PUBLISH STATUS
   */
  async togglePublishStatus(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.toggleProjectStatus(id, 'is_published');
      
      return res.status(200).json({
        success: true,
        message: 'Project publish status toggled successfully',
        data: project
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
   * TOGGLE FEATURED STATUS
   */
  async toggleFeaturedStatus(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.toggleProjectStatus(id, 'is_featured');
      
      return res.status(200).json({
        success: true,
        message: 'Project featured status toggled successfully',
        data: project
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
   * GET FEATURED PROJECTS
   */
  async getFeaturedProjects(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const projects = await projectService.getFeaturedProjects(limit);
      
      return res.status(200).json({
        success: true,
        message: 'Featured projects retrieved successfully',
        data: projects
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured projects',
        error: error.message
      });
    }
  }
}

module.exports = new ProjectController();
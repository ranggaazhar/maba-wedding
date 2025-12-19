// controllers/projectController.js
const projectService = require('../services/projectService');

class ProjectController {
  async getAllProjects(req, res) {
    try {
      const filters = {
        is_published: req.query.is_published === 'true' ? true : req.query.is_published === 'false' ? false : undefined,
        is_featured: req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : undefined,
        category_id: req.query.category_id,
        search: req.query.search,
        includePhotos: req.query.include_photos === 'true',
        includeDetails: req.query.include_details === 'true',
        includeIncludes: req.query.include_includes === 'true',
        includeMoods: req.query.include_moods === 'true',
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
  
  async createProject(req, res) {
    try {
      const projectData = {
        ...req.body,
        created_by: req.admin?.id || req.body.created_by
      };
      
      const project = await projectService.createProject(projectData);
      
      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      const statusCode = error.message === 'Project with this slug already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 
                        error.message === 'Project with this slug already exists' ? 409 : 500;
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
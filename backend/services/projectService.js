// services/projectService.js
const { 
  Project, 
  Category, 
  ProjectPhoto, 
  ProjectDetail, 
  ProjectDetailItem,
  ProjectInclude, 
  ProjectMood,
  Admin 
} = require('../models');
const { Op } = require('sequelize');

class ProjectService {
  async getAllProjects(filters = {}) {
    const where = {};
    
    if (filters.is_published !== undefined) {
      where.is_published = filters.is_published;
    }
    
    if (filters.is_featured !== undefined) {
      where.is_featured = filters.is_featured;
    }
    
    if (filters.category_id) {
      where.category_id = filters.category_id;
    }
    
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { slug: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const include = [
      { model: Category, as: 'category' }
    ];
    
    if (filters.includePhotos) {
      include.push({ 
        model: ProjectPhoto, 
        as: 'photos',
        order: [['display_order', 'ASC']]
      });
    }
    
    if (filters.includeDetails) {
      include.push({ 
        model: ProjectDetail, 
        as: 'details',
        include: [{ model: ProjectDetailItem, as: 'items' }],
        order: [['display_order', 'ASC']]
      });
    }
    
    if (filters.includeIncludes) {
      include.push({ 
        model: ProjectInclude, 
        as: 'includes',
        order: [['display_order', 'ASC']]
      });
    }
    
    if (filters.includeMoods) {
      include.push({ 
        model: ProjectMood, 
        as: 'moods',
        order: [['display_order', 'ASC']]
      });
    }
    
    const orderBy = filters.orderBy || 'created_at';
    const orderDir = filters.orderDir || 'DESC';
    
    const projects = await Project.findAll({
      where,
      include,
      order: [[orderBy, orderDir]]
    });
    
    return projects;
  }
  
  async getProjectById(id, includeAll = true) {
    const include = [
      { model: Category, as: 'category' },
      { model: Admin, as: 'creator', attributes: ['id', 'name', 'email'] }
    ];
    
    if (includeAll) {
      include.push(
        { 
          model: ProjectPhoto, 
          as: 'photos',
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectDetail, 
          as: 'details',
          include: [{ 
            model: ProjectDetailItem, 
            as: 'items',
            separate: true,
            order: [['display_order', 'ASC']]
          }],
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectInclude, 
          as: 'includes',
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectMood, 
          as: 'moods',
          separate: true,
          order: [['display_order', 'ASC']]
        }
      );
    }
    
    const project = await Project.findByPk(id, { include });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  }
  
  async getProjectBySlug(slug, incrementView = false) {
    const project = await Project.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: Admin, as: 'creator', attributes: ['id', 'name', 'email'] },
        { 
          model: ProjectPhoto, 
          as: 'photos',
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectDetail, 
          as: 'details',
          include: [{ 
            model: ProjectDetailItem, 
            as: 'items',
            separate: true,
            order: [['display_order', 'ASC']]
          }],
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectInclude, 
          as: 'includes',
          separate: true,
          order: [['display_order', 'ASC']]
        },
        { 
          model: ProjectMood, 
          as: 'moods',
          separate: true,
          order: [['display_order', 'ASC']]
        }
      ]
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (incrementView) {
      await project.increment('view_count');
      await project.reload();
    }
    
    return project;
  }
  
  async createProject(data, transaction = null) {
    const existingProject = await Project.findOne({
      where: { slug: data.slug }
    });
    
    if (existingProject) {
      throw new Error('Project with this slug already exists');
    }
    
    const project = await Project.create(data, { transaction });
    return project;
  }
  
  async updateProject(id, data) {
    const project = await this.getProjectById(id, false);
    
    if (data.slug && data.slug !== project.slug) {
      const existingProject = await Project.findOne({
        where: { 
          slug: data.slug,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingProject) {
        throw new Error('Project with this slug already exists');
      }
    }
    
    await project.update(data);
    return await this.getProjectById(id);
  }
  
  async deleteProject(id) {
    const project = await this.getProjectById(id);
    await project.destroy();
    return { message: 'Project deleted successfully' };
  }
  
  async toggleProjectStatus(id, field = 'is_published') {
    const project = await this.getProjectById(id, false);
    await project.update({ [field]: !project[field] });
    return project;
  }
  
  async getFeaturedProjects(limit = 6) {
    return await Project.findAll({
      where: { 
        is_featured: true,
        is_published: true
      },
      include: [
        { model: Category, as: 'category' },
        { 
          model: ProjectPhoto, 
          as: 'photos',
          where: { is_hero: true },
          required: false,
          limit: 1
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  }
}

module.exports = new ProjectService();
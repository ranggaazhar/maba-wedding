// services/projectIncludeService.js
const { ProjectInclude, Project } = require('../models');

class ProjectIncludeService {
  async getIncludesByProjectId(projectId) {
    const includes = await ProjectInclude.findAll({
      where: { project_id: projectId },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    
    return includes;
  }
  
  async getIncludeById(id) {
    const include = await ProjectInclude.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });
    
    if (!include) {
      throw new Error('Include not found');
    }
    
    return include;
  }
  
  async createInclude(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const include = await ProjectInclude.create({
      ...data,
      project_id: projectId
    });
    
    return include;
  }
  
  async updateInclude(id, data) {
    const include = await this.getIncludeById(id);
    await include.update(data);
    return include;
  }
  
  async deleteInclude(id) {
    const include = await this.getIncludeById(id);
    await include.destroy();
    return { message: 'Include deleted successfully' };
  }
  
  async bulkCreateIncludes(projectId, items) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const includes = items.map((item, index) => ({
      project_id: projectId,
      item: item.item,
      display_order: item.display_order !== undefined ? item.display_order : index
    }));
    
    const created = await ProjectInclude.bulkCreate(includes);
    return created;
  }
}

module.exports = new ProjectIncludeService();
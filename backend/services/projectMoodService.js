// services/projectMoodService.js
const { ProjectMood, Project } = require('../models');

class ProjectMoodService {
  async getMoodsByProjectId(projectId) {
    const moods = await ProjectMood.findAll({
      where: { project_id: projectId },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    
    return moods;
  }
  
  async getMoodById(id) {
    const mood = await ProjectMood.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });
    
    if (!mood) {
      throw new Error('Mood not found');
    }
    
    return mood;
  }
  
  async createMood(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const mood = await ProjectMood.create({
      ...data,
      project_id: projectId
    });
    
    return mood;
  }
  
  async updateMood(id, data) {
    const mood = await this.getMoodById(id);
    await mood.update(data);
    return mood;
  }
  
  async deleteMood(id) {
    const mood = await this.getMoodById(id);
    await mood.destroy();
    return { message: 'Mood deleted successfully' };
  }
  
  async bulkCreateMoods(projectId, moods) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const moodData = moods.map((mood, index) => ({
      project_id: projectId,
      mood: mood.mood,
      display_order: mood.display_order !== undefined ? mood.display_order : index
    }));
    
    const created = await ProjectMood.bulkCreate(moodData);
    return created;
  }
}

module.exports = new ProjectMoodService();
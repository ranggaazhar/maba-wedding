// services/projectPhotoService.js
const { ProjectPhoto, Project } = require('../models');

class ProjectPhotoService {
  async getPhotosByProjectId(projectId) {
    const photos = await ProjectPhoto.findAll({
      where: { project_id: projectId },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    
    return photos;
  }
  
  async getPhotoById(id) {
    const photo = await ProjectPhoto.findByPk(id, {
      include: [{ model: Project, as: 'project' }]
    });
    
    if (!photo) {
      throw new Error('Photo not found');
    }
    
    return photo;
  }
  
  async createPhoto(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // If this is set as hero, unset other hero photos
    if (data.is_hero) {
      await ProjectPhoto.update(
        { is_hero: false },
        { where: { project_id: projectId, is_hero: true } }
      );
    }
    
    const photo = await ProjectPhoto.create({
      ...data,
      project_id: projectId
    });
    
    return photo;
  }
  
  async updatePhoto(id, data) {
    const photo = await this.getPhotoById(id);
    
    // If this is set as hero, unset other hero photos
    if (data.is_hero && !photo.is_hero) {
      await ProjectPhoto.update(
        { is_hero: false },
        { where: { project_id: photo.project_id, is_hero: true } }
      );
    }
    
    await photo.update(data);
    return photo;
  }
  
  async deletePhoto(id) {
    const photo = await this.getPhotoById(id);
    await photo.destroy();
    return { message: 'Photo deleted successfully' };
  }
  
  async reorderPhotos(projectId, photoIds) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatePromises = photoIds.map((photoId, index) => {
      return ProjectPhoto.update(
        { display_order: index },
        { where: { id: photoId, project_id: projectId } }
      );
    });
    
    await Promise.all(updatePromises);
    return await this.getPhotosByProjectId(projectId);
  }
}

module.exports = new ProjectPhotoService();
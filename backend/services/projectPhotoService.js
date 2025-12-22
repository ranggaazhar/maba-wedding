const { ProjectPhoto, Project } = require('../models');
const FileHelper = require('../utils/fileHelper');

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
  
  // ✅ NEW: Create photo with file upload
  async createPhotoWithFile(projectId, file, data = {}) {
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
    
    // Save relative path
    const url = file.path.replace(/\\/g, '/');
    
    const photo = await ProjectPhoto.create({
      project_id: projectId,
      url: url,
      caption: data.caption || null,
      position: data.position || 'center',
      display_order: data.display_order || 0,
      is_hero: data.is_hero || false
    });
    
    return photo;
  }
  
  // Original method for URL-based photos
  async createPhoto(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
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
    
    // Delete file if exists
    await FileHelper.deleteFile(photo.url);
    
    await photo.destroy();
    return { message: 'Photo deleted successfully' };
  }
  
  // ✅ NEW: Upload multiple photos
  async uploadMultiplePhotos(projectId, files, data = {}) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const photos = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = file.path.replace(/\\/g, '/');
      
      const photo = await ProjectPhoto.create({
        project_id: projectId,
        url: url,
        caption: data.captions ? data.captions[i] : null,
        position: data.positions ? data.positions[i] : 'center',
        display_order: data.display_orders ? data.display_orders[i] : i,
        is_hero: false
      });
      
      photos.push(photo);
    }
    
    return photos;
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
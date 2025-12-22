// services/projectPhotoService.js - FIXED UPDATE & DELETE
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
  
  /**
   * ✅ UPDATE PHOTO - dengan opsi replace file
   */
  async updatePhoto(id, data, newFile = null) {
    const photo = await this.getPhotoById(id);
    const oldUrl = photo.url; // Simpan URL lama untuk dihapus nanti
    
    // Jika ada file baru, hapus file lama dan ganti
    if (newFile) {
      // Hapus file lama
      await FileHelper.deleteFile(oldUrl);
      
      // Set URL baru
      data.url = newFile.path.replace(/\\/g, '/');
    }
    
    // Jika set sebagai hero, unset hero lainnya
    if (data.is_hero && !photo.is_hero) {
      await ProjectPhoto.update(
        { is_hero: false },
        { where: { project_id: photo.project_id, is_hero: true } }
      );
    }
    
    await photo.update(data);
    return photo;
  }
  
  /**
   * ✅ DELETE PHOTO - hapus file dari storage
   */
  async deletePhoto(id) {
    const photo = await this.getPhotoById(id);
    const photoUrl = photo.url;
    
    // Delete from database
    await photo.destroy();
    
    // Delete file from storage
    await FileHelper.deleteFile(photoUrl);
    
    return { message: 'Photo deleted successfully' };
  }
  
  async createPhotoWithFile(projectId, file, data = {}) {
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
// services/projectDetailService.js
const { ProjectDetail, ProjectDetailItem, Project } = require('../models');
const { sequelize } = require('../models');

class ProjectDetailService {
  async getDetailsByProjectId(projectId) {
    const details = await ProjectDetail.findAll({
      where: { project_id: projectId },
      include: [{ 
        model: ProjectDetailItem, 
        as: 'items',
        separate: true,
        order: [['display_order', 'ASC']]
      }],
      order: [['display_order', 'ASC']]
    });
    
    return details;
  }
  
  async getDetailById(id) {
    const detail = await ProjectDetail.findByPk(id, {
      include: [
        { model: Project, as: 'project' },
        { 
          model: ProjectDetailItem, 
          as: 'items',
          separate: true,
          order: [['display_order', 'ASC']]
        }
      ]
    });
    
    if (!detail) {
      throw new Error('Detail not found');
    }
    
    return detail;
  }
  
  async createDetail(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      const detail = await ProjectDetail.create({
        project_id: projectId,
        detail_type: data.detail_type,
        title: data.title,
        display_order: data.display_order
      }, { transaction });
      
      // Create items if provided
      if (data.items && data.items.length > 0) {
        const items = data.items.map((item, index) => ({
          detail_id: detail.id,
          content: item.content,
          display_order: item.display_order !== undefined ? item.display_order : index
        }));
        
        await ProjectDetailItem.bulkCreate(items, { transaction });
      }
      
      await transaction.commit();
      
      return await this.getDetailById(detail.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async updateDetail(id, data) {
    const detail = await this.getDetailById(id);
    
    const transaction = await sequelize.transaction();
    
    try {
      await detail.update({
        detail_type: data.detail_type,
        title: data.title,
        display_order: data.display_order
      }, { transaction });
      
      // Update items if provided
      if (data.items) {
        // Delete existing items
        await ProjectDetailItem.destroy({
          where: { detail_id: id },
          transaction
        });
        
        // Create new items
        if (data.items.length > 0) {
          const items = data.items.map((item, index) => ({
            detail_id: id,
            content: item.content,
            display_order: item.display_order !== undefined ? item.display_order : index
          }));
          
          await ProjectDetailItem.bulkCreate(items, { transaction });
        }
      }
      
      await transaction.commit();
      
      return await this.getDetailById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async deleteDetail(id) {
    const detail = await this.getDetailById(id);
    await detail.destroy();
    return { message: 'Detail deleted successfully' };
  }
}

module.exports = new ProjectDetailService();
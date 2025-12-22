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
const { sequelize } = require('../models');
const FileHelper = require('../utils/fileHelper');

class ProjectService {
  async createCompleteProject(data, files = []) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🔄 Creating project with data:', {
        title: data.title,
        category_id: data.category_id,
        filesCount: files.length
      });

      // 1. Create Project
      const project = await Project.create({
        title: data.title,
        slug: data.slug,
        category_id: data.category_id,
        price: data.price || null,
        theme: data.theme || null,
        description: data.description || null,
        atmosphere_description: data.atmosphere_description || null,
        is_featured: data.is_featured || false,
        is_published: data.is_published || false,
        created_by: data.created_by
      }, { transaction });

      console.log('✅ Project created:', project.id);

      // 2. Upload & Create Photos
      if (files && files.length > 0) {
        try {
          const photosMetadata = data.photos_metadata || [];
          console.log('📸 Processing photos:', { count: files.length, metadata: photosMetadata });
          
          const photoData = files.map((file, index) => {
            const metadata = photosMetadata[index] || {};
            return {
              project_id: project.id,
              url: file.path.replace(/\\/g, '/'),
              caption: metadata.caption || null,
              position: metadata.position || 'center',
              display_order: metadata.display_order !== undefined ? metadata.display_order : index,
              is_hero: index === (parseInt(data.hero_photo_index) || 0)
            };
          });

          await ProjectPhoto.bulkCreate(photoData, { transaction });
          console.log('✅ Photos created');
        } catch (photoError) {
          console.error('❌ Photo error:', photoError);
          throw new Error(`Failed to create photos: ${photoError.message}`);
        }
      }

      // 3. Create Details
      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        try {
          console.log('📝 Creating details:', data.details.length);
          
          for (let detailIndex = 0; detailIndex < data.details.length; detailIndex++) {
            const detail = data.details[detailIndex];
            
            const createdDetail = await ProjectDetail.create({
              project_id: project.id,
              detail_type: detail.detail_type || 'other',
              title: detail.title,
              display_order: detail.display_order !== undefined ? detail.display_order : detailIndex
            }, { transaction });

            if (detail.items && detail.items.length > 0) {
              const itemsData = detail.items.map((item, itemIndex) => ({
                detail_id: createdDetail.id,
                content: item.content,
                display_order: item.display_order !== undefined ? item.display_order : itemIndex
              }));

              await ProjectDetailItem.bulkCreate(itemsData, { transaction });
            }
          }
          console.log('✅ Details created');
        } catch (detailError) {
          console.error('❌ Detail error:', detailError);
          throw new Error(`Failed to create details: ${detailError.message}`);
        }
      }

      // 4. Create Includes
      if (data.includes && Array.isArray(data.includes) && data.includes.length > 0) {
        try {
          const includesData = data.includes.map((item, index) => ({
            project_id: project.id,
            item: typeof item === 'string' ? item : item.item,
            display_order: typeof item === 'object' && item.display_order !== undefined 
              ? item.display_order 
              : index
          }));

          await ProjectInclude.bulkCreate(includesData, { transaction });
          console.log('✅ Includes created');
        } catch (includeError) {
          console.error('❌ Include error:', includeError);
          throw new Error(`Failed to create includes: ${includeError.message}`);
        }
      }

      // 5. Create Moods
      if (data.moods && Array.isArray(data.moods) && data.moods.length > 0) {
        try {
          const moodsData = data.moods.map((mood, index) => ({
            project_id: project.id,
            mood: typeof mood === 'string' ? mood : mood.mood,
            display_order: typeof mood === 'object' && mood.display_order !== undefined
              ? mood.display_order
              : index
          }));

          await ProjectMood.bulkCreate(moodsData, { transaction });
          console.log('✅ Moods created');
        } catch (moodError) {
          console.error('❌ Mood error:', moodError);
          throw new Error(`Failed to create moods: ${moodError.message}`);
        }
      }

      await transaction.commit();
      console.log('✅ Transaction committed');

      return await this.getProjectById(project.id);
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Transaction rolled back:', error);
      
      if (files && files.length > 0) {
        for (const file of files) {
          await FileHelper.deleteFile(file.path);
        }
      }
      
      throw error;
    }
  }

  async updateCompleteProject(id, data, newFiles = []) {
    const transaction = await sequelize.transaction();
    
    try {
      const project = await Project.findByPk(id, { transaction });
      if (!project) {
        throw new Error('Project not found');
      }

      await project.update({
        title: data.title !== undefined ? data.title : project.title,
        slug: data.slug !== undefined ? data.slug : project.slug,
        category_id: data.category_id !== undefined ? data.category_id : project.category_id,
        price: data.price !== undefined ? data.price : project.price,
        theme: data.theme !== undefined ? data.theme : project.theme,
        description: data.description !== undefined ? data.description : project.description,
        atmosphere_description: data.atmosphere_description !== undefined ? data.atmosphere_description : project.atmosphere_description,
        is_featured: data.is_featured !== undefined ? data.is_featured : project.is_featured,
        is_published: data.is_published !== undefined ? data.is_published : project.is_published
      }, { transaction });

      if (newFiles && newFiles.length > 0) {
        const photosMetadata = data.photos_metadata ? (typeof data.photos_metadata === 'string' ? JSON.parse(data.photos_metadata) : data.photos_metadata) : [];
        
        const photoData = newFiles.map((file, index) => {
          const metadata = photosMetadata[index] || {};
          return {
            project_id: project.id,
            url: file.path.replace(/\\/g, '/'),
            caption: metadata.caption || null,
            position: metadata.position || 'center',
            display_order: metadata.display_order !== undefined ? metadata.display_order : index,
            is_hero: false
          };
        });

        await ProjectPhoto.bulkCreate(photoData, { transaction });
      }

      if (data.update_photos_metadata) {
        const updatePhotos = typeof data.update_photos_metadata === 'string' 
          ? JSON.parse(data.update_photos_metadata) 
          : data.update_photos_metadata;
        
        for (const photoUpdate of updatePhotos) {
          await ProjectPhoto.update({
            caption: photoUpdate.caption,
            position: photoUpdate.position,
            display_order: photoUpdate.display_order,
            is_hero: photoUpdate.is_hero
          }, {
            where: { id: photoUpdate.id, project_id: id },
            transaction
          });
        }
      }

      if (data.hero_photo_id) {
        await ProjectPhoto.update(
          { is_hero: false },
          { where: { project_id: id }, transaction }
        );
        await ProjectPhoto.update(
          { is_hero: true },
          { where: { id: data.hero_photo_id, project_id: id }, transaction }
        );
      }

      if (data.details !== undefined) {
        const details = typeof data.details === 'string' ? JSON.parse(data.details) : data.details;
        await ProjectDetail.destroy({ where: { project_id: id }, transaction });

        if (details && details.length > 0) {
          for (let detailIndex = 0; detailIndex < details.length; detailIndex++) {
            const detail = details[detailIndex];
            
            const createdDetail = await ProjectDetail.create({
              project_id: project.id,
              detail_type: detail.detail_type || 'other',
              title: detail.title,
              display_order: detail.display_order !== undefined ? detail.display_order : detailIndex
            }, { transaction });

            if (detail.items && detail.items.length > 0) {
              const itemsData = detail.items.map((item, itemIndex) => ({
                detail_id: createdDetail.id,
                content: item.content,
                display_order: item.display_order !== undefined ? item.display_order : itemIndex
              }));

              await ProjectDetailItem.bulkCreate(itemsData, { transaction });
            }
          }
        }
      }

      if (data.includes !== undefined) {
        const includes = typeof data.includes === 'string' ? JSON.parse(data.includes) : data.includes;
        await ProjectInclude.destroy({ where: { project_id: id }, transaction });
        
        if (includes && includes.length > 0) {
          const includesData = includes.map((item, index) => ({
            project_id: project.id,
            item: typeof item === 'string' ? item : item.item,
            display_order: typeof item === 'object' && item.display_order !== undefined
              ? item.display_order
              : index
          }));

          await ProjectInclude.bulkCreate(includesData, { transaction });
        }
      }

      if (data.moods !== undefined) {
        const moods = typeof data.moods === 'string' ? JSON.parse(data.moods) : data.moods;
        await ProjectMood.destroy({ where: { project_id: id }, transaction });
        
        if (moods && moods.length > 0) {
          const moodsData = moods.map((mood, index) => ({
            project_id: project.id,
            mood: typeof mood === 'string' ? mood : mood.mood,
            display_order: typeof mood === 'object' && mood.display_order !== undefined
              ? mood.display_order
              : index
          }));

          await ProjectMood.bulkCreate(moodsData, { transaction });
        }
      }

      await transaction.commit();
      return await this.getProjectById(id);
      
    } catch (error) {
      await transaction.rollback();
      if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
          await FileHelper.deleteFile(file.path);
        }
      }
      throw error;
    }
  }

  async deleteProject(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const project = await Project.findByPk(id);
      if(!project) throw new Error('Project not found');
      
      const photos = await ProjectPhoto.findAll({
        where: { project_id: id },
        attributes: ['url'],
        transaction
      });

      await ProjectDetailItem.destroy({
        where: {
          detail_id: {
            [Op.in]: sequelize.literal(`(SELECT id FROM project_details WHERE project_id = ${id})`)
          }
        },
        transaction
      });

      await ProjectDetail.destroy({ where: { project_id: id }, transaction });
      await ProjectInclude.destroy({ where: { project_id: id }, transaction });
      await ProjectMood.destroy({ where: { project_id: id }, transaction });
      await ProjectPhoto.destroy({ where: { project_id: id }, transaction });
      await project.destroy({ transaction });

      await transaction.commit();

      for (const photo of photos) {
        await FileHelper.deleteFile(photo.url);
      }

      return { message: 'Project and all related data deleted successfully' };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --- BAGIAN YANG DIPERBAIKI ---
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
          order: [['display_order', 'ASC'], ['created_at', 'ASC']]
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
    
    // Jika includeAll false (dipanggil oleh internal service seperti toggle), kembalikan Instance Sequelize
    if (!includeAll) {
      return project;
    }

    // Jika untuk API, kembalikan JSON hasil transformasi
    const projectData = project.toJSON();
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    
    if (projectData.photos && Array.isArray(projectData.photos)) {
      projectData.photos = projectData.photos.map(photo => ({
        ...photo,
        url: photo.url && photo.url.startsWith('http') 
          ? photo.url 
          : `${BASE_URL}/${photo.url}`
      }));
    }
    
    return projectData;
  }
  // ------------------------------

  async getProjectBySlug(slug, incrementView = false) {
    const project = await Project.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: Admin, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: ProjectPhoto, as: 'photos', separate: true, order: [['display_order', 'ASC']] },
        { 
          model: ProjectDetail, 
          as: 'details',
          include: [{ model: ProjectDetailItem, as: 'items', separate: true, order: [['display_order', 'ASC']] }],
          separate: true, order: [['display_order', 'ASC']]
        },
        { model: ProjectInclude, as: 'includes', separate: true, order: [['display_order', 'ASC']] },
        { model: ProjectMood, as: 'moods', separate: true, order: [['display_order', 'ASC']] }
      ]
    });
    
    if (!project) throw new Error('Project not found');
    
    if (incrementView) {
      await project.increment('view_count');
      await project.reload();
    }
    
    return project;
  }

  async getAllProjects(filters = {}) {
    const where = {};
    if (filters.is_published !== undefined) where.is_published = filters.is_published;
    if (filters.is_featured !== undefined) where.is_featured = filters.is_featured;
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { slug: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const include = [{ model: Category, as: 'category' }];
    if (filters.includePhotos) {
      include.push({ model: ProjectPhoto, as: 'photos', separate: true, order: [['display_order', 'ASC']] });
    }
    
    const orderBy = filters.orderBy || 'created_at';
    const orderDir = filters.orderDir || 'DESC';
    
    const projects = await Project.findAll({ where, include, order: [[orderBy, orderDir]] });
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    
    return projects.map(project => {
      const projectData = project.toJSON();
      if (projectData.photos && Array.isArray(projectData.photos)) {
        projectData.photos = projectData.photos.map(photo => ({
          ...photo,
          url: photo.url && photo.url.startsWith('http') ? photo.url : `${BASE_URL}/${photo.url}`
        }));
      }
      return projectData;
    });
  }

  async toggleProjectStatus(id, field = 'is_published') {
    // getProjectById(id, false) sekarang mengembalikan Instance asli
    const project = await this.getProjectById(id, false);
    await project.update({ [field]: !project[field] });
    return project;
  }

  async getFeaturedProjects(limit = 6) {
    return await Project.findAll({
      where: { is_featured: true, is_published: true },
      include: [
        { model: Category, as: 'category' },
        { model: ProjectPhoto, as: 'photos', where: { is_hero: true }, required: false, limit: 1 }
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  }
}

module.exports = new ProjectService();
const { 
  Project, 
  Category, 
  ProjectPhoto,
  ProjectPhotoColor,
  ProjectPhotoFlower,
  ProjectInclude, 
  Admin 
} = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../models');
const FileHelper = require('../../utils/fileHelper');

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

      // 2. Create Photos with Colors & Flowers
      if (files && files.length > 0) {
        try {
          const photosMetadata = data.photos_metadata || [];
          console.log('📸 Processing photos:', { count: files.length, metadata: photosMetadata });

          for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const metadata = photosMetadata[index] || {};

            const photo = await ProjectPhoto.create({
              project_id: project.id,
              url: file.path.replace(/\\/g, '/'),
              caption: metadata.caption || null,
              position: metadata.position || 'center',
              display_order: metadata.display_order !== undefined ? metadata.display_order : index,
              is_hero: index === (parseInt(data.hero_photo_index) || 0)
            }, { transaction });

            // Create colors untuk foto ini
            if (metadata.colors && metadata.colors.length > 0) {
              const colorsData = metadata.colors.map((color, i) => ({
                photo_id: photo.id,
                color_name: color.color_name,
                color_hex: color.color_hex || null,
                description: color.description || null,
                display_order: color.display_order !== undefined ? color.display_order : i
              }));
              await ProjectPhotoColor.bulkCreate(colorsData, { transaction });
            }

            // Create flowers untuk foto ini
            if (metadata.flowers && metadata.flowers.length > 0) {
              const flowersData = metadata.flowers.map((flower, i) => ({
                photo_id: photo.id,
                flower_name: flower.flower_name,
                description: flower.description || null,
                display_order: flower.display_order !== undefined ? flower.display_order : i
              }));
              await ProjectPhotoFlower.bulkCreate(flowersData, { transaction });
            }
          }

          console.log('✅ Photos with colors & flowers created');
        } catch (photoError) {
          console.error('❌ Photo error:', photoError);
          throw new Error(`Failed to create photos: ${photoError.message}`);
        }
      }

      // 3. Create Includes
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

      // 1. Update project fields
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

      // 2. Add new photos with colors & flowers
      if (newFiles && newFiles.length > 0) {
        const photosMetadata = data.photos_metadata 
          ? (typeof data.photos_metadata === 'string' ? JSON.parse(data.photos_metadata) : data.photos_metadata) 
          : [];

        for (let index = 0; index < newFiles.length; index++) {
          const file = newFiles[index];
          const metadata = photosMetadata[index] || {};

          const photo = await ProjectPhoto.create({
            project_id: project.id,
            url: file.path.replace(/\\/g, '/'),
            caption: metadata.caption || null,
            position: metadata.position || 'center',
            display_order: metadata.display_order !== undefined ? metadata.display_order : index,
            is_hero: false
          }, { transaction });

          if (metadata.colors && metadata.colors.length > 0) {
            const colorsData = metadata.colors.map((color, i) => ({
              photo_id: photo.id,
              color_name: color.color_name,
              color_hex: color.color_hex || null,
              description: color.description || null,
              display_order: color.display_order !== undefined ? color.display_order : i
            }));
            await ProjectPhotoColor.bulkCreate(colorsData, { transaction });
          }

          if (metadata.flowers && metadata.flowers.length > 0) {
            const flowersData = metadata.flowers.map((flower, i) => ({
              photo_id: photo.id,
              flower_name: flower.flower_name,
              description: flower.description || null,
              display_order: flower.display_order !== undefined ? flower.display_order : i
            }));
            await ProjectPhotoFlower.bulkCreate(flowersData, { transaction });
          }
        }
      }

      // 3. Update existing photos metadata (caption, position, display_order, is_hero)
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

          // Update colors foto yang sudah ada (replace semua)
          if (photoUpdate.colors !== undefined) {
            await ProjectPhotoColor.destroy({ where: { photo_id: photoUpdate.id }, transaction });
            if (photoUpdate.colors.length > 0) {
              const colorsData = photoUpdate.colors.map((color, i) => ({
                photo_id: photoUpdate.id,
                color_name: color.color_name,
                color_hex: color.color_hex || null,
                description: color.description || null,
                display_order: color.display_order !== undefined ? color.display_order : i
              }));
              await ProjectPhotoColor.bulkCreate(colorsData, { transaction });
            }
          }

          // Update flowers foto yang sudah ada (replace semua)
          if (photoUpdate.flowers !== undefined) {
            await ProjectPhotoFlower.destroy({ where: { photo_id: photoUpdate.id }, transaction });
            if (photoUpdate.flowers.length > 0) {
              const flowersData = photoUpdate.flowers.map((flower, i) => ({
                photo_id: photoUpdate.id,
                flower_name: flower.flower_name,
                description: flower.description || null,
                display_order: flower.display_order !== undefined ? flower.display_order : i
              }));
              await ProjectPhotoFlower.bulkCreate(flowersData, { transaction });
            }
          }
        }
      }

      // 4. Set hero photo
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

      // 5. Delete specific photos
      if (data.delete_photo_ids) {
        const deleteIds = typeof data.delete_photo_ids === 'string'
          ? JSON.parse(data.delete_photo_ids)
          : data.delete_photo_ids;

        const photosToDelete = await ProjectPhoto.findAll({
          where: { id: deleteIds, project_id: id },
          transaction
        });

        // Colors & flowers terhapus otomatis via CASCADE
        await ProjectPhoto.destroy({ where: { id: deleteIds, project_id: id }, transaction });

        // Hapus file fisik setelah commit
        for (const photo of photosToDelete) {
          await FileHelper.deleteFile(photo.url);
        }
      }

      // 6. Update includes (replace semua)
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
      if (!project) throw new Error('Project not found');
      
      const photos = await ProjectPhoto.findAll({
        where: { project_id: id },
        attributes: ['url'],
        transaction
      });

      // Colors & flowers terhapus otomatis via CASCADE ketika photos dihapus
      await ProjectInclude.destroy({ where: { project_id: id }, transaction });
      await ProjectPhoto.destroy({ where: { project_id: id }, transaction });
      await project.destroy({ transaction });

      await transaction.commit();

      // Hapus file fisik setelah commit
      for (const photo of photos) {
        await FileHelper.deleteFile(photo.url);
      }

      return { message: 'Project and all related data deleted successfully' };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
          order: [['display_order', 'ASC'], ['created_at', 'ASC']],
          include: [
            { 
              model: ProjectPhotoColor, 
              as: 'colors',
              order: [['display_order', 'ASC']]
            },
            { 
              model: ProjectPhotoFlower, 
              as: 'flowers',
              order: [['display_order', 'ASC']]
            }
          ]
        },
        { 
          model: ProjectInclude, 
          as: 'includes',
          separate: true,
          order: [['display_order', 'ASC']]
        }
      );
    }
    
    const project = await Project.findByPk(id, { include });
    
    if (!project) {
      throw new Error('Project not found');
    }

    if (!includeAll) {
      return project;
    }

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
          order: [['display_order', 'ASC']],
          include: [
            { model: ProjectPhotoColor, as: 'colors', order: [['display_order', 'ASC']] },
            { model: ProjectPhotoFlower, as: 'flowers', order: [['display_order', 'ASC']] }
          ]
        },
        { model: ProjectInclude, as: 'includes', separate: true, order: [['display_order', 'ASC']] }
      ]
    });
    
    if (!project) throw new Error('Project not found');
    
    if (incrementView) {
      await project.increment('view_count');
      await project.reload();
    }

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
      include.push({ 
        model: ProjectPhoto, 
        as: 'photos', 
        separate: true, 
        order: [['display_order', 'ASC']],
        include: [
          { model: ProjectPhotoColor, as: 'colors', order: [['display_order', 'ASC']] },
          { model: ProjectPhotoFlower, as: 'flowers', order: [['display_order', 'ASC']] }
        ]
      });
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

  async updateProjectPhoto(photoId, { caption, position, is_hero, colors, flowers, file }) {
    const transaction = await sequelize.transaction();
    try {
      const photo = await ProjectPhoto.findByPk(photoId);
      if (!photo) throw new Error('Photo not found');

      // Ganti file jika ada upload baru
      let newUrl = photo.url;
      if (file) {
        if (photo.url) await FileHelper.deleteFile(photo.url).catch(() => {});
        newUrl = file.path.replace(/\\/g, '/');
      }

      await photo.update({
        caption: caption !== undefined ? caption : photo.caption,
        position: position !== undefined ? position : photo.position,
        is_hero: is_hero !== undefined ? (is_hero === 'true' || is_hero === true) : photo.is_hero,
        url: newUrl
      }, { transaction });

      // Replace colors jika dikirim
      if (colors !== undefined) {
        let parsed = typeof colors === 'string' ? JSON.parse(colors) : colors;
        await ProjectPhotoColor.destroy({ where: { photo_id: photoId }, transaction });
        if (Array.isArray(parsed) && parsed.length > 0) {
          await ProjectPhotoColor.bulkCreate(
            parsed.map((c, i) => ({
              photo_id: photoId,
              color_name: c.color_name,
              color_hex: c.color_hex || null,
              description: c.description || null,
              display_order: c.display_order ?? i
            })),
            { transaction }
          );
        }
      }

      // Replace flowers jika dikirim
      if (flowers !== undefined) {
        let parsed = typeof flowers === 'string' ? JSON.parse(flowers) : flowers;
        await ProjectPhotoFlower.destroy({ where: { photo_id: photoId }, transaction });
        if (Array.isArray(parsed) && parsed.length > 0) {
          await ProjectPhotoFlower.bulkCreate(
            parsed.map((f, i) => ({
              photo_id: photoId,
              flower_name: f.flower_name,
              description: f.description || null,
              display_order: f.display_order ?? i
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();

      // Kembalikan data terbaru lengkap
      return await ProjectPhoto.findByPk(photoId, {
        include: [
          { model: ProjectPhotoColor, as: 'colors', order: [['display_order', 'ASC']] },
          { model: ProjectPhotoFlower, as: 'flowers', order: [['display_order', 'ASC']] }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteProjectPhoto(photoId) {
    const photo = await ProjectPhoto.findByPk(photoId);
    if (!photo) throw new Error('Photo not found');

    if (photo.url) await FileHelper.deleteFile(photo.url).catch(() => {});
    await photo.destroy(); // colors & flowers auto-cascade
  }

  async toggleProjectStatus(id, field = 'is_published') {
    const project = await this.getProjectById(id, false);
    await project.update({ [field]: !project[field] });
    return project;
  }

  async getFeaturedProjects(limit = 6) {
    const projects = await Project.findAll({
      where: { is_featured: true, is_published: true },
      include: [
        { model: Category, as: 'category' },
        { 
          model: ProjectPhoto, 
          as: 'photos', 
          where: { is_hero: true }, 
          required: false, 
          limit: 1,
          include: [
            { model: ProjectPhotoColor, as: 'colors' },
            { model: ProjectPhotoFlower, as: 'flowers' }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

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
}

module.exports = new ProjectService();
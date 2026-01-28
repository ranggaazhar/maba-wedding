const { Category, Project, BookingModel } = require('../models');
const { Op } = require('sequelize');

class CategoryService {
  async getAllCategories(filters = {}) {
    const where = {};
    
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }
    
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { slug: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']],
      include: filters.includeProjects ? [
        { model: Project, as: 'projects' },
        { model: BookingModel, as: 'bookingModels' }
      ] : []
    });
    
    return categories;
  }
  
  async getCategoryById(id, includeRelations = false) {
    const include = includeRelations ? [
      { model: Project, as: 'projects' },
      { model: BookingModel, as: 'bookingModels' }
    ] : [];
    
    const category = await Category.findByPk(id, { include });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  }
  
  async getCategoryBySlug(slug, includeRelations = false) {
    const include = includeRelations ? [
      { model: Project, as: 'projects' },
      { model: BookingModel, as: 'bookingModels' }
    ] : [];
    
    const category = await Category.findOne({
      where: { slug },
      include
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  }
  
  async createCategory(data) {
    const existingCategory = await Category.findOne({
      where: { slug: data.slug }
    });
    
    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }
    
    const category = await Category.create(data);
    return category;
  }
  
  async updateCategory(id, data) {
    const category = await this.getCategoryById(id);
    
    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await Category.findOne({
        where: { 
          slug: data.slug,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingCategory) {
        throw new Error('Category with this slug already exists');
      }
    }
    
    await category.update(data);
    return category;
  }
  
  async deleteCategory(id) {
    const category = await this.getCategoryById(id);
    const projectCount = await Project.count({
      where: { category_id: id }
    });
    
    const bookingModelCount = await BookingModel.count({
      where: { category_id: id }
    });
    
    if (projectCount > 0 || bookingModelCount > 0) {
      throw new Error('Cannot delete category with associated projects or booking models');
    }
    
    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
  
  async toggleCategoryStatus(id) {
    const category = await this.getCategoryById(id);
    await category.update({ is_active: !category.is_active });
    return category;
  }
}

module.exports = new CategoryService();
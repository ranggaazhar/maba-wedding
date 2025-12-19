// services/propertyCategoryService.js
const { PropertyCategory, Property } = require('../models');
const { Op } = require('sequelize');

class PropertyCategoryService {
  async getAllPropertyCategories(filters = {}) {
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
    
    const propertyCategories = await PropertyCategory.findAll({
      where,
      order: [['display_order', 'ASC'], ['name', 'ASC']],
      include: filters.includeProperties ? [
        { model: Property, as: 'properties' }
      ] : []
    });
    
    return propertyCategories;
  }
  
  async getPropertyCategoryById(id, includeRelations = false) {
    const include = includeRelations ? [
      { model: Property, as: 'properties' }
    ] : [];
    
    const propertyCategory = await PropertyCategory.findByPk(id, { include });
    
    if (!propertyCategory) {
      throw new Error('Property category not found');
    }
    
    return propertyCategory;
  }
  
  async getPropertyCategoryBySlug(slug, includeRelations = false) {
    const include = includeRelations ? [
      { model: Property, as: 'properties' }
    ] : [];
    
    const propertyCategory = await PropertyCategory.findOne({
      where: { slug },
      include
    });
    
    if (!propertyCategory) {
      throw new Error('Property category not found');
    }
    
    return propertyCategory;
  }
  
  async createPropertyCategory(data) {
    // Check if slug already exists
    const existingPropertyCategory = await PropertyCategory.findOne({
      where: { slug: data.slug }
    });
    
    if (existingPropertyCategory) {
      throw new Error('Property category with this slug already exists');
    }
    
    const propertyCategory = await PropertyCategory.create(data);
    return propertyCategory;
  }
  
  async updatePropertyCategory(id, data) {
    const propertyCategory = await this.getPropertyCategoryById(id);
    
    // Check if slug is being updated and if it's unique
    if (data.slug && data.slug !== propertyCategory.slug) {
      const existingPropertyCategory = await PropertyCategory.findOne({
        where: { 
          slug: data.slug,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingPropertyCategory) {
        throw new Error('Property category with this slug already exists');
      }
    }
    
    await propertyCategory.update(data);
    return propertyCategory;
  }
  
  async deletePropertyCategory(id) {
    const propertyCategory = await this.getPropertyCategoryById(id);
    
    // Check if property category has associated properties
    const propertyCount = await Property.count({
      where: { category_id: id }
    });
    
    if (propertyCount > 0) {
      throw new Error('Cannot delete property category with associated properties');
    }
    
    await propertyCategory.destroy();
    return { message: 'Property category deleted successfully' };
  }
  
  async togglePropertyCategoryStatus(id) {
    const propertyCategory = await this.getPropertyCategoryById(id);
    await propertyCategory.update({ is_active: !propertyCategory.is_active });
    return propertyCategory;
  }
}

module.exports = new PropertyCategoryService();
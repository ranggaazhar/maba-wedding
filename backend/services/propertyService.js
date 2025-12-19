// services/propertyService.js
const { Property, PropertyCategory, PropertyImage, Admin } = require('../models');
const { Op } = require('sequelize');

class PropertyService {
  async getAllProperties(filters = {}) {
    const where = {};
    
    if (filters.is_available !== undefined) {
      where.is_available = filters.is_available;
    }
    
    if (filters.category_id) {
      where.category_id = filters.category_id;
    }
    
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { slug: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    if (filters.min_price) {
      where.price = { [Op.gte]: filters.min_price };
    }
    
    if (filters.max_price) {
      where.price = where.price 
        ? { ...where.price, [Op.lte]: filters.max_price }
        : { [Op.lte]: filters.max_price };
    }
    
    if (filters.in_stock) {
      where.stock_quantity = { [Op.gt]: 0 };
    }
    
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    
    if (filters.includeImages) {
      include.push({ 
        model: PropertyImage, 
        as: 'images',
        separate: true,
        order: [['display_order', 'ASC'], ['created_at', 'ASC']]
      });
    }
    
    if (filters.includeCreator) {
      include.push({
        model: Admin,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      });
    }
    
    const orderBy = filters.orderBy || 'created_at';
    const orderDir = filters.orderDir || 'DESC';
    
    const properties = await Property.findAll({
      where,
      include,
      order: [[orderBy, orderDir]]
    });
    
    return properties;
  }
  
  async getPropertyById(id, includeRelations = true) {
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    
    if (includeRelations) {
      include.push(
        { 
          model: PropertyImage, 
          as: 'images',
          separate: true,
          order: [['display_order', 'ASC'], ['created_at', 'ASC']]
        },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      );
    }
    
    const property = await Property.findByPk(id, { include });
    
    if (!property) {
      throw new Error('Property not found');
    }
    
    return property;
  }
  
  async getPropertyBySlug(slug, includeRelations = true) {
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    
    if (includeRelations) {
      include.push(
        { 
          model: PropertyImage, 
          as: 'images',
          separate: true,
          order: [['display_order', 'ASC'], ['created_at', 'ASC']]
        },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      );
    }
    
    const property = await Property.findOne({
      where: { slug },
      include
    });
    
    if (!property) {
      throw new Error('Property not found');
    }
    
    return property;
  }
  
  async createProperty(data) {
    // Check if slug already exists
    const existingProperty = await Property.findOne({
      where: { slug: data.slug }
    });
    
    if (existingProperty) {
      throw new Error('Property with this slug already exists');
    }
    
    // Verify category exists
    const category = await PropertyCategory.findByPk(data.category_id);
    if (!category) {
      throw new Error('Property category not found');
    }
    
    const property = await Property.create(data);
    return await this.getPropertyById(property.id);
  }
  
  async updateProperty(id, data) {
    const property = await this.getPropertyById(id, false);
    
    // Check if slug is being updated and if it's unique
    if (data.slug && data.slug !== property.slug) {
      const existingProperty = await Property.findOne({
        where: { 
          slug: data.slug,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingProperty) {
        throw new Error('Property with this slug already exists');
      }
    }
    
    // Verify category exists if being updated
    if (data.category_id && data.category_id !== property.category_id) {
      const category = await PropertyCategory.findByPk(data.category_id);
      if (!category) {
        throw new Error('Property category not found');
      }
    }
    
    await property.update(data);
    return await this.getPropertyById(id);
  }
  
  async deleteProperty(id) {
    const property = await this.getPropertyById(id);
    
    // Check if property has associated booking properties or invoice items
    const bookingCount = await property.countBookingProperties();
    const invoiceCount = await property.countInvoiceItems();
    
    if (bookingCount > 0 || invoiceCount > 0) {
      throw new Error('Cannot delete property with existing bookings or invoices');
    }
    
    await property.destroy();
    return { message: 'Property deleted successfully' };
  }
  
  async toggleAvailability(id) {
    const property = await this.getPropertyById(id, false);
    await property.update({ is_available: !property.is_available });
    return property;
  }
  
  async updateStock(id, quantity, operation = 'set') {
    const property = await this.getPropertyById(id, false);
    
    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = property.stock_quantity + quantity;
        break;
      case 'subtract':
        newQuantity = property.stock_quantity - quantity;
        if (newQuantity < 0) {
          throw new Error('Insufficient stock');
        }
        break;
      case 'set':
      default:
        newQuantity = quantity;
    }
    
    await property.update({ stock_quantity: newQuantity });
    return property;
  }
  
  async getAvailableProperties(categoryId = null) {
    const where = {
      is_available: true,
      stock_quantity: { [Op.gt]: 0 }
    };
    
    if (categoryId) {
      where.category_id = categoryId;
    }
    
    return await Property.findAll({
      where,
      include: [
        { model: PropertyCategory, as: 'category' },
        { 
          model: PropertyImage, 
          as: 'images',
          where: { is_primary: true },
          required: false,
          limit: 1
        }
      ],
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new PropertyService();
const { Property, PropertyCategory, Admin } = require('../../models');
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
    
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    

    
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
    
    const results = [];
    for (const prop of properties) {
      const propData = prop.toJSON();
      propData.is_deletable = await this.isPropertyDeletable(prop.id);
      results.push(propData);
    }
    return results;
  }
  
  async getPropertyById(id, includeRelations = true) {
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    
    if (includeRelations) {
      include.push(
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
    
    const propData = property.toJSON();
    propData.is_deletable = await this.isPropertyDeletable(id);
    return propData;
  }
  
  async getPropertyBySlug(slug, includeRelations = true) {
    const include = [
      { model: PropertyCategory, as: 'category' }
    ];
    
    if (includeRelations) {
      include.push(
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
    
    const propData = property.toJSON();
    propData.is_deletable = await this.isPropertyDeletable(propData.id);
    return propData;
  }
  
  async createProperty(data) {
    const existingProperty = await Property.findOne({
      where: { slug: data.slug }
    });
    
    if (existingProperty) {
      throw new Error('Property with this slug already exists');
    }
    
    const category = await PropertyCategory.findByPk(data.category_id);
    if (!category) {
      throw new Error('Property category not found');
    }
    
    const property = await Property.create(data);
    return await this.getPropertyById(property.id);
  }
  
  async updateProperty(id, data) {
    const property = await this.getPropertyById(id, false);
    
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
    
    if (data.category_id && data.category_id !== property.category_id) {
      const category = await PropertyCategory.findByPk(data.category_id);
      if (!category) {
        throw new Error('Property category not found');
      }
    }
    
    if (data.image_url && property.image_url && data.image_url !== property.image_url) {
      const FileHelper = require('../../utils/fileHelper');
      await FileHelper.deleteFile(property.image_url);
    }
    
    await property.update(data);
    return await this.getPropertyById(id);
  }
  
  async isPropertyDeletable(id) {
    const { BookingProperty, Booking, InvoiceItem, Invoice } = require('../../models');
    
    // Check if there are any associated bookings (whether confirmed or not)
    // whose invoice is NOT paid (or doesn't exist).
    const bookings = await BookingProperty.findAll({
      where: { property_id: id },
      include: [{
        model: Booking,
        as: 'booking',
        include: [{
          model: Invoice,
          as: 'invoice'
        }]
      }]
    });

    for (const bp of bookings) {
      const booking = bp.booking;
      if (!booking) continue;
      
      const invoice = booking.invoice;
      if (!invoice || invoice.status !== 'PAID') {
        return false;
      }
    }

    // Also check direct InvoiceItems
    const invoiceItems = await InvoiceItem.findAll({
      where: { property_id: id },
      include: [{
        model: Invoice,
        as: 'invoice'
      }]
    });

    for (const item of invoiceItems) {
      const invoice = item.invoice;
      if (!invoice || invoice.status !== 'PAID') {
        return false;
      }
    }

    return true;
  }

  async deleteProperty(id) {
    const deletable = await this.isPropertyDeletable(id);
    if (!deletable) {
      throw new Error('Properti tidak dapat dihapus karena masih memiliki booking atau invoice yang belum lunas.');
    }

    const { BookingProperty, InvoiceItem } = require('../../models');
    const { sequelize } = require('../../models');
    const transaction = await sequelize.transaction();
    
    try {
      const property = await Property.findByPk(id, { transaction });
      if (!property) throw new Error('Property not found');
      
      // Update associated BookingProperty and InvoiceItem property_id to NULL to preserve invoice history!
      await BookingProperty.update(
        { property_id: null },
        { where: { property_id: id }, transaction }
      );
      
      await InvoiceItem.update(
        { property_id: null },
        { where: { property_id: id }, transaction }
      );

      if (property.image_url) {
        const FileHelper = require('../../utils/fileHelper');
        await FileHelper.deleteFile(property.image_url).catch(() => {});
      }
      
      await property.destroy({ transaction });
      await transaction.commit();
      
      return { message: 'Property deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async toggleAvailability(id) {
    const property = await this.getPropertyById(id, false);
    await property.update({ is_available: !property.is_available });
    return property;
  }
  
  
  async getAvailableProperties(categoryId = null) {
    const where = {
      is_available: true,
    };
    
    if (categoryId) {
      where.category_id = categoryId;
    }
    
    return await Property.findAll({
      where,
      include: [
        { model: PropertyCategory, as: 'category' }
      ],
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new PropertyService();
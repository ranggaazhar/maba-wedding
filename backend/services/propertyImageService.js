const { PropertyImage, Property } = require('../models');
const FileHelper = require('../utils/fileHelper');

class PropertyImageService {
  async getImagesByPropertyId(propertyId) {
    const images = await PropertyImage.findAll({
      where: { property_id: propertyId },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    
    return images;
  }
  
  async getImageById(id) {
    const image = await PropertyImage.findByPk(id, {
      include: [{ model: Property, as: 'property' }]
    });
    
    if (!image) {
      throw new Error('Image not found');
    }
    
    return image;
  }
  
  // ✅ FIXED: Create image with file upload
  async createImageWithFile(propertyId, file, data = {}) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    // Parse is_primary
    const isPrimary = data.is_primary === 'true' || data.is_primary === true;
    
    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await PropertyImage.update(
        { is_primary: false },
        { where: { property_id: propertyId, is_primary: true } }
      );
    }
    
    // Normalize path for database (always use forward slash)
    const url = file.path.replace(/\\/g, '/');
    
    const image = await PropertyImage.create({
      property_id: propertyId,
      url: url,
      is_primary: isPrimary,
      display_order: data.display_order || 0
    });
    
    return image;
  }
  
  // ✅ FIXED: Upload multiple images with primary selection
  async uploadMultipleImages(propertyId, files, data = {}) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    // Parse primary_image_index from request body
    const primaryIndex = data.primary_image_index !== undefined 
      ? parseInt(data.primary_image_index) 
      : 0; // Default: first image is primary
    
    // Unset all existing primary images for this property
    await PropertyImage.update(
      { is_primary: false },
      { where: { property_id: propertyId } }
    );
    
    const images = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Normalize path for database (always use forward slash)
      const url = file.path.replace(/\\/g, '/');
      
      const image = await PropertyImage.create({
        property_id: propertyId,
        url: url,
        is_primary: i === primaryIndex, // Set primary based on index
        display_order: data.display_orders ? data.display_orders[i] : i
      });
      
      images.push(image);
    }
    
    return images;
  }
  
  // Original URL-based method
  async createImage(propertyId, data) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    // If this is set as primary, unset other primary images
    if (data.is_primary) {
      await PropertyImage.update(
        { is_primary: false },
        { where: { property_id: propertyId, is_primary: true } }
      );
    }
    
    const image = await PropertyImage.create({
      ...data,
      property_id: propertyId
    });
    
    return image;
  }
  
  async updateImage(id, data) {
    const image = await this.getImageById(id);
    
    // If this is set as primary, unset other primary images
    if (data.is_primary && !image.is_primary) {
      await PropertyImage.update(
        { is_primary: false },
        { where: { property_id: image.property_id, is_primary: true } }
      );
    }
    
    await image.update(data);
    return image;
  }
  
  async deleteImage(id) {
    const image = await this.getImageById(id);
    
    // Delete file if exists
    await FileHelper.deleteFile(image.url);
    
    await image.destroy();
    return { message: 'Image deleted successfully' };
  }
  
  async reorderImages(propertyId, imageIds) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    const updatePromises = imageIds.map((imageId, index) => {
      return PropertyImage.update(
        { display_order: index },
        { where: { id: imageId, property_id: propertyId } }
      );
    });
    
    await Promise.all(updatePromises);
    return await this.getImagesByPropertyId(propertyId);
  }
  
  async setPrimaryImage(id) {
    const image = await this.getImageById(id);
    
    // Unset all primary images for this property
    await PropertyImage.update(
      { is_primary: false },
      { where: { property_id: image.property_id, is_primary: true } }
    );
    
    // Set this image as primary
    await image.update({ is_primary: true });
    return image;
  }
  
  async bulkCreateImages(propertyId, images) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    
    // Check if any image is marked as primary
    const hasPrimary = images.some(img => img.is_primary);
    
    if (hasPrimary) {
      // Unset existing primary images
      await PropertyImage.update(
        { is_primary: false },
        { where: { property_id: propertyId, is_primary: true } }
      );
    }
    
    const imageData = images.map((img, index) => ({
      property_id: propertyId,
      url: img.url,
      is_primary: img.is_primary || false,
      display_order: img.display_order !== undefined ? img.display_order : index
    }));
    
    const created = await PropertyImage.bulkCreate(imageData);
    return created;
  }
}

module.exports = new PropertyImageService();
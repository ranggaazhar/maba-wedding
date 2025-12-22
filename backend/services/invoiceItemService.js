// services/invoiceItemService.js
const { InvoiceItem, Invoice, Project, Property } = require('../models');

class InvoiceItemService {
  async getItemsByInvoiceId(invoiceId) {
    const items = await InvoiceItem.findAll({
      where: { invoice_id: invoiceId },
      include: [
        { model: Project, as: 'project' },
        { model: Property, as: 'property' }
      ],
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });
    
    return items;
  }
  
  async getItemById(id) {
    const item = await InvoiceItem.findByPk(id, {
      include: [
        { model: Invoice, as: 'invoice' },
        { model: Project, as: 'project' },
        { model: Property, as: 'property' }
      ]
    });
    
    if (!item) {
      throw new Error('Invoice item not found');
    }
    
    return item;
  }
  
  async createItem(invoiceId, data) {
    // Verify invoice exists
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // Verify project if provided
    if (data.project_id) {
      const project = await Project.findByPk(data.project_id);
      if (!project) {
        throw new Error('Project not found');
      }
    }
    
    // Verify property if provided
    if (data.property_id) {
      const property = await Property.findByPk(data.property_id);
      if (!property) {
        throw new Error('Property not found');
      }
    }
    
    const item = await InvoiceItem.create({
      invoice_id: invoiceId,
      item_name: data.item_name,
      description: data.description,
      quantity: data.quantity || 1,
      unit_price: data.unit_price,
      subtotal: data.subtotal,
      project_id: data.project_id,
      property_id: data.property_id,
      display_order: data.display_order
    });
    
    return await this.getItemById(item.id);
  }
  
  async updateItem(id, data) {
    const item = await this.getItemById(id);
    
    // Verify project if being updated
    if (data.project_id && data.project_id !== item.project_id) {
      const project = await Project.findByPk(data.project_id);
      if (!project) {
        throw new Error('Project not found');
      }
    }
    
    // Verify property if being updated
    if (data.property_id && data.property_id !== item.property_id) {
      const property = await Property.findByPk(data.property_id);
      if (!property) {
        throw new Error('Property not found');
      }
    }
    
    // Recalculate subtotal if quantity or unit_price changes
    const updateData = { ...data };
    if (data.quantity || data.unit_price) {
      const quantity = data.quantity || item.quantity;
      const unitPrice = data.unit_price || item.unit_price;
      updateData.subtotal = parseFloat(unitPrice) * parseInt(quantity);
    }
    
    await item.update(updateData);
    return await this.getItemById(id);
  }
  
  async deleteItem(id) {
    const item = await this.getItemById(id);
    await item.destroy();
    return { message: 'Invoice item deleted successfully' };
  }
  
  async bulkCreateItems(invoiceId, items) {
    // Verify invoice exists
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const itemData = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Verify project if provided
      if (item.project_id) {
        const project = await Project.findByPk(item.project_id);
        if (!project) {
          throw new Error(`Project not found for item at index ${i}`);
        }
      }
      
      // Verify property if provided
      if (item.property_id) {
        const property = await Property.findByPk(item.property_id);
        if (!property) {
          throw new Error(`Property not found for item at index ${i}`);
        }
      }
      
      const quantity = item.quantity || 1;
      const unitPrice = parseFloat(item.unit_price);
      const subtotal = item.subtotal || (unitPrice * quantity);
      
      itemData.push({
        invoice_id: invoiceId,
        item_name: item.item_name,
        description: item.description,
        quantity,
        unit_price: unitPrice,
        subtotal,
        project_id: item.project_id,
        property_id: item.property_id,
        display_order: item.display_order !== undefined ? item.display_order : i
      });
    }
    
    const created = await InvoiceItem.bulkCreate(itemData);
    return created;
  }
  
  async reorderItems(invoiceId, itemIds) {
    // Verify invoice exists
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const updatePromises = itemIds.map((itemId, index) => {
      return InvoiceItem.update(
        { display_order: index },
        { where: { id: itemId, invoice_id: invoiceId } }
      );
    });
    
    await Promise.all(updatePromises);
    return await this.getItemsByInvoiceId(invoiceId);
  }
  
  async calculateItemsTotal(invoiceId) {
    const items = await this.getItemsByInvoiceId(invoiceId);
    
    const total = items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);
    
    return {
      total,
      itemCount: items.length,
      items
    };
  }
}

module.exports = new InvoiceItemService();
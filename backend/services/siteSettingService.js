// services/siteSettingService.js
const { SiteSetting, Admin } = require('../models');
const { Op } = require('sequelize');

class SiteSettingService {
  async getAllSettings(filters = {}) {
    const where = {};
    
    if (filters.setting_type) {
      where.setting_type = filters.setting_type;
    }
    
    if (filters.search) {
      where[Op.or] = [
        { setting_key: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const include = [];
    
    if (filters.includeUpdater) {
      include.push({
        model: Admin,
        as: 'updater',
        attributes: ['id', 'name', 'email']
      });
    }
    
    const settings = await SiteSetting.findAll({
      where,
      include,
      order: [['setting_key', 'ASC']]
    });
    
    return settings;
  }
  
  async getSettingById(id, includeUpdater = false) {
    const include = [];
    
    if (includeUpdater) {
      include.push({
        model: Admin,
        as: 'updater',
        attributes: ['id', 'name', 'email']
      });
    }
    
    const setting = await SiteSetting.findByPk(id, { include });
    
    if (!setting) {
      throw new Error('Site setting not found');
    }
    
    return setting;
  }
  
  async getSettingByKey(key) {
    const setting = await SiteSetting.findOne({
      where: { setting_key: key },
      include: [{
        model: Admin,
        as: 'updater',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!setting) {
      throw new Error('Site setting not found');
    }
    
    return setting;
  }
  
  async createSetting(data, adminId = null) {
    // Check if setting key already exists
    const existingSetting = await SiteSetting.findOne({
      where: { setting_key: data.setting_key }
    });
    
    if (existingSetting) {
      throw new Error('Setting key already exists');
    }
    
    const setting = await SiteSetting.create({
      setting_key: data.setting_key,
      setting_value: data.setting_value,
      setting_type: data.setting_type || 'text',
      description: data.description,
      updated_by: adminId
    });
    
    return setting;
  }
  
  async updateSetting(id, data, adminId = null) {
    const setting = await this.getSettingById(id);
    
    await setting.update({
      setting_value: data.setting_value !== undefined ? data.setting_value : setting.setting_value,
      setting_type: data.setting_type || setting.setting_type,
      description: data.description !== undefined ? data.description : setting.description,
      updated_by: adminId
    });
    
    return setting;
  }
  
  async updateSettingByKey(key, value, adminId = null) {
    const setting = await this.getSettingByKey(key);
    
    await setting.update({
      setting_value: value,
      updated_by: adminId
    });
    
    return setting;
  }
  
  async deleteSetting(id) {
    const setting = await this.getSettingById(id);
    await setting.destroy();
    return { message: 'Site setting deleted successfully' };
  }
  
  async bulkUpdateSettings(settings, adminId = null) {
    const results = [];
    
    for (const settingData of settings) {
      try {
        let setting = await SiteSetting.findOne({
          where: { setting_key: settingData.setting_key }
        });
        
        if (setting) {
          // Update existing
          await setting.update({
            setting_value: settingData.setting_value,
            updated_by: adminId
          });
        } else {
          // Create new
          setting = await SiteSetting.create({
            setting_key: settingData.setting_key,
            setting_value: settingData.setting_value,
            setting_type: settingData.setting_type || 'text',
            description: settingData.description,
            updated_by: adminId
          });
        }
        
        results.push({ key: settingData.setting_key, success: true, setting });
      } catch (error) {
        results.push({ 
          key: settingData.setting_key, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }
  
  async getSettingsAsObject() {
    const settings = await SiteSetting.findAll({
      attributes: ['setting_key', 'setting_value', 'setting_type']
    });
    
    const settingsObject = {};
    
    settings.forEach(setting => {
      let value = setting.setting_value;
      
      // Parse value based on type
      switch (setting.setting_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = null;
          }
          break;
      }
      
      settingsObject[setting.setting_key] = value;
    });
    
    return settingsObject;
  }
  
  async initializeDefaultSettings(adminId = null) {
    const defaultSettings = [
      { key: 'site_name', value: 'My Site', type: 'text', description: 'Website name' },
      { key: 'site_description', value: '', type: 'textarea', description: 'Website description' },
      { key: 'site_email', value: '', type: 'email', description: 'Contact email' },
      { key: 'site_phone', value: '', type: 'tel', description: 'Contact phone' },
      { key: 'site_address', value: '', type: 'textarea', description: 'Business address' },
      { key: 'company_name', value: '', type: 'text', description: 'Company name' },
      { key: 'bank_name', value: '', type: 'text', description: 'Bank name' },
      { key: 'bank_account_number', value: '', type: 'text', description: 'Bank account number' },
      { key: 'bank_account_name', value: '', type: 'text', description: 'Bank account holder name' },
      { key: 'invoice_prefix', value: 'INV', type: 'text', description: 'Invoice number prefix' },
      { key: 'invoice_terms', value: '', type: 'textarea', description: 'Default invoice payment terms' },
      { key: 'booking_link_expiry_days', value: '30', type: 'number', description: 'Booking link expiry in days' },
      { key: 'review_link_expiry_days', value: '90', type: 'number', description: 'Review link expiry in days' }
    ];
    
    const results = [];
    
    for (const def of defaultSettings) {
      const existing = await SiteSetting.findOne({
        where: { setting_key: def.key }
      });
      
      if (!existing) {
        const setting = await SiteSetting.create({
          setting_key: def.key,
          setting_value: def.value,
          setting_type: def.type,
          description: def.description,
          updated_by: adminId
        });
        results.push(setting);
      }
    }
    
    return results;
  }
}

module.exports = new SiteSettingService();
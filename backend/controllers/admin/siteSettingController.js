// controllers/siteSettingController.js
const siteSettingService = require('../../services/admin/siteSettingService');

class SiteSettingController {
  async getAllSettings(req, res) {
    try {
      const filters = {
        setting_type: req.query.setting_type,
        search: req.query.search,
        includeUpdater: req.query.include_updater === 'true'
      };
      
      const settings = await siteSettingService.getAllSettings(filters);
      
      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve settings',
        error: error.message
      });
    }
  }
  
  async getSettingById(req, res) {
    try {
      const { id } = req.params;
      const includeUpdater = req.query.include_updater === 'true';
      
      const setting = await siteSettingService.getSettingById(id, includeUpdater);
      
      return res.status(200).json({
        success: true,
        message: 'Setting retrieved successfully',
        data: setting
      });
    } catch (error) {
      const statusCode = error.message === 'Site setting not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getSettingByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await siteSettingService.getSettingByKey(key);
      
      return res.status(200).json({
        success: true,
        message: 'Setting retrieved successfully',
        data: setting
      });
    } catch (error) {
      const statusCode = error.message === 'Site setting not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async createSetting(req, res) {
    try {
      const adminId = req.admin?.id;
      const setting = await siteSettingService.createSetting(req.body, adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting
      });
    } catch (error) {
      const statusCode = error.message === 'Setting key already exists' ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateSetting(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      const setting = await siteSettingService.updateSetting(id, req.body, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting
      });
    } catch (error) {
      const statusCode = error.message === 'Site setting not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateSettingByKey(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const adminId = req.admin?.id;
      
      if (value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Value is required'
        });
      }
      
      const setting = await siteSettingService.updateSettingByKey(key, value, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting
      });
    } catch (error) {
      const statusCode = error.message === 'Site setting not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteSetting(req, res) {
    try {
      const { id } = req.params;
      const result = await siteSettingService.deleteSetting(id);
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Site setting not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async bulkUpdateSettings(req, res) {
    try {
      const { settings } = req.body;
      const adminId = req.admin?.id;
      
      if (!Array.isArray(settings)) {
        return res.status(400).json({
          success: false,
          message: 'Settings must be an array'
        });
      }
      
      const results = await siteSettingService.bulkUpdateSettings(settings, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: results
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error.message
      });
    }
  }
  
  async getSettingsAsObject(req, res) {
    try {
      const settings = await siteSettingService.getSettingsAsObject();
      
      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve settings',
        error: error.message
      });
    }
  }
  
  async initializeDefaultSettings(req, res) {
    try {
      const adminId = req.admin?.id;
      const settings = await siteSettingService.initializeDefaultSettings(adminId);
      
      return res.status(201).json({
        success: true,
        message: 'Default settings initialized successfully',
        data: settings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize default settings',
        error: error.message
      });
    }
  }
}

module.exports = new SiteSettingController();
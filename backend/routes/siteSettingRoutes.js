const express = require('express');
const router = express.Router();
const siteSettingController = require('../controllers/admin/siteSettingController');
const authMiddleware = require('../middleware/auth');
const {
  createSiteSettingValidation,
  updateSiteSettingValidation,
  bulkUpdateSettingsValidation,
  validate,
} = require('../validators/siteSettingValidator');

router.get('/public',        siteSettingController.getSettingsAsObject);
router.get('/',              authMiddleware, siteSettingController.getAllSettings);
router.get('/key/:key',      authMiddleware, siteSettingController.getSettingByKey);
router.get('/:id',           authMiddleware, siteSettingController.getSettingById);
router.post('/',             authMiddleware, createSiteSettingValidation, validate, siteSettingController.createSetting);
router.post('/initialize',   authMiddleware, siteSettingController.initializeDefaultSettings);
router.post('/bulk-update',  authMiddleware, bulkUpdateSettingsValidation, validate, siteSettingController.bulkUpdateSettings);
router.put('/key/:key',      authMiddleware, siteSettingController.updateSettingByKey);
router.put('/:id',           authMiddleware, updateSiteSettingValidation, validate, siteSettingController.updateSetting);
router.delete('/:id',        authMiddleware, siteSettingController.deleteSetting);

module.exports = router;
// routes/api.js (Complete with all routes + File Upload)
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const propertyCategoryController = require('../controllers/propertyCategoryController');
const projectController = require('../controllers/projectController');
const propertyController = require('../controllers/propertyController');
const propertyImageController = require('../controllers/propertyImageController');
const bookingLinkController = require('../controllers/bookingLinkController');
const bookingController = require('../controllers/bookingController');
const reviewLinkController = require('../controllers/reviewLinkController');
const reviewController = require('../controllers/reviewController');
const siteSettingController = require('../controllers/siteSettingController');
const invoiceController = require('../controllers/invoiceController');

// Import middlewares
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processImage, processMultipleImages } = require('../middleware/imageProcessor');

const { registerValidation, loginValidation, updateProfileValidation,changePasswordValidation,validate: authValidate } = require('../validators/authValidator');
const {createCategoryValidation,updateCategoryValidation,categoryIdValidation,validate: categoryValidate} = require('../validators/categoryValidator');
const {createPropertyCategoryValidation,updatePropertyCategoryValidation,propertyCategoryIdValidation,validate: propertyCategoryValidate} = require('../validators/propertyCategoryValidator');
const {createProjectValidation,updateProjectValidation,projectIdValidation,projectSlugValidation,createProjectPhotoValidation,createProjectDetailValidation,createProjectIncludeValidation,createProjectMoodValidation,validate: projectValidate} = require('../validators/projectValidator');
const {createPropertyValidation,updatePropertyValidation,propertyIdValidation,propertySlugValidation,createPropertyImageValidation,updatePropertyImageValidation,imageIdValidation,validate: propertyValidate} = require('../validators/propertyValidator');

const {
  createBookingLinkValidation,
  updateBookingLinkValidation,
  bookingLinkTokenValidation,
  createBookingValidation,
  updateBookingValidation,
  submitPaymentValidation,
  uploadPaymentProofValidation,
  bookingIdValidation,
  bookingCodeValidation,
  validate: bookingValidate
} = require('../validators/bookingValidator');

const {
  createReviewLinkValidation,
  updateReviewLinkValidation,
  reviewLinkTokenValidation,
  createReviewValidation,
  updateReviewValidation,
  submitReplyValidation,
  moderateReviewValidation,
  reviewIdValidation,
  validate: reviewValidate
} = require('../validators/reviewValidator');

const {
  createSiteSettingValidation,
  updateSiteSettingValidation,
  bulkUpdateSettingsValidation,
  createInvoiceValidation,
  updateInvoiceValidation,
  createInvoiceItemValidation,
  invoiceIdValidation,
  validate: settingInvoiceValidate
} = require('../validators/siteSettingValidator');

router.post('/auth/login', loginValidation, authValidate, authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, updateProfileValidation, authValidate, authController.updateProfile);
router.post('/auth/change-password', authMiddleware, changePasswordValidation, authValidate, authController.changePassword);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/verify', authMiddleware, authController.verifyToken);

// CATEGORY ROUTES
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryIdValidation, categoryValidate, categoryController.getCategoryById);
router.get('/categories/slug/:slug', categoryController.getCategoryBySlug);
router.post('/categories', authMiddleware, createCategoryValidation, categoryValidate, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, updateCategoryValidation, categoryValidate, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, categoryIdValidation, categoryValidate, categoryController.deleteCategory);
router.patch('/categories/:id/toggle-status', authMiddleware, categoryIdValidation, categoryValidate, categoryController.toggleCategoryStatus);

// PROPERTY CATEGORY ROUTES
router.get('/property-categories', propertyCategoryController.getAllPropertyCategories);
router.get('/property-categories/:id', propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.getPropertyCategoryById);
router.get('/property-categories/slug/:slug', propertyCategoryController.getPropertyCategoryBySlug);
router.post('/property-categories', authMiddleware, createPropertyCategoryValidation, propertyCategoryValidate, propertyCategoryController.createPropertyCategory);
router.put('/property-categories/:id', authMiddleware, updatePropertyCategoryValidation, propertyCategoryValidate, propertyCategoryController.updatePropertyCategory);
router.delete('/property-categories/:id', authMiddleware, propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.deletePropertyCategory);
router.patch('/property-categories/:id/toggle-status', authMiddleware, propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.togglePropertyCategoryStatus);

// PROJECT ROUTES
router.get('/projects', projectController.getAllProjects);
router.get('/projects/featured', projectController.getFeaturedProjects);
router.get('/projects/slug/:slug', projectSlugValidation, projectValidate, projectController.getProjectBySlug);
router.get('/projects/:id', projectIdValidation, projectValidate, projectController.getProjectById);
router.post('/projects/complete',authMiddleware,upload.projectPhoto.array('photos', 10),processMultipleImages({ width: 1920, quality: 85 }),createProjectValidation,projectValidate,projectController.createCompleteProject);
router.put('/projects/:id/complete', authMiddleware,upload.projectPhoto.array('photos', 10),processMultipleImages({ width: 1920, quality: 85 }),updateProjectValidation,projectValidate, projectController.updateCompleteProject);
router.delete('/projects/:id',authMiddleware,projectIdValidation,projectValidate,projectController.deleteProject);
router.patch('/projects/:id/toggle-publish',authMiddleware,projectIdValidation,projectValidate,projectController.togglePublishStatus);
router.patch('/projects/:id/toggle-featured',authMiddleware,projectIdValidation,projectValidate,projectController.toggleFeaturedStatus);
router.put('/projects/:id/photos/:photoId',authMiddleware,upload.projectPhoto.single('photo'),          // field 'photo', 1 fileprocessMultipleImages({ width: 1920, quality: 85 }),
projectController.updatePhoto
);

router.delete(
  '/projects/:id/photos/:photoId',
  authMiddleware,
  projectIdValidation,
  projectValidate,
  projectController.deletePhoto
);

// PROPERTY ROUTES
router.get('/properties', propertyController.getAllProperties);
router.get('/properties/available', propertyController.getAvailableProperties);
router.get('/properties/:id', propertyIdValidation, propertyValidate, propertyController.getPropertyById);
router.get('/properties/slug/:slug', propertySlugValidation, propertyValidate, propertyController.getPropertyBySlug);
router.post('/properties', authMiddleware, createPropertyValidation, propertyValidate, propertyController.createProperty);
router.put('/properties/:id', authMiddleware, updatePropertyValidation, propertyValidate, propertyController.updateProperty);
router.delete('/properties/:id', authMiddleware, propertyIdValidation, propertyValidate, propertyController.deleteProperty);
router.patch('/properties/:id/toggle-availability', authMiddleware, propertyIdValidation, propertyValidate, propertyController.toggleAvailability);
router.get('/properties/:propertyId/images', propertyImageController.getImagesByProperty);
router.get('/property-images/:id', imageIdValidation, propertyValidate, propertyImageController.getImageById);
router.post('/properties/:propertyId/images/upload',authMiddleware,upload.propertyImage.single('image'),processImage({ width: 1920, quality: 85 }),propertyImageController.uploadImage);
router.post('/properties/:propertyId/images/upload-multiple',authMiddleware,upload.propertyImage.array('images', 10),processMultipleImages({ width: 1920, quality: 85 }),propertyImageController.uploadMultipleImages);
router.post('/properties/:propertyId/images', authMiddleware, createPropertyImageValidation, propertyValidate, propertyImageController.createImage);
router.post('/properties/:propertyId/images/bulk', authMiddleware, propertyImageController.bulkCreateImages);
router.put('/property-images/:id', authMiddleware, updatePropertyImageValidation, propertyValidate, propertyImageController.updateImage);
router.delete('/property-images/:id', authMiddleware, imageIdValidation, propertyValidate, propertyImageController.deleteImage);
router.post('/properties/:propertyId/images/reorder', authMiddleware, propertyImageController.reorderImages);
router.patch('/property-images/:id/set-primary', authMiddleware, imageIdValidation, propertyValidate, propertyImageController.setPrimaryImage);

// BOOKING LINK ROUTES
router.get('/booking-links/token/:token', bookingLinkTokenValidation, bookingValidate, bookingLinkController.getBookingLinkByToken);
router.post('/booking-links/validate/:token', bookingLinkTokenValidation, bookingValidate, bookingLinkController.validateBookingLink);
router.get('/booking-links', authMiddleware, bookingLinkController.getAllBookingLinks);
router.get('/booking-links/:id', authMiddleware, bookingLinkController.getBookingLinkById);
router.post('/booking-links', authMiddleware, createBookingLinkValidation, bookingValidate, bookingLinkController.createBookingLink);
router.put('/booking-links/:id', authMiddleware, updateBookingLinkValidation, bookingValidate, bookingLinkController.updateBookingLink);
router.delete('/booking-links/:id', authMiddleware, bookingLinkController.deleteBookingLink);
router.patch('/booking-links/:id/regenerate-token', authMiddleware, bookingLinkController.regenerateToken);

// BOOKING ROUTES 
router.post('/bookings', createBookingValidation, bookingValidate, bookingController.createBooking);
router.post('/bookings/:id/payment-proof/upload',upload.paymentProof.single('payment_proof'),processImage({ width: 1920, quality: 80 }),uploadPaymentProofValidation,bookingValidate,bookingController.uploadPaymentProof);
router.post('/bookings/:id/submit-payment', bookingIdValidation, submitPaymentValidation, bookingValidate, bookingController.submitPayment);
router.post('/bookings/:id/confirm-payment', authMiddleware, bookingIdValidation, bookingValidate, bookingController.confirmPayment);
router.post('/bookings/:id/reject-payment',  authMiddleware, bookingIdValidation, bookingValidate, bookingController.rejectPayment);
router.get('/bookings', authMiddleware, bookingController.getAllBookings);
router.get('/bookings/statistics', authMiddleware, bookingController.getStatistics);
router.get('/bookings/date-range', authMiddleware, bookingController.getBookingsByDateRange);
router.get('/bookings/:id', authMiddleware, bookingIdValidation, bookingValidate, bookingController.getBookingById);
router.put('/bookings/:id', authMiddleware, updateBookingValidation, bookingValidate, bookingController.updateBooking);
router.delete('/bookings/:id', authMiddleware, bookingIdValidation, bookingValidate, bookingController.deleteBooking);

// REVIEW LINK ROUTES
router.get('/review-links/token/:token', reviewLinkTokenValidation, reviewValidate, reviewLinkController.getReviewLinkByToken);
router.post('/review-links/validate/:token', reviewLinkTokenValidation, reviewValidate, reviewLinkController.validateReviewLink);
router.get('/review-links', authMiddleware, reviewLinkController.getAllReviewLinks);
router.get('/review-links/statistics', authMiddleware, reviewLinkController.getStatistics);
router.get('/review-links/:id', authMiddleware, reviewLinkController.getReviewLinkById);
router.post('/review-links', authMiddleware, createReviewLinkValidation, reviewValidate, reviewLinkController.createReviewLink);
router.put('/review-links/:id', authMiddleware, updateReviewLinkValidation, reviewValidate, reviewLinkController.updateReviewLink);
router.delete('/review-links/:id', authMiddleware, reviewLinkController.deleteReviewLink);
router.patch('/review-links/:id/mark-sent', authMiddleware, reviewLinkController.markAsSent);
router.patch('/review-links/:id/regenerate-token', authMiddleware, reviewLinkController.regenerateToken);

// REVIEW ROUTES
router.post('/reviews', createReviewValidation, reviewValidate, reviewController.createReview);
router.get('/reviews/published', reviewController.getPublishedReviews);
router.get('/reviews/average-rating', reviewController.getAverageRating);
router.get('/reviews/rating-distribution', reviewController.getRatingDistribution);
router.get('/reviews', authMiddleware, reviewController.getAllReviews);
router.get('/reviews/statistics', authMiddleware, reviewController.getStatistics);
router.get('/reviews/:id', authMiddleware, reviewIdValidation, reviewValidate, reviewController.getReviewById);
router.put('/reviews/:id', authMiddleware, updateReviewValidation, reviewValidate, reviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, reviewIdValidation, reviewValidate, reviewController.deleteReview);
router.post('/reviews/:id/reply', authMiddleware, submitReplyValidation, reviewValidate, reviewController.submitReply);
router.post('/reviews/:id/moderate', authMiddleware, moderateReviewValidation, reviewValidate, reviewController.moderateReview);
router.patch('/reviews/:id/toggle-publish', authMiddleware, reviewIdValidation, reviewValidate, reviewController.togglePublishStatus);
router.patch('/reviews/:id/toggle-featured', authMiddleware, reviewIdValidation, reviewValidate, reviewController.toggleFeaturedStatus);
// SITE SETTING ROUTES
router.get('/site-settings/public', siteSettingController.getSettingsAsObject);

router.get('/site-settings', authMiddleware, siteSettingController.getAllSettings);
router.get('/site-settings/key/:key', authMiddleware, siteSettingController.getSettingByKey);
router.get('/site-settings/:id', authMiddleware, siteSettingController.getSettingById);
router.post('/site-settings', authMiddleware, createSiteSettingValidation, settingInvoiceValidate, siteSettingController.createSetting);
router.post('/site-settings/initialize', authMiddleware, siteSettingController.initializeDefaultSettings);
router.post('/site-settings/bulk-update', authMiddleware, bulkUpdateSettingsValidation, settingInvoiceValidate, siteSettingController.bulkUpdateSettings);
router.put('/site-settings/:id', authMiddleware, updateSiteSettingValidation, settingInvoiceValidate, siteSettingController.updateSetting);
router.put('/site-settings/key/:key', authMiddleware, siteSettingController.updateSettingByKey);
router.delete('/site-settings/:id', authMiddleware, siteSettingController.deleteSetting);

// ── INVOICE ROUTES ────────────────────────────────────────────────────────
router.get('/invoices',                    authMiddleware, invoiceController.getAllInvoices);
router.get('/invoices/statistics',         authMiddleware, invoiceController.getStatistics);
router.get('/invoices/date-range',         authMiddleware, invoiceController.getInvoicesByDateRange);
router.get('/invoices/:id',                authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.getInvoiceById);
router.post('/invoices',                   authMiddleware, createInvoiceValidation, settingInvoiceValidate, invoiceController.createInvoice);
router.post('/invoices/from-booking/:bookingId', authMiddleware, invoiceController.createInvoiceFromBooking);
router.put('/invoices/:id',                authMiddleware, updateInvoiceValidation, settingInvoiceValidate, invoiceController.updateInvoice);
router.delete('/invoices/:id',             authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.deleteInvoice);
router.patch('/invoices/:id/update-pdf',   authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.updatePdfUrl);
router.patch('/invoices/:id/recalculate',  authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.recalculateTotal);
router.patch('/invoices/:id/mark-sent',    authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.markAsSent);
router.patch('/invoices/:id/mark-paid',    authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.markAsPaid);
router.patch('/invoices/:id/mark-overdue', authMiddleware, invoiceIdValidation, settingInvoiceValidate, invoiceController.markAsOverdue);
router.get('/invoices/:invoiceId/items',                  authMiddleware, invoiceController.getItemsByInvoice);
router.get('/invoices/:invoiceId/items/calculate-total',  authMiddleware, invoiceController.calculateItemsTotal);
router.get('/invoice-items/:id',                          authMiddleware, invoiceController.getItemById);
router.post('/invoices/:invoiceId/items',                 authMiddleware, createInvoiceItemValidation, settingInvoiceValidate, invoiceController.createItem);
router.post('/invoices/:invoiceId/items/bulk',            authMiddleware, invoiceController.bulkCreateItems);
router.post('/invoices/:invoiceId/items/reorder',         authMiddleware, invoiceController.reorderItems);
router.put('/invoice-items/:id',                          authMiddleware, invoiceController.updateItem);
router.delete('/invoice-items/:id',                       authMiddleware, invoiceController.deleteItem);

module.exports = router;
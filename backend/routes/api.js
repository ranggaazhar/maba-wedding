// routes/api.js (Complete with all routes)
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const propertyCategoryController = require('../controllers/propertyCategoryController');
const projectController = require('../controllers/projectController');
const projectPhotoController = require('../controllers/projectPhotoController');
const projectDetailController = require('../controllers/projectDetailController');
const projectIncludeController = require('../controllers/projectIncludeController');
const projectMoodController = require('../controllers/projectMoodController');
const propertyController = require('../controllers/propertyController');
const propertyImageController = require('../controllers/propertyImageController');
const bookingLinkController = require('../controllers/bookingLinkController');
const bookingController = require('../controllers/bookingController');
const bookingModelController = require('../controllers/bookingModelController');
const bookingPropertyController = require('../controllers/bookingPropertyController');
const reviewLinkController = require('../controllers/reviewLinkController');
const reviewController = require('../controllers/reviewController');

// Import middlewares
const authMiddleware = require('../middleware/auth');

// Import validators
const { 
  registerValidation, 
  loginValidation, 
  updateProfileValidation,
  changePasswordValidation,
  validate: authValidate 
} = require('../validators/authValidator');

const {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
  validate: categoryValidate
} = require('../validators/categoryValidator');

const {
  createPropertyCategoryValidation,
  updatePropertyCategoryValidation,
  propertyCategoryIdValidation,
  validate: propertyCategoryValidate
} = require('../validators/propertyCategoryValidator');

const {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  projectSlugValidation,
  createProjectPhotoValidation,
  createProjectDetailValidation,
  createProjectIncludeValidation,
  createProjectMoodValidation,
  validate: projectValidate
} = require('../validators/projectValidator');

const {
  createPropertyValidation,
  updatePropertyValidation,
  propertyIdValidation,
  propertySlugValidation,
  createPropertyImageValidation,
  updatePropertyImageValidation,
  imageIdValidation,
  validate: propertyValidate
} = require('../validators/propertyValidator');

const {
  createBookingLinkValidation,
  updateBookingLinkValidation,
  bookingLinkTokenValidation,
  createBookingValidation,
  updateBookingValidation,
  submitPaymentValidation,
  createBookingModelValidation,
  createBookingPropertyValidation,
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

// ======================
// AUTH ROUTES
// ======================
router.post('/auth/register', registerValidation, authValidate, authController.register);
router.post('/auth/login', loginValidation, authValidate, authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, updateProfileValidation, authValidate, authController.updateProfile);
router.post('/auth/change-password', authMiddleware, changePasswordValidation, authValidate, authController.changePassword);
router.post('/auth/logout', authMiddleware, authController.logout);
router.get('/auth/verify', authMiddleware, authController.verifyToken);

// ======================
// CATEGORY ROUTES
// ======================
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryIdValidation, categoryValidate, categoryController.getCategoryById);
router.get('/categories/slug/:slug', categoryController.getCategoryBySlug);
router.post('/categories', authMiddleware, createCategoryValidation, categoryValidate, categoryController.createCategory);
router.put('/categories/:id', authMiddleware, updateCategoryValidation, categoryValidate, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, categoryIdValidation, categoryValidate, categoryController.deleteCategory);
router.patch('/categories/:id/toggle-status', authMiddleware, categoryIdValidation, categoryValidate, categoryController.toggleCategoryStatus);

// ======================
// PROPERTY CATEGORY ROUTES
// ======================
router.get('/property-categories', propertyCategoryController.getAllPropertyCategories);
router.get('/property-categories/:id', propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.getPropertyCategoryById);
router.get('/property-categories/slug/:slug', propertyCategoryController.getPropertyCategoryBySlug);
router.post('/property-categories', authMiddleware, createPropertyCategoryValidation, propertyCategoryValidate, propertyCategoryController.createPropertyCategory);
router.put('/property-categories/:id', authMiddleware, updatePropertyCategoryValidation, propertyCategoryValidate, propertyCategoryController.updatePropertyCategory);
router.delete('/property-categories/:id', authMiddleware, propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.deletePropertyCategory);
router.patch('/property-categories/:id/toggle-status', authMiddleware, propertyCategoryIdValidation, propertyCategoryValidate, propertyCategoryController.togglePropertyCategoryStatus);

// ======================
// PROJECT ROUTES
// ======================
router.get('/projects', projectController.getAllProjects);
router.get('/projects/featured', projectController.getFeaturedProjects);
router.get('/projects/:id', projectIdValidation, projectValidate, projectController.getProjectById);
router.get('/projects/slug/:slug', projectSlugValidation, projectValidate, projectController.getProjectBySlug);
router.post('/projects', authMiddleware, createProjectValidation, projectValidate, projectController.createProject);
router.put('/projects/:id', authMiddleware, updateProjectValidation, projectValidate, projectController.updateProject);
router.delete('/projects/:id', authMiddleware, projectIdValidation, projectValidate, projectController.deleteProject);
router.patch('/projects/:id/toggle-publish', authMiddleware, projectIdValidation, projectValidate, projectController.togglePublishStatus);
router.patch('/projects/:id/toggle-featured', authMiddleware, projectIdValidation, projectValidate, projectController.toggleFeaturedStatus);

// ======================
// PROJECT PHOTO ROUTES
// ======================
router.get('/projects/:projectId/photos', projectPhotoController.getPhotosByProject);
router.get('/project-photos/:id', projectPhotoController.getPhotoById);
router.post('/projects/:projectId/photos', authMiddleware, createProjectPhotoValidation, projectValidate, projectPhotoController.createPhoto);
router.put('/project-photos/:id', authMiddleware, projectPhotoController.updatePhoto);
router.delete('/project-photos/:id', authMiddleware, projectPhotoController.deletePhoto);
router.post('/projects/:projectId/photos/reorder', authMiddleware, projectPhotoController.reorderPhotos);

// ======================
// PROJECT DETAIL ROUTES
// ======================
router.get('/projects/:projectId/details', projectDetailController.getDetailsByProject);
router.get('/project-details/:id', projectDetailController.getDetailById);
router.post('/projects/:projectId/details', authMiddleware, createProjectDetailValidation, projectValidate, projectDetailController.createDetail);
router.put('/project-details/:id', authMiddleware, projectDetailController.updateDetail);
router.delete('/project-details/:id', authMiddleware, projectDetailController.deleteDetail);

// ======================
// PROJECT INCLUDE ROUTES
// ======================
router.get('/projects/:projectId/includes', projectIncludeController.getIncludesByProject);
router.get('/project-includes/:id', projectIncludeController.getIncludeById);
router.post('/projects/:projectId/includes', authMiddleware, createProjectIncludeValidation, projectValidate, projectIncludeController.createInclude);
router.post('/projects/:projectId/includes/bulk', authMiddleware, projectIncludeController.bulkCreateIncludes);
router.put('/project-includes/:id', authMiddleware, projectIncludeController.updateInclude);
router.delete('/project-includes/:id', authMiddleware, projectIncludeController.deleteInclude);

// ======================
// PROJECT MOOD ROUTES
// ======================
router.get('/projects/:projectId/moods', projectMoodController.getMoodsByProject);
router.get('/project-moods/:id', projectMoodController.getMoodById);
router.post('/projects/:projectId/moods', authMiddleware, createProjectMoodValidation, projectValidate, projectMoodController.createMood);
router.post('/projects/:projectId/moods/bulk', authMiddleware, projectMoodController.bulkCreateMoods);
router.put('/project-moods/:id', authMiddleware, projectMoodController.updateMood);
router.delete('/project-moods/:id', authMiddleware, projectMoodController.deleteMood);

// ======================
// PROPERTY ROUTES
// ======================

// Public routes
router.get('/properties', propertyController.getAllProperties);
router.get('/properties/available', propertyController.getAvailableProperties);
router.get('/properties/:id', propertyIdValidation, propertyValidate, propertyController.getPropertyById);
router.get('/properties/slug/:slug', propertySlugValidation, propertyValidate, propertyController.getPropertyBySlug);

// Protected routes (require authentication)
router.post('/properties', authMiddleware, createPropertyValidation, propertyValidate, propertyController.createProperty);
router.put('/properties/:id', authMiddleware, updatePropertyValidation, propertyValidate, propertyController.updateProperty);
router.delete('/properties/:id', authMiddleware, propertyIdValidation, propertyValidate, propertyController.deleteProperty);
router.patch('/properties/:id/toggle-availability', authMiddleware, propertyIdValidation, propertyValidate, propertyController.toggleAvailability);
router.patch('/properties/:id/update-stock', authMiddleware, propertyIdValidation, propertyValidate, propertyController.updateStock);

// ======================
// PROPERTY IMAGE ROUTES
// ======================

// Public routes
router.get('/properties/:propertyId/images', propertyImageController.getImagesByProperty);
router.get('/property-images/:id', imageIdValidation, propertyValidate, propertyImageController.getImageById);

// Protected routes
router.post('/properties/:propertyId/images', authMiddleware, createPropertyImageValidation, propertyValidate, propertyImageController.createImage);
router.post('/properties/:propertyId/images/bulk', authMiddleware, propertyImageController.bulkCreateImages);
router.put('/property-images/:id', authMiddleware, updatePropertyImageValidation, propertyValidate, propertyImageController.updateImage);
router.delete('/property-images/:id', authMiddleware, imageIdValidation, propertyValidate, propertyImageController.deleteImage);
router.post('/properties/:propertyId/images/reorder', authMiddleware, propertyImageController.reorderImages);
router.patch('/property-images/:id/set-primary', authMiddleware, imageIdValidation, propertyValidate, propertyImageController.setPrimaryImage);

// Public routes
router.get('/booking-links/token/:token', bookingLinkTokenValidation, bookingValidate, bookingLinkController.getBookingLinkByToken);
router.post('/booking-links/validate/:token', bookingLinkTokenValidation, bookingValidate, bookingLinkController.validateBookingLink);

// Protected routes (require authentication)
router.get('/booking-links', authMiddleware, bookingLinkController.getAllBookingLinks);
router.get('/booking-links/statistics', authMiddleware, bookingLinkController.getStatistics);
router.get('/booking-links/:id', authMiddleware, bookingLinkController.getBookingLinkById);
router.post('/booking-links', authMiddleware, createBookingLinkValidation, bookingValidate, bookingLinkController.createBookingLink);
router.put('/booking-links/:id', authMiddleware, updateBookingLinkValidation, bookingValidate, bookingLinkController.updateBookingLink);
router.delete('/booking-links/:id', authMiddleware, bookingLinkController.deleteBookingLink);
router.patch('/booking-links/:id/mark-sent', authMiddleware, bookingLinkController.markAsSent);
router.patch('/booking-links/:id/regenerate-token', authMiddleware, bookingLinkController.regenerateToken);

// ======================
// BOOKING ROUTES
// ======================

// Public routes
router.post('/bookings', createBookingValidation, bookingValidate, bookingController.createBooking);
router.get('/bookings/code/:code', bookingCodeValidation, bookingValidate, bookingController.getBookingByCode);
router.post('/bookings/:id/submit-payment', bookingIdValidation, submitPaymentValidation, bookingValidate, bookingController.submitPayment);

// Protected routes (require authentication)
router.get('/bookings', authMiddleware, bookingController.getAllBookings);
router.get('/bookings/statistics', authMiddleware, bookingController.getStatistics);
router.get('/bookings/date-range', authMiddleware, bookingController.getBookingsByDateRange);
router.get('/bookings/:id', authMiddleware, bookingIdValidation, bookingValidate, bookingController.getBookingById);
router.put('/bookings/:id', authMiddleware, updateBookingValidation, bookingValidate, bookingController.updateBooking);
router.delete('/bookings/:id', authMiddleware, bookingIdValidation, bookingValidate, bookingController.deleteBooking);

// ======================
// BOOKING MODEL ROUTES
// ======================

// Public routes (read only)
router.get('/bookings/:bookingId/models', bookingModelController.getModelsByBooking);
router.get('/booking-models/:id', bookingModelController.getModelById);

// Protected routes
router.post('/bookings/:bookingId/models', authMiddleware, createBookingModelValidation, bookingValidate, bookingModelController.createModel);
router.post('/bookings/:bookingId/models/bulk', authMiddleware, bookingModelController.bulkCreateModels);
router.post('/bookings/:bookingId/models/reorder', authMiddleware, bookingModelController.reorderModels);
router.put('/booking-models/:id', authMiddleware, bookingModelController.updateModel);
router.delete('/booking-models/:id', authMiddleware, bookingModelController.deleteModel);

// ======================
// BOOKING PROPERTY ROUTES
// ======================

// Public routes (read only)
router.get('/bookings/:bookingId/properties', bookingPropertyController.getPropertiesByBooking);
router.get('/bookings/:bookingId/properties/calculate-total', bookingPropertyController.calculateTotal);
router.get('/booking-properties/:id', bookingPropertyController.getPropertyById);

// Protected routes
router.post('/bookings/:bookingId/properties', authMiddleware, createBookingPropertyValidation, bookingValidate, bookingPropertyController.createProperty);
router.post('/bookings/:bookingId/properties/bulk', authMiddleware, bookingPropertyController.bulkCreateProperties);
router.put('/booking-properties/:id', authMiddleware, bookingPropertyController.updateProperty);
router.delete('/booking-properties/:id', authMiddleware, bookingPropertyController.deleteProperty);

// Public routes
router.get('/review-links/token/:token', reviewLinkTokenValidation, reviewValidate, reviewLinkController.getReviewLinkByToken);
router.post('/review-links/validate/:token', reviewLinkTokenValidation, reviewValidate, reviewLinkController.validateReviewLink);

// Protected routes (require authentication)
router.get('/review-links', authMiddleware, reviewLinkController.getAllReviewLinks);
router.get('/review-links/statistics', authMiddleware, reviewLinkController.getStatistics);
router.get('/review-links/:id', authMiddleware, reviewLinkController.getReviewLinkById);
router.post('/review-links', authMiddleware, createReviewLinkValidation, reviewValidate, reviewLinkController.createReviewLink);
router.put('/review-links/:id', authMiddleware, updateReviewLinkValidation, reviewValidate, reviewLinkController.updateReviewLink);
router.delete('/review-links/:id', authMiddleware, reviewLinkController.deleteReviewLink);
router.patch('/review-links/:id/mark-sent', authMiddleware, reviewLinkController.markAsSent);
router.patch('/review-links/:id/regenerate-token', authMiddleware, reviewLinkController.regenerateToken);

// ======================
// REVIEW ROUTES
// ======================

// Public routes
router.post('/reviews', createReviewValidation, reviewValidate, reviewController.createReview);
router.get('/reviews/published', reviewController.getPublishedReviews);
router.get('/reviews/average-rating', reviewController.getAverageRating);
router.get('/reviews/rating-distribution', reviewController.getRatingDistribution);

// Protected routes (require authentication)
router.get('/reviews', authMiddleware, reviewController.getAllReviews);
router.get('/reviews/statistics', authMiddleware, reviewController.getStatistics);
router.get('/reviews/:id', authMiddleware, reviewIdValidation, reviewValidate, reviewController.getReviewById);
router.put('/reviews/:id', authMiddleware, updateReviewValidation, reviewValidate, reviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, reviewIdValidation, reviewValidate, reviewController.deleteReview);
router.post('/reviews/:id/reply', authMiddleware, submitReplyValidation, reviewValidate, reviewController.submitReply);
router.post('/reviews/:id/moderate', authMiddleware, moderateReviewValidation, reviewValidate, reviewController.moderateReview);
router.patch('/reviews/:id/toggle-publish', authMiddleware, reviewIdValidation, reviewValidate, reviewController.togglePublishStatus);
router.patch('/reviews/:id/toggle-featured', authMiddleware, reviewIdValidation, reviewValidate, reviewController.toggleFeaturedStatus);


module.exports = router;
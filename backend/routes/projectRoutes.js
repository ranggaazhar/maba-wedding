const express = require('express');
const router = express.Router();
const projectController = require('../controllers/admin/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const { processMultipleImages } = require('../middleware/imageProcessor');
const {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
  projectSlugValidation,
  validate,
} = require('../validators/projectValidator');

router.get('/', projectController.getAllProjects);
router.get('/featured',projectController.getFeaturedProjects);
router.get('/slug/:slug',projectSlugValidation, validate, projectController.getProjectBySlug);
router.get('/:id',projectIdValidation, validate, projectController.getProjectById);

router.post('/complete',
  authMiddleware,
  upload.projectPhoto.array('photos', 10),
  processMultipleImages({ width: 1920, quality: 85 }),
  createProjectValidation, validate,
  projectController.createCompleteProject
);
router.put('/:id/complete',
  authMiddleware,
  upload.projectPhoto.array('photos', 10),
  processMultipleImages({ width: 1920, quality: 85 }),
  updateProjectValidation, validate,
  projectController.updateCompleteProject
);

router.delete('/:id',               authMiddleware, projectIdValidation, validate, projectController.deleteProject);
router.patch('/:id/toggle-publish', authMiddleware, projectIdValidation, validate, projectController.togglePublishStatus);
router.patch('/:id/toggle-featured',authMiddleware, projectIdValidation, validate, projectController.toggleFeaturedStatus);

router.put('/:id/photos/:photoId',
  authMiddleware,
  upload.projectPhoto.single('photo'),
  processMultipleImages({ width: 1920, quality: 85 }),
  projectController.updatePhoto
);
router.delete('/:id/photos/:photoId',
  authMiddleware,
  projectIdValidation, validate,
  projectController.deletePhoto
);

module.exports = router;
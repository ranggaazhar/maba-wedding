const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories
const createUploadDirs = () => {
  const dirs = [
    'uploads/projects',
    'uploads/properties',
    'uploads/payment-proofs',
    'uploads/temp'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

const createStorage = (destination) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
  });
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const uploadConfigs = {
  projectPhoto: multer({
    storage: createStorage('uploads/projects'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }),
  
  propertyImage: multer({
    storage: createStorage('uploads/properties'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }),
  
  paymentProof: multer({
    storage: createStorage('uploads/payment-proofs'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB for payment proofs
    }
  })
};

module.exports = uploadConfigs;
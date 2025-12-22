const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Process and optimize single uploaded image
 */
const processImage = (options = {}) => {
  const {
    width = 1920,
    height = null,
    quality = 80,
    format = 'jpeg'
  } = options;

  return async (req, res, next) => {
    if (!req.file) return next();

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(
      path.extname(inputPath),
      `-optimized.${format}`
    );

    try {
      let sharpInstance = sharp(inputPath);

      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      await sharpInstance
        .toFormat(format, { quality })
        .toFile(outputPath);

      // Cek apakah file asli masih ada sebelum dihapus
      try {
        await fs.access(inputPath);
        await fs.unlink(inputPath);
      } catch (err) {
        console.warn(`Original file ${inputPath} not found for deletion, skipping...`);
      }

      // Update metadata file di request
      req.file.path = outputPath.replace(/\\/g, '/'); // Normalisasi path untuk DB
      req.file.filename = path.basename(outputPath);
      req.file.optimized = true;

      next();
    } catch (error) {
      console.error('Image optimization error:', error);
      // Jika gagal, tetap lanjut menggunakan file original agar user tidak error
      next();
    }
  };
};

/**
 * Process multiple images
 */
const processMultipleImages = (options = {}) => {
  return async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
      const processPromises = req.files.map(async (file) => {
        const inputPath = file.path;
        const targetFormat = options.format || 'jpeg';
        const outputPath = inputPath.replace(
          path.extname(inputPath),
          `-optimized.${targetFormat}`
        );

        try {
          let sharpInstance = sharp(inputPath);

          if (options.width || options.height) {
            sharpInstance = sharpInstance.resize(options.width, options.height, {
              fit: 'inside',
              withoutEnlargement: true
            });
          }

          await sharpInstance
            .toFormat(targetFormat, { quality: options.quality || 80 })
            .toFile(outputPath);

          // Hapus file asli
          try {
            await fs.access(inputPath);
            await fs.unlink(inputPath);
          } catch (e) { /* ignore deletion error */ }

          // Update data file
          file.path = outputPath.replace(/\\/g, '/'); // Penting untuk konsistensi database
          file.filename = path.basename(outputPath);
          file.optimized = true;
          
        } catch (fileError) {
          console.error(`Failed to process file ${file.filename}:`, fileError);
          // Biarkan file original tetap ada jika optimasi gagal
          file.path = file.path.replace(/\\/g, '/');
        }
      });

      await Promise.all(processPromises);
      next();
    } catch (error) {
      console.error('Multiple images optimization error:', error);
      next();
    }
  };
};

module.exports = {
  processImage,
  processMultipleImages
};
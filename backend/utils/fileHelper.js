const fs = require('fs').promises;
const path = require('path');

class FileHelper {
  /**
   * Delete file if exists
   */
  static async deleteFile(filePath) {
    try {
      if (filePath && filePath.startsWith('uploads/')) {
        const fullPath = path.join(process.cwd(), filePath);
        await fs.unlink(fullPath);
        console.log(`✅ Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error deleting file:', error);
      }
      return false;
    }
  }

  /**
   * Get file URL for response
   */
  static getFileUrl(filePath, req) {
    if (!filePath) return null;
    
    // If already full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // Build URL from request
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/${filePath}`;
  }

  /**
   * Validate file size
   */
  static validateFileSize(file, maxSize = 5 * 1024 * 1024) {
    return file.size <= maxSize;
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }
}

module.exports = FileHelper;
// services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

class AuthService {
  /**
   * Register new admin
   * @param {Object} data - Registration data
   * @returns {Object} Admin data and token
   */
  async register(data) {
    const { name, email, password, phone } = data;

    try {
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ 
        where: { email: email.toLowerCase() } // Case-insensitive email
      });
      
      if (existingAdmin) {
        throw new Error('Email already registered');
      }

      // Hash password with salt rounds
      const hashedPassword = await bcrypt.hash(password, 12); // Increased to 12 for better security

      // Create admin
      const admin = await Admin.create({
        name: name.trim(),
        email: email.toLowerCase().trim(), // Normalize email
        password: hashedPassword,
        phone: phone?.trim() || null,
        is_active: true
      });

      // Generate token
      const token = this.generateToken(admin.id);

      return {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          is_active: admin.is_active,
          created_at: admin.created_at
        },
        token
      };
    } catch (error) {
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already registered');
      }
      throw error;
    }
  }

  /**
   * Login admin
   * @param {String} email - Admin email
   * @param {String} password - Admin password
   * @returns {Object} Admin data and token
   */
  async login(email, password) {
    try {
      // Find admin by email (case-insensitive)
      const admin = await Admin.findOne({ 
        where: { email: email.toLowerCase().trim() } 
      });
      
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Check if admin is active
      if (!admin.is_active) {
        throw new Error('Account is not active. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(admin.id);

      return {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          is_active: admin.is_active,
          created_at: admin.created_at
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get admin profile
   * @param {Number} adminId - Admin ID
   * @returns {Object} Admin data
   */
  async getProfile(adminId) {
    try {
      const admin = await Admin.findOne({
        where: { id: adminId },
        attributes: { exclude: ['password'] }
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        is_active: admin.is_active,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update admin profile
   * @param {Number} adminId - Admin ID
   * @param {Object} data - Update data
   * @returns {Object} Updated admin data
   */
  async updateProfile(adminId, data) {
    try {
      const admin = await Admin.findByPk(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Check if email is being changed and already exists
      if (data.email && data.email.toLowerCase() !== admin.email.toLowerCase()) {
        const existingAdmin = await Admin.findOne({ 
          where: { email: data.email.toLowerCase().trim() } 
        });
        
        if (existingAdmin) {
          throw new Error('Email already in use');
        }
      }

      // Update allowed fields
      const allowedFields = ['name', 'email', 'phone'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          if (field === 'email') {
            updateData[field] = data[field].toLowerCase().trim();
          } else if (field === 'name' || field === 'phone') {
            updateData[field] = data[field].trim();
          } else {
            updateData[field] = data[field];
          }
        }
      });

      // Only update if there's data to update
      if (Object.keys(updateData).length > 0) {
        await admin.update(updateData);
      }

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        is_active: admin.is_active,
        updated_at: admin.updated_at
      };
    } catch (error) {
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already in use');
      }
      throw error;
    }
  }

  /**
   * Change password
   * @param {Number} adminId - Admin ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(adminId, currentPassword, newPassword) {
    try {
      const admin = await Admin.findByPk(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, admin.password);
      if (isSamePassword) {
        throw new Error('New password must be different from current password');
      }

      // Hash new password with increased salt rounds
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await admin.update({ password: hashedPassword });

      return { 
        message: 'Password changed successfully',
        updated_at: admin.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate admin account
   * @param {Number} adminId - Admin ID to deactivate
   * @param {Number} currentAdminId - ID of admin performing the action
   * @returns {Object} Success message
   */
  async deactivateAdmin(adminId, currentAdminId) {
    try {
      // Prevent self-deactivation
      if (adminId === currentAdminId) {
        throw new Error('Cannot deactivate your own account');
      }

      const admin = await Admin.findByPk(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      await admin.update({ is_active: false });

      return { 
        message: 'Admin account deactivated successfully',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          is_active: admin.is_active
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activate admin account
   * @param {Number} adminId - Admin ID to activate
   * @returns {Object} Success message
   */
  async activateAdmin(adminId) {
    try {
      const admin = await Admin.findByPk(adminId);
      
      if (!admin) {
        throw new Error('Admin not found');
      }

      await admin.update({ is_active: true });

      return { 
        message: 'Admin account activated successfully',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          is_active: admin.is_active
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all admins (for super admin)
   * @param {Object} options - Query options
   * @returns {Object} List of admins
   */
  async getAllAdmins(options = {}) {
    try {
      const { page = 1, limit = 10, is_active } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (is_active !== undefined) {
        where.is_active = is_active;
      }

      const { count, rows } = await Admin.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return {
        admins: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Number} adminId - Admin ID
   * @returns {String} JWT token
   */
  generateToken(adminId) {
    try {
      return jwt.sign(
        { 
          id: adminId,
          type: 'admin', // Token type
          iat: Math.floor(Date.now() / 1000) // Issued at
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
          issuer: 'wedding-decoration-api', // Token issuer
          audience: 'wedding-decoration-admin' // Token audience
        }
      );
    } catch (error) {
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} Decoded token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'wedding-decoration-api',
        audience: 'wedding-decoration-admin'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Refresh token (generate new token for existing valid token)
   * @param {String} oldToken - Current valid token
   * @returns {Object} New token
   */
  async refreshToken(oldToken) {
    try {
      const decoded = this.verifyToken(oldToken);
      
      // Check if admin still exists and is active
      const admin = await Admin.findOne({
        where: { 
          id: decoded.id,
          is_active: true 
        }
      });

      if (!admin) {
        throw new Error('Admin not found or inactive');
      }

      // Generate new token
      const newToken = this.generateToken(admin.id);

      return {
        token: newToken,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
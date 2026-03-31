const authService = require('../services/admin/authService');

class AuthController {

  // Login admin
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get admin profile
  async getProfile(req, res) {
    try {
      const admin = await authService.getProfile(req.admin.id);
      
      return res.status(200).json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update admin profile
  async updateProfile(req, res) {
    try {
      const admin = await authService.updateProfile(req.admin.id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: admin
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.admin.id,
        currentPassword,
        newPassword
      );
      
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify token (useful for frontend)
  async verifyToken(req, res) {
    try {
      // If middleware passed, token is valid
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          admin: req.admin
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();

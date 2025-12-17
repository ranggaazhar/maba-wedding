const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin
    const admin = await Admin.findOne({
      where: { 
        id: decoded.id,
        is_active: true 
      },
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin not found'
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;

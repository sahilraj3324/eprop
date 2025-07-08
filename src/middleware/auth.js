const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

// Middleware to authenticate user from cookie
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // Optionally verify user still exists in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    req.user = decoded; // Add user info to request object
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed.',
    });
  }
};

// Middleware to authenticate admin from adminToken cookie
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token.',
      });
    }

    // Verify admin still exists in database
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive.',
      });
    }

    req.user = decoded; // Add admin info to request object (using same property name for consistency)
    req.admin = admin; // Also add full admin object for additional context
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin token verification failed.',
    });
  }
};

module.exports = { authenticate, authenticateAdmin }; 
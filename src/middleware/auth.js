const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

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
    res.status(500).json({
      success: false,
      message: 'Token verification failed.',
    });
  }
};

module.exports = { authenticate }; 
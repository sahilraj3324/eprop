const jwt = require('jsonwebtoken');

// Generate JWT token with user data
const generateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    address: user.address,
    status: user.status,
    profilePic: user.profilePic,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
}; 
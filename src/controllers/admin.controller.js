const Admin = require('../models/admin.model');
const { generateToken } = require('../utils/jwt');

// Admin signup
exports.signupAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if admin already exists with this email
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already exists with this email address' 
      });
    }

    // Create new admin
    const admin = await Admin.create({ 
      name, 
      email, 
      phoneNumber, 
      password 
    });

    // Generate JWT token
    const token = generateToken(admin);

    // Set token in HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token: token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin login by email and password
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      // Check if admin is active
      if (admin.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Admin account is inactive'
        });
      }

      // Generate JWT token
      const token = generateToken(admin);

      // Set token in HTTP-only cookie
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          role: admin.role,
          status: admin.status,
        },
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      count: admins.length,
      admins: admins
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }
    res.json({
      success: true,
      admin: admin
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update all fields of admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, status } = req.body;

    // Check if email is being updated and if it's already taken by another admin
    if (email) {
      const existingAdmin = await Admin.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another admin'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (password) updateData.password = password;
    if (status) updateData.status = status;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }
    res.json({ 
      success: true,
      message: 'Admin removed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete all admins
exports.deleteAllAdmins = async (req, res) => {
  try {
    const result = await Admin.deleteMany();
    res.json({ 
      success: true,
      message: `All ${result.deletedCount} admins deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin logout
exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      success: true,
      message: 'Admin logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current admin profile (from token)
exports.getCurrentAdmin = async (req, res) => {
  try {
    // req.user is set by authentication middleware
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      admin: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 
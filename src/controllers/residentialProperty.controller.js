const ResidentialProperty = require('../models/residentialProperty.model');

// Create residential property
exports.createResidentialProperty = async (req, res) => {
  try {
    const residentialProperty = new ResidentialProperty(req.body);
    const savedProperty = await residentialProperty.save();
    const populatedProperty = await ResidentialProperty.findById(savedProperty._id)
      .populate('user', 'name phoneNumber')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Residential property created successfully',
      data: populatedProperty
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating residential property',
      error: error.message
    });
  }
};

// Get all residential properties
exports.getAllResidentialProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      property_type,
      bhk_rk,
      looking_for,
      min_cost,
      max_cost,
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (city) filter.city = new RegExp(city, 'i');
    if (property_type) filter.property_type = property_type;
    if (bhk_rk) filter.bhk_rk = bhk_rk;
    if (looking_for) filter.looking_for = looking_for;
    if (min_cost || max_cost) {
      filter.cost = {};
      if (min_cost) filter.cost.$gte = parseFloat(min_cost);
      if (max_cost) filter.cost.$lte = parseFloat(max_cost);
    }

    const skip = (page - 1) * limit;
    
    const properties = await ResidentialProperty.find(filter)
      .populate('user', 'name phoneNumber')
      .sort({ put_on_top: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ResidentialProperty.countDocuments(filter);
    
    res.json({
      success: true,
      data: properties,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching residential properties',
      error: error.message
    });
  }
};

// Get residential property by ID
exports.getResidentialPropertyById = async (req, res) => {
  try {
    const property = await ResidentialProperty.findById(req.params.id)
      .populate('user', 'name phoneNumber address profilePic')
      .lean();
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Residential property not found'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching residential property',
      error: error.message
    });
  }
};

// Get all residential properties by user ID
exports.getResidentialPropertiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: userId };
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    
    const properties = await ResidentialProperty.find(filter)
      .populate('user', 'name phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ResidentialProperty.countDocuments(filter);
    
    res.json({
      success: true,
      data: properties,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user residential properties',
      error: error.message
    });
  }
};

// Update residential property by ID and user ID
exports.updateResidentialPropertyByUserAndId = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const updatedProperty = await ResidentialProperty.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'name phoneNumber');

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Residential property not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Residential property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating residential property',
      error: error.message
    });
  }
};

// Delete residential property by ID
exports.deleteResidentialPropertyById = async (req, res) => {
  try {
    const property = await ResidentialProperty.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Residential property not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Residential property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting residential property',
      error: error.message
    });
  }
};

// Delete residential property by ID and user ID
exports.deleteResidentialPropertyByUserAndId = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const property = await ResidentialProperty.findOneAndDelete({
      _id: id,
      user: userId
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Residential property not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Residential property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting residential property',
      error: error.message
    });
  }
};

// Delete all residential properties
exports.deleteAllResidentialProperties = async (req, res) => {
  try {
    const result = await ResidentialProperty.deleteMany();
    
    res.json({
      success: true,
      message: `All residential properties deleted successfully. ${result.deletedCount} properties removed.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting all residential properties',
      error: error.message
    });
  }
};

// Delete all residential properties by user ID
exports.deleteAllResidentialPropertiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await ResidentialProperty.deleteMany({ user: userId });
    
    res.json({
      success: true,
      message: `All user residential properties deleted successfully. ${result.deletedCount} properties removed.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user residential properties',
      error: error.message
    });
  }
}; 
const CommercialProperty = require('../models/commercialProperty.model');

// Create commercial property
exports.createCommercialProperty = async (req, res) => {
  try {
    const commercialProperty = new CommercialProperty(req.body);
    const savedProperty = await commercialProperty.save();
    const populatedProperty = await CommercialProperty.findById(savedProperty._id)
      .populate('user', 'name phoneNumber')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Commercial property created successfully',
      data: populatedProperty
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating commercial property',
      error: error.message
    });
  }
};

// Get all commercial properties
exports.getAllCommercialProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      property_type,
      looking_to,
      possession_status,
      ownership,
      min_cost,
      max_cost,
      min_area,
      max_area,
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (city) filter.city = new RegExp(city, 'i');
    if (property_type) filter.property_type = new RegExp(property_type, 'i');
    if (looking_to) filter.looking_to = looking_to;
    if (possession_status) filter.possession_status = possession_status;
    if (ownership) filter.ownership = ownership;
    if (min_cost || max_cost) {
      filter.cost = {};
      if (min_cost) filter.cost.$gte = parseFloat(min_cost);
      if (max_cost) filter.cost.$lte = parseFloat(max_cost);
    }
    if (min_area || max_area) {
      filter.build_up_area = {};
      if (min_area) filter.build_up_area.$gte = parseFloat(min_area);
      if (max_area) filter.build_up_area.$lte = parseFloat(max_area);
    }

    const skip = (page - 1) * limit;
    
    const properties = await CommercialProperty.find(filter)
      .populate('user', 'name phoneNumber')
      .sort({ put_on_top: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CommercialProperty.countDocuments(filter);
    
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
      message: 'Error fetching commercial properties',
      error: error.message
    });
  }
};

// Get commercial property by ID
exports.getCommercialPropertyById = async (req, res) => {
  try {
    const property = await CommercialProperty.findById(req.params.id)
      .populate('user', 'name phoneNumber address profilePic')
      .lean();
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Commercial property not found'
      });
    }
    
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching commercial property',
      error: error.message
    });
  }
};

// Get all commercial properties by user ID
exports.getCommercialPropertiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: userId };
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    
    const properties = await CommercialProperty.find(filter)
      .populate('user', 'name phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CommercialProperty.countDocuments(filter);
    
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
      message: 'Error fetching user commercial properties',
      error: error.message
    });
  }
};

// Update commercial property by ID and user ID
exports.updateCommercialPropertyByUserAndId = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const updatedProperty = await CommercialProperty.findOneAndUpdate(
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
        message: 'Commercial property not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Commercial property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating commercial property',
      error: error.message
    });
  }
};

// Delete commercial property by ID
exports.deleteCommercialPropertyById = async (req, res) => {
  try {
    const property = await CommercialProperty.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Commercial property not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Commercial property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting commercial property',
      error: error.message
    });
  }
};

// Delete commercial property by ID and user ID
exports.deleteCommercialPropertyByUserAndId = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const property = await CommercialProperty.findOneAndDelete({
      _id: id,
      user: userId
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Commercial property not found or unauthorized'
      });
    }
    
    res.json({
      success: true,
      message: 'Commercial property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting commercial property',
      error: error.message
    });
  }
};

// Delete all commercial properties
exports.deleteAllCommercialProperties = async (req, res) => {
  try {
    const result = await CommercialProperty.deleteMany();
    
    res.json({
      success: true,
      message: `All commercial properties deleted successfully. ${result.deletedCount} properties removed.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting all commercial properties',
      error: error.message
    });
  }
};

// Delete all commercial properties by user ID
exports.deleteAllCommercialPropertiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await CommercialProperty.deleteMany({ user: userId });
    
    res.json({
      success: true,
      message: `All user commercial properties deleted successfully. ${result.deletedCount} properties removed.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user commercial properties',
      error: error.message
    });
  }
}; 
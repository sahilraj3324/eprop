const Property = require('../models/property.model');

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('user', 'name phoneNumber').lean();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('user', 'name phoneNumber').lean();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get properties by user ID
exports.getPropertiesByUserId = async (req, res) => {
  try {
    const properties = await Property.find({ user: req.params.userId }).populate('user', 'name phoneNumber').lean();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property by ID
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all properties
exports.deleteAllProperties = async (req, res) => {
  try {
    await Property.deleteMany();
    res.json({ message: 'All properties deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
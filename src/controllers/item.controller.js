const Item = require('../models/item.model');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'name phoneNumber');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name phoneNumber');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get items by user ID
exports.getItemsByUserId = async (req, res) => {
  try {
    const items = await Item.find({ user: req.params.userId }).populate('user', 'name phoneNumber');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await Item.find({ category: req.params.category }).populate('user', 'name phoneNumber');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item by ID
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all items
exports.deleteAllItems = async (req, res) => {
  try {
    await Item.deleteMany();
    res.json({ message: 'All items deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
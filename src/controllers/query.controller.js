const Query = require('../models/query.model');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

// Submit a new query (for users)
exports.submitQuery = async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;
    const userId = req.user.id; // from auth middleware

    // Get user details to pre-fill if not provided
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const query = await Query.create({
      userId,
      name: name || user.name,
      email: email || user.email || `${user.phoneNumber}@example.com`,
      phone: phone || user.phoneNumber,
      subject,
      message,
      category: category || 'general',
    });

    const populatedQuery = await Query.findById(query._id)
      .populate('userId', 'name phoneNumber email')
      .exec();

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      query: populatedQuery,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all queries (for admin)
exports.getAllQueries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority, 
      assignedTo,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const queries = await Query.find(filter)
      .populate('userId', 'name phoneNumber email')
      .populate('assignedTo', 'name email')
      .populate('adminResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Query.countDocuments(filter);

    res.json({
      success: true,
      queries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQueries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get queries for a specific user
exports.getUserQueries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const queries = await Query.find(filter)
      .populate('assignedTo', 'name')
      .populate('adminResponse.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Query.countDocuments(filter);

    res.json({
      success: true,
      queries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQueries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get query by ID
exports.getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('userId', 'name phoneNumber email')
      .populate('assignedTo', 'name email')
      .populate('adminResponse.respondedBy', 'name email');

    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    // Check if user is authorized to view this query
    if (req.user.role === 'user' && query.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this query' 
      });
    }

    res.json({
      success: true,
      query,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update query status and assign admin (admin only)
exports.updateQueryStatus = async (req, res) => {
  try {
    const { status, priority, assignedTo, tags } = req.body;
    const adminId = req.user.id;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    // Set resolved date if status is resolved
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const query = await Query.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name phoneNumber email')
      .populate('assignedTo', 'name email')
      .populate('adminResponse.respondedBy', 'name email');

    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    res.json({
      success: true,
      message: 'Query updated successfully',
      query,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add admin response to query
exports.respondToQuery = async (req, res) => {
  try {
    const { message } = req.body;
    const adminId = req.user.id;

    const query = await Query.findByIdAndUpdate(
      req.params.id,
      {
        'adminResponse.message': message,
        'adminResponse.respondedBy': adminId,
        'adminResponse.respondedAt': new Date(),
        status: 'in-progress', // Auto-update status when admin responds
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name phoneNumber email')
      .populate('assignedTo', 'name email')
      .populate('adminResponse.respondedBy', 'name email');

    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      query,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete query (admin only)
exports.deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    
    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    res.json({
      success: true,
      message: 'Query deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get query statistics (admin only)
exports.getQueryStats = async (req, res) => {
  try {
    const stats = await Query.aggregate([
      {
        $group: {
          _id: null,
          totalQueries: { $sum: 1 },
          pendingQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          resolvedQueries: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          urgentQueries: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$adminResponse.respondedAt' },
        }
      }
    ]);

    const categoryStats = await Query.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Query.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalQueries: 0,
        pendingQueries: 0,
        inProgressQueries: 0,
        resolvedQueries: 0,
        urgentQueries: 0,
      },
      categoryStats,
      priorityStats,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Submit user satisfaction rating
exports.submitSatisfactionRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({ 
        success: false, 
        message: 'Query not found' 
      });
    }

    // Check if user owns this query
    if (query.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to rate this query' 
      });
    }

    // Only allow rating for resolved queries
    if (query.status !== 'resolved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only rate resolved queries' 
      });
    }

    query.userSatisfaction = {
      rating,
      feedback,
      ratedAt: new Date(),
    };

    await query.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      query,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 
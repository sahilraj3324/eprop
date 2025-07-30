const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
    maxLength: 20,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000,
  },
  category: {
    type: String,
    enum: ['general', 'property', 'item', 'technical', 'billing', 'complaint', 'suggestion'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
  },
  adminResponse: {
    message: {
      type: String,
      trim: true,
      maxLength: 2000,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    respondedAt: {
      type: Date,
    },
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [{
    type: String,
    trim: true,
    maxLength: 50,
  }],
  resolvedAt: {
    type: Date,
  },
  userSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxLength: 500,
    },
    ratedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
querySchema.index({ userId: 1, createdAt: -1 });
querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ assignedTo: 1, status: 1 });
querySchema.index({ category: 1, priority: 1 });
querySchema.index({ createdAt: -1 });

// Text index for search functionality
querySchema.index({ 
  subject: 'text', 
  message: 'text', 
  'adminResponse.message': 'text' 
});

module.exports = mongoose.model('Query', querySchema); 
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000, // Limit message length
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text',
  },
  // For system messages (like "User joined", "Item sold", etc.)
  systemMessageType: {
    type: String,
    enum: ['join', 'leave', 'item_sold', 'item_unavailable'],
  },
  // Track if message has been read
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // For future image support
  attachments: [{
    type: String, // URL to attachment
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema); 
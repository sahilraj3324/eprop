const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Track read status for each participant
  readStatus: {
    seller: {
      type: Date,
      default: Date.now,
    },
    buyer: {
      type: Date,
      default: Date.now,
    },
  },
}, {
  timestamps: true,
});

// Ensure one conversation per item-buyer-seller combination
conversationSchema.index({ itemId: 1, sellerId: 1, buyerId: 1 }, { unique: true });

// Index for efficient queries
conversationSchema.index({ sellerId: 1, lastMessageAt: -1 });
conversationSchema.index({ buyerId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema); 
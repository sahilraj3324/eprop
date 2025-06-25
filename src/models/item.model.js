const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['electronics', 'furniture', 'clothing', 'books', 'vehicles', 'appliances', 'sports', 'toys', 'other'],
      default: 'other',
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    brand: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    images: [
      {
        type: String, // URLs or paths to images
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema); 
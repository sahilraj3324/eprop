const mongoose = require('mongoose');

const residentialPropertySchema = new mongoose.Schema(
  {
    looking_for: {
      type: String,
      enum: ['rent', 'sale', 'lease'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    property_type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
    },
    bhk_rk: {
      type: String,
      required: true,
    },
    build_up_area: {
      type: Number,
      required: true,
      min: 0,
    },
    area_unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft',
    },
    flat_furnishings: [{
      type: String,
      
    }],
    society_amenities: [{
      type: String,
    }],
    rent: {
      type: Number,
      min: 0,
    },
    available_from: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
    },
    put_on_top: {
      type: Boolean,
      default: false,
    },
    descriptions: {
      type: String,
      trim: true,
    },
    images: [{
      type: String, // URLs or paths to images
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'rented', 'sold'],
      default: 'active',
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
residentialPropertySchema.index({ city: 1, property_type: 1, bhk_rk: 1 });
residentialPropertySchema.index({ user: 1 });
residentialPropertySchema.index({ put_on_top: -1, createdAt: -1 });

module.exports = mongoose.model('ResidentialProperty', residentialPropertySchema); 
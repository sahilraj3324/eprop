const mongoose = require('mongoose');

const commercialPropertySchema = new mongoose.Schema(
  {
    looking_to: {
      type: String,
      enum: ['rent', 'sale', 'lease'],
      required: true,
    },
    property_type: {
      type: String,
      required: true,
    },
    your_name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
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
    possession_status: {
      type: String,
      enum: ['ready_to_move', 'under_construction', 'new_launch'],
      required: true,
    },
    location_hub: {
      type: String,
      trim: true,
    },
    build_up_area: {
      type: Number,
      required: true,
      min: 0,
    },
    build_up_area_unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft',
    },
    carpet_area: {
      type: Number,
      min: 0,
    },
    carpet_area_unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft',
    },
    ownership: {
      type: String,
      enum: ['freehold', 'leasehold', 'co_operative_society', 'power_of_attorney'],
      required: true,
    },
    total_floor: {
      type: Number,
      min: 1,
    },
    your_floor: {
      type: Number,
      min: 0,
    },
    put_on_top: {
      type: Boolean,
      default: false,
    },
    monthly_rent: {
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
    description: {
      type: String,
      trim: true,
    },
    images: [{
      type: String, // URLs or paths to images
    }],
    amenities: [{
      type: String,
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
commercialPropertySchema.index({ city: 1, property_type: 1, looking_to: 1 });
commercialPropertySchema.index({ user: 1 });
commercialPropertySchema.index({ put_on_top: -1, createdAt: -1 });

module.exports = mongoose.model('CommercialProperty', commercialPropertySchema); 
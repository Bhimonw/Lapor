const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  photoUrl: {
    type: String,
    required: [true, 'Photo is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates format. Must be [longitude, latitude]'
      }
    }
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'in_progress', 'working', 'completed'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNote: {
    type: String,
    trim: true
  },
  verifiedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedNote: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date
  },
  workingBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workingNote: {
    type: String,
    trim: true
  },
  workingAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedNote: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'in_progress', 'working', 'completed']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      trim: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
ReportSchema.index({ location: '2dsphere' });

// Index for efficient querying
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ user: 1, createdAt: -1 });

// Virtual for getting latitude and longitude separately
ReportSchema.virtual('latitude').get(function() {
  return this.location.coordinates[1];
});

ReportSchema.virtual('longitude').get(function() {
  return this.location.coordinates[0];
});

// Ensure virtual fields are serialized
ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', ReportSchema);
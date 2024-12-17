// models/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  platform: {
    type: String,
    required: true,
    enum: ['youtube', 'tiktok', 'instagram', 'twitter']
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],  // Added cancelled status
    default: 'pending'
  },
  publishedUrl: String,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  lastAttempt: Date,
  // Added publishing details
  publishingDetails: {
    startTime: Date,
    endTime: Date,
    duration: Number,  // in seconds
    error: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for efficient querying
scheduleSchema.index({ userId: 1, scheduledFor: 1 });
scheduleSchema.index({ status: 1, scheduledFor: 1 });

export default mongoose.model('Schedule', scheduleSchema);
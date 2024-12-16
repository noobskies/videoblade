// server/models/Schedule.js
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  publishedUrl: String,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  lastAttempt: Date
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
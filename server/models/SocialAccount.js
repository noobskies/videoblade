// server/models/SocialAccount.js
import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema({
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
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  platformUserId: {
    type: String,
    required: true
  },
  platformUsername: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastTokenRefresh: Date,
  expiresAt: Date
}, { timestamps: true });

// Compound index to ensure one platform account per user
socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model('SocialAccount', socialAccountSchema);
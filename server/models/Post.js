// models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  mediaUrl: String,
  thumbnailUrl: String,
  // Changed platforms to be an array of objects to track platform-specific details
  platforms: [{
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'instagram', 'twitter'],
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft'
    },
    publishedUrl: String,
    platformPostId: String,  // Store the post ID from each platform
    error: String
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  tags: [String],  // Added tags for better categorization
  metadata: {
    type: Map,
    of: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for schedules
postSchema.virtual('schedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'postId'
});

export default mongoose.model('Post', postSchema);
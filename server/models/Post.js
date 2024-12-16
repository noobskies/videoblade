// server/models/Post.js
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
  platforms: [{
    type: String,
    enum: ['youtube', 'tiktok', 'instagram', 'twitter']
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
  scheduledFor: Date,
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
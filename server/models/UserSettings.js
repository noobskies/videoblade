// server/models/UserSettings.js
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('UserSettings', userSettingsSchema);
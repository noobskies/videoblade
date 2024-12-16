// server/services/auth/clerk-service.js
import User from '../../models/User.js';

export class ClerkService {
  static async createUser(userData) {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = userData;
    
    const primaryEmail = email_addresses.find(email => email.primary)?.email_address;
    if (!primaryEmail) {
      throw new Error('No primary email found');
    }

    return await User.create({
      clerkId,
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      lastLoginAt: new Date()
    });
  }

  static async updateUser(userData) {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = userData;
    
    const primaryEmail = email_addresses.find(email => email.primary)?.email_address;
    if (!primaryEmail) {
      throw new Error('No primary email found');
    }

    return await User.findOneAndUpdate(
      { clerkId },
      {
        email: primaryEmail,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        lastLoginAt: new Date()
      },
      { new: true }
    );
  }

  static async deleteUser(clerkId) {
    await User.findOneAndDelete({ clerkId });
    return { success: true };
  }
}
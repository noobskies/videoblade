// server/controllers/auth/clerk-controller.js
import { ClerkService } from '../../services/auth/clerk-service.js';

export class ClerkController {
  static async handleUserCreated(userData) {
    try {
      const user = await ClerkService.createUser(userData);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async handleUserUpdated(userData) {
    try {
      const user = await ClerkService.updateUser(userData);
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async handleUserDeleted(userData) {
    try {
      await ClerkService.deleteUser(userData.id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
// client/src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const syncUserWithBackend = async (user) => {
  try {
    const response = await fetch(`${API_URL}/user/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          id: user.id,
          email_addresses: user.emailAddresses,
          firstName: user.firstName,
          lastName: user.lastName
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
};
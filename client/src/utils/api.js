// client/src/utils/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Clerk session token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// User sync function (keeping existing functionality)
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

export default api;
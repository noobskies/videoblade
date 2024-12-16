// server/middleware/auth.js
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});
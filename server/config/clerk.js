// server/config/clerk.js
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

export const clerkMiddleware = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});
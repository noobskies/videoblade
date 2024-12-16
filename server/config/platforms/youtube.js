// server/config/platforms/youtube.js
import dotenv from 'dotenv';
dotenv.config();

export const youtubeConfig = {
  clientId: process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  redirectUri: process.env.YOUTUBE_REDIRECT_URI,
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
};
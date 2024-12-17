// server/controllers/platforms/youtubeController.js
import youtubeService from '../../services/platforms/youtubeService.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';

export const youtubeController = {
  async getAuthUrl(req, res) {
    try {
      const authUrl = youtubeService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      logger.error('Error generating auth URL', { error: error.message });
      throw new AppError('Failed to generate authentication URL', 500);
    }
  },

  async handleCallback(req, res) {
    try {
      const { code } = req.query;
      const { userId } = req.auth;

      if (!code) {
        throw new AppError('No authorization code provided', 400);
      }

      const tokens = await youtubeService.getTokens(code);
      const channelData = await youtubeService.getUserChannel(tokens.access_token);
      await youtubeService.storeUserAccount(userId, tokens, channelData);

      res.json({
        success: true,
        channel: {
          id: channelData.id,
          title: channelData.snippet.title
        }
      });
    } catch (error) {
      logger.error('Error handling YouTube callback', { error: error.message });
      throw new AppError('Failed to connect YouTube account', 500);
    }
  },

  async getConnectedAccount(req, res, next) {  // Add next parameter
    try {
      const { userId } = req.auth;
      
      logger.debug('Fetching YouTube account', { userId });

      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      const account = await SocialAccount.findOne({
        userId,
        platform: 'youtube',
        isActive: true
      }).lean();  // Use lean() for better performance

      logger.debug('YouTube account query result', { 
        found: !!account,
        accountId: account?._id 
      });

      if (!account) {
        return res.json({ connected: false });
      }

      try {
        // Refresh token if needed
        await youtubeService.refreshTokenIfNeeded(account);
      } catch (refreshError) {
        logger.error('Token refresh failed', { error: refreshError.message });
        // If token refresh fails, we'll mark as disconnected
        return res.json({ connected: false });
      }

      return res.json({
        connected: true,
        channelName: account.platformUsername,
        channelId: account.platformUserId
      });
    } catch (error) {
      logger.error('Error getting YouTube account', { 
        error: error.message,
        stack: error.stack 
      });
      
      // Pass error to error handler middleware instead of throwing
      return next(new AppError('Failed to get YouTube account information', 500));
    }
  },

  async getVideos(req, res) {
    try {
      const { userId } = req.auth;
      
      const account = await SocialAccount.findOne({
        userId,
        platform: 'youtube',
        isActive: true
      });

      if (!account) {
        throw new AppError('No connected YouTube account found', 404);
      }

      // Refresh token if needed
      const accessToken = await youtubeService.refreshTokenIfNeeded(account);
      
      // Fetch videos
      const videos = await youtubeService.getChannelVideos(accessToken);
      
      res.json({
        channelName: account.platformUsername,
        videos
      });
    } catch (error) {
      logger.error('Error getting YouTube videos', { error: error.message });
      throw new AppError('Failed to fetch YouTube videos', 500);
    }
  }
};
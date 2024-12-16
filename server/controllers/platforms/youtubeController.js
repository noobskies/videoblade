// server/controllers/platforms/youtubeController.js
import youtubeService from '../../services/platforms/youtubeService.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';  // Add this import

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

  async getConnectedAccount(req, res) {
    try {
      const { userId } = req.auth;
      
      const account = await SocialAccount.findOne({
        userId,
        platform: 'youtube',
        isActive: true
      });

      if (!account) {
        return res.json({ connected: false });
      }

      // Refresh token if needed
      await youtubeService.refreshTokenIfNeeded(account);

      res.json({
        connected: true,
        channelName: account.platformUsername,
        channelId: account.platformUserId
      });
    } catch (error) {
      logger.error('Error getting YouTube account', { error: error.message });
      throw new AppError('Failed to get YouTube account information', 500);
    }
  }
};
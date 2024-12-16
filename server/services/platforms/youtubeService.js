// server/services/platforms/youtubeService.js
import { google } from 'googleapis';
import { youtubeConfig } from '../../config/platforms/youtube.js';
import logger from '../../utils/logger.js';
import { SocialAccount } from '../../models/SocialAccount.js';

class YouTubeService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      youtubeConfig.clientId,
      youtubeConfig.clientSecret,
      youtubeConfig.redirectUri
    );

    this.youtube = google.youtube('v3');
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: youtubeConfig.scopes,
      include_granted_scopes: true,
    });
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Error getting YouTube tokens', { error: error.message });
      throw error;
    }
  }

  async getUserChannel(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await this.youtube.channels.list({
        auth: this.oauth2Client,
        part: 'snippet',
        mine: true
      });

      return response.data.items[0];
    } catch (error) {
      logger.error('Error getting YouTube channel', { error: error.message });
      throw error;
    }
  }

  async storeUserAccount(userId, tokens, channelData) {
    try {
      const account = await SocialAccount.findOneAndUpdate(
        { 
          userId,
          platform: 'youtube'
        },
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          platformUserId: channelData.id,
          platformUsername: channelData.snippet.title,
          expiresAt: new Date(tokens.expiry_date),
          isActive: true
        },
        { upsert: true, new: true }
      );

      return account;
    } catch (error) {
      logger.error('Error storing YouTube account', { error: error.message });
      throw error;
    }
  }

  // Refresh token if expired
  async refreshTokenIfNeeded(socialAccount) {
    try {
      if (new Date() >= new Date(socialAccount.expiresAt)) {
        this.oauth2Client.setCredentials({
          refresh_token: socialAccount.refreshToken
        });

        const { tokens } = await this.oauth2Client.refreshAccessToken();
        
        await SocialAccount.findByIdAndUpdate(socialAccount._id, {
          accessToken: tokens.access_token,
          expiresAt: new Date(tokens.expiry_date)
        });

        return tokens.access_token;
      }
      
      return socialAccount.accessToken;
    } catch (error) {
      logger.error('Error refreshing YouTube token', { error: error.message });
      throw error;
    }
  }
}

export default new YouTubeService();
// controllers/platforms/BasePlatformController.js

import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';

/**
 * Base controller class for social media platform integrations.
 * Provides standard endpoints and functionality for platform management.
 */
export class BasePlatformController {
  /**
   * @param {Object} platformService - Instance of platform-specific service
   * @param {string} platform - Platform identifier (e.g., 'youtube', 'facebook')
   */
  constructor(platformService, platform) {
    this.platformService = platformService;
    this.platform = platform;
    
    // Bind methods to ensure correct 'this' context
    this.getAuthUrl = this.getAuthUrl.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
    this.getConnectedAccount = this.getConnectedAccount.bind(this);
    this.uploadVideo = this.uploadVideo.bind(this);
    this.disconnectAccount = this.disconnectAccount.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  /**
   * Get OAuth authorization URL for platform connection
   */
  async getAuthUrl(req, res) {
    try {
      logger.debug(`Generating ${this.platform} auth URL`);
      
      const authUrl = await this.platformService.getAuthUrl();
      
      res.json({ 
        success: true,
        authUrl 
      });
    } catch (error) {
      logger.error(`Error generating ${this.platform} auth URL`, { 
        error: error.message,
        stack: error.stack 
      });
      throw new AppError(`Failed to generate authentication URL`, 500);
    }
  }

  /**
   * Handle OAuth callback and account connection
   */
  async handleCallback(req, res) {
    try {
      const { code } = req.query;
      const { userId } = req.auth;
  
      if (!code) {
        throw new AppError('No authorization code provided', 400);
      }

      logger.info(`Processing ${this.platform} OAuth callback`, { userId });
  
      // Exchange code for tokens
      const tokens = await this.platformService.getTokens(code);
      
      // Get user/account data from platform
      const platformData = await this.platformService.getUserData(tokens.access_token);
      
      // Store account information
      const account = await this.platformService.storeUserAccount(
        userId, 
        tokens, 
        platformData
      );
  
      logger.info(`Successfully connected ${this.platform} account`, {
        userId,
        platformUserId: account.platformUserId
      });
  
      res.json({
        success: true,
        account: {
          id: platformData.id,
          username: platformData.username,
          connected: true
        }
      });
    } catch (error) {
      logger.error(`Error handling ${this.platform} callback`, { 
        error: error.message,
        stack: error.stack 
      });
      
      // Handle specific OAuth errors
      if (error.message?.includes('invalid_grant')) {
        throw new AppError('Invalid or expired authorization code', 401);
      }
      
      throw new AppError(`Failed to connect ${this.platform} account`, 500);
    }
  }

  /**
   * Get user's connected account information
   */
  async getConnectedAccount(req, res, next) {
    try {
      const { userId } = req.auth;
      
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      logger.debug(`Fetching ${this.platform} account`, { userId });

      const account = await this.platformService.getConnectedAccount(userId);

      if (!account) {
        return res.json({ 
          success: true,
          connected: false 
        });
      }

      return res.json({
        success: true,
        connected: true,
        account: {
          username: account.platformUsername,
          platformId: account.platformUserId,
          lastTokenRefresh: account.lastTokenRefresh,
          connectedAt: account.createdAt
        }
      });
    } catch (error) {
      logger.error(`Error getting ${this.platform} account`, { 
        error: error.message,
        stack: error.stack 
      });
      return next(new AppError(`Failed to get ${this.platform} account information`, 500));
    }
  }

  /**
   * Upload video to platform
   */
  async uploadVideo(req, res) {
    try {
      const { userId } = req.auth;
      
      // Validate request
      if (!req.file) {
        throw new AppError('No video file provided', 400);
      }

      logger.info(`Starting ${this.platform} video upload`, { userId });

      // Get connected account
      const account = await this.platformService.getConnectedAccount(userId);
      
      if (!account) {
        throw new AppError(`No connected ${this.platform} account found`, 404);
      }

      // Parse and validate metadata
      const metadata = this.parseVideoMetadata(req.body);

      // Upload video
      const result = await this.platformService.uploadVideo(
        account.accessToken,
        req.file.buffer,
        metadata
      );

      logger.info(`Successfully uploaded video to ${this.platform}`, {
        userId,
        videoId: result.id
      });

      res.json({
        success: true,
        video: {
          id: result.id,
          url: result.url,
          ...metadata
        }
      });
    } catch (error) {
      logger.error(`Video upload to ${this.platform} failed`, { 
        error: error.message,
        stack: error.stack 
      });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: `Failed to upload video to ${this.platform}` 
        });
      }
    }
  }

  /**
   * Disconnect platform account
   */
  async disconnectAccount(req, res) {
    try {
      const { userId } = req.auth;

      logger.info(`Disconnecting ${this.platform} account`, { userId });
      
      // Find and deactivate account
      const result = await SocialAccount.findOneAndUpdate(
        { 
          userId,
          platform: this.platform,
          isActive: true
        },
        { 
          $set: { 
            isActive: false,
            disconnectedAt: new Date()
          }
        }
      );

      if (!result) {
        return res.json({ 
          success: true,
          message: 'No active account found to disconnect'
        });
      }

      // Attempt to revoke platform access if supported
      try {
        await this.platformService.revokeAccess(result.accessToken);
      } catch (revokeError) {
        logger.warn(`Failed to revoke ${this.platform} access`, { 
          error: revokeError.message 
        });
        // Continue since we've already marked account as inactive
      }

      res.json({
        success: true,
        message: `Successfully disconnected ${this.platform} account`
      });
    } catch (error) {
      logger.error(`Error disconnecting ${this.platform} account`, { 
        error: error.message 
      });
      throw new AppError(`Failed to disconnect ${this.platform} account`, 500);
    }
  }

  /**
   * Manually refresh platform access token
   */
  async refreshToken(req, res) {
    try {
      const { userId } = req.auth;

      const account = await SocialAccount.findOne({
        userId,
        platform: this.platform,
        isActive: true
      });

      if (!account) {
        throw new AppError(`No active ${this.platform} account found`, 404);
      }

      const newAccessToken = await this.platformService.refreshTokenIfNeeded(account);

      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      logger.error(`Error refreshing ${this.platform} token`, { 
        error: error.message 
      });
      throw new AppError(`Failed to refresh ${this.platform} token`, 500);
    }
  }

  /**
   * Parse and validate video metadata from request body
   * @private
   */
  parseVideoMetadata(body) {
    return {
      title: body.title || 'Untitled Video',
      description: body.description || '',
      tags: body.tags ? JSON.parse(body.tags) : [],
      privacy: body.privacy || 'private',
      // Platform-specific options can be added by child classes
      ...this.getPlatformSpecificMetadata(body)
    };
  }

  /**
   * Get platform-specific metadata fields
   * Can be overridden by child classes
   * @protected
   */
  getPlatformSpecificMetadata(body) {
    return {};
  }

  /**
   * Helper to wrap async route handlers with error handling
   * @protected
   */
  wrapAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
// services/platforms/BasePlatformService.js

import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';

/**
 * Base service class for social media platform integrations.
 * Provides common functionality for platform services.
 */
export class BasePlatformService {
  /**
   * @param {string} platform - Platform identifier (e.g., 'youtube', 'facebook')
   * @param {Object} config - Platform-specific configuration
   */
  constructor(platform, config) {
    this.platform = platform;
    this.config = config;
    this.validateConfig(config);
    this.initializeClient();
  }

  /**
   * Validate platform configuration
   * @protected
   */
  validateConfig(config) {
    const requiredFields = ['clientId', 'clientSecret', 'redirectUri', 'scopes'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Store or update user's platform account
   */
  async storeUserAccount(userId, tokens, platformData) {
    try {
      logger.debug(`Storing ${this.platform} account`, { 
        userId,
        platformId: platformData.id
      });

      // Parse tokens and validate structure
      const tokenData = this.parseTokenData(tokens);

      // Store account data
      const account = await SocialAccount.findOneAndUpdate(
        { 
          userId,
          platform: this.platform
        },
        {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          platformUserId: platformData.id,
          platformUsername: platformData.username,
          expiresAt: tokenData.expiresAt,
          tokenType: tokenData.tokenType,
          scope: tokenData.scope,
          lastTokenRefresh: new Date(),
          isActive: true,
          metadata: this.sanitizeAccountMetadata(platformData)
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );

      return account;
    } catch (error) {
      logger.error(`Error storing ${this.platform} account`, { 
        error: error.message,
        stack: error.stack 
      });
      throw new AppError(`Failed to store ${this.platform} account`, 500);
    }
  }

  /**
   * Get user's connected platform account
   */
  async getConnectedAccount(userId) {
    try {
      const account = await SocialAccount.findOne({
        userId,
        platform: this.platform,
        isActive: true
      }).lean();

      if (!account) {
        return null;
      }

      if (this.shouldRefreshToken(account)) {
        const newToken = await this.refreshTokenIfNeeded(account);
        account.accessToken = newToken;
      }

      return account;
    } catch (error) {
      logger.error(`Error getting ${this.platform} account`, { 
        error: error.message,
        stack: error.stack 
      });
      throw this.formatError(error, `Failed to get ${this.platform} account`);
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl() {
    try {
      const url = this.generateAuthUrl({
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        scopes: this.config.scopes,
        state: this.generateState()
      });

      logger.debug(`Generated ${this.platform} auth URL`);
      return url;
    } catch (error) {
      logger.error(`Error generating ${this.platform} auth URL`, { error: error.message });
      throw this.formatError(error, 'Failed to generate auth URL');
    }
  }

  /**
   * Handle OAuth token exchange
   */
  async getTokens(code) {
    try {
      // Reset client state before token exchange
      this.initializeClient();
      
      logger.debug(`Exchanging ${this.platform} auth code for tokens`);
      const tokens = await this.exchangeCodeForTokens(code);
      
      if (!this.validateTokens(tokens)) {
        throw new AppError('Invalid token response', 401);
      }
      
      return tokens;
    } catch (error) {
      logger.error(`Error getting ${this.platform} tokens`, { error: error.message });
      
      if (error.message?.includes('invalid_grant')) {
        throw new AppError('Invalid or expired authorization code', 401);
      }
      
      throw this.formatError(error, 'Failed to exchange authorization code');
    }
  }

  /**
   * Check if token needs refreshing
   * @protected
   */
  shouldRefreshToken(account) {
    if (!account.expiresAt) return true;
    
    const now = Date.now();
    const expiryDate = account.expiresAt.getTime();
    // Refresh if token expires in less than 5 minutes
    return now + 300000 > expiryDate;
  }

  /**
   * Parse and validate token data
   * @protected
   */
  parseTokenData(tokens) {
    if (!tokens?.access_token) {
      throw new AppError('Invalid token data: missing access token', 400);
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      tokenType: tokens.token_type || 'Bearer',
      scope: tokens.scope || ''
    };
  }

  /**
   * Generate secure state parameter for OAuth
   * @protected
   */
  generateState() {
    return Buffer.from(crypto.randomBytes(32)).toString('base64');
  }

  /**
   * Validate OAuth tokens
   * @protected
   */
  validateTokens(tokens) {
    return tokens?.access_token && 
           (tokens?.refresh_token || tokens?.refreshToken);
  }

  /**
   * Validate video file
   * @protected
   */
  validateVideoFile(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new AppError('Empty video file', 400);
    }

    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    if (buffer.length > maxSize) {
      throw new AppError('Video file too large (max 10GB)', 400);
    }

    return true;
  }

  /**
   * Format error for consistent handling
   * @protected
   */
  formatError(error, defaultMessage) {
    if (error instanceof AppError) {
      return error;
    }

    const statusCode = error.response?.status || 500;
    const message = error.message || defaultMessage;

    return new AppError(message, statusCode);
  }

  /**
   * Build authorization header
   * @protected
   */
  getAuthHeader(accessToken, tokenType = 'Bearer') {
    return `${tokenType} ${accessToken}`;
  }

  /**
   * Process video metadata
   * @protected
   */
  processVideoMetadata(metadata) {
    const processed = {
      title: metadata.title?.trim() || 'Untitled Video',
      description: metadata.description?.trim() || '',
      privacy: this.validatePrivacyStatus(metadata.privacy),
      tags: this.processTags(metadata.tags)
    };

    return {
      ...processed,
      ...this.processCustomMetadata(metadata)
    };
  }

  /**
   * Validate video privacy status
   * @protected
   */
  validatePrivacyStatus(privacy) {
    const validStatuses = ['private', 'unlisted', 'public'];
    return validStatuses.includes(privacy) ? privacy : 'private';
  }

  /**
   * Process video tags
   * @protected
   */
  processTags(tags = []) {
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags.split(',').map(tag => tag.trim());
      }
    }
    
    return Array.isArray(tags) ? 
      tags
        .map(tag => String(tag).trim())
        .filter(tag => tag.length > 0)
        .slice(0, 500) : 
      [];
  }

  /**
   * Abstract methods that must be implemented by platform services
   */

  initializeClient() {
    throw new Error('initializeClient must be implemented');
  }

  generateAuthUrl(params) {
    throw new Error('generateAuthUrl must be implemented');
  }

  async exchangeCodeForTokens(code) {
    throw new Error('exchangeCodeForTokens must be implemented');
  }

  async refreshTokenIfNeeded(account) {
    throw new Error('refreshTokenIfNeeded must be implemented');
  }

  async getUserData(accessToken) {
    throw new Error('getUserData must be implemented');
  }

  async uploadVideo(accessToken, videoBuffer, metadata) {
    throw new Error('uploadVideo must be implemented');
  }

  processCustomMetadata(metadata) {
    return {};
  }

  sanitizeAccountMetadata(platformData) {
    return {};
  }

  async revokeAccess(accessToken) {
    // Optional: implement if platform supports token revocation
    logger.debug(`Token revocation not implemented for ${this.platform}`);
    return true;
  }
}
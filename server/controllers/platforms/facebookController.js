import facebookService from '../../services/platforms/facebookService.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';

export const facebookController = {
  async getAuthUrl(req, res) {
    try {
      const authUrl = facebookService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      logger.error('Error generating Facebook auth URL', { error: error.message });
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

      const tokens = await facebookService.getTokens(code);
      
      // Get user's Facebook pages
      const pages = await facebookService.getUserPages(tokens.access_token);
      
      // For now, use the first page. In production, you might want to let users choose
      const pageData = pages[0];
      
      await facebookService.storeUserAccount(userId, tokens, pageData);

      res.json({
        success: true,
        page: {
          id: pageData.id,
          name: pageData.name
        }
      });
    } catch (error) {
      logger.error('Error handling Facebook callback', { error: error.message });
      throw new AppError('Failed to connect Facebook account', 500);
    }
  },

  async getConnectedAccount(req, res) {
    try {
      const { userId } = req.auth;
      
      logger.debug('Fetching Facebook account', { userId });

      const account = await SocialAccount.findOne({
        userId,
        platform: 'facebook',
        isActive: true
      }).lean();

      if (!account) {
        return res.json({ connected: false });
      }

      return res.json({
        connected: true,
        pageName: account.platformUsername,
        pageId: account.platformUserId
      });
    } catch (error) {
      logger.error('Error getting Facebook account', { error: error.message });
      throw new AppError('Failed to get Facebook account information', 500);
    }
  },

  async getVideos(req, res) {
    try {
      const { userId } = req.auth;
      
      const account = await SocialAccount.findOne({
        userId,
        platform: 'facebook',
        isActive: true
      });

      if (!account) {
        throw new AppError('No connected Facebook account found', 404);
      }

      // Get videos using page access token from metadata
      const videos = await facebookService.getPageVideos(
        account.metadata.pageAccessToken,
        account.platformUserId
      );
      
      res.json({
        pageName: account.platformUsername,
        videos
      });
    } catch (error) {
      logger.error('Error getting Facebook videos', { error: error.message });
      throw new AppError('Failed to fetch Facebook videos', 500);
    }
  },

  async uploadVideo(req, res) {
    try {
      const { userId } = req.auth;
      
      if (!req.file) {
        throw new AppError('No video file provided', 400);
      }

      logger.info('Starting Facebook video upload process', { userId });

      const account = await SocialAccount.findOne({
        userId,
        platform: 'facebook',
        isActive: true
      });

      if (!account) {
        throw new AppError('No connected Facebook account found', 404);
      }

      const metadata = {
        title: req.body.title || 'Untitled Video',
        description: req.body.description || ''
      };

      logger.info('Uploading video to Facebook', { 
        userId,
        metadata
      });

      const result = await facebookService.uploadVideo(
        account.metadata.pageAccessToken,
        account.platformUserId,
        req.file.buffer,
        metadata
      );

      logger.info('Facebook video upload completed', { 
        userId, 
        videoId: result.id 
      });

      res.json({
        success: true,
        videoId: result.id,
        url: `https://facebook.com/${result.id}`
      });
    } catch (error) {
      logger.error('Facebook video upload failed', { 
        error: error.message,
        stack: error.stack 
      });
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to upload video' });
      }
    }
  }
};
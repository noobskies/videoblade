import { facebookConfig } from '../../config/platforms/facebook.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';
import AppError from '../../utils/errors/AppError.js';
import axios from 'axios';

class FacebookService {
  constructor() {
    this.apiVersion = 'v18.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}`;
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: facebookConfig.clientId,
      redirect_uri: facebookConfig.redirectUri,
      scope: facebookConfig.scopes.join(','),
      response_type: 'code',
      state: 'facebook'  // Used to verify the callback
    });

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params}`;
  }

  async getTokens(code) {
    try {
      const params = new URLSearchParams({
        client_id: facebookConfig.clientId,
        client_secret: facebookConfig.clientSecret,
        redirect_uri: facebookConfig.redirectUri,
        code: code
      });

      const response = await axios.get(
        `${this.baseURL}/oauth/access_token?${params}`
      );

      return {
        access_token: response.data.access_token,
        // Facebook tokens are long-lived by default now
        expiry_date: Date.now() + (60 * 24 * 60 * 60 * 1000) // 60 days
      };
    } catch (error) {
      logger.error('Error getting Facebook tokens', { error: error.message });
      throw error;
    }
  }

  async getUserPages(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: { access_token: accessToken }
      });

      if (!response.data.data?.length) {
        throw new Error('No Facebook pages found for user');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error getting Facebook pages', { error: error.message });
      throw error;
    }
  }

  async getPageVideos(accessToken, pageId, maxResults = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${pageId}/videos`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,title,description,created_time,thumbnails,source,permalink_url,views,reactions.summary(total_count)',
            limit: maxResults
          }
        }
      );

      if (!response.data.data?.length) {
        return [];
      }

      const videos = response.data.data.map(video => ({
        id: video.id,
        title: video.title || '',
        description: video.description || '',
        publishedAt: video.created_time,
        thumbnail: video.thumbnails?.data?.[0]?.uri || '',
        facebookUrl: video.permalink_url,
        statistics: {
          views: video.views || 0,
          reactions: video.reactions?.summary?.total_count || 0
        }
      }));

      return videos;
    } catch (error) {
      logger.error('Error fetching Facebook videos', { error: error.message });
      throw error;
    }
  }

  async uploadVideo(accessToken, pageId, videoBuffer, metadata) {
    try {
      logger.info('Starting Facebook video upload', { 
        title: metadata.title,
        pageId: pageId 
      });

      // First, initialize the video upload
      const initResponse = await axios.post(
        `${this.baseURL}/${pageId}/videos`,
        {
          upload_phase: 'start',
          file_size: videoBuffer.length
        },
        {
          params: { access_token: accessToken }
        }
      );

      const { upload_session_id, start_offset, end_offset } = initResponse.data;

      // Upload the video chunks
      await axios.post(
        `${this.baseURL}/${pageId}/videos`,
        videoBuffer,
        {
          params: {
            access_token: accessToken,
            upload_phase: 'transfer',
            upload_session_id,
            start_offset,
            end_offset
          },
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      );

      // Finish the upload and set metadata
      const finishResponse = await axios.post(
        `${this.baseURL}/${pageId}/videos`,
        {
          upload_phase: 'finish',
          upload_session_id,
          title: metadata.title,
          description: metadata.description
        },
        {
          params: { access_token: accessToken }
        }
      );

      logger.info('Facebook upload completed', { 
        videoId: finishResponse.data.id 
      });

      return finishResponse.data;
    } catch (error) {
      logger.error('Error uploading to Facebook', { 
        error: error.message,
        stack: error.stack 
      });
      throw new AppError(
        error.message || 'Failed to upload video to Facebook',
        error.response?.status || 500
      );
    }
  }

  async storeUserAccount(userId, tokens, pageData) {
    try {
      logger.debug('Storing Facebook account', { 
        userId,
        pageId: pageData.id
      });

      const account = await SocialAccount.findOneAndUpdate(
        { 
          userId,
          platform: 'facebook',
          platformUserId: pageData.id // Store by page ID
        },
        {
          accessToken: tokens.access_token,
          platformUsername: pageData.name,
          expiresAt: new Date(tokens.expiry_date),
          lastTokenRefresh: new Date(),
          isActive: true,
          metadata: {
            pageAccessToken: pageData.access_token
          }
        },
        { upsert: true, new: true }
      );

      return account;
    } catch (error) {
      logger.error('Error storing Facebook account', { error: error.message });
      throw error;
    }
  }
}

export default new FacebookService();
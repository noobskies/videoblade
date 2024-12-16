// client/src/components/common/VideoPreviewModal/utils.js
export const formatVideoUrl = (videoId, platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${videoId}`;
      
      case 'tiktok':
        return `https://www.tiktok.com/@username/video/${videoId}`;
      
      case 'instagram':
        return `https://www.instagram.com/p/${videoId}`;
      
      default:
        return '#';
    }
  };
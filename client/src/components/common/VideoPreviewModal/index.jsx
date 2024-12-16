// client/src/components/common/VideoPreviewModal/index.jsx
import { useEffect } from 'react';
import { formatVideoUrl } from './utils';

const VideoPreviewModal = ({ 
  video, 
  platform, 
  onClose,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!video) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-lg w-full max-w-5xl ${className}`}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-500">{platform}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close preview"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Container */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
          <div className="absolute inset-0 w-full h-full">
            <VideoEmbed video={video} platform={platform} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Open in {platform}
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

const VideoEmbed = ({ video, platform }) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      // Clean up the embed HTML to ensure it takes full space
      let embedHtml = video.embedHtml;
      if (embedHtml) {
        // Add width and height 100% to the iframe
        embedHtml = embedHtml.replace(
          'iframe',
          'iframe style="width: 100%; height: 100%;"'
        );
      }
      
      return (
        <div className="w-full h-full">
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
          />
        </div>
      );
    
    case 'tiktok':
      return (
        <iframe
          className="w-full h-full"
          src={formatVideoUrl(video.id, 'tiktok')}
          allowFullScreen
        />
      );
    
    case 'instagram':
      return (
        <div className="w-full h-full">
          {/* Instagram embed code */}
        </div>
      );
    
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Preview not available</p>
        </div>
      );
  }
};

export default VideoPreviewModal;
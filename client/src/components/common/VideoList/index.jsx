// client/src/components/common/VideoList/index.jsx
import { useState } from 'react';
import { formatDistance, format } from 'date-fns'; 
import VideoPreviewModal from '../VideoPreviewModal';
import PlatformIcon from './PlatformIcon';

const VideoList = ({
  videos,
  platform,
  channelName,
  loading,
  error,
  onRefresh,
  renderStats,  // Custom stats renderer for each platform
  formatPreviewData // Function to format video data for preview modal
}) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600">
        <p>{error}</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-6">
              {/* Thumbnail with preview button */}
              <div 
                className="flex-shrink-0 relative group cursor-pointer" 
                onClick={() => setSelectedVideo(video)}
              >
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-48 h-28 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                  <svg 
                    className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform transition-all"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow">
                {/* Header with title and external link */}
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    {/* Author info and platform */}
                    <div className="flex items-center gap-2 mb-2">
                      {video.authorImage && (
                        <img 
                          src={video.authorImage} 
                          alt={channelName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-600">{channelName}</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <PlatformIcon platform={platform} />
                        <time 
                          className="text-sm text-gray-500"
                          dateTime={video.publishedAt}
                          title={format(new Date(video.publishedAt), 'PPpp')}
                        >
                          {formatDistance(new Date(video.publishedAt), new Date(), { addSuffix: true })}
                        </time>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-gray-900">
                      {video.title}
                    </h3>
                  </div>
                  
                  <a 
                    href={video.youtubeUrl || video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500 ml-4"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Platform-specific stats */}
                {renderStats && (
                  <div className="mt-4">
                    {renderStats(video)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Preview Modal */}
      {selectedVideo && (
        <VideoPreviewModal 
          video={formatPreviewData(selectedVideo)}
          platform={platform}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
};

export default VideoList;
// components/common/VideoList/index.jsx
import { useState } from 'react';
import { formatDistance, format } from 'date-fns'; 
import VideoPreviewModal from '../VideoPreviewModal';
import PlatformIcon from './PlatformIcon';

const VideoList = ({
  videos = [], // Add default empty array
  platform,
  channelInfo,
  loading,
  error,
  onRefresh,
  renderStats,
  formatPreviewData,
  hasMore,
  onLoadMore,
  loadingMore
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

  // Add check for empty videos array
  if (!videos.length && !loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No videos found</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Info Header */}
      {channelInfo && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            {channelInfo.thumbnails?.default && (
              <img 
                src={channelInfo.thumbnails.default} 
                alt={channelInfo.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{channelInfo.name}</h2>
              {channelInfo.statistics && (
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span>{parseInt(channelInfo.statistics.videoCount).toLocaleString()} videos</span>
                  <span>{parseInt(channelInfo.statistics.subscriberCount).toLocaleString()} subscribers</span>
                  <span>{parseInt(channelInfo.statistics.viewCount).toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>
          {channelInfo.description && (
            <p className="mt-2 text-gray-600 text-sm">{channelInfo.description}</p>
          )}
        </div>
      )}

      {/* Videos List */}
      {videos.map(video => (
        <div key={video.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-6">
            {/* Thumbnail section */}
            <div 
              className="flex-shrink-0 relative group cursor-pointer" 
              onClick={() => setSelectedVideo(video)}
            >
              <img 
                src={video.thumbnails?.medium || video.thumbnails?.default || video.thumbnail} 
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

            {/* Content section */}
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  {/* Video metadata */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      {channelInfo?.name || video.channelName}
                    </span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <PlatformIcon platform={platform} />
                      <time
                        className="text-sm text-gray-500"
                        dateTime={video.publishedAt}
                        title={format(new Date(video.publishedAt), 'MMMM d, yyyy • h:mm a')}
                      >
                        {formatDistance(new Date(video.publishedAt), new Date(), { addSuffix: true })}
                      </time>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium text-gray-900">
                    {video.title}
                  </h3>

                  {/* Description preview */}
                  {video.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>

                {/* External link */}
                <a 
                  href={video.url || video.youtubeUrl}
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
              {video.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {video.tags.slice(0, 5).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {video.tags.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{video.tags.length - 5} more
                    </span>
                  )}
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

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load More Videos'
            )}
          </button>
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedVideo && formatPreviewData && (
        <VideoPreviewModal 
          video={formatPreviewData(selectedVideo)}
          platform={platform}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoList;
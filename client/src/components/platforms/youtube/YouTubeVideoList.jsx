// components/platforms/youtube/YouTubeVideoList.jsx
import { useState, useEffect } from 'react';
import VideoList from '../../common/VideoList';
import api from '../../../utils/api';

const YouTubeVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchVideos = async (nextPage = false) => {
    try {
      if (nextPage) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      if (pageToken && nextPage) {
        params.append('pageToken', pageToken);
      }

      const response = await api.get(`/platforms/youtube/videos?${params}`);
      
      // Log the response to see its structure
      console.log('API Response:', response.data);

      if (response.data) {
        // Check if we're getting videos directly or nested in items
        const newVideos = response.data.videos || response.data.items || [];
        setVideos(prevVideos => nextPage ? [...prevVideos, ...newVideos] : newVideos);
        
        // Set channel info from response
        setChannelInfo({
          name: response.data.channelName,
          statistics: response.data.statistics,
          ...response.data.channel
        });

        // Set pagination info
        setPageToken(response.data.nextPageToken);
        setHasMore(!!response.data.nextPageToken);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.error || 'Failed to fetch videos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const loadMore = () => {
    if (pageToken && !loadingMore) {
      fetchVideos(true);
    }
  };

  const renderYouTubeStats = (video) => (
    <div className="flex gap-6">
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {parseInt(video.statistics?.views || 0).toLocaleString()} views
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        {parseInt(video.statistics?.likes || 0).toLocaleString()} likes
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {parseInt(video.statistics?.comments || 0).toLocaleString()} comments
      </div>
    </div>
  );

  const formatPreviewData = (video) => ({
    id: video.id,
    title: video.title,
    embedHtml: video.embedHtml,
    url: video.url || video.youtubeUrl
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <VideoList
        videos={videos}
        platform="youtube"
        channelInfo={channelInfo}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        onRefresh={() => fetchVideos(false)}
        renderStats={renderYouTubeStats}
        formatPreviewData={formatPreviewData}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default YouTubeVideoList;
// client/src/components/platforms/youtube/YouTubeVideoList.jsx
import { useState, useEffect } from 'react';
import VideoList from '../../common/VideoList';
import api from '../../../utils/api';

const YouTubeVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/platforms/youtube/videos');
      setVideos(response.data.videos);
      setChannelName(response.data.channelName);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom stats renderer for YouTube
  const renderYouTubeStats = (video) => (
    <div className="flex gap-6">
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {parseInt(video.statistics.views).toLocaleString()} views
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        {parseInt(video.statistics.likes).toLocaleString()} likes
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {parseInt(video.statistics.comments).toLocaleString()} comments
      </div>
    </div>
  );

  // Format video data for preview modal
  const formatPreviewData = (video) => ({
    id: video.id,
    title: video.title,
    embedHtml: video.embedHtml,
    url: video.youtubeUrl
  });

  return (
    <VideoList
      videos={videos}
      platform="YouTube"
      channelName={channelName}
      loading={loading}
      error={error}
      onRefresh={fetchVideos}
      renderStats={renderYouTubeStats}
      formatPreviewData={formatPreviewData}
    />
  );
};

export default YouTubeVideoList;
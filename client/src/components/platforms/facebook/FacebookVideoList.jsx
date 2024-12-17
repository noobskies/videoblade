import { useState, useEffect } from 'react';
import VideoList from '../../common/VideoList';
import api from '../../../utils/api';

const FacebookVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [pageName, setPageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/platforms/facebook/videos');
      setVideos(response.data.videos);
      setPageName(response.data.pageName);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom stats renderer for Facebook
  const renderFacebookStats = (video) => (
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {parseInt(video.statistics.reactions).toLocaleString()} reactions
      </div>
    </div>
  );

  // Format video data for preview modal
  const formatPreviewData = (video) => ({
    id: video.id,
    title: video.title,
    // Facebook doesn't provide embed HTML directly, so we'll use a custom embed
    embedHtml: `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.facebookUrl)}&show_text=false" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`,
    url: video.facebookUrl
  });

  return (
    <VideoList
      videos={videos}
      platform="Facebook"
      channelName={pageName}
      loading={loading}
      error={error}
      onRefresh={fetchVideos}
      renderStats={renderFacebookStats}
      formatPreviewData={formatPreviewData}
    />
  );
};

export default FacebookVideoList;
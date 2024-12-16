// client/src/components/platforms/youtube/YouTubeConnect.jsx
import { useState, useEffect } from 'react';
import api from '../../../utils/api';  // Import our api utility

const YouTubeConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      console.log('Checking YouTube connection...'); // Debug log
      const response = await api.get('/platforms/youtube/account');
      console.log('Connection response:', response.data); // Debug log
      setIsConnected(response.data.connected);
      if (response.data.connected) {
        setChannelInfo({
          name: response.data.channelName,
          id: response.data.channelId
        });
      }
    } catch (err) {
      console.error('Connection check error:', err); // Debug log
      setError('Failed to check YouTube connection');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/platforms/youtube/auth-url');
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Connection initiation error:', err); // Debug log
      setError('Failed to initiate YouTube connection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">YouTube</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="text-sm text-gray-600">
            Connected as: {channelInfo?.name}
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect YouTube
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default YouTubeConnect;
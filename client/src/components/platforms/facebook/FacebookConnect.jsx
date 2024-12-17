import { useState, useEffect } from 'react';
import api from '../../../utils/api';

const FacebookConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      console.log('Checking Facebook connection...'); // Debug log
      const response = await api.get('/platforms/facebook/account');
      console.log('Connection response:', response.data); // Debug log
      setIsConnected(response.data.connected);
      if (response.data.connected) {
        setPageInfo({
          name: response.data.pageName,
          id: response.data.pageId
        });
      }
    } catch (err) {
      console.error('Connection check error:', err); // Debug log
      setError('Failed to check Facebook connection');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/platforms/facebook/auth-url');
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Connection initiation error:', err); // Debug log
      setError('Failed to initiate Facebook connection');
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
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
            <svg 
              className="w-6 h-6 text-blue-600" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Facebook</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="text-sm text-gray-600">
            Page: {pageInfo?.name}
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect Facebook
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

export default FacebookConnect;
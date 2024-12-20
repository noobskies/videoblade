// client/src/pages/platforms/FacebookCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const FacebookCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code) {
        setError('No authorization code received');
        return;
      }

      // Verify state matches what we expect (facebook)
      if (state !== 'facebook') {
        setError('Invalid state parameter');
        return;
      }

      try {
        console.log('Sending Facebook callback with code:', code); // Debug log
        const response = await api.get(`/platforms/facebook/callback`, {
          params: { code }
        });
        console.log('Facebook callback response:', response.data); // Debug log
        navigate('/settings?connection=success');
      } catch (err) {
        console.error('Failed to connect Facebook:', err);
        setError('Failed to connect Facebook account');
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600">{error}</h2>
          <button
            onClick={() => navigate('/settings')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Connecting your Facebook account...</h2>
      </div>
    </div>
  );
};

export default FacebookCallback;
// client/src/components/common/VideoUpload/index.jsx
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import FileUploader from './FileUploader';
import UploadForm from './UploadForm';
import ProgressBar from './ProgressBar';
import axios from 'axios';

const VideoUpload = ({ 
  platform = 'youtube',
  maxFileSize = 1024 * 1024 * 100, // 100MB
  onUploadComplete
}) => {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleYouTubeUpload = async (metadata) => {
    try {
      setIsUploading(true);
      setUploadStatus('Preparing upload...');

      // Get the authentication token
      const token = await getToken();

      // First, get the upload URL from YouTube
      try {
        const { data: uploadData } = await axios.post('/api/platforms/youtube/videos/upload-url', {
          title: metadata.title,
          description: metadata.description,
          categoryId: metadata.categoryId,
          madeForKids: metadata.madeForKids,
          language: metadata.language
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        // Extract the error message from the response
        const errorMessage = err.response?.data?.error || err.message;
        throw new Error(errorMessage);
      }

      setUploadStatus('Starting upload to YouTube...');

      // Upload the video directly to YouTube
      const formData = new FormData();
      formData.append('video', selectedFile);

      await axios.put(uploadData.uploadUrl, selectedFile, {
        headers: {
          'Content-Type': 'video/*'
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(Math.round(progress));
          setUploadStatus('Uploading to YouTube...');
        }
      });

      setUploadedVideoId(uploadData.videoId);
      setUploadStatus('Video uploaded successfully!');

      // If a schedule time was set, create a schedule
      if (metadata.scheduledTime) {
        setUploadStatus('Creating schedule...');
        
        // Get a fresh token for the scheduler request
        const schedulerToken = await getToken();
        
        await axios.post('/api/scheduler/youtube', {
          videoId: uploadData.videoId,
          scheduledTime: metadata.scheduledTime,
          title: metadata.title,
          description: metadata.description,
          privacy: metadata.privacy,
          tags: metadata.tags
        }, {
          headers: {
            'Authorization': `Bearer ${schedulerToken}`
          }
        });

        setUploadStatus('Schedule created successfully!');
      }

      // Call completion handler if provided
      if (onUploadComplete) {
        onUploadComplete({
          videoId: uploadData.videoId,
          metadata
        });
      }

      // Reset form after delay
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('');
        setUploadedVideoId(null);
      }, 2000);

    } catch (err) {
      setIsUploading(false);
      setUploadStatus('Upload failed');
      
      // Determine if we should show a reconnect button
      if (err.message.includes('reconnect') || err.message.includes('authorization expired')) {
        setError({
          message: err.message,
          action: {
            label: 'Reconnect YouTube',
            onClick: () => {
              // Redirect to YouTube auth
              window.location.href = '/api/platforms/youtube/auth-url';
            }
          }
        });
      } else {
        setError(err.message || 'Failed to upload video');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (metadata) => {
    switch (platform) {
      case 'youtube':
        await handleYouTubeUpload(metadata);
        break;
      default:
        setError(`Uploading to ${platform} is not yet supported`);
    }
  };

  return (
    <div className="space-y-8">
      {!selectedFile ? (
        <FileUploader
          onFileSelect={handleFileSelect}
          maxSize={maxFileSize}
          acceptedTypes="video/*"
        />
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isUploading}
            >
              Change file
            </button>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <UploadForm
            onSubmit={handleFormSubmit}
            isUploading={isUploading}
            platform={platform}
          />
        </div>
      )}

      {isUploading && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ProgressBar 
            progress={uploadProgress}
            status={uploadStatus}
          />
        </div>
      )}

      {uploadedVideoId && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Video uploaded successfully! Video ID: {uploadedVideoId}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">
                {typeof error === 'string' ? error : error.message}
              </p>
              {error.action && (
                <div className="mt-2">
                  <button
                    onClick={error.action.onClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {error.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
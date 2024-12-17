// client/src/components/common/VideoUpload/index.jsx
import { useState } from 'react';
import FileUploader from './FileUploader';
import UploadForm from './UploadForm';
import ProgressBar from './ProgressBar';

const VideoUpload = ({ 
  onUpload,
  platform = 'youtube',
  maxFileSize = 1024 * 1024 * 100, // 100MB
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleFormSubmit = async (metadata) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadStatus('Preparing upload...');

      // Create form data with file and metadata
      const formData = new FormData();
      formData.append('video', selectedFile);
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      // Call the provided upload handler
      await onUpload(formData, {
        onProgress: (progress) => {
          setUploadProgress(Math.round(progress));
          setUploadStatus('Uploading video...');
        },
        onComplete: () => {
          setUploadStatus('Processing video...');
        }
      });

      // Reset form after successful upload
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadStatus('');
    } catch (err) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
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
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Change file
            </button>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="bg-white p-6 rounded-lg shadow">
          <UploadForm
            onSubmit={handleFormSubmit}
            isUploading={isUploading}
            platform={platform}
          />
        </div>
      )}

      {isUploading && (
        <div className="bg-white p-6 rounded-lg shadow">
          <ProgressBar 
            progress={uploadProgress}
            status={uploadStatus}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Upload Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
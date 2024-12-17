// client/src/pages/Upload.jsx
import { useState } from 'react';
import VideoUpload from '../components/common/VideoUpload';

const Upload = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');

  const handleUpload = async (formData, { onProgress, onComplete }) => {
    // Platform-specific upload logic will go here
    switch (selectedPlatform) {
      case 'youtube':
        // YouTube upload logic
        break;
      case 'tiktok':
        // TikTok upload logic
        break;
      // Add more platforms as needed
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
        <p className="mt-1 text-sm text-gray-600">
          Share your content across platforms
        </p>
      </div>

      {/* Platform Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Platform
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPlatform('youtube')}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              selectedPlatform === 'youtube'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {/* YouTube Icon */}
            <svg className="w-5 h-5 mr-2 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            YouTube
          </button>

          <button
            onClick={() => setSelectedPlatform('tiktok')}
            disabled
            className="flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            {/* TikTok Icon */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 01 2.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            TikTok (Coming Soon)
          </button>
        </div>
      </div>

      {/* Upload Component */}
      <VideoUpload
        onUpload={handleUpload}
        platform={selectedPlatform}
        maxFileSize={selectedPlatform === 'youtube' ? 1024 * 1024 * 100 : 1024 * 1024 * 50}
      />
    </div>
  );
};

export default Upload;
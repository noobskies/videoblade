// client/src/components/common/VideoUpload/FileUploader.jsx
import { useState, useRef } from 'react';

const FileUploader = ({ 
  onFileSelect, 
  acceptedTypes = "video/*",
  maxSize = 1024 * 1024 * 100, // 100MB default
  className = "" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file.type.startsWith('video/')) {
      throw new Error('Please upload a video file');
    }
    if (file.size > maxSize) {
      throw new Error(`File size should not exceed ${maxSize / (1024 * 1024)}MB`);
    }
  };

  const handleFile = (file) => {
    try {
      setError(null);
      validateFile(file);
      onFileSelect(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center 
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${className}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <svg 
            className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div className="text-lg">
            {isDragging ? (
              <span className="text-blue-500">Drop your video here</span>
            ) : (
              <span className="text-gray-600">
                Drag and drop your video or <span className="text-blue-500">browse</span>
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Maximum file size: {maxSize / (1024 * 1024)}MB
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
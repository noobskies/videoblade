// SchedulePost.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Upload, X } from 'lucide-react';

const SchedulePost = ({ 
  isModal = false, 
  onClose, 
  preselectedDate,
  preselectedTime 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: preselectedDate || '',
    scheduledTime: preselectedTime || '',
    platforms: [],
    mediaType: 'video',
    tags: []
  });

  useEffect(() => {
    if (preselectedDate) {
      setFormData(prev => ({ ...prev, scheduledDate: preselectedDate }));
    }
    if (preselectedTime) {
      setFormData(prev => ({ ...prev, scheduledTime: preselectedTime }));
    }
  }, [preselectedDate, preselectedTime]);

  const connectedPlatforms = [
    { id: 'youtube', name: 'YouTube', connected: true },
    { id: 'facebook', name: 'Facebook', connected: false },
    { id: 'instagram', name: 'Instagram', connected: false }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    if (isModal && onClose) {
      onClose();
    }
  };

  const content = (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Media Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.mediaType}
          onChange={(e) => handleInputChange({
            target: { name: 'mediaType', value: e.target.value }
          })}
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="text">Text Only</option>
        </select>

        <div className="mt-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                MP4, MOV up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Post Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter post title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter post description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          name="tags"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="Enter tags (comma separated)"
        />
      </div>

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platforms
        </label>
        <div className="grid grid-cols-3 gap-4">
          {connectedPlatforms.map(platform => (
            <button
              key={platform.id}
              type="button"
              disabled={!platform.connected}
              onClick={() => handlePlatformToggle(platform.id)}
              className={`
                py-2 px-4 rounded-md text-sm font-medium
                ${formData.platforms.includes(platform.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'}
                ${!platform.connected && 'opacity-50 cursor-not-allowed'}
                hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              name="scheduledDate"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.scheduledDate}
              onChange={handleInputChange}
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <div className="relative">
            <input
              type="time"
              name="scheduledTime"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.scheduledTime}
              onChange={handleInputChange}
            />
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Schedule Post
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Schedule Post
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Post</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and schedule your content across multiple platforms
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

export default SchedulePost;